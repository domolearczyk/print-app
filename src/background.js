'use strict'

import { app, dialog, protocol, BrowserWindow, ipcMain } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'
import { autoUpdater } from "electron-updater";
import log from "electron-log";
import path from "path"

log.transports.file.resolvePath = () => path.join('C:\\Users\\dolea\\Projekte\\acut\\print-app', '/logs/log.log')

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

let win

async function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      enableRemoteModule: true,
      nodeIntegrationInWorker: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    title: 'acut WMS Print-App',
    resizable: false,
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS3_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
  autoUpdater.checkForUpdatesAndNotify()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

////////////////////////////////
// No changes above this line
////////////////////////////////

////////////////////////////////
// IPC Listeners
////////////////////////////////

ipcMain.on('get-version', (event) => {
  // let path = require("path").dirname(require('electron').app.getPath("exe"))
  event.reply('get-version', app.getVersion())
  log.log(app.getVersion())
})

ipcMain.on('get-printer-list', (event) => {
  event.reply('get-printer-list', win.webContents.getPrinters())
})

ipcMain.on('select-mo-path', async (event) => {
  const result = await dialog.showOpenDialog(win, {
    properties: ['openDirectory']
  })
  event.reply('select-mo-path', result.filePaths[0])
})

ipcMain.on('select-download-path', async (event) => {
  const result = await dialog.showOpenDialog(win, {
    properties: ['openDirectory']
  })
  event.reply('select-download-path', result.filePaths[0])
})

ipcMain.on('check-for-update', (event) => {
  autoUpdater.on('update-available', () => {
    log.info('update available')
    event.reply('check-for-update', false)
  })
})

ipcMain.on('open-sumatra', (event) => {
  log.log(event)
  log.log('test')
})

////////////////////////////////
// AutoUpdater functions
////////////////////////////////

autoUpdater.on('update-available', () => {
  log.info('update available')
})

autoUpdater.on('checking-for-update', () => {
  log.info('checking for updates')
})

autoUpdater.on('download-progress', (progress) => {
  log.info('download in progress')
  log.info(progress)
})

autoUpdater.on('update-downloaded', () => {
  log.info('update downloaded')
})