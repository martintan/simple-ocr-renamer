const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const url = require('url')
const { fork } = require('child_process')

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({ width: 800, height: 600 })
  
  mainWindow.loadURL(
    process.env.ELECTRON_START_URL ||
      url.format({
        pathname: path.join(__dirname, '/../build/index.html'),
        protocol: 'file',
        slashes: true
      })
  )

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

ipcMain.on('scan-barcode', (event, filePath) => {
  event.sender.send('scan-barcode-finish', filePath)
  const child = fork('./utils/scanBarcode.js', [], {
    stdio: ['pipe', 'pipe', 'pipe', 'ipc']
  })
  child.send({ filePath })
  child.on('message', (data) => {
    console.log('child process:', data)
    event.sender.send('scan-barcode-finish', data)
  })
})

app.on('ready', () => {
  createWindow()
})

app.on('window-all-closed', () => app.quit)
app.on('before-quit', () => {
  mainWindow.removeAllListeners('close')
  mainWindow.close()
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})