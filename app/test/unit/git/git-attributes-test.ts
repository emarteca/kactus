

const perf_hooks = require('perf_hooks'); 

import * as FSE from 'fs-extra'

import * as Path from 'path'


import { setupEmptyRepository } from '../../helpers/repositories'

import { writeGitAttributes } from '../../../src/ui/add-repository/git-attributes'


describe('git/git-attributes', () => 
{
  
describe('writeGitAttributes', () => 
{
    
it('initializes a .gitattributes file', async () => 
{
      
const repo = await setupEmptyRepository()
      

var TIMING_TEMP_VAR_AUTOGEN9__RANDOM = perf_hooks.performance.now();
 await  writeGitAttributes(repo.path)
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/app/test/unit/git/git-attributes-test.ts& [10, 6; 10, 41]& TEMP_VAR_AUTOGEN9__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN9__RANDOM));
 
      
const expectedPath = Path.join(repo.path, '.gitattributes')
      
const contents = await FSE.readFile(expectedPath, 'utf8')
      
expect(contents).toContain('* text=auto')
    })

  })

})

