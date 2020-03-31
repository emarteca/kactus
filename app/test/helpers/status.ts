

const perf_hooks = require('perf_hooks'); 

import { getStatus } from '../../src/lib/git'

import { Repository } from '../../src/models/repository'

/**
 * git status may return null in some edge cases but for the most
 * part we know we'll get a valid input so let's fail the test
 * if we get null, rather than need to handle it everywhere
 */

export 
const getStatusOrThrow = async (repository: Repository) => 
{
  
var TIMING_TEMP_VAR_AUTOGEN_CALLING_827_getStatus__RANDOM = perf_hooks.performance.now();
 
var TIMING_TEMP_VAR_AUTOGEN_CALLING_816_getStatus__RANDOM = perf_hooks.performance.now();
 
const inner = await getStatus(repository, [])
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/app/test/helpers/status.ts& [9, 2; 9, 47]& TEMP_VAR_AUTOGEN_CALLING_816_getStatus__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN_CALLING_816_getStatus__RANDOM));
 
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/app/test/helpers/status.ts& [9, 2; 9, 47]& TEMP_VAR_AUTOGEN_CALLING_827_getStatus__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN_CALLING_827_getStatus__RANDOM));
 
  
if (inner == null) 
{
    
throw new Error('git status returned null which was not expected')
  }

  
return inner
}
