const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
    // A generic invoke for handlers that don't need special logic
    invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),

    // Specific handlers
    openLink: (url) => ipcRenderer.send('open-link', url),
    changeLanguage: (lang) => ipcRenderer.send('language-changed', lang),
    getLanguage: () => ipcRenderer.invoke('get-language'),
    t: (key) => ipcRenderer.invoke('t', key),

    // App Upload
    selectExe: () => ipcRenderer.invoke('uploadapp:select-exe'),
    hashExe: (path) => ipcRenderer.invoke('uploadapp:hash-exe', path),
    readExeMeta: (path) => ipcRenderer.invoke('uploadapp:read-exe-meta', path),
    extractIcons: (path) => ipcRenderer.invoke('uploadapp:extract-icons', path),
    uploadCustomIcon: (path) => ipcRenderer.invoke('uploadapp:upload-custom-icon', path),
    saveApp: (data) => ipcRenderer.invoke('uploadapp:save-app', data),

    // File/Game Data
    getFilesDirectory: () => ipcRenderer.invoke('get-files-directory'),
    readFilesInDirectory: (path) => ipcRenderer.invoke('read-files-in-directory', path),
    showSaveDialogAndCopy: (source, defaultName) => ipcRenderer.invoke('show-save-dialog-and-copy', source, defaultName),
    readGameDataJson: () => ipcRenderer.invoke('read-game-data-json'),
    selectDownloadFolder: () => ipcRenderer.invoke('select-download-folder'),

    // System/Clipboard
    getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
    copyToClipboard: (text) => ipcRenderer.invoke('copy-to-clipboard', text),
    getUsername: () => ipcRenderer.invoke('get-username'),

    // Discord Presence
    updateDiscordPresence: (presence) => ipcRenderer.send('update-discord-presence', presence),

    // Nasłuchiwanie na zmianę języka z procesu głównego
    onLanguageChange: (callback) => ipcRenderer.on('language-change-success', (event, lang) => callback(lang)),

    // torrent
    addTorrent: (magnet) => ipcRenderer.invoke("torrent-add", magnet),
    onTorrentProgress: (callback) => ipcRenderer.on("torrent-progress", (event, data) => callback(data)),
    onTorrentDone: (callback) => ipcRenderer.on("torrent-done", (event, data) => callback(data)),
    onTorrentError: (callback) => ipcRenderer.on("torrent-error", (event, data) => callback(data)),
    readFileAsBuffer: (filePath) => ipcRenderer.invoke('read-file-as-buffer', filePath),

    // Dodana funkcja do przełączania narzędzi deweloperskich
    toggleDevTools: () => ipcRenderer.send('toggle-dev-tools'),

    // Calendar data
    readCalendarData: () => ipcRenderer.invoke('read-calendar-data'),

    // Auto-updater functions
    checkForAppUpdates: () => ipcRenderer.invoke('check-for-app-updates'),
    downloadAppUpdate: () => ipcRenderer.invoke('download-app-update'),
    installAppUpdate: () => ipcRenderer.invoke('install-app-update'),
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),

    // Auto-updater event listeners
    onUpdateAvailable: (callback) => ipcRenderer.on('update-available', (event, data) => callback(data)),
    onDownloadProgress: (callback) => ipcRenderer.on('download-progress', (event, data) => callback(data)),
    onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', (event, data) => callback(data)),
    onUpdateError: (callback) => ipcRenderer.on('update-error', (event, data) => callback(data)),
});