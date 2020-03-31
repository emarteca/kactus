

const perf_hooks = require('perf_hooks'); 
/* eslint-disable no-sync */


import { setupFixtureRepository } from '../helpers/repositories'

import { openSync } from '../helpers/temp'

import { validatedRepositoryPath } from '../../src/lib/stores/helpers/validated-repository-path'


describe('validatedRepositoryPath', () => 
{
  
it('returns the path to the repository', async () => 
{
    
var TIMING_TEMP_VAR_AUTOGEN_CALLING_248_setupFixtureRepository__RANDOM = perf_hooks.performance.now();
 
const testRepoPath = await setupFixtureRepository('test-repo')
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/app/test/unit/validated-repository-path-test.ts& [8, 4; 8, 66]& TEMP_VAR_AUTOGEN_CALLING_248_setupFixtureRepository__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN_CALLING_248_setupFixtureRepository__RANDOM));
 
    
const result = await validatedRepositoryPath(testRepoPath)
    
expect(result).toBe(testRepoPath)
  })


  
it('returns null if the path is not a repository', async () => 
{
    
const testRepoPath = openSync('repo-test').path
    
const result = await validatedRepositoryPath(testRepoPath)
    
expect(result).toBeNull()
  })

})

