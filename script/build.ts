

const perf_hooks = require('perf_hooks'); 
/* eslint-disable no-sync */
/// <reference path="./globals.d.ts" />


import * as path from 'path'

import * as cp from 'child_process'

import * as fs from 'fs-extra'

import * as packager from 'electron-packager'


import { externals } from '../app/webpack.common'


interface IFrontMatterResult<T> {
  readonly attributes: T
  readonly body: string
}


interface IChooseALicense {
  readonly title: string
  readonly nickname?: string
  readonly featured?: boolean
  readonly hidden?: boolean
}


export 
interface ILicense {
  readonly name: string
  readonly featured: boolean
  readonly body: string
  readonly hidden: boolean
}


const frontMatter: <T>(
  path: string
) => IFrontMatterResult<T> = require('front-matter')


import { getBundleID, getProductName } from '../app/package-info'


import { getReleaseChannel, getDistRoot, getExecutableName } from './dist-info'

import { isRunningOnFork, isCircleCI } from './build-platforms'


import { updateLicenseDump } from './licenses/update-license-dump'

import { verifyInjectedSassVariables } from './validate-sass/validate-all'


const projectRoot = path.join(__dirname, '..')

const outRoot = path.join(projectRoot, 'out')


const isPublishableBuild = getReleaseChannel() !== 'development'


console.log(`Building for ${getReleaseChannel()}…`)


console.log('Removing old distribution…')

fs.removeSync(getDistRoot())


console.log('Copying dependencies…')

copyDependencies()


console.log('Packaging emoji…')

copyEmoji()


console.log('Copying static resources…')

copyStaticResources()


console.log('Parsing license metadata…')

generateLicenseMetadata(outRoot)


moveAnalysisFiles()


if (isCircleCI() && !isRunningOnFork()) 
{
  
console.log('Setting up keychain…')
  
cp.execSync(path.join(__dirname, 'setup-macos-keychain'))
}


var TIMING_TEMP_VAR_AUTOGEN_CALLING_145_verifyInjectedSassVariables__RANDOM = perf_hooks.performance.now();
 
verifyInjectedSassVariables(outRoot)
  .catch(err => 
{
    
console.error(
      'Error verifying the Sass variables in the rendered app. This is fatal for a published build.'
    )

    
if (isPublishableBuild) 
{
      
process.exit(1)
    }
  })

  .then(() => 
{
    
console.log('Updating our licenses dump…')
    
var TIMING_TEMP_VAR_AUTOGEN_CALLING_688_updateLicenseDump__RANDOM = perf_hooks.performance.now();
 
var TIMING_TEMP_VAR_AUTOGEN_CALLING_322_updateLicenseDump__RANDOM = perf_hooks.performance.now();
 
return updateLicenseDump(projectRoot, outRoot).catch(err => 
{
      
console.error(
        'Error updating the license dump. This is fatal for a published build.'
      )
      
console.error(err)

      
if (isPublishableBuild) 
{
        
process.exit(1)
      }
    })

console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/script/build.ts& [82, 4; 91, 6]& TEMP_VAR_AUTOGEN_CALLING_322_updateLicenseDump__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN_CALLING_322_updateLicenseDump__RANDOM));
 
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/script/build.ts& [82, 4; 91, 6]& TEMP_VAR_AUTOGEN_CALLING_688_updateLicenseDump__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN_CALLING_688_updateLicenseDump__RANDOM));
 
  })

  .then(() => 
{
    
console.log('Packaging…')
    
return packageApp()
  })

  .catch(err => 
{
    
console.error(err)
    
process.exit(1)
  })

  .then(appPaths => 
{
    
console.log(`Built to ${appPaths}`)
  })

console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/script/build.ts& [70, 0; 103, 4]& TEMP_VAR_AUTOGEN_CALLING_145_verifyInjectedSassVariables__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN_CALLING_145_verifyInjectedSassVariables__RANDOM));
 

/**
 * The additional packager options not included in the existing typing.
 *
 * See https://github.com/desktop/desktop/issues/2429 for some history on this.
 */

interface IPackageAdditionalOptions {
  readonly protocols: ReadonlyArray<{
    readonly name: string
    readonly schemes: ReadonlyArray<string>
  }>
}


function packageApp() 
{
  
const options: packager.Options & IPackageAdditionalOptions = {
    name: getExecutableName(),
    platform: 'darwin',
    arch: 'x64',
    asar: false, // TODO: Probably wanna enable this down the road.
    out: getDistRoot(),
    icon: path.join(projectRoot, 'app', 'static', 'logos', 'icon-logo'),
    dir: outRoot,
    overwrite: true,
    tmpdir: false,
    derefSymlinks: false,
    prune: false, // We'll prune them ourselves below.
    ignore: [
      new RegExp('/node_modules/electron($|/)'),
      new RegExp('/node_modules/electron-packager($|/)'),
      new RegExp('/\\.git($|/)'),
      new RegExp('/node_modules/\\.bin($|/)'),
    ],
    appCopyright: 'Copyright © 2019 Mathieu Dutour.',

    // macOS
    appBundleId: getBundleID(),
    appCategoryType: 'public.app-category.developer-tools',
    darwinDarkModeSupport: true,
    osxSign: {
      entitlements: path.join(__dirname, './entitlement.plist'),
      // @ts-ignore
      entitlementsInherit: path.join(__dirname, './entitlement.plist'),
      gatekeeperAssess: false,
      'entitlements-inherit': path.join(__dirname, './entitlement.plist'),
      'gatekeeper-assess': false,
    },
    ...(process.env.NODE_ENV === 'development' &&
    process.env.APPLE_ID &&
    process.env.APPLE_ID_PASSWORD
      ? {}
      : {
          osxNotarize: {
            ascProvider: process.env.APPLE_TEAM,
            appleId: process.env.APPLE_ID || '',
            appleIdPassword: process.env.APPLE_ID_PASSWORD || '',
          },
        }),
    protocols: [
      {
        name: getBundleID(),
        schemes: [
          isPublishableBuild ? 'x-kactus-auth' : 'x-kactus-dev-auth',
          'x-kactus-client',
          'x-github-client',
          'github-mac',
          'kactus',
        ],
      },
    ],
    extendInfo: `${projectRoot}/script/info.plist`,
  }

  
return packager(options)
}


function removeAndCopy(source: string, destination: string) 
{
  
fs.removeSync(destination)
  
fs.copySync(source, destination)
}


function copyEmoji() 
{
  
const emojiImages = path.join(projectRoot, 'gemoji', 'images', 'emoji')
  
const emojiImagesDestination = path.join(outRoot, 'emoji')
  
removeAndCopy(emojiImages, emojiImagesDestination)

  
const emojiJSON = path.join(projectRoot, 'gemoji', 'db', 'emoji.json')
  
const emojiJSONDestination = path.join(outRoot, 'emoji.json')
  
removeAndCopy(emojiJSON, emojiJSONDestination)
}


function copyStaticResources() 
{
  
const dirName = process.platform
  
const platformSpecific = path.join(projectRoot, 'app', 'static', dirName)
  
const common = path.join(projectRoot, 'app', 'static', 'common')
  
const destination = path.join(outRoot, 'static')
  
fs.removeSync(destination)
  
if (fs.existsSync(platformSpecific)) 
{
    
fs.copySync(platformSpecific, destination)
  }
  
fs.copySync(common, destination, { overwrite: false })
}


function moveAnalysisFiles() 
{
  
const rendererReport = 'renderer.report.html'
  
const analysisSource = path.join(outRoot, rendererReport)
  
if (fs.existsSync(analysisSource)) 
{
    
const distRoot = getDistRoot()
    
const destination = path.join(distRoot, rendererReport)
    
fs.mkdirpSync(distRoot)
    // there's no moveSync API here, so let's do it the old fashioned way
    //
    // unlinkSync below ensures that the analysis file isn't bundled into
    // the app by accident
    
fs.copySync(analysisSource, destination, { overwrite: true })
    
fs.unlinkSync(analysisSource)
  }
}


function copyDependencies() 
{
  // eslint-disable-next-line import/no-dynamic-require
  
const originalPackage: Package = require(path.join(
    projectRoot,
    'app',
    'package.json'
  ))

  
const oldDependencies = originalPackage.dependencies
  
const newDependencies: PackageLookup = {}

  
for (
const name
of Object.keys(oldDependencies))
{
    
const spec = oldDependencies[name]
    
if (externals.indexOf(name) !== -1) 
{
      
newDependencies[name] = spec
    }
  }

  
const oldDevDependencies = originalPackage.devDependencies
  
const newDevDependencies: PackageLookup = {}

  
if (!isPublishableBuild) 
{
    
for (
const name
of Object.keys(oldDevDependencies))
{
      
const spec = oldDevDependencies[name]
      
if (externals.indexOf(name) !== -1) 
{
        
newDevDependencies[name] = spec
      }
    }
  }

  // The product name changes depending on whether it's a prod build or dev
  // build, so that we can have them running side by side.
  
const updatedPackage = Object.assign({}, originalPackage, {
    productName: getProductName(),
    dependencies: newDependencies,
    devDependencies: newDevDependencies,
  })

  
if (isPublishableBuild) 
{
    
delete updatedPackage.devDependencies
  }

  
fs.writeFileSync(
    path.join(outRoot, 'package.json'),
    JSON.stringify(updatedPackage)
  )

  
fs.removeSync(path.resolve(outRoot, 'node_modules'))

  
if (
    Object.keys(newDependencies).length ||
    Object.keys(newDevDependencies).length
  ) 
{
    
console.log('  Installing dependencies via npm…')
    
cp.execSync('npm install', { cwd: outRoot, env: process.env })
  }

  
if (!isPublishableBuild) 
{
    
console.log(
      '  Installing 7zip (dependency for electron-devtools-installer)'
    )

    
const sevenZipSource = path.resolve(projectRoot, 'app/node_modules/7zip')
    
const sevenZipDestination = path.resolve(outRoot, 'node_modules/7zip')

    
fs.mkdirpSync(sevenZipDestination)
    
fs.copySync(sevenZipSource, sevenZipDestination)
  }

  
console.log('  Copying git environment…')
  
const gitDir = path.resolve(outRoot, 'git')
  
fs.removeSync(gitDir)
  
fs.mkdirpSync(gitDir)
  
fs.copySync(path.resolve(projectRoot, 'app/node_modules/dugite/git'), gitDir)

  
console.log('  Copying app-path binary…')
  
const appPathMain = path.resolve(outRoot, 'main')
  
fs.removeSync(appPathMain)
  
fs.copySync(
    path.resolve(projectRoot, 'app/node_modules/app-path/main'),
    appPathMain
  )
}


function generateLicenseMetadata(outRoot: string) 
{
  
const chooseALicense = path.join(outRoot, 'static', 'choosealicense.com')
  
const licensesDir = path.join(chooseALicense, '_licenses')

  
const files = fs.readdirSync(licensesDir)

  
const licenses = new Array<ILicense>()
  
for (
const file
of files)
{
    
const fullPath = path.join(licensesDir, file)
    
const contents = fs.readFileSync(fullPath, 'utf8')
    
const result = frontMatter<IChooseALicense>(contents)

    
const licenseText = result.body.trim()
    // ensure that any license file created in the app does not trigger the
    // "no newline at end of file" warning when viewing diffs
    
const licenseTextWithNewLine = `${licenseText}\n`

    
const license: ILicense = {
      name: result.attributes.nickname || result.attributes.title,
      featured: result.attributes.featured || false,
      hidden:
        result.attributes.hidden === undefined || result.attributes.hidden,
      body: licenseTextWithNewLine,
    }

    
if (!license.hidden) 
{
      
licenses.push(license)
    }
  }

  
const licensePayload = path.join(outRoot, 'static', 'available-licenses.json')
  
const text = JSON.stringify(licenses)
  
fs.writeFileSync(licensePayload, text, 'utf8')

  // embed the license alongside the generated license payload
  
const chooseALicenseLicense = path.join(chooseALicense, 'LICENSE.md')
  
const licenseDestination = path.join(
    outRoot,
    'static',
    'LICENSE.choosealicense.md'
  )

  
const licenseText = fs.readFileSync(chooseALicenseLicense, 'utf8')
  
const licenseWithHeader = `Kactus uses licensing information provided by choosealicense.com.

The bundle in available-licenses.json has been generated from a source list provided at https://github.com/github/choosealicense.com, which is made available under the below license:

------------

${licenseText}`

  
fs.writeFileSync(licenseDestination, licenseWithHeader, 'utf8')

  // sweep up the choosealicense directory as the important bits have been bundled in the app
  
fs.removeSync(chooseALicense)
}
