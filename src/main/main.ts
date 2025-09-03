import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
let mainWindow: BrowserWindow | null = null

const isDev = process.env.NODE_ENV === 'development'

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js')
    },
    title: 'creative.space.utility'
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'))
  }

  // Quit app when window closes
  mainWindow.on('closed', () => {
    mainWindow = null
    app.quit()
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// IPC Handlers
ipcMain.handle('calc:run', async (event, { module, fn, payload }) => {
  console.log(`Running calculation: ${module}.${fn}`, payload)
  
  try {
    // Import calculator module
    const modulePath = isDev 
      ? path.join(__dirname, '..', 'src', 'shared', 'modules', module, 'index.mjs')
      : path.join(process.resourcesPath, 'shared', 'modules', module, 'index.mjs')
    
    const calculator = await import(modulePath)
    const calcFunction = calculator[fn]
    
    if (typeof calcFunction !== 'function') {
      throw new Error(`Function ${fn} not found in module ${module}`)
    }
    
    const result = await calcFunction(payload)
    console.log(`Calculation result:`, result)
    return result
  } catch (error) {
    console.error(`Calculation error:`, error)
    throw error
  }
})