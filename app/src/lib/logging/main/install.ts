

const perf_hooks = require('perf_hooks'); 

import { log } from '../../../main-process/log'

import { formatLogMessage } from '../format-log-message'


const g = global as any


g.log = {
  error(message: string, error?: Error) 
{
    
var TIMING_TEMP_VAR_AUTOGEN_CALLING_734_log__RANDOM = perf_hooks.performance.now();
 
log('error', '[main] ' + formatLogMessage(message, error))
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/app/src/lib/logging/main/install.ts& [7, 4; 7, 62]& TEMP_VAR_AUTOGEN_CALLING_734_log__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN_CALLING_734_log__RANDOM));
 
  },

  warn(message: string, error?: Error) 
{
    
var TIMING_TEMP_VAR_AUTOGEN_CALLING_735_log__RANDOM = perf_hooks.performance.now();
 
log('warn', '[main] ' + formatLogMessage(message, error))
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/app/src/lib/logging/main/install.ts& [10, 4; 10, 61]& TEMP_VAR_AUTOGEN_CALLING_735_log__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN_CALLING_735_log__RANDOM));
 
  },

  info(message: string, error?: Error) 
{
    
var TIMING_TEMP_VAR_AUTOGEN_CALLING_736_log__RANDOM = perf_hooks.performance.now();
 
log('info', '[main] ' + formatLogMessage(message, error))
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/app/src/lib/logging/main/install.ts& [13, 4; 13, 61]& TEMP_VAR_AUTOGEN_CALLING_736_log__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN_CALLING_736_log__RANDOM));
 
  },

  debug(message: string, error?: Error) 
{
    
var TIMING_TEMP_VAR_AUTOGEN_CALLING_737_log__RANDOM = perf_hooks.performance.now();
 
log('debug', '[main] ' + formatLogMessage(message, error))
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/app/src/lib/logging/main/install.ts& [16, 4; 16, 62]& TEMP_VAR_AUTOGEN_CALLING_737_log__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN_CALLING_737_log__RANDOM));
 
  },

} as IKactusLogger
