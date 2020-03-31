

const perf_hooks = require('perf_hooks'); 

import * as FSE from 'fs-extra'

import * as Path from 'path'

import { GitProcess } from 'dugite'


import { setupEmptyRepository } from '../../helpers/repositories'

import { getStatusOrThrow } from '../../helpers/status'

import {
  saveGitIgnore,
  readGitIgnoreAtRoot,
  appendIgnoreRule,
} from '../../../src/lib/git'

import { setupLocalConfig } from '../../helpers/local-config'


describe('gitignore', () => 
{
  
describe('readGitIgnoreAtRoot', () => 
{
    
it('returns null when .gitignore does not exist on disk', async () => 
{
      
const repo = await setupEmptyRepository()

      
const gitignore = await readGitIgnoreAtRoot(repo)

      
expect(gitignore).toBeNull()
    })


    
it('reads contents from disk', async () => 
{
      
const repo = await setupEmptyRepository()
      
const path = repo.path

      
const expected = 'node_modules\nyarn-error.log\n'

      
const ignoreFile = `${path}/.gitignore`
      
await FSE.writeFile(ignoreFile, expected)

      
const gitignore = await readGitIgnoreAtRoot(repo)

      
expect(gitignore).toBe(expected)
    })


    
it('when autocrlf=true and safecrlf=true, appends CRLF to file', async () => 
{
      
const repo = await setupEmptyRepository()

      
await setupLocalConfig(repo, [
        ['core.autocrlf', 'true'],
        ['core.safecrlf', 'true'],
      ])

      
const { path } = repo

      

var TIMING_TEMP_VAR_AUTOGEN129__RANDOM = perf_hooks.performance.now();
 await  saveGitIgnore(repo, 'node_modules')
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/app/test/unit/git/gitignore-test.ts& [47, 6; 47, 47]& TEMP_VAR_AUTOGEN129__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN129__RANDOM));
 
      
await GitProcess.exec(['add', '.gitignore'], path)

      
const commit = await GitProcess.exec(
        ['commit', '-m', 'create the ignore file'],
        path
      )
      
expect(commit.exitCode).toBe(0)

      

var TIMING_TEMP_VAR_AUTOGEN159__RANDOM = perf_hooks.performance.now();
 var AWAIT_VAR_TIMING_TEMP_VAR_AUTOGEN159__RANDOM = await  readGitIgnoreAtRoot(repo)
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/app/test/unit/git/gitignore-test.ts& [56, 6; 56, 54]& TEMP_VAR_AUTOGEN159__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN159__RANDOM));
 const contents =  AWAIT_VAR_TIMING_TEMP_VAR_AUTOGEN159__RANDOM
      
expect(contents!.endsWith('\r\n'))
    })


    
it('when autocrlf=input, appends LF to file', async () => 
{
      
const repo = await setupEmptyRepository()

      
setupLocalConfig(repo, [
        // ensure this repository only ever sticks to LF
        ['core.eol', 'lf'],
        // do not do any conversion of line endings when committing
        ['core.autocrlf', 'input'],
      ])

      
const { path } = repo

      

var TIMING_TEMP_VAR_AUTOGEN196__RANDOM = perf_hooks.performance.now();
 await  saveGitIgnore(repo, 'node_modules')
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/app/test/unit/git/gitignore-test.ts& [72, 6; 72, 47]& TEMP_VAR_AUTOGEN196__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN196__RANDOM));
 
      
await GitProcess.exec(['add', '.gitignore'], path)

      
const commit = await GitProcess.exec(
        ['commit', '-m', 'create the ignore file'],
        path
      )
      
expect(commit.exitCode).toBe(0)

      

var TIMING_TEMP_VAR_AUTOGEN217__RANDOM = perf_hooks.performance.now();
 var AWAIT_VAR_TIMING_TEMP_VAR_AUTOGEN217__RANDOM = await  readGitIgnoreAtRoot(repo)
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/app/test/unit/git/gitignore-test.ts& [81, 6; 81, 54]& TEMP_VAR_AUTOGEN217__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN217__RANDOM));
 const contents =  AWAIT_VAR_TIMING_TEMP_VAR_AUTOGEN217__RANDOM
      
expect(contents!.endsWith('\n'))
    })

  })


  
describe('saveGitIgnore', () => 
{
    
it(`creates gitignore file when it doesn't exist`, async () => 
{
      
const repo = await setupEmptyRepository()

      
await saveGitIgnore(repo, 'node_modules\n')

      
const exists = await FSE.pathExists(`${repo.path}/.gitignore`)

      
expect(exists).toBe(true)
    })


    
it('deletes gitignore file when no entries provided', async () => 
{
      
const repo = await setupEmptyRepository()
      
const path = repo.path

      
const ignoreFile = `${path}/.gitignore`
      
await FSE.writeFile(ignoreFile, 'node_modules\n')

      // update gitignore file to be empty
      
await saveGitIgnore(repo, '')

      
const exists = await FSE.pathExists(ignoreFile)
      
expect(exists).toBe(false)
    })


    
it('applies rule correctly to repository', async () => 
{
      
const repo = await setupEmptyRepository()

      
const path = repo.path

      

var TIMING_TEMP_VAR_AUTOGEN284__RANDOM = perf_hooks.performance.now();
 await  saveGitIgnore(repo, '*.txt\n')
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/app/test/unit/git/gitignore-test.ts& [116, 6; 116, 42]& TEMP_VAR_AUTOGEN284__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN284__RANDOM));
 
      
await GitProcess.exec(['add', '.gitignore'], path)
      
await GitProcess.exec(['commit', '-m', 'create the ignore file'], path)

      // Create a txt file
      
const file = Path.join(repo.path, 'a.txt')

      
await FSE.writeFile(file, 'thrvbnmerkl;,iuw')

      // Check status of repo
      
const status = await getStatusOrThrow(repo)
      
const files = status.workingDirectory.files

      
expect(files).toHaveLength(0)
    })

  })


  
describe('appendIgnoreRule', () => 
{
    
it('appends one rule', async () => 
{
      
const repo = await setupEmptyRepository()

      
await setupLocalConfig(repo, [['core.autocrlf', 'true']])

      
const { path } = repo

      
const ignoreFile = `${path}/.gitignore`
      
await FSE.writeFile(ignoreFile, 'node_modules\n')

      
await appendIgnoreRule(repo, ['yarn-error.log'])

      

var TIMING_TEMP_VAR_AUTOGEN326__RANDOM = perf_hooks.performance.now();
 var AWAIT_VAR_TIMING_TEMP_VAR_AUTOGEN326__RANDOM = await  FSE.readFile(ignoreFile)
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/app/test/unit/git/gitignore-test.ts& [146, 6; 146, 54]& TEMP_VAR_AUTOGEN326__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN326__RANDOM));
 const gitignore =  AWAIT_VAR_TIMING_TEMP_VAR_AUTOGEN326__RANDOM

      
const expected = 'node_modules\nyarn-error.log\n'
      
expect(gitignore.toString('utf8')).toBe(expected)
    })


    
it('appends multiple rules', async () => 
{
      
const repo = await setupEmptyRepository()

      
await setupLocalConfig(repo, [['core.autocrlf', 'true']])

      
const { path } = repo

      
const ignoreFile = `${path}/.gitignore`
      
await FSE.writeFile(ignoreFile, 'node_modules\n')

      
await appendIgnoreRule(repo, ['yarn-error.log', '.eslintcache', 'dist/'])

      

var TIMING_TEMP_VAR_AUTOGEN352__RANDOM = perf_hooks.performance.now();
 var AWAIT_VAR_TIMING_TEMP_VAR_AUTOGEN352__RANDOM = await  FSE.readFile(ignoreFile)
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/app/test/unit/git/gitignore-test.ts& [164, 6; 164, 54]& TEMP_VAR_AUTOGEN352__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN352__RANDOM));
 const gitignore =  AWAIT_VAR_TIMING_TEMP_VAR_AUTOGEN352__RANDOM

      
const expected = 'node_modules\nyarn-error.log\n.eslintcache\ndist/\n'
      
expect(gitignore.toString('utf8')).toBe(expected)
    })

  })

})

