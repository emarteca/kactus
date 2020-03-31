

const perf_hooks = require('perf_hooks'); 

import * as path from 'path'


import { Repository } from '../../../src/models/repository'

import {
  listSubmodules,
  resetSubmodulePaths,
} from '../../../src/lib/git/submodule'

import { checkoutBranch, getBranches } from '../../../src/lib/git'

import { setupFixtureRepository } from '../../helpers/repositories'


describe('git/submodule', () => 
{
  
describe('listSubmodules', () => 
{
    
it('returns the submodule entry', async () => 
{
      
var TIMING_TEMP_VAR_AUTOGEN_CALLING_252_setupFixtureRepository__RANDOM = perf_hooks.performance.now();
 
const testRepoPath = await setupFixtureRepository('submodule-basic-setup')
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/app/test/unit/git/submodule-test.ts& [13, 6; 13, 80]& TEMP_VAR_AUTOGEN_CALLING_252_setupFixtureRepository__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN_CALLING_252_setupFixtureRepository__RANDOM));
 
      
const repository = new Repository(testRepoPath, -1, null, false, [])
      
const result = await listSubmodules(repository)
      
expect(result).toHaveLength(1)
      
expect(result[0].sha).toBe('c59617b65080863c4ca72c1f191fa1b423b92223')
      
expect(result[0].path).toBe('foo/submodule')
      
expect(result[0].describe).toBe('first-tag~2')
    })


    
it('returns the expected tag', async () => 
{
      
var TIMING_TEMP_VAR_AUTOGEN_CALLING_259_setupFixtureRepository__RANDOM = perf_hooks.performance.now();
 
const testRepoPath = await setupFixtureRepository('submodule-basic-setup')
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/app/test/unit/git/submodule-test.ts& [23, 6; 23, 80]& TEMP_VAR_AUTOGEN_CALLING_259_setupFixtureRepository__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN_CALLING_259_setupFixtureRepository__RANDOM));
 
      
const repository = new Repository(testRepoPath, -1, null, false, [])

      
const submodulePath = path.join(testRepoPath, 'foo', 'submodule')
      
const submoduleRepository = new Repository(
        submodulePath,
        -1,
        null,
        false,
        []
      )

      
const branches = await getBranches(
        submoduleRepository,
        'refs/remotes/origin/feature-branch'
      )

      
if (branches.length === 0) 
{
        
throw new Error(`Could not find branch: feature-branch`)
      }

      
await checkoutBranch(submoduleRepository, null, branches[0])

      
const result = await listSubmodules(repository)
      
expect(result).toHaveLength(1)
      
expect(result[0].sha).toBe('14425bb2a4ee361af7f789a81b971f8466ae521d')
      
expect(result[0].path).toBe('foo/submodule')
      
expect(result[0].describe).toBe('heads/feature-branch')
    })

  })


  
describe('resetSubmodulePaths', () => 
{
    
it('update submodule to original commit', async () => 
{
      
var TIMING_TEMP_VAR_AUTOGEN_CALLING_271_setupFixtureRepository__RANDOM = perf_hooks.performance.now();
 
const testRepoPath = await setupFixtureRepository('submodule-basic-setup')
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/app/test/unit/git/submodule-test.ts& [56, 6; 56, 80]& TEMP_VAR_AUTOGEN_CALLING_271_setupFixtureRepository__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN_CALLING_271_setupFixtureRepository__RANDOM));
 
      
const repository = new Repository(testRepoPath, -1, null, false, [])

      
const submodulePath = path.join(testRepoPath, 'foo', 'submodule')
      
const submoduleRepository = new Repository(
        submodulePath,
        -1,
        null,
        false,
        []
      )

      
const branches = await getBranches(
        submoduleRepository,
        'refs/remotes/origin/feature-branch'
      )

      
if (branches.length === 0) 
{
        
throw new Error(`Could not find branch: feature-branch`)
      }

      
await checkoutBranch(submoduleRepository, null, branches[0])

      
let result = await listSubmodules(repository)
      
expect(result[0].describe).toBe('heads/feature-branch')

      
await resetSubmodulePaths(repository, ['foo/submodule'])

      
result = await listSubmodules(repository)
      
expect(result[0].describe).toBe('first-tag~2')
    })

  })

})

