

const perf_hooks = require('perf_hooks'); 

import * as Path from 'path'

import { writeFile } from 'fs-extra'


import {
  setupFixtureRepository,
  setupEmptyRepository,
} from '../../helpers/repositories'

import { Repository } from '../../../src/models/repository'

import { GitProcess } from 'dugite'

import {
  isUsingLFS,
  isTrackedByLFS,
  filesNotTrackedByLFS,
} from '../../../src/lib/git/lfs'


describe('git-lfs', () => 
{
  
describe('isUsingLFS', () => 
{
    
it('returns false for repository not using LFS', async () => 
{
      
var TIMING_TEMP_VAR_AUTOGEN_CALLING_256_setupFixtureRepository__RANDOM = perf_hooks.performance.now();
 
const path = await setupFixtureRepository('test-repo')
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/app/test/unit/git/lfs-test.ts& [18, 6; 18, 60]& TEMP_VAR_AUTOGEN_CALLING_256_setupFixtureRepository__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN_CALLING_256_setupFixtureRepository__RANDOM));
 
      
const repository = new Repository(path, -1, null, false, [])

      
const usingLFS = await isUsingLFS(repository)
      
expect(usingLFS).toBe(false)
    })


    
it('returns true if LFS is tracking a path', async () => 
{
      
var TIMING_TEMP_VAR_AUTOGEN_CALLING_260_setupFixtureRepository__RANDOM = perf_hooks.performance.now();
 
const path = await setupFixtureRepository('test-repo')
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/app/test/unit/git/lfs-test.ts& [26, 6; 26, 60]& TEMP_VAR_AUTOGEN_CALLING_260_setupFixtureRepository__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN_CALLING_260_setupFixtureRepository__RANDOM));
 
      
const repository = new Repository(path, -1, null, false, [])

      
await GitProcess.exec(['lfs', 'track', '*.psd'], repository.path)

      
const usingLFS = await isUsingLFS(repository)
      
expect(usingLFS).toBe(true)
    })

  })


  
describe('isTrackedByLFS', () => 
{
    
it('returns false for repository not using LFS', async () => 
{
      
const repository = await setupEmptyRepository()

      
const file = 'README.md'
      
const readme = Path.join(repository.path, file)
      
await writeFile(readme, 'Hello world!')

      
const found = await isTrackedByLFS(repository, file)
      
expect(found).toBe(false)
    })


    
it('returns true after tracking file in Git LFS', async () => 
{
      
const repository = await setupEmptyRepository()

      
const file = 'README.md'
      
const readme = Path.join(repository.path, file)
      
await writeFile(readme, 'Hello world!')

      
await GitProcess.exec(['lfs', 'track', '*.md'], repository.path)

      
const found = await isTrackedByLFS(repository, file)
      
expect(found).toBe(true)
    })


    
it('returns true after tracking file with character issues in Git LFS', async () => 
{
      
const repository = await setupEmptyRepository()

      
const file =
        'Top Ten Worst Repositories to host on GitHub - Carlos Martín Nieto.md'
      
const readme = Path.join(repository.path, file)
      
await writeFile(readme, 'Hello world!')

      
await GitProcess.exec(['lfs', 'track', '*.md'], repository.path)

      
const found = await isTrackedByLFS(repository, file)
      
expect(found).toBe(true)
    })

  })


  
describe('filesNotTrackedByLFS', () => 
{
    
it('returns files not listed in Git LFS', async () => 
{
      
const repository = await setupEmptyRepository()
      
await GitProcess.exec(['lfs', 'track', '*.md'], repository.path)

      
const videoFile = 'some-video-file.mp4'

      
const notFound = await filesNotTrackedByLFS(repository, [videoFile])

      
expect(notFound).toHaveLength(1)
      
expect(notFound).toContain(videoFile)
    })


    
it('skips files that are tracked by Git LFS', async () => 
{
      
const repository = await setupEmptyRepository()
      
await GitProcess.exec(['lfs', 'track', '*.png'], repository.path)

      
const photoFile = 'some-cool-photo.png'

      
const notFound = await filesNotTrackedByLFS(repository, [photoFile])

      
expect(notFound).toHaveLength(0)
    })


    
it('skips files in a subfolder that are tracked', async () => 
{
      
const repository = await setupEmptyRepository()
      
await GitProcess.exec(['lfs', 'track', '*.png'], repository.path)

      
const photoFileInDirectory = 'app/src/some-cool-photo.png'
      
const notFound = await filesNotTrackedByLFS(repository, [
        photoFileInDirectory,
      ])

      
expect(notFound).toHaveLength(0)
    })


    
it('skips files in a subfolder where the rule only covers the subdirectory', async () => 
{
      
const repository = await setupEmptyRepository()
      
await GitProcess.exec(['lfs', 'track', 'app/src/*.png'], repository.path)

      
const photoFileInDirectory = 'app/src/some-cool-photo.png'
      
const notFound = await filesNotTrackedByLFS(repository, [
        photoFileInDirectory,
      ])

      
expect(notFound).toHaveLength(0)
    })

  })

})

