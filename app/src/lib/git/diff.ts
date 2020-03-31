

const perf_hooks = require('perf_hooks'); 

import * as Path from 'path'

import { ensureDir, pathExists, stat } from 'fs-extra'

import * as fileSystem from '../../lib/file-system'

import { remote } from 'electron'

import { importFolder } from 'kactus-cli'

import { IKactusFile } from '../kactus'


import { getHEADsha } from './get-HEAD-sha'

import { getBlobContents } from './show'

import { exportTreeAtCommit } from './export'


import { Repository } from '../../models/repository'

import {
  WorkingDirectoryFileChange,
  FileChange,
  AppFileStatusKind,
  FileType,
} from '../../models/status'

import {
  DiffType,
  IRawDiff,
  IDiff,
  IImageDiff,
  Image,
  LineEndingsChange,
  parseLineEndingText,
  ISketchDiff,
  IKactusFileType,
  ILargeTextDiff,
  IUnrenderableDiff,
} from '../../models/diff'


import { spawnAndComplete } from './spawn'


import { DiffParser } from '../diff-parser'

import {
  generateDocumentPreview,
  generateArtboardPreview,
  generateLayerPreview,
  generatePagePreview,
  getKactusStoragePaths,
} from '../kactus'

import { getUserDataPath, getTempPath } from '../../ui/lib/app-proxy'

import { assertNever } from '../fatal-error'

import { getOldPathOrDefault } from '../get-old-path'

import { getCaptures } from '../helpers/regex'


export 
interface ISketchPreviews {
  current: Image | undefined
  previous: Image | undefined
}


export 
interface IOnSketchPreviews {
  (err: Error, previews?: undefined): void
  (err: null, previews: ISketchPreviews): void
}

/**
 * V8 has a limit on the size of string it can create (~256MB), and unless we want to
 * trigger an unhandled exception we need to do the encoding conversion by hand.
 *
 * This is a hard limit on how big a buffer can be and still be converted into
 * a string.
 */

const MaxDiffBufferSize = 70e6
// 70MB in decimal

/**
 * Where `MaxDiffBufferSize` is a hard limit, this is a suggested limit. Diffs
 * bigger than this _could_ be displayed but it might cause some slowness.
 */

const MaxReasonableDiffSize = MaxDiffBufferSize / 16
// ~4.375MB in decimal

/**
 * The longest line length we should try to display. If a diff has a line longer
 * than this, we probably shouldn't attempt it
 */

const MaxCharactersPerLine = 5000

/**
 * Utility function to check whether parsing this buffer is going to cause
 * issues at runtime.
 *
 * @param buffer A buffer of binary text from a spawned process
 */

function isValidBuffer(buffer: Buffer) 
{
  
return buffer.length <= MaxDiffBufferSize
}

/** Is the buffer too large for us to reasonably represent? */

function isBufferTooLarge(buffer: Buffer) 
{
  
return buffer.length >= MaxReasonableDiffSize
}

/** Is the diff too large for us to reasonably represent? */

function isDiffTooLarge(diff: IRawDiff) 
{
  
for (
const hunk
of diff.hunks)
{
    
for (
const line
of hunk.lines)
{
      
if (line.text.length > MaxCharactersPerLine) 
{
        
return true
      }
    }
  }

  
return false
}

/**
 *  Defining the list of known extensions we can render inside the app
 */

const imageFileExtensions = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.ico',
  '.webp',
  '.bmp',
])

const visualTextFileExtensions = new Set(['.svg'])

/**
 * Render the difference between a file in the given commit and its parent
 *
 * @param commitish A commit SHA or some other identifier that ultimately dereferences
 *                  to a commit.
 */

export 
async function getCommitDiff<K extends keyof IDiff>(
  sketchPath: string,
  repository: Repository,
  kactusFiles: Array<IKactusFile>,
  file: FileChange,
  commitish: string,
  hideWhitespaceInDiff: boolean = false,
  previousCommitish?: string,
  onSketchPreviews?: IOnSketchPreviews
): Promise<IDiff> 
{
  
const args = [
    'log',
    commitish,
    ...(hideWhitespaceInDiff ? ['-w'] : []),
    '-m',
    '-1',
    '--first-parent',
    '--patch-with-raw',
    '-z',
    '--no-color',
    '--',
    file.path,
  ]

  
if (
    file.status.kind === AppFileStatusKind.Renamed ||
    file.status.kind === AppFileStatusKind.Copied
  ) 
{
    
args.push(file.status.oldPath)
  }

  
const { output } = await spawnAndComplete(
    args,
    repository.path,
    'getCommitDiff'
  )

  
return buildDiff(
    sketchPath,
    kactusFiles,
    output,
    repository,
    file,
    commitish,
    previousCommitish,
    undefined,
    onSketchPreviews
  )
}

/**
 * Render the diff for a file within the repository working directory. The file will be
 * compared against HEAD if it's tracked, if not it'll be compared to an empty file meaning
 * that all content in the file will be treated as additions.
 */

export 
async function getWorkingDirectoryDiff<K extends keyof IDiff>(
  sketchPath: string,
  repository: Repository,
  kactusFiles: Array<IKactusFile>,
  file: WorkingDirectoryFileChange,
  previousCommitish?: string,
  onSketchPreviews?: IOnSketchPreviews
): Promise<IDiff> 
{
  
let successExitCodes: Set<number> | undefined
  
let args: Array<string>

  // `--no-ext-diff` should be provided wherever we invoke `git diff` so that any
  // diff.external program configured by the user is ignored

  
if (
    file.status.kind === AppFileStatusKind.New ||
    file.status.kind === AppFileStatusKind.Untracked
  ) 
{
    // `git diff --no-index` seems to emulate the exit codes from `diff` irrespective of
    // whether you set --exit-code
    //
    // this is the behaviour:
    // - 0 if no changes found
    // - 1 if changes found
    // -   and error otherwise
    //
    // citation in source:
    // https://github.com/git/git/blob/1f66975deb8402131fbf7c14330d0c7cdebaeaa2/diff-no-index.c#L300
    
successExitCodes = new Set([0, 1])
    
args = [
      'diff',
      '--no-ext-diff',
      '--no-index',
      '--patch-with-raw',
      '-z',
      '--no-color',
      '--',
      '/dev/null',
      file.path,
    ]
  } 
else
if (file.status.kind === AppFileStatusKind.Renamed) 
{
    // NB: Technically this is incorrect, the best kind of incorrect.
    // In order to show exactly what will end up in the commit we should
    // perform a diff between the new file and the old file as it appears
    // in HEAD. By diffing against the index we won't show any changes
    // already staged to the renamed file which differs from our other diffs.
    // The closest I got to that was running hash-object and then using
    // git diff <blob> <blob> but that seems a bit excessive.
    
args = [
      'diff',
      '--no-ext-diff',
      '--patch-with-raw',
      '-z',
      '--no-color',
      '--',
      file.path,
    ]
  } 
else
{
    
args = [
      'diff',
      'HEAD',
      '--no-ext-diff',
      '--patch-with-raw',
      '-z',
      '--no-color',
      '--',
      file.path,
    ]
  }

  
const { output, error } = await spawnAndComplete(
    args,
    repository.path,
    'getWorkingDirectoryDiff',
    successExitCodes
  )
  
const lineEndingsChange = parseLineEndingsWarning(error)
  
return buildDiff(
    sketchPath,
    kactusFiles,
    output,
    repository,
    file,
    'HEAD',
    previousCommitish,
    lineEndingsChange,
    onSketchPreviews
  )
}


export 
async function getWorkingDirectoryPartDiff<K extends keyof IDiff>(
  sketchPath: string,
  repository: Repository,
  kactusFiles: Array<IKactusFile>,
  sketchPart: {
    id: string
    type: FileType.PageFile | FileType.LayerFile
  },
  previousCommitish?: string,
  onSketchPreviews?: IOnSketchPreviews
): Promise<IDiff> 
{
  
const kactusFile = kactusFiles.find(
    f => sketchPart.id.indexOf(f.id + '/') === 0
  )

  
return getSketchDiff(
    sketchPath,
    repository,
    {
      path: sketchPart.id,
      id: sketchPart.id,
      status: {
        kind: AppFileStatusKind.Modified,
      },
      type: FileType.NormalFile,
    },
    kactusFile!,
    'HEAD',
    onSketchPreviews!,
    previousCommitish,
    undefined,
    sketchPart.type
  )
}


async function getImageDiff(
  repository: Repository,
  file: FileChange,
  commitish: string
): Promise<IImageDiff> 
{
  
const promises: [Promise<Image | undefined>, Promise<Image | undefined>] = [
    Promise.resolve(undefined),
    Promise.resolve(undefined),
  ]

  // Are we looking at a file in the working directory or a file in a commit?
  
if (file instanceof WorkingDirectoryFileChange) 
{
    // No idea what to do about this, a conflicted binary (presumably) file.
    // Ideally we'd show all three versions and let the user pick but that's
    // a bit out of scope for now.
    
if (file.status.kind === AppFileStatusKind.Conflicted) 
{
      
return { kind: DiffType.Image, previous: undefined, current: undefined }
    }

    // Does it even exist in the working directory?
    
if (file.status.kind !== AppFileStatusKind.Deleted) 
{
      
promises[0] = getWorkingDirectoryImage(repository, file)
    }

    
if (
      file.status.kind !== AppFileStatusKind.New &&
      file.status.kind !== AppFileStatusKind.Untracked
    ) 
{
      
promises[1] = getBlobImage(repository, getOldPathOrDefault(file), 'HEAD')
    }
  } 
else
{
    // File status can't be conflicted for a file in a commit
    
if (file.status.kind !== AppFileStatusKind.Deleted) 
{
      
promises[0] = getBlobImage(repository, file.path, commitish)
    }

    // File status can't be conflicted for a file in a commit
    
if (file.status.kind !== AppFileStatusKind.New) 
{
      // TODO: commitish^ won't work for the first commit
      
promises[1] = getBlobImage(
        repository,
        getOldPathOrDefault(file),
        `${commitish}^`
      )
    }
  }

  
const [current, previous] = await Promise.all(promises)

  
return {
    kind: DiffType.Image,
    previous: previous,
    current: current,
  }
}


async function getSketchDiff(
  sketchPath: string,
  repository: Repository,
  file: FileChange,
  kactusFile: IKactusFile,
  commitish: string,
  onSketchPreviews: IOnSketchPreviews,
  previousCommitish?: string,
  diff?: IRawDiff,
  _type?: FileType.PageFile | FileType.LayerFile
): Promise<ISketchDiff> 
{
  
if (!onSketchPreviews) 
{
    
throw new Error('we are missing the hook to update the diff!')
  }

  
const name = Path.basename(file.path)

  
let type: IKactusFileType
  
if (/layerTextStyles/.test(file.path) || /layerStyles/.test(file.path)) 
{
    
type = IKactusFileType.Style
  } 
else
if (name === 'document.json' || name === kactusFile.id) 
{
    
type = IKactusFileType.Document
  } 
else
if (_type === FileType.PageFile || name === 'page.json') 
{
    
type = IKactusFileType.Page
  } 
else
if (name === 'artboard.json') 
{
    
type = IKactusFileType.Artboard
  } 
else
if (name === 'shapeGroup.json') 
{
    
type = IKactusFileType.ShapeGroup
  } 
else
if (name === 'symbolMaster.json') 
{
    
type = IKactusFileType.SymbolMaster
  } 
else
if (name === 'group.json') 
{
    
type = IKactusFileType.Group
  } 
else
if (name === 'bitmap.json') 
{
    
type = IKactusFileType.Bitmap
  } 
else
{
    
type = IKactusFileType.Layer
  }

  
const promises: [Promise<Image | undefined>, Promise<Image | undefined>] = [
    Promise.resolve(undefined),
    Promise.resolve(undefined),
  ]

  // Are we looking at a file in the working directory or a file in a commit?
  
if (file instanceof WorkingDirectoryFileChange || _type) 
{
    // No idea what to do about this, a conflicted binary (presumably) file.
    // Ideally we'd show all three versions and let the user pick but that's
    // a bit out of scope for now.
    
if (file.status.kind === AppFileStatusKind.Conflicted) 
{
      
promises[0] = getHEADsha(repository, 'MERGE_HEAD').then(sha => 
{
        
return getOldSketchPreview(
          sketchPath,
          kactusFile,
          repository,
          file.path,
          sha,
          type,
          _type ? Path.basename(file.id) : undefined
        )
      })

      
promises[1] = getHEADsha(repository, 'ORIG_HEAD').then(sha => 
{
        
return getOldSketchPreview(
          sketchPath,
          kactusFile,
          repository,
          file.path,
          sha,
          type,
          _type ? Path.basename(file.id) : undefined
        )
      })

    }

    // Does it even exist in the working directory?
    
if (
      file.status.kind !== AppFileStatusKind.Conflicted &&
      file.status.kind !== AppFileStatusKind.Deleted
    ) 
{
      
promises[0] = getWorkingDirectorySketchPreview(
        sketchPath,
        kactusFile,
        repository,
        file.path,
        type,
        _type ? Path.basename(file.id) : undefined
      )
    }

    
if (
      file.status.kind !== AppFileStatusKind.Conflicted &&
      file.status.kind !== AppFileStatusKind.New &&
      file.status.kind !== AppFileStatusKind.Untracked
    ) 
{
      // If we have file.oldPath that means it's a rename so we'll
      // look for that file.
      
promises[1] = getOldSketchPreview(
        sketchPath,
        kactusFile,
        repository,
        getOldPathOrDefault(file),
        'HEAD',
        type,
        _type ? Path.basename(file.id) : undefined
      )
    }
  } 
else
{
    // File status can't be conflicted for a file in a commit
    
if (file.status.kind !== AppFileStatusKind.Deleted) 
{
      
promises[0] = getOldSketchPreview(
        sketchPath,
        kactusFile,
        repository,
        file.path,
        commitish,
        type,
        _type ? Path.basename(file.id) : undefined
      )
    }

    // File status can't be conflicted for a file in a commit
    
if (
      file.status.kind !== AppFileStatusKind.New &&
      file.status.kind !== AppFileStatusKind.Untracked
    ) 
{
      // TODO: commitish^ won't work for the first commit
      //
      // If we have file.oldPath that means it's a rename so we'll
      // look for that file.
      
promises[1] = getOldSketchPreview(
        sketchPath,
        kactusFile,
        repository,
        getOldPathOrDefault(file),
        previousCommitish || `${commitish}`,
        type,
        _type ? Path.basename(file.id) : undefined
      )
    }
  }

  
Promise.all(promises)
    .then(([current, previous]) => 
{
      
onSketchPreviews(null, { current, previous })
    })

    .catch(err => onSketchPreviews(err))

  
return {
    kind: DiffType.Sketch,
    text: (diff || { contents: '' }).contents,
    hunks: (diff || { hunks: [] }).hunks,
    sketchFile: kactusFile,
    previous: 'loading',
    current: 'loading',
    type: type,
    isDirectory: (await stat(
      Path.join(repository.path, file.path)
    )).isDirectory(),
  }
}


export 
async function convertDiff<K extends keyof IDiff>(
  sketchPath: string,
  repository: Repository,
  kactusFiles: Array<IKactusFile>,
  file: FileChange,
  diff: IRawDiff,
  commitish: string,
  previousCommitish?: string,
  lineEndingsChange?: LineEndingsChange,
  onSketchPreviews?: IOnSketchPreviews
): Promise<IDiff> 
{
  
const extension = Path.extname(file.path).toLowerCase()

  
if (diff.isBinary) 
{
    // some extension we don't know how to parse, never mind
    
if (!imageFileExtensions.has(extension)) 
{
      
return {
        kind: DiffType.Binary,
      }
    } 
else
{
      
return getImageDiff(repository, file, commitish)
    }
  }

  
if (visualTextFileExtensions.has(extension)) 
{
    
const imageDiff = await getImageDiff(repository, file, commitish)
    
return {
      kind: DiffType.VisualText,
      previous: imageDiff.previous,
      current: imageDiff.current,
      text: diff.contents,
      hunks: diff.hunks,
      lineEndingsChange,
    }
  }

  
const kactusFile = kactusFiles.find(f => file.path.indexOf(f.id + '/') === 0)

  
if (kactusFile) 
{
    
return getSketchDiff(
      sketchPath,
      repository,
      file,
      kactusFile,
      commitish,
      onSketchPreviews!,
      previousCommitish,
      diff
    )
  }

  
let isDirectory = false
  
try 
{
    
isDirectory = (await stat(
      Path.join(repository.path, file.path)
    )).isDirectory()
  } 

catch (err) 
{}

  
return {
    kind: DiffType.Text,
    text: diff.contents,
    hunks: diff.hunks,
    lineEndingsChange,
    isDirectory,
  }
}

/**
 * Map a given file extension to the related data URL media type
 */

function getMediaType(extension: string) 
{
  
if (extension === '.svg') 
{
    
return 'image/svg+xml'
  }
  
if (extension === '.png') 
{
    
return 'image/png'
  }
  
if (extension === '.jpg' || extension === '.jpeg') 
{
    
return 'image/jpg'
  }
  
if (extension === '.gif') 
{
    
return 'image/gif'
  }
  
if (extension === '.ico') 
{
    
return 'image/x-icon'
  }
  
if (extension === '.webp') 
{
    
return 'image/webp'
  }
  
if (extension === '.bmp') 
{
    
return 'image/bmp'
  }

  // fallback value as per the spec
  
return 'text/plain'
}

/**
 * `git diff` will write out messages about the line ending changes it knows
 * about to `stderr` - this rule here will catch this and also the to/from
 * changes based on what the user has configured.
 */

const lineEndingsChangeRegex = /warning: (CRLF|CR|LF) will be replaced by (CRLF|CR|LF) in .*/

/**
 * Utility function for inspecting the stderr output for the line endings
 * warning that Git may report.
 *
 * @param error A buffer of binary text from a spawned process
 */

function parseLineEndingsWarning(error: Buffer): LineEndingsChange | undefined 
{
  
if (error.length === 0) 
{
    
return undefined
  }

  
const errorText = error.toString('utf-8')
  
const match = lineEndingsChangeRegex.exec(errorText)
  
if (match) 
{
    
const from = parseLineEndingText(match[1])
    
const to = parseLineEndingText(match[2])
    
if (from && to) 
{
      
return { from, to }
    }
  }

  
return undefined
}

/**
 * Utility function used by get(Commit|WorkingDirectory)Diff.
 *
 * Parses the output from a diff-like command that uses `--path-with-raw`
 */

function diffFromRawDiffOutput(output: Buffer): IRawDiff 
{
  // for now we just assume the diff is UTF-8, but given we have the raw buffer
  // we can try and convert this into other encodings in the future
  
const result = output.toString('utf-8')

  
const pieces = result.split('\0')
  
const parser = new DiffParser()
  
return parser.parse(pieces[pieces.length - 1])
}


function buildDiff<K extends keyof IDiff>(
  sketchPath: string,
  kactusFiles: Array<IKactusFile>,
  buffer: Buffer,
  repository: Repository,
  file: FileChange,
  commitish: string,
  previousCommitish?: string,
  lineEndingsChange?: LineEndingsChange,
  onSketchPreviews?: IOnSketchPreviews
): Promise<IDiff> 
{
  
if (!isValidBuffer(buffer)) 
{
    // the buffer's diff is too large to be renderable in the UI
    
return Promise.resolve<IUnrenderableDiff>({ kind: DiffType.Unrenderable })
  }

  
const diff = diffFromRawDiffOutput(buffer)

  
if (isBufferTooLarge(buffer) || isDiffTooLarge(diff)) 
{
    // we don't want to render by default
    // but we keep it as an option by
    // passing in text and hunks
    
const largeTextDiff: ILargeTextDiff = {
      kind: DiffType.LargeText,
      text: diff.contents,
      hunks: diff.hunks,
      lineEndingsChange,
    }

    
return Promise.resolve(largeTextDiff)
  }

  
var TIMING_TEMP_VAR_AUTOGEN_CALLING_943_convertDiff__RANDOM = perf_hooks.performance.now();
 
return convertDiff(
    sketchPath,
    repository,
    kactusFiles,
    file,
    diff,
    commitish,
    previousCommitish,
    lineEndingsChange,
    onSketchPreviews
  )
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/app/src/lib/git/diff.ts& [697, 2; 707, 3]& TEMP_VAR_AUTOGEN_CALLING_943_convertDiff__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN_CALLING_943_convertDiff__RANDOM));
 
}

/**
 * Retrieve the binary contents of a blob from the object database
 *
 * Returns an image object containing the base64 encoded string,
 * as <img> tags support the data URI scheme instead of
 * needing to reference a file:// URI
 *
 * https://en.wikipedia.org/wiki/Data_URI_scheme
 */

export 
async function getBlobImage(
  repository: Repository,
  path: string,
  commitish: string
): Promise<Image> 
{
  
const extension = Path.extname(path)
  
const contents = await getBlobContents(repository, commitish, path)
  
return new Image(
    contents.toString('base64'),
    getMediaType(extension),
    contents.length
  )
}


export 
async function getWorkingDirectoryImage(
  repository: Repository,
  file: FileChange
): Promise<Image> 
{
  
return getImage(Path.join(repository.path, file.path))
}

/**
 * Retrieve the binary contents of a blob from the working directory
 *
 * Returns an image object containing the base64 encoded string,
 * as <img> tags support the data URI scheme instead of
 * needing to reference a file:// URI
 *
 * https://en.wikipedia.org/wiki/Data_URI_scheme
 */

async function getImage(path: string): Promise<Image> 
{
  
const contents = await fileSystem.readFile(path)
  
return new Image(
    contents.toString('base64'),
    getMediaType(Path.extname(path)),
    contents.length
  )
}


async function generatePreview(
  sketchPath: string,
  sketchFilePath: string,
  file: string,
  storagePath: string,
  type: IKactusFileType,
  name?: string
) 
{
  
try 
{
    
let path: string
    
if (type === IKactusFileType.Document) 
{
      
path = await generateDocumentPreview(
        sketchPath,
        sketchFilePath,
        storagePath
      )
    } 
else
if (type === IKactusFileType.Page) 
{
      
path = await generatePagePreview(
        sketchPath,
        sketchFilePath,
        name || Path.basename(Path.dirname(file)),
        storagePath
      )
    } 
else
if (type === IKactusFileType.Artboard) 
{
      
path = await generateArtboardPreview(
        sketchPath,
        sketchFilePath,
        name || Path.basename(Path.dirname(file)),
        storagePath
      )
    } 
else
if (type === IKactusFileType.ShapeGroup) 
{
      
path = await generateLayerPreview(
        sketchPath,
        sketchFilePath,
        name || Path.basename(Path.dirname(file)),
        storagePath
      )
    } 
else
if (type === IKactusFileType.Group) 
{
      
path = await generateLayerPreview(
        sketchPath,
        sketchFilePath,
        name || Path.basename(Path.dirname(file)),
        storagePath
      )
    } 
else
if (type === IKactusFileType.SymbolMaster) 
{
      
path = await generateLayerPreview(
        sketchPath,
        sketchFilePath,
        name || Path.basename(Path.dirname(file)),
        storagePath
      )
    } 
else
if (type === IKactusFileType.Bitmap) 
{
      
path = await generateLayerPreview(
        sketchPath,
        sketchFilePath,
        name || Path.basename(Path.dirname(file)),
        storagePath
      )
    } 
else
if (type === IKactusFileType.Layer) 
{
      
const fileName = Path.basename(file)
      
if (fileName.indexOf('.png') !== -1) 
{
        
path = Path.join(Path.dirname(sketchFilePath), file)
      } 
else
{
        
path = await generateLayerPreview(
          sketchPath,
          sketchFilePath,
          name || fileName.replace('.json', ''),
          storagePath
        )
      }
    } 
else
if (type === IKactusFileType.Style) 
{
      
return Promise.resolve(undefined)
    } 
else
{
      
return assertNever(type, `Unknown KactusFileType: ${type}`)
    }
    
const image = await getImage(path)
    
return image
  } 

catch (e) 
{
    
log.error('Failed to generate the preview for ' + file, e)
    
return Promise.resolve(undefined)
  }
}


function getImagePath(
  storagePath: string,
  file: string,
  type: IKactusFileType
) 
{
  
if (type === IKactusFileType.Style) 
{
    
return ''
  }
  
let path: string
  
if (type === IKactusFileType.Document) 
{
    
path = Path.join(storagePath, 'document.png')
  } 
else
if (
    type === IKactusFileType.Page ||
    type === IKactusFileType.Artboard ||
    type === IKactusFileType.ShapeGroup ||
    type === IKactusFileType.Group ||
    type === IKactusFileType.SymbolMaster ||
    type === IKactusFileType.Bitmap
  ) 
{
    
path = Path.join(storagePath, Path.basename(Path.dirname(file)) + '.png')
  } 
else
if (type === IKactusFileType.Layer) 
{
    
const name = Path.basename(file)
    
path = Path.join(storagePath, name.replace('.json', '') + '.png')
  } 
else
{
    
return assertNever(type, `Unknown KactusFileType: ${type}`)
  }
  
return path
}


export 
async function getWorkingDirectorySketchPreview(
  sketchPath: string,
  sketchFile: IKactusFile,
  repository: Repository,
  file: string,
  type: IKactusFileType,
  name?: string
) 
{
  
if (type === IKactusFileType.Style) 
{
    
return
  }
  
const storagePath = Path.join(
    getTempPath(),
    'kactus',
    String(repository.id),
    sketchFile.id
  )

  
const path = getImagePath(storagePath, file, type)

  
if (await pathExists(path)) 
{
    
return getImage(path)
  }

  
const sketchFilePath = sketchFile.path + '.sketch'

  
return generatePreview(
    sketchPath,
    sketchFilePath,
    file,
    storagePath,
    type,
    name
  )
}


async function getOldSketchPreview(
  sketchPath: string,
  sketchFile: IKactusFile,
  repository: Repository,
  file: string,
  commitish: string,
  type: IKactusFileType,
  name?: string
) 
{
  
if (type === IKactusFileType.Style) 
{
    
return
  }

  
if (commitish === 'HEAD') 
{
    
commitish = await getHEADsha(repository)
  }

  
const { storagePath, sketchStoragePath } = getKactusStoragePaths(
    repository,
    commitish,
    sketchFile
  )

  
const alreadyExported = await pathExists(
    Path.join(sketchStoragePath, 'document.json')
  )
  
if (!alreadyExported) 
{
    
await ensureDir(storagePath)
    
await exportTreeAtCommit(
      repository,
      commitish,
      Path.join(getUserDataPath(), 'previews', String(repository.id))
    )
  }

  
const sketchFilesAlreadyImported = await pathExists(
    sketchStoragePath + '.sketch'
  )
  
if (!sketchFilesAlreadyImported) 
{
    
let config
    
try 
{
      
config = remote.require(Path.join(storagePath, 'kactus.json'))
// get the config in the commitish
    } 

catch (err) 
{
      
config = {}
    }
    
config.sketchApp = sketchPath
    
await importFolder(sketchStoragePath, config)
  }

  
const path = getImagePath(sketchStoragePath, file, type)

  
if (await pathExists(path)) 
{
    
return getImage(path)
  }

  
return await generatePreview(
    sketchPath,
    sketchStoragePath + '.sketch',
    file,
    sketchStoragePath,
    type,
    name
  )
}

/**
 * list the modified binary files' paths in the given repository
 * @param repository to run git operation in
 * @param ref ref (sha, branch, etc) to compare the working index against
 *
 * if you're mid-merge pass `'MERGE_HEAD'` to ref to get a diff of `HEAD` vs `MERGE_HEAD`,
 * otherwise you should probably pass `'HEAD'` to get a diff of the working tree vs `HEAD`
 */

export 
async function getBinaryPaths(
  repository: Repository,
  ref: string
): Promise<ReadonlyArray<string>> 
{
  
const { output } = await spawnAndComplete(
    ['diff', '--numstat', '-z', ref],
    repository.path,
    'getBinaryPaths'
  )
  
const captures = getCaptures(output.toString('utf8'), binaryListRegex)
  
if (captures.length === 0) 
{
    
return []
  }
  // flatten the list (only does one level deep)
  
const flatCaptures = captures.reduce((acc, val) => acc.concat(val))
  
return flatCaptures
}


const binaryListRegex = /-\t-\t(?:\0.+\0)?([^\0]*)/gi
