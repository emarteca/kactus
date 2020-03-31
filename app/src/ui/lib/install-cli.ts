

const perf_hooks = require('perf_hooks'); 

import * as FSE from 'fs-extra'

import * as Path from 'path'


import * as fsAdmin from 'fs-admin'

/** The path for the installed command line tool. */

export 
const InstalledCLIPath = '/usr/local/bin/kactus'

/** The path to the packaged CLI. */

const PackagedPath = Path.resolve(__dirname, 'static', 'kactus.sh')

/** Install the command line tool on macOS. */

export 
async function installCLI(): Promise<void> 
{
  
const installedPath = await getResolvedInstallPath()
  
if (installedPath === PackagedPath) 
{
    
return
  }

  
try 
{
    
var TIMING_TEMP_VAR_AUTOGEN_CALLING_719_symlinkCLI__RANDOM = perf_hooks.performance.now();
 
var TIMING_TEMP_VAR_AUTOGEN_CALLING_713_symlinkCLI__RANDOM = perf_hooks.performance.now();
 
await symlinkCLI(false)
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/app/src/ui/lib/install-cli.ts& [19, 4; 19, 27]& TEMP_VAR_AUTOGEN_CALLING_713_symlinkCLI__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN_CALLING_713_symlinkCLI__RANDOM));
 
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/app/src/ui/lib/install-cli.ts& [19, 4; 19, 27]& TEMP_VAR_AUTOGEN_CALLING_719_symlinkCLI__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN_CALLING_719_symlinkCLI__RANDOM));
 
  } 

catch (e) 
{
    // If we error without running as an admin, try again as an admin.
    
var TIMING_TEMP_VAR_AUTOGEN_CALLING_720_symlinkCLI__RANDOM = perf_hooks.performance.now();
 
var TIMING_TEMP_VAR_AUTOGEN_CALLING_714_symlinkCLI__RANDOM = perf_hooks.performance.now();
 
await symlinkCLI(true)
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/app/src/ui/lib/install-cli.ts& [22, 4; 22, 26]& TEMP_VAR_AUTOGEN_CALLING_714_symlinkCLI__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN_CALLING_714_symlinkCLI__RANDOM));
 
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/app/src/ui/lib/install-cli.ts& [22, 4; 22, 26]& TEMP_VAR_AUTOGEN_CALLING_720_symlinkCLI__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN_CALLING_720_symlinkCLI__RANDOM));
 
  }
}


async function getResolvedInstallPath(): Promise<string | null> 
{
  
try 
{
    
return await FSE.readlink(InstalledCLIPath)
  } 

catch 
{
    
return null
  }
}


function removeExistingSymlink(asAdmin: boolean) 
{
  
if (!asAdmin) 
{
    
return FSE.unlink(InstalledCLIPath)
  }

  
return new Promise<void>((resolve, reject) => 
{
    
fsAdmin.unlink(InstalledCLIPath, error => 
{
      
if (error !== null) 
{
        
reject(
          new Error(
            `Failed to remove file at ${InstalledCLIPath}. Authorization of GitHub Desktop Helper is required.`
          )
        )
        
return
      }

      
resolve()
    })

  })

}


function createDirectories(asAdmin: boolean) 
{
  
const path = Path.dirname(InstalledCLIPath)

  
if (!asAdmin) 
{
    
return FSE.mkdirp(path)
  }

  
return new Promise<void>((resolve, reject) => 
{
    
fsAdmin.makeTree(path, error => 
{
      
if (error !== null) 
{
        
reject(
          new Error(
            `Failed to create intermediate directories to ${InstalledCLIPath}`
          )
        )
        
return
      }

      
resolve()
    })

  })

}


function createNewSymlink(asAdmin: boolean) 
{
  
if (!asAdmin) 
{
    
return FSE.symlink(PackagedPath, InstalledCLIPath)
  }

  
return new Promise<void>((resolve, reject) => 
{
    
fsAdmin.symlink(PackagedPath, InstalledCLIPath, error => 
{
      
if (error !== null) 
{
        
reject(
          new Error(`Failed to symlink ${PackagedPath} to ${InstalledCLIPath}`)
        )
        
return
      }

      
resolve()
    })

  })

}


async function symlinkCLI(asAdmin: boolean): Promise<void> 
{
  
await removeExistingSymlink(asAdmin)
  

var TIMING_TEMP_VAR_AUTOGEN257__RANDOM = perf_hooks.performance.now();
 await  createDirectories(asAdmin)
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/app/src/ui/lib/install-cli.ts& [99, 2; 99, 34]& TEMP_VAR_AUTOGEN257__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN257__RANDOM));
 
  

var TIMING_TEMP_VAR_AUTOGEN259__RANDOM = perf_hooks.performance.now();
 await  createNewSymlink(asAdmin)
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/app/src/ui/lib/install-cli.ts& [100, 2; 100, 33]& TEMP_VAR_AUTOGEN259__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN259__RANDOM));
 
}
