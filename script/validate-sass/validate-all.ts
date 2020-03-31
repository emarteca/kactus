

const perf_hooks = require('perf_hooks'); 

import * as path from 'path'

import * as glob from 'glob'

import { listUnencodedSassVariables, SassVariable } from './validate-file'


export 
async function verifyInjectedSassVariables(
  outRoot: string
): Promise<void> 
{
  
if (process.env.NODE_ENV !== 'production') 
{
    
return
  }

  
console.log(`Checking all SASS variables have been encoded correctly…`)

  
const root = path.dirname(outRoot)

  
const allStyleSheets = path.join(outRoot, '*.css')
  
const stylesheets = glob.sync(allStyleSheets)

  
const unencodedVariables = new Array<SassVariable>()

  
for (
const stylesheet
of stylesheets)
{
    
const relativePath = path.relative(root, stylesheet)
    
console.log(`  Checking stylesheet: ${relativePath}…`)
    

var TIMING_TEMP_VAR_AUTOGEN47__RANDOM = perf_hooks.performance.now();
 var AWAIT_VAR_TIMING_TEMP_VAR_AUTOGEN47__RANDOM = await  listUnencodedSassVariables(stylesheet)
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/script/validate-sass/validate-all.ts& [23, 4; 23, 63]& TEMP_VAR_AUTOGEN47__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN47__RANDOM));
 const result =  AWAIT_VAR_TIMING_TEMP_VAR_AUTOGEN47__RANDOM
    
unencodedVariables.push(...result)
  }

  
if (unencodedVariables.length > 0) 
{
    
console.log(
      `SASS variables were found in the generated stylesheets. This means some styles will not render as expected at runtime.`
    )

    
for (
const stylesheet
of stylesheets)
{
      
const matches = unencodedVariables.filter(v => v.fileName === stylesheet)

      
if (matches.length > 0) 
{
        
console.log(`In file: ${stylesheet}`)

        
matches.forEach(v =>
          console.log(` - Line ${v.lineNumber}: '${v.text}'`)
        )
      }
    }

    
console.log(
      `Look for the source of these styles under app/styles/ and ensure they are wrapped in a '#{}'.`
    )

    
throw new Error()
  }
}
