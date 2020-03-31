

const perf_hooks = require('perf_hooks'); 

import { IStatusResult } from '../../../../src/lib/git'

import {
  rebase,
  RebaseResult,
  getRebaseSnapshot,
} from '../../../../src/lib/git'

import { createRepository as createShortRebaseTest } from '../../../helpers/repository-builder-rebase-test'

import { createRepository as createLongRebaseTest } from '../../../helpers/repository-builder-long-rebase-test'

import { getStatusOrThrow } from '../../../helpers/status'

import { GitRebaseSnapshot } from '../../../../src/models/rebase'

import { setupEmptyDirectory } from '../../../helpers/repositories'

import { getBranchOrError } from '../../../helpers/git'


const baseBranchName = 'base-branch'

const featureBranchName = 'this-is-a-feature'


describe('git/rebase', () => 
{
  
describe('skips a normal repository', () => 
{
    
it('returns null for rebase progress', async () => 
{
      
const repository = await setupEmptyDirectory()

      
var TIMING_TEMP_VAR_AUTOGEN_CALLING_810_getRebaseSnapshot__RANDOM = perf_hooks.performance.now();
 
var TIMING_TEMP_VAR_AUTOGEN_CALLING_802_getRebaseSnapshot__RANDOM = perf_hooks.performance.now();
 
var TIMING_TEMP_VAR_AUTOGEN_CALLING_778_getRebaseSnapshot__RANDOM = perf_hooks.performance.now();
 
const progress = await getRebaseSnapshot(repository)
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/app/test/unit/git/rebase/progress-test.ts& [21, 6; 21, 58]& TEMP_VAR_AUTOGEN_CALLING_778_getRebaseSnapshot__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN_CALLING_778_getRebaseSnapshot__RANDOM));
 
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/app/test/unit/git/rebase/progress-test.ts& [21, 6; 21, 58]& TEMP_VAR_AUTOGEN_CALLING_802_getRebaseSnapshot__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN_CALLING_802_getRebaseSnapshot__RANDOM));
 
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/app/test/unit/git/rebase/progress-test.ts& [21, 6; 21, 58]& TEMP_VAR_AUTOGEN_CALLING_810_getRebaseSnapshot__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN_CALLING_810_getRebaseSnapshot__RANDOM));
 

      
expect(progress).toEqual(null)
    })

  })


  
describe('can parse progress', () => 
{
    
let result: RebaseResult
    
let snapshot: GitRebaseSnapshot | null
    
let status: IStatusResult

    
beforeEach(async () => 
{
      
const repository = await createShortRebaseTest(
        baseBranchName,
        featureBranchName
      )

      
const featureBranch = await getBranchOrError(
        repository,
        featureBranchName
      )

      
const baseBranch = await getBranchOrError(repository, baseBranchName)

      
result = await rebase(repository, baseBranch, featureBranch)

      
var TIMING_TEMP_VAR_AUTOGEN_CALLING_811_getRebaseSnapshot__RANDOM = perf_hooks.performance.now();
 
var TIMING_TEMP_VAR_AUTOGEN_CALLING_803_getRebaseSnapshot__RANDOM = perf_hooks.performance.now();
 
var TIMING_TEMP_VAR_AUTOGEN_CALLING_779_getRebaseSnapshot__RANDOM = perf_hooks.performance.now();
 
snapshot = await getRebaseSnapshot(repository)
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/app/test/unit/git/rebase/progress-test.ts& [47, 6; 47, 52]& TEMP_VAR_AUTOGEN_CALLING_779_getRebaseSnapshot__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN_CALLING_779_getRebaseSnapshot__RANDOM));
 
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/app/test/unit/git/rebase/progress-test.ts& [47, 6; 47, 52]& TEMP_VAR_AUTOGEN_CALLING_803_getRebaseSnapshot__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN_CALLING_803_getRebaseSnapshot__RANDOM));
 
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/app/test/unit/git/rebase/progress-test.ts& [47, 6; 47, 52]& TEMP_VAR_AUTOGEN_CALLING_811_getRebaseSnapshot__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN_CALLING_811_getRebaseSnapshot__RANDOM));
 

      
status = await getStatusOrThrow(repository)
    })


    
it('returns a value indicating conflicts were encountered', () => 
{
      
expect(result).toBe(RebaseResult.ConflictsEncountered)
    })


    
it('status detects REBASE_HEAD', () => 
{
      
expect(snapshot).not.toEqual(null)
      
const s = snapshot!
      
expect(s.commits.length).toEqual(1)
      
expect(s.commits[0].summary).toEqual('Feature Branch!')

      
expect(s.progress.rebasedCommitCount).toEqual(1)
      
expect(s.progress.totalCommitCount).toEqual(1)
      
expect(s.progress.currentCommitSummary).toEqual('Feature Branch!')
      
expect(s.progress.value).toEqual(1)
    })


    
it('is a detached HEAD state', () => 
{
      
expect(status.currentBranch).toBeUndefined()
    })

  })


  
describe('can parse progress for long rebase', () => 
{
    
let result: RebaseResult
    
let snapshot: GitRebaseSnapshot | null
    
let status: IStatusResult

    
beforeEach(async () => 
{
      
const repository = await createLongRebaseTest(
        baseBranchName,
        featureBranchName
      )

      
const featureBranch = await getBranchOrError(
        repository,
        featureBranchName
      )

      
const baseBranch = await getBranchOrError(repository, baseBranchName)

      
result = await rebase(repository, baseBranch, featureBranch)

      
var TIMING_TEMP_VAR_AUTOGEN_CALLING_812_getRebaseSnapshot__RANDOM = perf_hooks.performance.now();
 
var TIMING_TEMP_VAR_AUTOGEN_CALLING_804_getRebaseSnapshot__RANDOM = perf_hooks.performance.now();
 
var TIMING_TEMP_VAR_AUTOGEN_CALLING_780_getRebaseSnapshot__RANDOM = perf_hooks.performance.now();
 
snapshot = await getRebaseSnapshot(repository)
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/app/test/unit/git/rebase/progress-test.ts& [93, 6; 93, 52]& TEMP_VAR_AUTOGEN_CALLING_780_getRebaseSnapshot__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN_CALLING_780_getRebaseSnapshot__RANDOM));
 
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/app/test/unit/git/rebase/progress-test.ts& [93, 6; 93, 52]& TEMP_VAR_AUTOGEN_CALLING_804_getRebaseSnapshot__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN_CALLING_804_getRebaseSnapshot__RANDOM));
 
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/app/test/unit/git/rebase/progress-test.ts& [93, 6; 93, 52]& TEMP_VAR_AUTOGEN_CALLING_812_getRebaseSnapshot__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN_CALLING_812_getRebaseSnapshot__RANDOM));
 

      
status = await getStatusOrThrow(repository)
    })


    
it('returns a value indicating conflicts were encountered', () => 
{
      
expect(result).toBe(RebaseResult.ConflictsEncountered)
    })


    
it('status detects REBASE_HEAD', () => 
{
      
expect(snapshot).not.toEqual(null)
      
const s = snapshot!
      
expect(s.commits.length).toEqual(10)
      
expect(s.commits[0].summary).toEqual('Feature Branch First Commit!')

      
expect(s.progress.rebasedCommitCount).toEqual(1)
      
expect(s.progress.totalCommitCount).toEqual(10)
      
expect(s.progress.currentCommitSummary).toEqual(
        'Feature Branch First Commit!'
      )
      
expect(s.progress.value).toEqual(0.1)
    })


    
it('is a detached HEAD state', () => 
{
      
expect(status.currentBranch).toBeUndefined()
    })

  })

})

