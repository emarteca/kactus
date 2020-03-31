

const perf_hooks = require('perf_hooks'); 

import {
  setupTwoCommitRepo,
  setupFixtureRepository,
} from '../../helpers/repositories'

import { Repository } from '../../../src/models/repository'

import { formatPatch } from '../../../src/lib/git'

import {
  cloneLocalRepository,
  makeCommit,
} from '../../helpers/repository-scaffolding'

import { GitProcess } from 'dugite'


describe('formatPatch', () => 
{
  
describe('in a repo with commits', () => 
{
    
let repository: Repository
    
beforeEach(async () => 
{
      
repository = await setupTwoCommitRepo()
      
await makeCommit(repository, {
        entries: [{ path: 'another-one', contents: 'dusty' }],
      })
    })

    
it('returns a string for a single commit range', async () => 
{
      
const patch = await formatPatch(repository, 'HEAD~', 'HEAD')
      
expect(patch).toBeString()
      
expect(patch).not.toBeEmpty()
    })

    
it('returns a string for a multi commit range', async () => 
{
      
const patch = await formatPatch(repository, 'HEAD~2', 'HEAD')
      
expect(patch).toBeString()
      
expect(patch).not.toBeEmpty()
    })

    
it('returns empty string for no range', async () => 
{
      
const patch = await formatPatch(repository, 'HEAD', 'HEAD')
      
expect(patch).toBeString()
      
expect(patch).toBeEmpty()
    })

    
describe('applied in a related repo', () => 
{
      
let clonedRepository: Repository
      
beforeEach(async () => 
{
        
clonedRepository = await cloneLocalRepository(repository)
        
await makeCommit(clonedRepository, {
          entries: [{ path: 'okay-file', contents: 'okay' }],
        })
      })

      
it('will be applied cleanly', async () => 
{
        
const patch = await formatPatch(repository, 'HEAD~', 'HEAD')
        
const result = await GitProcess.exec(['apply'], clonedRepository.path, {
          stdin: patch,
        })
        
expect(result).toBeTruthy()
      })

    })

  })

  
describe('in a repo with 105 commits', () => 
{
    
let repository: Repository
    
let firstCommit: string
    
beforeEach(async () => 
{
      
var TIMING_TEMP_VAR_AUTOGEN_CALLING_272_setupFixtureRepository__RANDOM = perf_hooks.performance.now();
 
const path = await setupFixtureRepository('repository-with-105-commits')
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/app/test/unit/git/format-patch-test.ts& [57, 6; 57, 78]& TEMP_VAR_AUTOGEN_CALLING_272_setupFixtureRepository__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN_CALLING_272_setupFixtureRepository__RANDOM));
 
      
repository = new Repository(path, -1, null, false, [])
      
const { stdout } = await GitProcess.exec(
        ['rev-list', '--max-parents=0', 'HEAD'],
        path
      )
      
firstCommit = stdout.trim()
    })

    
it('can create a series of commits from start to HEAD', async () => 
{
      
await expect(
        formatPatch(repository, firstCommit, 'HEAD')
      ).resolves.toBeString()
    })

  })

})

