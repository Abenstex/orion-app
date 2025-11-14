// electron/main.ts
import { app, BrowserWindow } from 'electron'
import { join } from 'path'

// Function to create window
function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            // Preload script, can be used to expose secure APIs to the page
            preload: join(__dirname, 'preload.js'),
            contextIsolation: true // Secure context isolation
        }
    })

    // Load local Vite server during development
    const devUrl = 'http://localhost:5173'
    win.loadURL(devUrl)
    win.webContents.openDevTools()
}

// Create window after Electron is initialized
app.whenReady().then(() => {
    createWindow()

    // Re-create window when clicking Dock icon on macOS
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// Quit app when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})