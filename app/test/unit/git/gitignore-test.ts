

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

      
var TEMP_VAR_AUTOGEN129__RANDOM =  saveGitIgnore(repo, 'node_modules')

const { path } = repo

      

 await TEMP_VAR_AUTOGEN129__RANDOM
      
await GitProcess.exec(['add', '.gitignore'], path)

      
const commit = await GitProcess.exec(
        ['commit', '-m', 'create the ignore file'],
        path
      )
      
var TEMP_VAR_AUTOGEN159__RANDOM =  readGitIgnoreAtRoot(repo)

expect(commit.exitCode).toBe(0)

      

const contents =  await TEMP_VAR_AUTOGEN159__RANDOM
      
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

      
var TEMP_VAR_AUTOGEN196__RANDOM =  saveGitIgnore(repo, 'node_modules')

const { path } = repo

      

 await TEMP_VAR_AUTOGEN196__RANDOM
      
await GitProcess.exec(['add', '.gitignore'], path)

      
const commit = await GitProcess.exec(
        ['commit', '-m', 'create the ignore file'],
        path
      )
      
var TEMP_VAR_AUTOGEN217__RANDOM =  readGitIgnoreAtRoot(repo)

expect(commit.exitCode).toBe(0)

      

const contents =  await TEMP_VAR_AUTOGEN217__RANDOM
      
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

      
var TEMP_VAR_AUTOGEN284__RANDOM =  saveGitIgnore(repo, '*.txt\n')

const path = repo.path

      

 await TEMP_VAR_AUTOGEN284__RANDOM
      
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

      

var TEMP_VAR_AUTOGEN326__RANDOM_LATER =  FSE.readFile(ignoreFile)


      
const expected = 'node_modules\nyarn-error.log\n'
const gitignore = await TEMP_VAR_AUTOGEN326__RANDOM_LATER

      
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

      

var TEMP_VAR_AUTOGEN352__RANDOM_LATER =  FSE.readFile(ignoreFile)


      
const expected = 'node_modules\nyarn-error.log\n.eslintcache\ndist/\n'
const gitignore = await TEMP_VAR_AUTOGEN352__RANDOM_LATER

      
expect(gitignore.toString('utf8')).toBe(expected)
    })

  })

})

