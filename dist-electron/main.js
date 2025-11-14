"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// electron/main.ts
var electron_1 = require("electron");
var path_1 = require("path");
// Function to create window
function createWindow() {
    var win = new electron_1.BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            // Preload script, can be used to expose secure APIs to the page
            preload: (0, path_1.join)(__dirname, 'preload.js'),
            contextIsolation: true // Secure context isolation
        }
    });
    // Load local Vite server during development
    var devUrl = 'http://localhost:5020';
    win.loadURL(devUrl);
}
// Create window after Electron is initialized
electron_1.app.whenReady().then(function () {
    createWindow();
    // Re-create window when clicking Dock icon on macOS
    electron_1.app.on('activate', function () {
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
// Quit app when all windows are closed (except on macOS)
electron_1.app.on('window-all-closed', function () {
    if (process.platform !== 'darwin')
        electron_1.app.quit();
});
