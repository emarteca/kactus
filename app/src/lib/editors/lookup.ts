

const perf_hooks = require('perf_hooks'); 

import {
  ExternalEditor,
  ExternalEditorError,
  getAvailableEditors,
} from './utils'

import { IFoundEditor } from './found-editor'


let editorCache: ReadonlyArray<IFoundEditor<ExternalEditor>> | null = null

/**
 * Resolve a list of installed editors on the user's machine, using the known
 * install identifiers that each OS supports.
 */

export 
async function getCachedAvailableEditors(): Promise<
  ReadonlyArray<IFoundEditor<ExternalEditor>>
> 
{
  
if (editorCache && editorCache.length > 0) 
{
    
return editorCache
  }

  
var TIMING_TEMP_VAR_AUTOGEN_CALLING_807_getAvailableEditors__RANDOM = perf_hooks.performance.now();
 
editorCache = await getAvailableEditors()
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/app/src/lib/editors/lookup.ts& [20, 2; 20, 43]& TEMP_VAR_AUTOGEN_CALLING_807_getAvailableEditors__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN_CALLING_807_getAvailableEditors__RANDOM));
 
  
return editorCache
}

/**
 * Find an editor installed on the machine using the friendly name, or the
 * first valid editor if `null` is provided.
 *
 * Will throw an error if no editors are found, or if the editor name cannot
 * be found (i.e. it has been removed).
 */

export 
async function findEditorOrDefault(
  name?: string
): Promise<IFoundEditor<ExternalEditor> | null> 
{
  
var TIMING_TEMP_VAR_AUTOGEN_CALLING_808_getAvailableEditors__RANDOM = perf_hooks.performance.now();
 
const editors = await getAvailableEditors()
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/app/src/lib/editors/lookup.ts& [34, 2; 34, 45]& TEMP_VAR_AUTOGEN_CALLING_808_getAvailableEditors__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN_CALLING_808_getAvailableEditors__RANDOM));
 
  
if (editors.length === 0) 
{
    
return null
  }

  
if (name) 
{
    
const match = editors.find(p => p.editor === name) || null
    
if (!match) 
{
      
const menuItemName = 'Preferences'
      
const message = `The editor '${name}' could not be found. Please open ${menuItemName} and choose an available editor.`

      
throw new ExternalEditorError(message, { openPreferences: true })
    }

    
return match
  }

  
return editors[0]
}
