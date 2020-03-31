

const perf_hooks = require('perf_hooks'); 

import { GitStore } from './stores'

import { Repository } from '../models/repository'

import { Account } from '../models/account'

import { getAccountForRepository } from './get-account-for-repository'

import { API } from './api'

import { matchGitHubRepository } from './repository-matching'

/**
 * Use the GitHub API to find the last push date for a repository, favouring
 * the current remote (if defined) or falling back to the detected GitHub remote
 * if no tracking information set for the current branch.
 *
 * Returns null if no date can be detected.
 *
 * @param accounts available accounts in the app
 * @param gitStore Git information about the repository
 * @param repository the local repository tracked by Desktop
 */

export 
async function inferLastPushForRepository(
  accounts: ReadonlyArray<Account>,
  gitStore: GitStore,
  repository: Repository
): Promise<Date | null> 
{
  
const account = getAccountForRepository(accounts, repository)
  
if (account == null) 
{
    
return null
  }

  
await gitStore.loadRemotes()

  
const api = API.fromAccount(account)
  
let lastPushDate: Date | null = null
  
if (gitStore.currentRemote !== null) 
{
    
const matchedRepository = matchGitHubRepository(
      accounts,
      gitStore.currentRemote.url
    )

    
if (matchedRepository !== null) 
{
      
const { owner, name } = matchedRepository
      
const repo = await api.fetchRepository(owner, name)

      
if (repo !== null) 
{
        
lastPushDate = new Date(repo.pushed_at)
      }
    }
  }

  
if (repository.gitHubRepository !== null) 
{
    
const { owner, name } = repository.gitHubRepository
    
const repo = await api.fetchRepository(owner.login, name)

    
if (repo !== null) 
{
      
lastPushDate = new Date(repo.pushed_at)
    }
  }

  

var TIMING_TEMP_VAR_AUTOGEN161__RANDOM = perf_hooks.performance.now();
 await  gitStore.updateLastFetched()
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/app/src/lib/infer-last-push-for-repository.ts& [57, 2; 57, 36]& TEMP_VAR_AUTOGEN161__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN161__RANDOM));
 

  
return lastPushDate
}
