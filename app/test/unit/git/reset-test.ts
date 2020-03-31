

const perf_hooks = require('perf_hooks'); 

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
    
var TIMING_TEMP_VAR_AUTOGEN_CALLING_253_setupFixtureRepository__RANDOM = perf_hooks.performance.now();
 
const testRepoPath = await setupFixtureRepository('test-repo')
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/app/test/unit/git/reset-test.ts& [14, 4; 14, 66]& TEMP_VAR_AUTOGEN_CALLING_253_setupFixtureRepository__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN_CALLING_253_setupFixtureRepository__RANDOM));
 
    
repository = new Repository(testRepoPath, -1, null, false, [])
  })


  
describe('reset', () => 
{
    
it('can hard reset a repository', async () => 
{
      
const repoPath = repository.path
      
const fileName = 'README.md'
      
const filePath = path.join(repoPath, fileName)

      

var TIMING_TEMP_VAR_AUTOGEN49__RANDOM = perf_hooks.performance.now();
 await  FSE.writeFile(filePath, 'Hi world\n')
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/app/test/unit/git/reset-test.ts& [24, 6; 24, 49]& TEMP_VAR_AUTOGEN49__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN49__RANDOM));
 

      
await reset(repository, GitResetMode.Hard, 'HEAD')

      
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
      

var TIMING_TEMP_VAR_AUTOGEN116__RANDOM = perf_hooks.performance.now();
 await  FSE.unlink(filePath)
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/app/test/unit/git/reset-test.ts& [44, 6; 44, 32]& TEMP_VAR_AUTOGEN116__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN116__RANDOM));
 

      
await resetPaths(repository, GitResetMode.Mixed, 'HEAD', [filePath])

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

