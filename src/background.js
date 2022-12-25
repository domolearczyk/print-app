'use strict'

import { app, dialog, protocol, BrowserWindow, ipcMain } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'
import { autoUpdater } from "electron-updater";
import log from "electron-log";
import path from "path"
import Store from 'electron-store'
import fs from 'fs'
import fsExtra from 'fs-extra'
import Ably from 'ably'
import https from 'https'
import { print } from 'pdf-to-printer';

log.transports.file.resolvePath = () => path.join('C:\\Users\\dolea\\Projekte\\acut\\print-app', '/logs/log.log')

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

let win
const store = new Store()

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

async function downloadFile (url, targetFile) {
  return await new Promise((resolve, reject) => {
    https.get(url, (response) => {
      // const code = response.statusCode ?? 0

      // if (code >= 400) {
      //   return reject(new Error(response.statusMessage))
      // }
      //
      // // handle redirects
      // if (code > 300 && code < 400 && !!response.headers.location) {
      //   return downloadFile(response.headers.location, targetFile)
      // }

      // save the file to disk
      const fileWriter = fs
          .createWriteStream(targetFile)
          .on('finish', () => {
            resolve({
              targetFile: targetFile
            })
          })

      response.pipe(fileWriter)
    }).on('error', error => {
      reject(error)
    })
  })
}

function timestamp() {
  return Math.floor(Date.now() / 1000)
}

////////////////////////////////
// IPC Listeners
////////////////////////////////

ipcMain.on('get-version', (event) => {
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

ipcMain.on('mailoptimizer-polling', (event) => {
  let settings = JSON.parse(store.get('settings'))

  if(settings.paths.download === '' || settings.paths.mo === '' || settings.token === '') {
    return
  }

  let xmlFiles = fs.readdirSync(settings.paths.download)
  xmlFiles.forEach(file => {
    if (file.indexOf(settings.token+'.bpslabel.xml') !== -1) {
      event.reply('append-to-log', 'Mailoptimizer-XML gefunden: '+file)
      fsExtra.move(settings.paths.download+'\\'+file, settings.paths.mo+'\\In\\'+file)
          .then(() => {
            event.reply('append-to-log', 'XML-Datei zu Mailoptimizer verschoben: '+file)
          })
    }
  })

  // let labelFiles = fs.readdirSync(settings.paths.mo+'\\Adresslabel')
  // labelFiles.forEach(file => {
  //   if (file.indexOf(settings.token+'.bpslabel.png') !== -1) {
  //     event.reply('append-to-log', 'Mailoptimizer-Label gefunden: '+file)
  //     fsExtra.move(settings.paths.mo+'\\Adresslabel\\'+file, settings.paths.mo+'\\Adresslabel\\Verarbeitet\\'+file)
  //         .then(() => {
  //           event.reply('append-to-log', 'XML-Datei zu Mailoptimizer verschoben: '+file)
  //         })
  //   }
  // })
})

ipcMain.on('wms-polling', (event) => {
  let settings = JSON.parse(store.get('settings'))

  if(settings.paths.download === '' || settings.ablyKey === '' || settings.token === '') {
    event.reply('append-to-log', 'Es konnte keine Verbindung zum Server aufgebaut werden. Bitte Einstellungen prüfen')
    return
  }

  const ably = new Ably.Realtime(settings.ablyKey)

  ably.connection.on('failed', () => {
    event.reply('append-to-log', 'Es konnte keine Verbindung zum Server aufgebaut werden. Bitte Einstellungen prüfen')
  })

  ably.connection.on('connected', () => {
    event.reply('append-to-log', 'Verbindung zum Server aufgebaut. Warte auf Label...')

    const channel = ably.channels.get('public:prints')
    channel.subscribe('print.'+settings.token, (payload) => {
      event.reply('append-to-log', 'Druckauftrag empfangen')

      let file = settings.paths.download+'\\'+timestamp()+'.pdf'
      downloadFile(payload.data.url, file)
          .then(() => {
            print(file, {
              printer: settings.printers[payload.data.printer],
              silent: true,
              pages: 1,
              sumatraPdfPath: require("path").dirname(require('electron').app.getPath("exe"))+'\\SumatraPDF-3.4.6-32.exe'
            })
          })
    })
  })
})

ipcMain.on('save-settings', (event, settings) => {
  store.set('settings', settings)
  event.reply('save-settings')
  event.reply('append-to-log', 'Einstellungen gespeichert')
})

ipcMain.on('load-settings', (event) => {
  event.reply('load-settings', store.get('settings'))
})

ipcMain.on('restart-app', () => {
  autoUpdater.quitAndInstall()
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
  win.webContents.send('update-downloaded')
})