

import * as path from 'path'


import { Repository } from '../../../src/models/repository'

import { reset, resetPaths, GitResetMode } from '../../../src/lib/git/reset'

import { getStatusOrThrow } from '../../helpers/status'

import { setupFixtureRepository } from '../../helpers/repositories'

import { GitProcess } from 'dugite'


import * as FSE from 'fs-extra'


describe('git/reset', () => 
{
  
let repository: Repository

  
beforeEach(async () => 
{
    
const testRepoPath = await setupFixtureRepository('test-repo')
    
repository = new Repository(testRepoPath, -1, null, false, [])
  })


  
describe('reset', () => 
{
    
it('can hard reset a repository', async () => 
{
      
const repoPath = repository.path
      
const fileName = 'README.md'
      
const filePath = path.join(repoPath, fileName)

      

var TEMP_VAR_AUTOGEN49__RANDOM_LATER =  FSE.writeFile(filePath, 'Hi world\n')


      
await reset(repository, GitResetMode.Hard, 'HEAD')
await TEMP_VAR_AUTOGEN49__RANDOM_LATER


      
const status = await getStatusOrThrow(repository)
      
expect(status.workingDirectory.files).toHaveLength(0)
    })

  })


  
describe('resetPaths', () => 
{
    
it.skip('resets discarded staged file', async () => 
{
      
const repoPath = repository.path
      
const fileName = 'README.md'
      
const filePath = path.join(repoPath, fileName)

      // modify the file
      
await FSE.writeFile(filePath, 'Hi world\n')

      // stage the file, then delete it to mimic discarding
      
GitProcess.exec(['add', fileName], repoPath)
      

var TEMP_VAR_AUTOGEN116__RANDOM_LATER =  FSE.unlink(filePath)


      
await resetPaths(repository, GitResetMode.Mixed, 'HEAD', [filePath])
await TEMP_VAR_AUTOGEN116__RANDOM_LATER


      // then checkout the version from the index to restore it
      
await GitProcess.exec(
        ['checkout-index', '-f', '-u', '-q', '--', fileName],
        repoPath
      )

      
const status = await getStatusOrThrow(repository)
      
expect(status.workingDirectory.files).toHaveLength(0)
    })

  })

})

