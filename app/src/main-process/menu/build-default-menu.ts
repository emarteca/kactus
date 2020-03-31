

const perf_hooks = require('perf_hooks'); 

import { Menu, ipcMain, shell, app } from 'electron'

import { ensureItemIds } from './ensure-item-ids'

import { MenuEvent } from './menu-event'

import { truncateWithEllipsis } from '../../lib/truncate-with-ellipsis'

import { getLogDirectoryPath } from '../../lib/logging/get-log-path'

import { ensureDir } from 'fs-extra'


import { log } from '../log'

import { openDirectorySafe } from '../shell'

import { enableRebaseDialog, enableStashing } from '../../lib/feature-flag'

import { MenuLabelsEvent } from '../../models/menu-labels'

import { DefaultEditorLabel } from '../../ui/lib/context-menu'


const defaultShellLabel = 'Open in Terminal'

const createPullRequestLabel = 'Create Pull Request'

const showPullRequestLabel = 'Show Pull Request'

const defaultBranchNameValue = 'Default Branch'

const confirmRepositoryRemovalLabel = 'Remove…'

const repositoryRemovalLabel = 'Remove'


enum ZoomDirection {
  Reset,
  In,
  Out,
}


export 
function buildDefaultMenu({
  selectedExternalEditor,
  selectedShell,
  askForConfirmationOnForcePush,
  askForConfirmationOnRepositoryRemoval,
  hasCurrentPullRequest = false,
  defaultBranchName = defaultBranchNameValue,
  isForcePushForCurrentRepository = false,
  isStashedChangesVisible = false,
}: MenuLabelsEvent): Electron.Menu 
{
  
defaultBranchName = truncateWithEllipsis(defaultBranchName, 25)

  
const removeRepoLabel = askForConfirmationOnRepositoryRemoval
    ? confirmRepositoryRemovalLabel
    : repositoryRemovalLabel

  
const pullRequestLabel = hasCurrentPullRequest
    ? showPullRequestLabel
    : createPullRequestLabel

  
const shellLabel =
    selectedShell === null ? defaultShellLabel : `Open in ${selectedShell}`

  
const editorLabel =
    selectedExternalEditor === null
      ? DefaultEditorLabel
      : `Open in ${selectedExternalEditor}`

  
const template = new Array<Electron.MenuItemConstructorOptions>()
  
const separator: Electron.MenuItemConstructorOptions = { type: 'separator' }

  
template.push({
    label: 'Kactus',
    submenu: [
      {
        label: 'About Kactus',
        click: emit('show-about'),
        id: 'about',
      },
      separator,
      {
        label: 'Preferences…',
        id: 'preferences',
        accelerator: 'CmdOrCtrl+,',
        click: emit('show-preferences'),
      },
      separator,
      {
        label: 'Install Command Line Tool…',
        id: 'install-cli',
        click: emit('install-cli'),
      },
      separator,
      {
        role: 'services',
        submenu: [],
      },
      separator,
      { role: 'hide' },
      { role: 'hideothers' },
      { role: 'unhide' },
      separator,
      { role: 'quit' },
    ],
  })

  
const fileMenu: Electron.MenuItemConstructorOptions = {
    label: 'File',
    submenu: [
      {
        label: 'New Repository…',
        id: 'new-repository',
        click: emit('create-repository'),
        accelerator: 'CmdOrCtrl+N',
      },
      {
        label: 'New Sketch File…',
        id: 'create-sketch-file',
        click: emit('create-sketch-file'),
      },
      separator,
      {
        label: 'Add Local Repository…',
        id: 'add-local-repository',
        accelerator: 'CmdOrCtrl+O',
        click: emit('add-local-repository'),
      },
      {
        label: 'Clone Repository…',
        id: 'clone-repository',
        accelerator: 'CmdOrCtrl+Shift+O',
        click: emit('clone-repository'),
      },
    ],
  }

  
template.push(fileMenu)

  
template.push({
    label: 'Edit',
    submenu: [
      { role: 'undo', label: 'Undo' },
      { role: 'redo', label: 'Redo' },
      separator,
      { role: 'cut', label: 'Cut' },
      { role: 'copy', label: 'Copy' },
      { role: 'paste', label: 'Paste' },
      {
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        click: emit('select-all'),
      },
      separator,
      {
        id: 'find',
        label: 'Find',
        accelerator: 'CmdOrCtrl+F',
        click: emit('find-text'),
      },
    ],
  })

  
template.push({
    label: 'View',
    submenu: [
      {
        label: 'Show Changes',
        id: 'show-changes',
        accelerator: 'CmdOrCtrl+1',
        click: emit('show-changes'),
      },
      {
        label: 'Show History',
        id: 'show-history',
        accelerator: 'CmdOrCtrl+2',
        click: emit('show-history'),
      },
      {
        label: 'Show Repository List',
        id: 'show-repository-list',
        accelerator: 'CmdOrCtrl+T',
        click: emit('choose-repository'),
      },
      {
        label: 'Show Branches List',
        id: 'show-branches-list',
        accelerator: 'CmdOrCtrl+B',
        click: emit('show-branches'),
      },
      separator,
      {
        label: 'Go to Summary',
        id: 'go-to-commit-message',
        accelerator: 'CmdOrCtrl+G',
        click: emit('go-to-commit-message'),
      },
      {
        label: getStashedChangesLabel(isStashedChangesVisible),
        id: 'toggle-stashed-changes',
        accelerator: 'Ctrl+H',
        click: isStashedChangesVisible
          ? emit('hide-stashed-changes')
          : emit('show-stashed-changes'),
        visible: enableStashing(),
      },
      {
        label: 'Toggle Full Screen',
        role: 'togglefullscreen',
      },
      separator,
      {
        label: 'Open Sketch',
        id: 'open-sketch',
        accelerator: 'Ctrl+K',
        click: emit('open-sketch'),
      },
      separator,
      {
        label: 'Reset Zoom',
        accelerator: 'CmdOrCtrl+0',
        click: zoom(ZoomDirection.Reset),
      },
      {
        label: 'Zoom In',
        accelerator: 'CmdOrCtrl+=',
        click: zoom(ZoomDirection.In),
      },
      {
        label: 'Zoom Out',
        accelerator: 'CmdOrCtrl+-',
        click: zoom(ZoomDirection.Out),
      },
      separator,
      {
        label: '&Reload',
        id: 'reload-window',
        // Ctrl+Alt is interpreted as AltGr on international keyboards and this
        // can clash with other shortcuts. We should always use Ctrl+Shift for
        // chorded shortcuts, but this menu item is not a user-facing feature
        // so we are going to keep this one around.
        accelerator: 'CmdOrCtrl+Alt+R',
        click(item: any, focusedWindow: Electron.BrowserWindow) 
{
          
if (focusedWindow) 
{
            
focusedWindow.reload()
          }
        },

        visible: __RELEASE_CHANNEL__ === 'development',
      },
      {
        id: 'show-devtools',
        label: 'Toggle Developer Tools',
        accelerator: 'Alt+Command+I',
        click(item: any, focusedWindow: Electron.BrowserWindow) 
{
          
if (focusedWindow) 
{
            
focusedWindow.webContents.toggleDevTools()
          }
        },

      },
    ],
  })

  
const pushLabel = getPushLabel(
    isForcePushForCurrentRepository,
    askForConfirmationOnForcePush
  )

  
const pushEventType = isForcePushForCurrentRepository ? 'force-push' : 'push'

  
template.push({
    label: 'Repository',
    id: 'repository',
    submenu: [
      {
        id: 'push',
        label: pushLabel,
        accelerator: 'CmdOrCtrl+P',
        click: emit(pushEventType),
      },
      {
        id: 'pull',
        label: 'Pull',
        accelerator: 'CmdOrCtrl+Shift+P',
        click: emit('pull'),
      },
      {
        label: removeRepoLabel,
        id: 'remove-repository',
        accelerator: 'CmdOrCtrl+Backspace',
        click: emit('remove-repository'),
      },
      separator,
      {
        id: 'view-repository-on-github',
        label: 'View on GitHub',
        accelerator: 'CmdOrCtrl+Shift+G',
        click: emit('view-repository-on-github'),
      },
      {
        label: shellLabel,
        id: 'open-in-shell',
        accelerator: 'Ctrl+`',
        click: emit('open-in-shell'),
      },
      {
        label: 'Show in Finder',
        id: 'open-working-directory',
        accelerator: 'CmdOrCtrl+Shift+F',
        click: emit('open-working-directory'),
      },
      {
        label: editorLabel,
        id: 'open-external-editor',
        accelerator: 'CmdOrCtrl+Shift+A',
        click: emit('open-external-editor'),
      },
      separator,
      {
        label: 'Repository Settings…',
        id: 'show-repository-settings',
        click: emit('show-repository-settings'),
      },
      {
        label: 'Kactus Settings…',
        id: 'show-kactus-settings',
        click: emit('show-kactus-settings'),
      },
    ],
  })

  
template.push({
    label: 'Branch',
    id: 'branch',
    submenu: [
      {
        label: 'New Branch…',
        id: 'create-branch',
        accelerator: 'CmdOrCtrl+Shift+N',
        click: emit('create-branch'),
      },
      {
        label: 'Rename…',
        id: 'rename-branch',
        accelerator: 'CmdOrCtrl+Shift+R',
        click: emit('rename-branch'),
      },
      {
        label: 'Delete…',
        id: 'delete-branch',
        accelerator: 'CmdOrCtrl+Shift+D',
        click: emit('delete-branch'),
      },
      separator,
      {
        label: 'Discard All Changes…',
        id: 'discard-all-changes',
        accelerator: 'CmdOrCtrl+Shift+Backspace',
        click: emit('discard-all-changes'),
      },
      separator,
      {
        label: `Update from ${defaultBranchName}`,
        id: 'update-branch',
        accelerator: 'CmdOrCtrl+Shift+U',
        click: emit('update-branch'),
      },
      {
        label: 'Compare to Branch',
        id: 'compare-to-branch',
        accelerator: 'CmdOrCtrl+Shift+B',
        click: emit('compare-to-branch'),
      },
      {
        label: 'Merge into Current Branch…',
        id: 'merge-branch',
        accelerator: 'CmdOrCtrl+Shift+M',
        click: emit('merge-branch'),
      },
      {
        label: 'Rebase Current Branch…',
        id: 'rebase-branch',
        accelerator: 'CmdOrCtrl+Shift+E',
        click: emit('rebase-branch'),
        visible: enableRebaseDialog(),
      },
      separator,
      {
        label: 'Compare on GitHub',
        id: 'compare-on-github',
        accelerator: 'CmdOrCtrl+Shift+C',
        click: emit('compare-on-github'),
      },
      {
        label: pullRequestLabel,
        id: 'create-pull-request',
        accelerator: 'CmdOrCtrl+R',
        click: emit('open-pull-request'),
      },
    ],
  })
  
template.push({
    role: 'window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      { role: 'close' },
      separator,
      { role: 'front' },
    ],
  })

  
const submitIssueItem: Electron.MenuItemConstructorOptions = {
    label: 'Report Issue…',
    click() 
{
      
shell.openExternal(
        'https://github.com/kactus-io/kactus/issues/new/choose'
      )
    },

  }

  
const contactSupportItem: Electron.MenuItemConstructorOptions = {
    label: 'Contact Kactus Support…',
    click() 
{
      
shell.openExternal(
        `https://kactus.io/contact?from_kactus_app=1&app_version=${app.getVersion()}`
      )
    },

  }

  
const showUserGuides: Electron.MenuItemConstructorOptions = {
    label: 'Show User Guides',
    click() 
{
      
shell.openExternal('https://kactus.io/help/')
    },

  }

  
const showKeyboardShortcuts: Electron.MenuItemConstructorOptions = {
    label: 'Show Keyboard Shortcuts',
    click() 
{
      
shell.openExternal(
        'https://help.github.com/en/desktop/getting-started-with-github-desktop/keyboard-shortcuts-in-github-desktop'
      )
    },

  }

  
const showLogsLabel = 'Show Logs in Finder'

  
const showLogsItem: Electron.MenuItemConstructorOptions = {
    label: showLogsLabel,
    click() 
{
      
const logPath = getLogDirectoryPath()
      
ensureDir(logPath)
        .then(() => 
{
          
openDirectorySafe(logPath)
        })

        .catch(err => 
{
          
var TIMING_TEMP_VAR_AUTOGEN_CALLING_739_log__RANDOM = perf_hooks.performance.now();
 
log('error', err.message)
console.log("/home/ellen/Documents/ASJProj/TESTING_reordering/kactus/app/src/main-process/menu/build-default-menu.ts& [441, 10; 441, 35]& TEMP_VAR_AUTOGEN_CALLING_739_log__RANDOM& " + (perf_hooks.performance.now() - TIMING_TEMP_VAR_AUTOGEN_CALLING_739_log__RANDOM));
 
        })

    },

  }

  
const helpItems = [
    submitIssueItem,
    contactSupportItem,
    showUserGuides,
    showKeyboardShortcuts,
    showLogsItem,
  ]

  
if (__DEV__) 
{
    
helpItems.push(
      separator,
      {
        label: 'Crash main process…',
        click() 
{
          
throw new Error('Boomtown!')
        },

      },
      {
        label: 'Crash renderer process…',
        click: emit('boomtown'),
      },
      {
        label: 'Show popup',
        submenu: [
          {
            label: 'Release notes',
            click: emit('show-release-notes-popup'),
          },
        ],
      },
      {
        label: 'Prune branches',
        click: emit('test-prune-branches'),
      }
    )
  }

  
template.push({
    role: 'help',
    submenu: helpItems,
  })

  
ensureItemIds(template)

  
return Menu.buildFromTemplate(template)
}


function getPushLabel(
  isForcePushForCurrentRepository: boolean,
  askForConfirmationOnForcePush: boolean
): string 
{
  
if (!isForcePushForCurrentRepository) 
{
    
return 'Push'
  }

  
if (askForConfirmationOnForcePush) 
{
    
return 'Force Push…'
  }

  
return 'Force Push'
}


function getStashedChangesLabel(isStashedChangesVisible: boolean): string 
{
  
if (isStashedChangesVisible) 
{
    
return 'Hide Stashed Changes'
  }

  
return 'Show Stashed Changes'
}


type ClickHandler = (
  menuItem: Electron.MenuItem,
  browserWindow: Electron.BrowserWindow,
  event: Electron.Event
) => void

/**
 * Utility function returning a Click event handler which, when invoked, emits
 * the provided menu event over IPC.
 */

function emit(name: MenuEvent): ClickHandler 
{
  
return (menuItem, window) => 
{
    
if (window) 
{
      
window.webContents.send('menu-event', { name })
    } 
else
{
      
ipcMain.emit('menu-event', { name })
    }
  }
}

/** The zoom steps that we support, these factors must sorted */

const ZoomInFactors = [1, 1.1, 1.25, 1.5, 1.75, 2]

const ZoomOutFactors = ZoomInFactors.slice().reverse()

/**
 * Returns the element in the array that's closest to the value parameter. Note
 * that this function will throw if passed an empty array.
 */

function findClosestValue(arr: Array<number>, value: number) 
{
  
return arr.reduce((previous, current) => 
{
    
return Math.abs(current - value) < Math.abs(previous - value)
      ? current
      : previous
  })

}

/**
 * Figure out the next zoom level for the given direction and alert the renderer
 * about a change in zoom factor if necessary.
 */

function zoom(direction: ZoomDirection): ClickHandler 
{
  
return (menuItem, window) => 
{
    
if (!window) 
{
      
return
    }

    
const { webContents } = window

    
if (direction === ZoomDirection.Reset) 
{
      
webContents.setZoomFactor(1)
      
webContents.send('zoom-factor-changed', 1)
    } 
else
{
      
const rawZoom = webContents.getZoomFactor()
      
const zoomFactors =
        direction === ZoomDirection.In ? ZoomInFactors : ZoomOutFactors

      // So the values that we get from getZoomFactor are floating point
      // precision numbers from chromium that don't always round nicely so
      // we'll have to do a little trick to figure out which of our supported
      // zoom factors the value is referring to.
      
const currentZoom = findClosestValue(zoomFactors, rawZoom)

      
const nextZoomLevel = zoomFactors.find(f =>
        direction === ZoomDirection.In ? f > currentZoom : f < currentZoom
      )

      // If we couldn't find a zoom level (likely due to manual manipulation
      // of the zoom factor in devtools) we'll just snap to the closest valid
      // factor we've got.
      
const newZoom = nextZoomLevel === undefined ? currentZoom : nextZoomLevel

      
webContents.setZoomFactor(newZoom)
      
webContents.send('zoom-factor-changed', newZoom)
    }
  }
}
