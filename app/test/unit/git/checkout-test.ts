

const perf_hooks = require('perf_hooks'); 

import { shell } from '../../helpers/test-app-shell'

import {
  setupEmptyRepository,
  setupFixtureRepository,
} from '../../helpers/repositories'


import { Repository } from '../../../src/models/repository'

import { checkoutBranch, getBranches, createBranch } from '../../../src/lib/git'

import { TipState, IValidBranch } from '../../../src/models/tip'

import { GitStore } from '../../../src/lib/stores'

import { Branch, BranchType } from '../../../src/models/branch'

import { getStatusOrThrow } from '../../helpers/status'

import { GitProcess } from 'dugite'


describe('git/checkout', () => 
{
  
it('throws when invalid characters are used for branch name', async () => 
{
    
const repository = await setupEmptyRepository()

    
const branch: Branch = {
      name: '..',
      nameWithoutRemote: '..',
      upstream: null,
      upstreamWithoutRemote: null,
      type: BranchType.Local,
      tip: {
        sha: '',
        shortSha: '',
        summary: '',
        body: '',
        author: {
          name: '',
          email: '',
          date: new Date(),
          tzOffset: 0,
        },
        committer: {
          name: '',
          email: '',
          date: new Date(),
          tzOffset: 0,
        },
        authoredByCommitter: true,
        parentSHAs: [],
        trailers: [],
        coAuthors: [],
      },
      remote: null,
    }

    
let errorRaised = false
    
try 
{
      
await checkoutBranch(repository, null, branch)
    } 

catch (error) 
{
      
errorRaised = true
      
expect(error.message).toBe('fatal: invalid reference: ..\n')
    }

    
expect(errorRaised).toBe(true)
  })


  
it('can checkout a valid branch name in an existing repository', async () => 
{
    
var TIMING_TEMP_VAR_AUTOGEN_CALLING_274_setupFixtureRepository__RANDOM = perf_hooks.performance.now();
 
const path = await setupFixtureRepository('repo-with-many-refs')
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/app/test/unit/git/checkout-test.ts& [61, 4; 61, 68]& TEMP_VAR_AUTOGEN_CALLING_274_setupFixtureRepository__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN_CALLING_274_setupFixtureRepository__RANDOM));
 
    
const repository = new Repository(path, -1, null, false, [])

    
const branches = await getBranches(
      repository,
      'refs/heads/commit-with-long-description'
    )

    
if (branches.length === 0) 
{
      
throw new Error(`Could not find branch: commit-with-long-description`)
    }

    
await checkoutBranch(repository, null, branches[0])

    
const store = new GitStore(repository, shell)
    
await store.loadStatus([])
    
const tip = store.tip

    
expect(tip.kind).toBe(TipState.Valid)

    
const validBranch = tip as IValidBranch
    
expect(validBranch.branch.name).toBe('commit-with-long-description')
  })


  
it('can checkout a branch when it exists on multiple remotes', async () => 
{
    
var TIMING_TEMP_VAR_AUTOGEN_CALLING_281_setupFixtureRepository__RANDOM = perf_hooks.performance.now();
 
const path = await setupFixtureRepository('checkout-test-cases')
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/app/test/unit/git/checkout-test.ts& [86, 4; 86, 68]& TEMP_VAR_AUTOGEN_CALLING_281_setupFixtureRepository__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN_CALLING_281_setupFixtureRepository__RANDOM));
 
    
const repository = new Repository(path, -1, null, false, [])

    
const expectedBranch = 'first'
    
const firstRemote = 'first-remote'
    
const secondRemote = 'second-remote'

    
const branches = await getBranches(repository)
    
const firstBranch = `${firstRemote}/${expectedBranch}`
    
const firstRemoteBranch = branches.find(b => b.name === firstBranch)

    
if (firstRemoteBranch == null) 
{
      
throw new Error(`Could not find branch: '${firstBranch}'`)
    }

    
const secondBranch = `${secondRemote}/${expectedBranch}`
    
const secondRemoteBranch = branches.find(b => b.name === secondBranch)

    
if (secondRemoteBranch == null) 
{
      
throw new Error(`Could not find branch: '${secondBranch}'`)
    }

    
await checkoutBranch(repository, null, firstRemoteBranch)

    
const store = new GitStore(repository, shell)
    
await store.loadStatus([])
    
const tip = store.tip

    
expect(tip.kind).toBe(TipState.Valid)

    
const validBranch = tip as IValidBranch
    
expect(validBranch.branch.name).toBe(expectedBranch)
    
expect(validBranch.branch.type).toBe(BranchType.Local)
    
expect(validBranch.branch.remote).toBe('first-remote')
  })


  
it('will fail when an existing branch matches the remote branch', async () => 
{
    
var TIMING_TEMP_VAR_AUTOGEN_CALLING_286_setupFixtureRepository__RANDOM = perf_hooks.performance.now();
 
const path = await setupFixtureRepository('checkout-test-cases')
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/app/test/unit/git/checkout-test.ts& [123, 4; 123, 68]& TEMP_VAR_AUTOGEN_CALLING_286_setupFixtureRepository__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN_CALLING_286_setupFixtureRepository__RANDOM));
 
    
const repository = new Repository(path, -1, null, false, [])

    
const expectedBranch = 'first'
    
const firstRemote = 'first-remote'

    
const branches = await getBranches(repository)
    
const firstBranch = `${firstRemote}/${expectedBranch}`
    
const remoteBranch = branches.find(b => b.name === firstBranch)

    
if (remoteBranch == null) 
{
      
throw new Error(`Could not find branch: '${firstBranch}'`)
    }

    
await createBranch(repository, expectedBranch, null)

    
let errorRaised = false

    
try 
{
      
await checkoutBranch(repository, null, remoteBranch)
    } 

catch (error) 
{
      
errorRaised = true
      
expect(error.message).toBe('A branch with that name already exists.')
    }

    
expect(errorRaised).toBe(true)
  })


  
describe('with submodules', () => 
{
    
it('cleans up an submodule that no longer exists', async () => 
{
      
var TIMING_TEMP_VAR_AUTOGEN_CALLING_290_setupFixtureRepository__RANDOM = perf_hooks.performance.now();
 
const path = await setupFixtureRepository('test-submodule-checkouts')
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/app/test/unit/git/checkout-test.ts& [153, 6; 153, 75]& TEMP_VAR_AUTOGEN_CALLING_290_setupFixtureRepository__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN_CALLING_290_setupFixtureRepository__RANDOM));
 
      
const repository = new Repository(path, -1, null, false, [])

      // put the repository into a known good state
      
await GitProcess.exec(
        ['checkout', 'add-private-repo', '-f', '--recurse-submodules'],
        path
      )

      
const branches = await getBranches(repository)
      
const masterBranch = branches.find(b => b.name === 'master')

      
if (masterBranch == null) 
{
        
throw new Error(`Could not find branch: 'master'`)
      }

      
await checkoutBranch(repository, null, masterBranch)

      
const status = await getStatusOrThrow(repository)

      
expect(status.workingDirectory.files).toHaveLength(0)
    })


    
it('updates a changed submodule reference', async () => 
{
      
var TIMING_TEMP_VAR_AUTOGEN_CALLING_295_setupFixtureRepository__RANDOM = perf_hooks.performance.now();
 
const path = await setupFixtureRepository('test-submodule-checkouts')
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/app/test/unit/git/checkout-test.ts& [177, 6; 177, 75]& TEMP_VAR_AUTOGEN_CALLING_295_setupFixtureRepository__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN_CALLING_295_setupFixtureRepository__RANDOM));
 
      
const repository = new Repository(path, -1, null, false, [])

      // put the repository into a known good state
      
await GitProcess.exec(
        ['checkout', 'master', '-f', '--recurse-submodules'],
        path
      )

      
const branches = await getBranches(repository)
      
const devBranch = branches.find(b => b.name === 'dev')

      
if (devBranch == null) 
{
        
throw new Error(`Could not find branch: 'dev'`)
      }

      
await checkoutBranch(repository, null, devBranch)

      
const status = await getStatusOrThrow(repository)
      
expect(status.workingDirectory.files).toHaveLength(0)
    })

  })

})

