

const perf_hooks = require('perf_hooks'); 

import { Repository } from '../../../src/models/repository'

import { getChangedFiles, getCommits } from '../../../src/lib/git'

import { setupFixtureRepository } from '../../helpers/repositories'

import { AppFileStatusKind } from '../../../src/models/status'

import { setupLocalConfig } from '../../helpers/local-config'


describe('git/log', () => 
{
  
let repository: Repository

  
beforeEach(async () => 
{
    
var TIMING_TEMP_VAR_AUTOGEN_CALLING_250_setupFixtureRepository__RANDOM = perf_hooks.performance.now();
 
const testRepoPath = await setupFixtureRepository('test-repo')
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/app/test/unit/git/log-test.ts& [10, 4; 10, 66]& TEMP_VAR_AUTOGEN_CALLING_250_setupFixtureRepository__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN_CALLING_250_setupFixtureRepository__RANDOM));
 
    
repository = new Repository(testRepoPath, -1, null, false, [])
  })


  
describe('getCommits', () => 
{
    
it('loads history', async () => 
{
      
const commits = await getCommits(repository, 'HEAD', 100)
      
expect(commits).toHaveLength(5)

      
const firstCommit = commits[commits.length - 1]
      
expect(firstCommit.summary).toBe('first')
      
expect(firstCommit.sha).toBe('7cd6640e5b6ca8dbfd0b33d0281ebe702127079c')
      
expect(firstCommit.shortSha).toBe('7cd6640')
    })


    
it('handles repository with HEAD file on disk', async () => 
{
      
var TIMING_TEMP_VAR_AUTOGEN_CALLING_261_setupFixtureRepository__RANDOM = perf_hooks.performance.now();
 
const path = await setupFixtureRepository('repository-with-HEAD-file')
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/app/test/unit/git/log-test.ts& [26, 6; 26, 76]& TEMP_VAR_AUTOGEN_CALLING_261_setupFixtureRepository__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN_CALLING_261_setupFixtureRepository__RANDOM));
 
      
const repo = new Repository(path, 1, null, false, [])
      
const commits = await getCommits(repo, 'HEAD', 100)
      
expect(commits).toHaveLength(2)
    })


    
it('handles repository with signed commit and log.showSignature set', async () => 
{
      
var TIMING_TEMP_VAR_AUTOGEN_CALLING_265_setupFixtureRepository__RANDOM = perf_hooks.performance.now();
 
const path = await setupFixtureRepository('just-doing-some-signing')
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/app/test/unit/git/log-test.ts& [33, 6; 33, 74]& TEMP_VAR_AUTOGEN_CALLING_265_setupFixtureRepository__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN_CALLING_265_setupFixtureRepository__RANDOM));
 
      
const repository = new Repository(path, 1, null, false, [])

      // ensure the default config is to try and show signatures
      // this should be overriden by the `getCommits` function as it may not
      // have a valid GPG agent configured
      
await setupLocalConfig(repository, [['log.showSignature', 'true']])

      
const commits = await getCommits(repository, 'HEAD', 100)

      
expect(commits).toHaveLength(1)
      
expect(commits[0].sha).toBe('415e4987158c49c383ce7114e0ef00ebf4b070c1')
      
expect(commits[0].shortSha).toBe('415e498')
    })

  })


  
describe('getChangedFiles', () => 
{
    
it('loads the files changed in the commit', async () => 
{
      
const files = await getChangedFiles(
        repository,
        [],
        '7cd6640e5b6ca8dbfd0b33d0281ebe702127079c'
      )
      
expect(files).toHaveLength(1)
      
expect(files[0].path).toBe('README.md')
      
expect(files[0].status.kind).toBe(AppFileStatusKind.New)
    })


    
it('detects renames', async () => 
{
      
var TIMING_TEMP_VAR_AUTOGEN_CALLING_276_setupFixtureRepository__RANDOM = perf_hooks.performance.now();
 
const testRepoPath = await setupFixtureRepository(
        'rename-history-detection'
      )
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/app/test/unit/git/log-test.ts& [62, 6; 64, 7]& TEMP_VAR_AUTOGEN_CALLING_276_setupFixtureRepository__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN_CALLING_276_setupFixtureRepository__RANDOM));
 
      
repository = new Repository(testRepoPath, -1, null, false, [])

      
const first = await getChangedFiles(repository, [], '55bdecb')
      
expect(first).toHaveLength(1)

      
expect(first[0].path).toBe('NEWER.md')
      
expect(first[0].status).toEqual({
        kind: AppFileStatusKind.Renamed,
        oldPath: 'NEW.md',
      })

      
const second = await getChangedFiles(repository, [], 'c898ca8')
      
expect(second).toHaveLength(1)

      
expect(second[0].path).toBe('NEW.md')
      
expect(second[0].status).toEqual({
        kind: AppFileStatusKind.Renamed,
        oldPath: 'OLD.md',
      })
    })


    
it('detect copies', async () => 
{
      
var TIMING_TEMP_VAR_AUTOGEN_CALLING_282_setupFixtureRepository__RANDOM = perf_hooks.performance.now();
 
const testRepoPath = await setupFixtureRepository(
        'copies-history-detection'
      )
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/app/test/unit/git/log-test.ts& [87, 6; 89, 7]& TEMP_VAR_AUTOGEN_CALLING_282_setupFixtureRepository__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN_CALLING_282_setupFixtureRepository__RANDOM));
 
      
repository = new Repository(testRepoPath, -1, null, false, [])

      // ensure the test repository is configured to detect copies
      
await setupLocalConfig(repository, [['diff.renames', 'copies']])

      
const files = await getChangedFiles(repository, [], 'a500bf415')
      
expect(files).toHaveLength(2)

      
expect(files[0].path).toBe('duplicate-with-edits.md')
      
expect(files[0].status).toEqual({
        kind: AppFileStatusKind.Copied,
        oldPath: 'initial.md',
      })

      
expect(files[1].path).toBe('duplicate.md')
      
expect(files[1].status).toEqual({
        kind: AppFileStatusKind.Copied,
        oldPath: 'initial.md',
      })
    })


    
it('handles commit when HEAD exists on disk', async () => 
{
      
const files = await getChangedFiles(repository, [], 'HEAD')
      
expect(files).toHaveLength(1)
      
expect(files[0].path).toBe('README.md')
      
expect(files[0].status.kind).toBe(AppFileStatusKind.Modified)
    })

  })

})

