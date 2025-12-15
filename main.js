let win;

// main.js

const { app, BrowserWindow, ipcMain, dialog, shell, clipboard, nativeImage, globalShortcut } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const fs = require('fs');
const os = require('os');
const DiscordRPC = require('discord-rpc');
const express = require('express');
const cors = require('cors');

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.webContents.session.clearCache().catch(() => {});
  win.webContents.session.clearStorageData({ storages: ['serviceworkers', 'cachestorage'] }).catch(() => {});

  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net/npm/chart.js",
    "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com",
    "font-src 'self' https://cdnjs.cloudflare.com https://fonts.gstatic.com",
    "img-src 'self' data: https://i.ytimg.com https://media.rawg.io https://cdn.cloudflare.steamstatic.com https://image.api.playstation.com https://via.placeholder.com",
    "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
    "child-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
    "connect-src 'self' https://astroworld.dev"
  ].join('; ');

  win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    const url = details.url || '';
    const headers = details.responseHeaders || {};

    if (url.startsWith('http://localhost:')) {
      delete headers['Content-Security-Policy'];
      delete headers['content-security-policy'];
      delete headers['Content-Security-Policy-Report-Only'];
      delete headers['content-security-policy-report-only'];

      headers['content-security-policy'] = [csp];
      headers['Content-Security-Policy'] = [csp];
    }

    callback({ responseHeaders: headers });
  });

  // ❌ usuń górne menu Electron
  win.removeMenu();

  // Otwieraj wszystkie zewnętrzne linki w domyślnej przeglądarce, nie w oknie aplikacji
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith('file://')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });
 
  ipcMain.on('open-link', (event, url) => {
    shell.openExternal(url);
  });
 
  // Dodaj ten fragment do nasłuchiwania na zdarzenie
  ipcMain.on('toggle-dev-tools', (event) => {
    const webContents = event.sender;
    const win = BrowserWindow.fromWebContents(webContents);
    if (win) {
      win.webContents.toggleDevTools();
    }
  });

  win.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('file://')) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });
 
  // Uruchomienie serwera Express
  const server = express();
  server.use(cors()); // Umożliwia żądania z innych źródeł, może być przydatne

  server.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', csp);
    next();
  });

  server.use(express.static(__dirname, { redirect: false, index: 'index.html' })); // Serwuje pliki z głównego katalogu aplikacji

  const startPort = 3000;
  const maxAttempts = 20;
  const startServer = (attempt) => {
    const portToTry = startPort + attempt;
    const listener = server.listen(portToTry, () => {
      console.log(`Serwer Express uruchomiony na http://localhost:${portToTry}`);
      win.loadURL(`http://localhost:${portToTry}/`);
    });

    listener.once('error', (err) => {
      if (err && err.code === 'EADDRINUSE' && attempt < maxAttempts) {
        startServer(attempt + 1);
        return;
      }
      console.error('Nie udało się uruchomić serwera Express:', err);
    });
  };

  startServer(0);

  win.webContents.openDevTools({ mode: 'detach' }); // Debug

  win.on("closed", () => {
    win = null;
  });
  return win;
}

// ********* AUTO-UPDATER CONFIGURATION *********
autoUpdater.checkForUpdatesAndNotify();

// Sprawdzaj aktualizacje co 24 godziny
setInterval(() => {
  autoUpdater.checkForUpdatesAndNotify();
}, 24 * 60 * 60 * 1000);

// Auto-updater events
autoUpdater.on('checking-for-update', () => {
  console.log('🔍 Sprawdzanie aktualizacji...');
});

autoUpdater.on('update-available', (info) => {
  console.log('🎉 Dostępna aktualizacja:', info.version);
  if (win && !win.isDestroyed()) {
    win.webContents.send('update-available', {
      version: info.version,
      releaseDate: info.releaseDate,
      releaseNotes: info.releaseNotes || 'Nowa wersja aplikacji jest dostępna!'
    });
  }
});

autoUpdater.on('update-not-available', (info) => {
  console.log('✅ Aplikacja jest aktualna (wersja: ' + info.version + ')');
});

autoUpdater.on('error', (err) => {
  console.error('❌ Błąd auto-updater:', err.message);
  if (win && !win.isDestroyed()) {
    win.webContents.send('update-error', {
      message: err.message
    });
  }
});

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Pobieranie: " + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  console.log(log_message);
  
  if (win && !win.isDestroyed()) {
    win.webContents.send('download-progress', {
      percent: Math.round(progressObj.percent),
      transferred: progressObj.transferred,
      total: progressObj.total
    });
  }
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('Aktualizacja pobrana, gotowa do instalacji');
  if (win && !win.isDestroyed()) {
    win.webContents.send('update-downloaded', {
      version: info.version
    });
  }
});

const crypto = require('crypto');
const util = require('util');
const execFile = util.promisify(require('child_process').execFile);
const sharp = require('sharp');

// Funkcja do wczytywania tłumaczeń
function loadTranslations(lang) {
  try {
    const translationPath = path.join(__dirname, 'locales', `${lang}.json`);
    if (fs.existsSync(translationPath)) {
      return JSON.parse(fs.readFileSync(translationPath, 'utf8'));
    }
    console.warn(`Brak pliku tłumaczeń dla języka: ${lang}`);
    return {};
  } catch (error) {
    console.error('Błąd podczas wczytywania tłumaczeń:', error);
    return {};
  }
}

app.whenReady().then(() => {
  createWindow();

  globalShortcut.register('CommandOrControl+Shift+I', () => {
    if (win && !win.isDestroyed()) win.webContents.toggleDevTools();
  });
  globalShortcut.register('F12', () => {
    if (win && !win.isDestroyed()) win.webContents.toggleDevTools();
  });

  let currentLanguage = 'pl';

  ipcMain.on('language-changed', (event, lang) => {
    currentLanguage = lang;
    console.log(`Zmieniono język na: ${lang}`);
  });

  ipcMain.handle('get-language', () => currentLanguage);

  // Handlery uploadowania aplikacji
  ipcMain.handle('uploadapp:select-exe', async () => {
    const result = await dialog.showOpenDialog({
      title: 'Wybierz plik .exe',
      filters: [{ name: 'Aplikacje Windows', extensions: ['exe'] }],
      properties: ['openFile']
    });
    if (result.canceled || !result.filePaths[0]) return null;
    const filePath = result.filePaths[0];
    const stats = await fs.promises.stat(filePath);
    return { path: filePath, size: stats.size };
  });

  // Handler do wyboru folderu docelowego pobrań
  ipcMain.handle('select-download-folder', async (event) => {
    try {
      const result = await dialog.showOpenDialog(BrowserWindow.fromWebContents(event.sender), {
        title: 'Wybierz folder docelowy pobrań',
        properties: ['openDirectory', 'createDirectory']
      });
      
      if (result.canceled || !result.filePaths[0]) {
        return { canceled: true };
      }
      
      const folderPath = result.filePaths[0];
      return { path: folderPath, success: true };
    } catch (error) {
      console.error('Błąd przy wyborze folderu:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('uploadapp:hash-exe', async (event, exePath) => {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = fs.createReadStream(exePath);
      stream.on('data', chunk => hash.update(chunk));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  });

  ipcMain.handle('uploadapp:read-exe-meta', async (event, exePath) => {
    try {
      const { stdout } = await execFile('powershell', [
        '-Command',
        `
        $f = Get-Item '${exePath.replace(/'/g, "''")}';
        $v = $f.VersionInfo;
        Write-Output ('{"fileVersion":"' + $v.FileVersion + '","companyName":"' + $v.CompanyName + '"}')
        `
      ]);
      return JSON.parse(stdout.trim());
    } catch (e) {
      return {};
    }
  });

  ipcMain.handle('uploadapp:extract-icons', async (event, exePath) => {
    try {
      const { stdout } = await execFile('powershell', [
        '-Command',
        `
        Add-Type -AssemblyName System.Drawing;
        $icons = [System.Drawing.Icon]::ExtractAssociatedIcon('${exePath.replace(/'/g, "''")}');
        if ($icons) {
          $bmp = $icons.ToBitmap();
          $ms = New-Object System.IO.MemoryStream;
          $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png);
          $bytes = $ms.ToArray();
          $b64 = [Convert]::ToBase64String($bytes);
          Write-Output ('[{"id":0,"nativeImageDataURL":"data:image/png;base64,'+$b64+'","size":'+$icons.Width+'}]');
        } else {
          Write-Output '[]';
        }
        `
      ]);
      return JSON.parse(stdout.trim());
    } catch (e) {
      return [];
    }
  });

  ipcMain.handle('uploadapp:upload-custom-icon', async (event, iconPath) => {
    const ext = path.extname(iconPath).toLowerCase();
    if (ext === '.ico') {
      try {
        const img = nativeImage.createFromPath(iconPath);
        if (img.isEmpty()) throw new Error('ICO empty');
        return { dataUrl: img.toDataURL() };
      } catch {
        throw new Error('Błąd walidacji ICO');
      }
    } else if (ext === '.png') {
      try {
        const img = nativeImage.createFromPath(iconPath);
        if (img.isEmpty()) throw new Error('PNG empty');
        const size = img.getSize();
        if (size.width < 256 || size.height < 256) throw new Error('PNG za mały');
        const buf = await sharp(iconPath).resize(256, 256).toFormat('png').toBuffer();
        const dataUrl = 'data:image/png;base64,' + buf.toString('base64');
        return { dataUrl };
      } catch {
        throw new Error('Błąd konwersji PNG');
      }
    } else {
      throw new Error('Nieobsługiwany format');
    }
  });

  ipcMain.handle('uploadapp:save-app', async (event, data) => {
    const appId = data.sha256;
    const userDataDir = path.join(app.getPath('userData'), 'apps', appId);
    await fs.promises.mkdir(userDataDir, { recursive: true });
    const exeDest = path.join(userDataDir, path.basename(data.exePath));
    await fs.promises.copyFile(data.exePath, exeDest);
    await fs.promises.writeFile(path.join(userDataDir, 'meta.json'), JSON.stringify(data.meta || {}, null, 2));
    if (data.iconSource === 'exe' && data.iconData && data.iconData.nativeImageDataURL) {
      const b64 = data.iconData.nativeImageDataURL.split(',')[1];
      await fs.promises.writeFile(path.join(userDataDir, 'icon.png'), Buffer.from(b64, 'base64'));
    } else if (data.iconSource === 'custom' && data.iconData && data.iconData.dataUrl) {
      const b64 = data.iconData.dataUrl.split(',')[1];
      await fs.promises.writeFile(path.join(userDataDir, 'icon.png'), Buffer.from(b64, 'base64'));
    }
    await fs.promises.writeFile(path.join(userDataDir, 'info.json'), JSON.stringify({
      exe: path.basename(data.exePath),
      sha256: data.sha256,
      meta: data.meta,
      icon: (data.iconSource !== 'none')
    }, null, 2));
    return { success: true };
  });

  ipcMain.handle('get-files-directory', async () => {
    return path.join(app.getAppPath(), 'files');
  });

  ipcMain.handle('read-files-in-directory', async (event, directoryPath) => {
    try {
      const fileNames = await fs.promises.readdir(directoryPath);
      const filesData = fileNames.map(name => {
        const filePath = path.join(directoryPath, name);
        const stats = fs.statSync(filePath);
        return {
          name: name,
          path: filePath,
          size: stats.size,
          mtime: stats.mtime
        };
      });
      return filesData;
    } catch (error) {
      console.error('Błąd w głównym procesie podczas czytania plików:', error);
      throw error;
    }
  });

  ipcMain.handle('show-save-dialog-and-copy', async (event, sourcePath, defaultFileName) => {
    try {
      const result = await dialog.showSaveDialog(BrowserWindow.fromWebContents(event.sender), {
        title: 'Zapisz plik',
        defaultPath: defaultFileName
      });

      if (!result.canceled && result.filePath) {
        const destinationPath = result.filePath;
        await fs.promises.copyFile(sourcePath, destinationPath);
        return { success: true, filePath: destinationPath };
      } else {
        return { success: false, canceled: true };
      }
    } catch (error) {
      console.error('Błąd w głównym procesie podczas kopiowania pliku:', error);
      throw error;
    }
  });

  ipcMain.handle('check-for-updates', async () => {
    const gamesDataPath = path.join(app.getAppPath(), 'games_data.json');
    const lastCheckPath = path.join(app.getAppPath(), 'last_update_check.json');
    
    try {
      const gamesData = JSON.parse(await fs.promises.readFile(gamesDataPath, 'utf8'));
      let lastCheck = {};
      try {
        lastCheck = JSON.parse(await fs.promises.readFile(lastCheckPath, 'utf8').catch(() => '{}'));
      } catch (e) {}
      
      const updates = [];
      for (const [gameName, gameData] of Object.entries(gamesData)) {
        const lastVersion = lastCheck[gameName];
        if (lastVersion && gameData.version && gameData.version !== lastVersion) {
          updates.push({
            name: gameName,
            oldVersion: lastVersion,
            newVersion: gameData.version,
            date: gameData.releaseDate || 'Niedawno'
          });
        }
      }
      
      const currentVersions = {};
      for (const [gameName, gameData] of Object.entries(gamesData)) {
        if (gameData.version) {
          currentVersions[gameName] = gameData.version;
        }
      }
      
      await fs.promises.writeFile(lastCheckPath, JSON.stringify(currentVersions, null, 2), 'utf8');
      return { success: true, updates };
    } catch (error) {
      console.error('Błąd podczas sprawdzania aktualizacji:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('read-game-data-json', async () => {
    const jsonPath = path.join(app.getAppPath(), 'games_data.json');
    try {
      const data = await fs.promises.readFile(jsonPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Błąd podczas czytania pliku games_data.json:', error);
      return [];
    }
  });

  ipcMain.handle('read-calendar-data', async () => {
    const jsonPath = path.join(app.getAppPath(), 'calendar_data.json');
    try {
      const data = await fs.promises.readFile(jsonPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Błąd podczas czytania pliku calendar_data.json:', error);
      return [];
    }
  });

  ipcMain.handle('get-system-info', () => {
    return {
      platform: os.platform(),
      release: os.release(),
      arch: os.arch(),
      cpuCores: os.cpus().length,
      totalMem: (os.totalmem() / (1024 ** 3)).toFixed(2) + ' GB'
    };
  });

  ipcMain.handle('copy-to-clipboard', (event, text) => {
    clipboard.writeText(text);
    return { success: true };
  });

  ipcMain.handle('get-username', () => {
    try {
      return os.userInfo().username;
    } catch (error) {
      console.error('Failed to get username in main process:', error);
      return null;
    }
  });

  // ********* AUTO-UPDATER IPC HANDLERS *********
  ipcMain.handle('check-for-app-updates', async () => {
    try {
      const result = await autoUpdater.checkForUpdates();
      return { success: true, updateInfo: result?.updateInfo };
    } catch (error) {
      console.error('Błąd sprawdzania aktualizacji:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('download-app-update', () => {
    try {
      autoUpdater.downloadUpdate();
      return { success: true };
    } catch (error) {
      console.error('Błąd pobierania aktualizacji:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('install-app-update', () => {
    try {
      autoUpdater.quitAndInstall();
      return { success: true };
    } catch (error) {
      console.error('Błąd instalacji aktualizacji:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('get-app-version', () => {
    return app.getVersion();
  });

  // ********* DISCORD RICH PRESENCE *********
  const clientId = '1413109083908739082';
  if (DiscordRPC) {
    const rpc = new DiscordRPC.Client({ transport: 'ipc' });

    async function setActivity(presence) {
      if (!rpc) return;
      const activity = {
        details: presence.details || 'Przegląda Astroworld',
        state: presence.state,
        startTimestamp: presence.startTimestamp || Date.now(),
        largeImageKey: 'icon',
        largeImageText: 'Astroworld',
        instance: false,
      };
      try {
        await rpc.setActivity(activity);
        console.log('Discord presence updated:', activity.details);
      } catch {}
    }

    rpc.on('ready', () => {
      console.log('Discord RPC is ready.');
      setActivity({ details: 'W menu głównym' });
    });

    rpc.login({ clientId }).catch(() => {
      console.error('Failed to login to Discord RPC. Is Discord running?');
    });

    ipcMain.on('update-discord-presence', (event, presence) => setActivity(presence));

    app.on('will-quit', () => {
      if (rpc) rpc.destroy();
    });
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ********* TORRENTY (WebTorrent) *********
let WebTorrentClient;

async function getClient() {
  if (!WebTorrentClient) {
    const WebTorrent = (await import("webtorrent")).default;
    WebTorrentClient = new WebTorrent();
  }
  return WebTorrentClient;
}
 
ipcMain.handle("torrent-add", async (event, data) => { 
  const client = await getClient(); // zakładam, że masz funkcję getClient()

  let magnet;
  let torrentName = "Unknown";

  if (typeof data === 'string') { 
    // Magnet link
    magnet = data;
    const match = magnet.match(/dn=([^&]+)/); 
    if (match) torrentName = decodeURIComponent(match[1].replace(/\+/g, ' '));
  } else if (Buffer.isBuffer(data)) { 
    // Plik .torrent
    magnet = data; 
  } else {
    return { success: false, error: "Invalid data provided. Expected magnet URI or torrent file buffer." };
  }

  // 🔎 Wyciągamy hash z magnet linka (żeby uniknąć duplikatów)
  let infoHashToCheck = null;
  if (typeof data === 'string') {
    const match = data.match(/btih:([a-fA-F0-9]+)/);
    infoHashToCheck = match ? match[1].toLowerCase() : null;
  }

  if (infoHashToCheck) {
    const existing = client.torrents.find(t => t.infoHash.toLowerCase() === infoHashToCheck);
    if (existing) {
      console.log("⚠️ Torrent już istnieje:", existing.infoHash);
      if (win && !win.isDestroyed()) {
        win.webContents.send("torrent-progress", { 
          progress: (existing.progress * 100).toFixed(1), 
          name: existing.name, 
          infoHash: existing.infoHash 
        });
      }
      return { success: true, name: existing.name, infoHash: existing.infoHash, alreadyAdded: true };
    }
  }

  // 🚀 Dodaj torrent (z trackerami + optymalizacją)
  const trackers = [
  'udp://public.popcorn-tracker.org:6969/announce',
  'http://104.28.1.30:8080/announce',
  'http://104.28.16.69/announce',
  'http://107.150.14.110:6969/announce',
  'http://109.121.134.121:1337/announce',
  'http://114.55.113.60:6969/announce',
  'http://125.227.35.196:6969/announce',
  'http://128.199.70.66:5944/announce',
  'http://157.7.202.64:8080/announce',
  'http://158.69.146.212:7777/announce',
  'http://173.254.204.71:1096/announce',
  'http://178.175.143.27/announce',
  'http://178.33.73.26:2710/announce',
  'http://182.176.139.129:6969/announce',
  'http://185.5.97.139:8089/announce',
  'http://188.165.253.109:1337/announce',
  'http://194.106.216.222/announce',
  'http://195.123.209.37:1337/announce',
  'http://210.244.71.25:6969/announce',
  'http://210.244.71.26:6969/announce',
  'http://213.159.215.198:6970/announce',
  'http://213.163.67.56:1337/announce',
  'http://37.19.5.139:6969/announce',
  'http://37.19.5.155:6881/announce',
  'http://46.4.109.148:6969/announce',
  'http://5.79.249.77:6969/announce',
  'http://5.79.83.193:2710/announce',
  'http://51.254.244.161:6969/announce',
  'http://59.36.96.77:6969/announce',
  'http://74.82.52.209:6969/announce',
  'http://80.246.243.18:6969/announce',
  'http://81.200.2.231/announce',
  'http://85.17.19.180/announce',
  'http://87.248.186.252:8080/announce',
  'http://87.253.152.137/announce',
  'http://91.216.110.47/announce',
  'http://91.217.91.21:3218/announce',
  'http://91.218.230.81:6969/announce',
  'http://93.92.64.5/announce',
  'http://atrack.pow7.com/announce',
  'http://bt.henbt.com:2710/announce',
  'http://bt.pusacg.org:8080/announce',
  'http://bt2.careland.com.cn:6969/announce',
  'http://explodie.org:6969/announce',
  'http://mgtracker.org:2710/announce',
  'http://mgtracker.org:6969/announce',
  'http://open.acgtracker.com:1096/announce',
  'http://open.lolicon.eu:7777/announce',
  'http://open.touki.ru/announce.php',
  'http://p4p.arenabg.ch:1337/announce',
  'http://p4p.arenabg.com:1337/announce',
  'http://pow7.com:80/announce',
  'http://retracker.gorcomnet.ru/announce',
  'http://retracker.krs-ix.ru/announce',
  'http://retracker.krs-ix.ru:80/announce',
  'http://secure.pow7.com/announce',
  'http://t1.pow7.com/announce',
  'http://t2.pow7.com/announce',
  'http://thetracker.org:80/announce',
  'http://torrent.gresille.org/announce',
  'http://torrentsmd.com:8080/announce',
  'http://tracker.aletorrenty.pl:2710/announce',
  'http://tracker.baravik.org:6970/announce',
  'http://tracker.bittor.pw:1337/announce',
  'http://tracker.bittorrent.am/announce',
  'http://tracker.calculate.ru:6969/announce',
  'http://tracker.dler.org:6969/announce',
  'http://tracker.dutchtracking.com/announce',
  'http://tracker.dutchtracking.com:80/announce',
  'http://tracker.dutchtracking.nl/announce',
  'http://tracker.dutchtracking.nl:80/announce',
  'http://tracker.edoardocolombo.eu:6969/announce',
  'http://tracker.ex.ua/announce',
  'http://tracker.ex.ua:80/announce',
  'http://tracker.filetracker.pl:8089/announce',
  'http://tracker.flashtorrents.org:6969/announce',
  'http://tracker.grepler.com:6969/announce',
  'http://tracker.internetwarriors.net:1337/announce',
  'http://tracker.kicks-ass.net/announce',
  'http://tracker.kicks-ass.net:80/announce',
  'http://tracker.kuroy.me:5944/announce',
  'http://tracker.mg64.net:6881/announce',
  'http://tracker.opentrackr.org:1337/announce',
  'http://tracker.skyts.net:6969/announce',
  'http://tracker.tfile.me/announce',
  'http://tracker.tiny-vps.com:6969/announce',
  'http://tracker.tvunderground.org.ru:3218/announce',
  'http://tracker.yoshi210.com:6969/announce',
  'http://tracker1.wasabii.com.tw:6969/announce',
  'http://tracker2.itzmx.com:6961/announce',
  'http://tracker2.wasabii.com.tw:6969/announce',
  'http://www.wareztorrent.com/announce',
  'http://www.wareztorrent.com:80/announce',
  'https://104.28.17.69/announce',
  'https://www.wareztorrent.com/announce',
  'udp://107.150.14.110:6969/announce',
  'udp://109.121.134.121:1337/announce',
  'udp://114.55.113.60:6969/announce',
  'udp://128.199.70.66:5944/announce',
  'udp://151.80.120.114:2710/announce',
  'udp://168.235.67.63:6969/announce',
  'udp://178.33.73.26:2710/announce',
  'udp://182.176.139.129:6969/announce',
  'udp://185.5.97.139:8089/announce',
  'udp://185.86.149.205:1337/announce',
  'udp://188.165.253.109:1337/announce',
  'udp://191.101.229.236:1337/announce',
  'udp://194.106.216.222:80/announce',
  'udp://195.123.209.37:1337/announce',
  'udp://195.123.209.40:80/announce',
  'udp://208.67.16.113:8000/announce',
  'udp://213.163.67.56:1337/announce',
  'udp://37.19.5.155:2710/announce',
  'udp://46.4.109.148:6969/announce',
  'udp://5.79.249.77:6969/announce',
  'udp://5.79.83.193:6969/announce',
  'udp://51.254.244.161:6969/announce',
  'udp://62.138.0.158:6969/announce',
  'udp://62.212.85.66:2710/announce',
  'udp://74.82.52.209:6969/announce',
  'udp://85.17.19.180:80/announce',
  'udp://89.234.156.205:80/announce',
  'udp://9.rarbg.com:2710/announce',
  'udp://9.rarbg.me:2780/announce',
  'udp://9.rarbg.to:2730/announce',
  'udp://91.218.230.81:6969/announce',
  'udp://94.23.183.33:6969/announce',
  'udp://bt.xxx-tracker.com:2710/announce',
  'udp://eddie4.nl:6969/announce',
  'udp://explodie.org:6969/announce',
  'udp://mgtracker.org:2710/announce',
  'udp://open.stealth.si:80/announce',
  'udp://p4p.arenabg.com:1337/announce',
  'udp://shadowshq.eddie4.nl:6969/announce',
  'udp://shadowshq.yi.org:6969/announce',
  'udp://torrent.gresille.org:80/announce',
  'udp://tracker.aletorrenty.pl:2710/announce',
  'udp://tracker.bittor.pw:1337/announce',
  'udp://tracker.coppersurfer.tk:6969/announce',
  'udp://tracker.eddie4.nl:6969/announce',
  'udp://tracker.ex.ua:80/announce',
  'udp://tracker.filetracker.pl:8089/announce',
  'udp://tracker.flashtorrents.org:6969/announce',
  'udp://tracker.grepler.com:6969/announce',
  'udp://tracker.ilibr.org:80/announce',
  'udp://tracker.internetwarriors.net:1337/announce',
  'udp://tracker.kicks-ass.net:80/announce',
  'udp://tracker.kuroy.me:5944/announce',
  'udp://tracker.leechers-paradise.org:6969/announce',
  'udp://tracker.mg64.net:2710/announce',
  'udp://tracker.mg64.net:6969/announce',
  'udp://tracker.opentrackr.org:1337/announce',
  'udp://tracker.piratepublic.com:1337/announce',
  'udp://tracker.sktorrent.net:6969/announce',
  'udp://tracker.skyts.net:6969/announce',
  'udp://tracker.tiny-vps.com:6969/announce',
  'udp://tracker.yoshi210.com:6969/announce',
  'udp://tracker2.indowebster.com:6969/announce',
  'udp://tracker4.piratux.com:6969/announce',
  'udp://zer0day.ch:1337/announce',
  'udp://zer0day.to:1337/announce'
  ];

  return new Promise((resolve) => {
    client.add(magnet, { 
      path: path.join(__dirname, "downloads"),
      announce: trackers,
      maxConns: 500
    }, (torrent) => {
      console.log("▶️ Start pobierania:", torrent.infoHash, torrent.name);

      if (torrentName === "Unknown" && torrent.name) {
        torrentName = torrent.name;
      }

      resolve({ success: true, name: torrent.name, infoHash: torrent.infoHash });

      torrent.on("download", () => {
        if (win && !win.isDestroyed()) {
          win.webContents.send("torrent-progress", { 
            progress: (torrent.progress * 100).toFixed(1),
            name: torrent.name,
            infoHash: torrent.infoHash,
            downloadSpeed: (torrent.downloadSpeed / 1024 / 1024).toFixed(2), // MB/s
            uploadSpeed: (torrent.uploadSpeed / 1024 / 1024).toFixed(2),     // MB/s
            peers: torrent.numPeers,
            timeRemaining: torrent.timeRemaining,
            downloaded: torrent.downloaded,
            total: torrent.length,
            ratio: torrent.ratio
          });
        }
      });

      torrent.on("done", () => {
        console.log("✅ Zakończono:", torrent.name);
        if (win && !win.isDestroyed()) {
          win.webContents.send("torrent-done", { 
            name: torrent.name, 
            infoHash: torrent.infoHash 
          });
        }
      });

      torrent.on("error", (err) => {
        console.error("❌ Błąd torrenta:", err);
        if (win && !win.isDestroyed()) {
          win.webContents.send("torrent-error", { 
            name: torrent.name, 
            infoHash: torrent.infoHash, 
            error: err.message 
          });
        }
      });
    });
  });
});


// New IPC handler to read file content as Buffer
ipcMain.handle('read-file-as-buffer', async (event, filePath) => {
  try {
    const buffer = await fs.promises.readFile(filePath);
    return buffer;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    throw error;
  }
});
