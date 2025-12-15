    
// === ASTROWORLD PROFESSIONAL INTRO LOGIC ===
document.addEventListener('DOMContentLoaded', function () {
    const intro = document.getElementById('astroIntro');
    if (!intro) return;
    let introClosed = false;
    function closeIntro() {
        if (introClosed) return;
        introClosed = true;
        intro.classList.add('hide');
        setTimeout(() => { intro.style.display = 'none'; }, 800);
    }
    setTimeout(closeIntro, 2700);
    intro.addEventListener('click', closeIntro);
    window.addEventListener('keydown', closeIntro);
});
// === END ASTROWORLD INTRO LOGIC ===

// === OBSŁUGA LINKÓW ZEWNĘTRZNYCH W SEKCJI "O PROGRAMIE" ===
document.addEventListener('DOMContentLoaded', () => {
    const links = {
        'aboutLinkGitHub': 'https://github.com/twoj-autor/astroworld',
        'aboutLinkDiscord': 'https://discord.gg/UBhtYzNu',
        'supportLinkDiscord': 'https://discord.gg/UBhtYzNu', // Dodany link
        'aboutLinkEmail': 'mailto:kuvismotionstudio@gmail.com',
        'supportLinkEmail': 'mailto:kuvismotionstudio@gmail.com',
        'supportLinkWebsite': 'https://astroworld.byethost8.com',
        'helpLinkRedirect': '#' // Specjalna obsługa poniżej
    };

    for (const [id, url] of Object.entries(links)) {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('click', (e) => {
                e.preventDefault();
                if (id === 'helpLinkRedirect') {
                    // Symuluje kliknięcie w link Pomocy w sidebarze
                    const helpPageLink = document.getElementById('helpPageLink');
                    if (helpPageLink) {
                        helpPageLink.click();
                    }
                } else {
                    window.api.openLink(url);
                }
            });
        }
    }
});
// === KONIEC OBSŁUGI LINKÓW ===

// === DISCORD RICH PRESENCE ===
function updateDiscordPresence(details, state = '') {
    if (window.api && typeof window.api.updateDiscordPresence === 'function') {
        // Używamy startTimestamp, aby pokazywać czas od uruchomienia aplikacji
        window.api.updateDiscordPresence({ details, state, startTimestamp: window.appStartTime });
    }
}


// Funkcja do sprawdzania aktualizacji gier
async function checkForGameUpdates() {
  try {
    const result = await window.api.invoke('check-for-updates');
    
    if (result.success && result.updates && result.updates.length > 0) {
      // Utwórz listę zaktualizowanych gier
      const updatesList = result.updates.map(update => 
        `• ${update.name} (${update.oldVersion} → ${update.newVersion})`
      ).join('\n');
      
      // Pokaż powiadomienie
      showToast(
        `Dostępne nowe wersje gier (${result.updates.length}):\n${updatesList}`,
        10000, // 10 sekund wyświetlania
        'info'
      );
      
      // Możesz też dodać powiadomienie systemowe
      if (window.Notification && Notification.permission === 'granted') {
        new Notification('Nowe aktualizacje gier!', {
          body: `Dostępne są nowe wersje ${result.updates.length} gier`,
          icon: 'icon.ico'
        });
      }
    }
  } catch (error) {
    console.error('Błąd podczas sprawdzania aktualizacji:', error);
  }
}

// ********* AUTO-UPDATER FUNCTIONS *********
let updateDownloadProgress = 0;
let isUpdateAvailable = false;

// Funkcja do sprawdzania aktualizacji aplikacji
async function checkForAppUpdates() {
  try {
    const result = await window.api.checkForAppUpdates();
    
    if (result.success && result.updateInfo) {
      console.log('Sprawdzono aktualizacje aplikacji');
    }
  } catch (error) {
    console.error('Błąd podczas sprawdzania aktualizacji aplikacji:', error);
  }
}

// Funkcja do pokazania modala aktualizacji
function showUpdateModal(updateInfo) {
  const modal = document.getElementById('updateModal');
  const modalInfo = document.getElementById('updateModalInfo');
  const changelog = document.getElementById('updateChangelog');
  const downloadBtn = document.getElementById('updateDownloadBtn');
  
  if (modal && modalInfo && downloadBtn) {
    modalInfo.innerHTML = `Wersja ${updateInfo.version} jest gotowa do pobrania`;
    
    // Wyświetl changelog
    if (changelog && updateInfo.releaseNotes) {
      const changelogContent = changelog.querySelector('.changelog-content');
      if (changelogContent) {
        // Parsuj release notes
        let notes = updateInfo.releaseNotes;
        if (typeof notes === 'string') {
          notes = notes.split('\n').filter(line => line.trim());
        }
        
        if (Array.isArray(notes) && notes.length > 0) {
          changelogContent.innerHTML = notes.map(note => `<div>• ${note}</div>`).join('');
        } else {
          changelogContent.innerHTML = '<div>• Poprawki błędów i ulepszenia wydajności</div><div>• Nowe funkcje i optymalizacje</div>';
        }
      }
    } else {
      const changelogContent = changelog.querySelector('.changelog-content');
      if (changelogContent) {
        changelogContent.innerHTML = '<div>• Poprawki błędów i ulepszenia wydajności</div><div>• Nowe funkcje i optymalizacje</div><div>• Aktualizacje bezpieczeństwa</div>';
      }
    }
    
    // Reset button state
    const btnIcon = downloadBtn.querySelector('i');
    const btnText = downloadBtn.querySelector('span');
    if (btnIcon) btnIcon.className = 'fas fa-download';
    if (btnText) btnText.textContent = 'Zaktualizuj i uruchom ponownie';
    downloadBtn.disabled = false;
    downloadBtn.onclick = () => downloadAppUpdate();
    
    modal.classList.remove('hidden');
    isUpdateAvailable = true;
  }
}

// Funkcja do pobierania aktualizacji
async function downloadAppUpdate() {
  try {
    const downloadBtn = document.getElementById('updateDownloadBtn');
    const progressDiv = document.getElementById('updateProgress');
    
    if (downloadBtn) {
      const btnIcon = downloadBtn.querySelector('i');
      const btnText = downloadBtn.querySelector('span');
      if (btnIcon) btnIcon.className = 'fas fa-spinner fa-spin';
      if (btnText) btnText.textContent = 'Pobieranie...';
      downloadBtn.disabled = true;
    }
    
    if (progressDiv) {
      progressDiv.classList.remove('hidden');
    }
    
    await window.api.downloadAppUpdate();
    showToast('Rozpoczęto pobieranie aktualizacji...', 3000, 'info');
  } catch (error) {
    console.error('Błąd pobierania aktualizacji:', error);
    showToast('Błąd podczas pobierania aktualizacji', 3000, 'error');
    
    // Reset button on error
    const downloadBtn = document.getElementById('updateDownloadBtn');
    if (downloadBtn) {
      const btnIcon = downloadBtn.querySelector('i');
      const btnText = downloadBtn.querySelector('span');
      if (btnIcon) btnIcon.className = 'fas fa-download';
      if (btnText) btnText.textContent = 'Zaktualizuj i uruchom ponownie';
      downloadBtn.disabled = false;
    }
  }
}

// Funkcja do instalacji aktualizacji
async function installAppUpdate() {
  try {
    console.log('🚀 Rozpoczynam instalację aktualizacji...');
    showToast('Instalowanie aktualizacji...', 2000, 'info');
    await window.api.installAppUpdate();
  } catch (error) {
    console.error('Błąd instalacji aktualizacji:', error);
    showToast('Błąd podczas instalacji aktualizacji', 3000, 'error');
  }
}

// Funkcja do aktualizacji paska postępu
function updateDownloadProgressBar(progress) {
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  const downloadBtn = document.getElementById('updateDownloadBtn');
  
  if (progressFill) {
    progressFill.style.width = `${progress.percent}%`;
  }
  
  if (progressText) {
    const mbTransferred = (progress.transferred / 1024 / 1024).toFixed(1);
    const mbTotal = (progress.total / 1024 / 1024).toFixed(1);
    progressText.textContent = `Pobieranie... ${progress.percent}% [${mbTransferred}MB / ${mbTotal}MB]`;
  }
  
  if (downloadBtn) {
    const btnText = downloadBtn.querySelector('span');
    if (btnText) {
      btnText.textContent = `Pobieranie... ${progress.percent}%`;
    }
  }
}

// Event listeners dla auto-updater będą ustawione w DOMContentLoaded

// Poproś o pozwolenie na powiadomienia przy pierwszym uruchomieniu
if (window.Notification && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
        console.log('Powiadomienia:', permission);
    });
}

 
// === ANIMACJE ŚWIĄTECZNE I OKOLICZNOŚCIOWE ===
function checkHolidayEvents() {
  const now = new Date();
  const month = now.getMonth(); // 0 = styczeń, 11 = grudzień
  const day = now.getDate();

  // Nowy Rok (1 stycznia)
  if (month === 0 && day === 1) {
    triggerConfettiAnimation('🎉 Szczęśliwego Nowego Roku! 🎉', 'new-year');
  }

  // Halloween (31 października)
  if (month === 9 && day === 31) {
    triggerBatAnimation();
  }

  // Boże Narodzenie (24-26 grudnia)
  if (month === 11 && (day >= 24 && day <= 26)) {
    triggerSnowAnimation();
  }
}

function triggerConfettiAnimation(message, toastClass) {
  const container = document.createElement('div');
  container.id = 'holiday-animation-container';
  document.body.appendChild(container);

  const confettiCount = 150;
  const colors = ['#ff3b3b', '#00cfff', '#a259ff', '#ffc107', '#28a745', '#ffffff'];

  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    confetti.classList.add('confetti');
    const x = Math.random() * 100;
    const animDuration = Math.random() * 5 + 4;
    const animDelay = Math.random() * 5;
    const size = Math.random() * 8 + 6;
    const color = colors[Math.floor(Math.random() * colors.length)];

    confetti.style.left = `${x}vw`;
    confetti.style.animationDuration = `${animDuration}s`;
    confetti.style.animationDelay = `${animDelay}s`;
    confetti.style.backgroundColor = color;
    confetti.style.width = `${size}px`;
    confetti.style.height = `${size * 2}px`;
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
    container.appendChild(confetti);
  }

  setTimeout(() => showToast(message, 8000, toastClass), 1500);
}

function triggerSnowAnimation() {
  const container = document.createElement('div');
  container.id = 'holiday-animation-container';
  document.body.appendChild(container);

  const snowCount = 100;
  for (let i = 0; i < snowCount; i++) {
    const snowflake = document.createElement('div');
    snowflake.classList.add('snowflake');
    snowflake.textContent = '❄';
    snowflake.style.left = `${Math.random() * 100}vw`;
    snowflake.style.animationDuration = `${Math.random() * 10 + 5}s`;
    snowflake.style.animationDelay = `${Math.random() * 10}s`;
    snowflake.style.opacity = Math.random();
    snowflake.style.fontSize = `${Math.random() * 1.5 + 0.5}em`;
    container.appendChild(snowflake);
  }

  setTimeout(() => showToast('🎄 Wesołych Świąt! 🎄', 8000, 'christmas'), 1500);
}

function triggerBatAnimation() {
  const container = document.createElement('div');
  container.id = 'holiday-animation-container';
  document.body.appendChild(container);

  const batCount = 30;
  for (let i = 0; i < batCount; i++) {
    const bat = document.createElement('div');
    bat.classList.add('bat');
    const startY = Math.random() * 40 + 80; // Start lower on the screen
    const duration = Math.random() * 8 + 6; // 6-14s
    const delay = Math.random() * 8;

    bat.style.top = `${startY}vh`;
    bat.style.animationDuration = `${duration}s`;
    bat.style.animationDelay = `${delay}s`;
    container.appendChild(bat);
  }

  setTimeout(() => showToast('🎃 Happy Halloween! 🎃', 8000, 'halloween'), 1500);
}
// === KONIEC ANIMACJI ŚWIĄTECZNYCH ===

document.addEventListener('DOMContentLoaded', () => {
    window.appStartTime = Date.now(); // Zapisz czas startu aplikacji
    updateDiscordPresence('W menu głównym', 'Przegląda bibliotekę');
    
    // Sprawdź aktualizacje aplikacji przy starcie (z opóźnieniem)
    setTimeout(() => {
        checkForAppUpdates();
    }, 3000); // 3 sekundy opóźnienia
    
    // Wyświetl aktualną wersję aplikacji
    if (window.api && window.api.getAppVersion) {
        window.api.getAppVersion().then(version => {
            const versionDisplay = document.getElementById('appVersionDisplay');
            if (versionDisplay) {
                versionDisplay.textContent = version;
            }
        }).catch(error => {
            console.error('Błąd pobierania wersji aplikacji:', error);
        });
    }
 
    // --- BARDZO MAŁY ZEGAR W SIDEBARZE ---
    function updateSidebarClock() {
        const clock = document.getElementById('sidebar-clock');
        const greeting = document.getElementById('sidebar-greeting');
        if (!clock || !greeting) return;

        const now = new Date();
        const h = now.getHours();
        const m = now.getMinutes().toString().padStart(2, '0');
        clock.textContent = h.toString().padStart(2, '0') + ':' + m;

        // Logika powitania wieczornego
        if (h >= 21 || h < 4) {
            greeting.textContent = 'Miłego wieczoru :)';
            greeting.classList.remove('hidden');
        } else {
            greeting.classList.add('hidden');
        }
    }
    updateSidebarClock();
    setInterval(updateSidebarClock, 10000); // Update every 10 seconds to reduce load

    // Sprawdź, czy jest jakieś święto
    checkHolidayEvents();
    
    // === OBSŁUGA MODALA AKTUALIZACJI ===
    const updateModal = document.getElementById('updateModal');
    const closeUpdateModalBtns = document.querySelectorAll('.close-update-modal');
    
    if (closeUpdateModalBtns.length > 0 && updateModal) {
        closeUpdateModalBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                updateModal.classList.add('hidden');
            });
        });
        
        // Zamknij modal po kliknięciu w tło
        updateModal.addEventListener('click', (e) => {
            if (e.target === updateModal) {
                updateModal.classList.add('hidden');
            }
        });
    }
 
    // === LOGIKA NIESTANDARDOWEGO KURSORA ===
    const cursorDot = document.createElement('div');
    cursorDot.className = 'cursor-dot';
    document.body.appendChild(cursorDot);

    const cursorOutline = document.createElement('div');
    cursorOutline.className = 'cursor-outline';
    document.body.appendChild(cursorOutline);

    let mouseX = 0, mouseY = 0;
    let outlineX = 0, outlineY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursorDot.style.opacity = '1';
        cursorOutline.style.opacity = '1';
    });

    const animateCursor = () => {
        let delay = 0.1;
        outlineX += (mouseX - outlineX) * delay;
        outlineY += (mouseY - outlineY) * delay;

        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;
        cursorOutline.style.left = `${outlineX}px`;
        cursorOutline.style.top = `${outlineY}px`;

        requestAnimationFrame(animateCursor);
    };
    animateCursor();
    // --- BACK TO TOP BUTTON ---
    const backToTopBtn = document.getElementById('backToTopBtn');
    const contentArea = document.querySelector('.container'); // Główny kontener do obserwacji scrolla

    if (backToTopBtn && contentArea) {
        contentArea.addEventListener('scroll', () => {
            if (contentArea.scrollTop > 300) {
                backToTopBtn.classList.remove('hidden');
            } else {
                backToTopBtn.classList.add('hidden');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            contentArea.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
 
    // --- WELCOME MESSAGE ---
    async function displayWelcomeMessage() {
        const welcomeEl = document.getElementById('welcomeMessage');
        const aboutWelcomeHeader = document.getElementById('aboutWelcomeHeader');

        try {
            const username = await window.api.getUsername();
            if (username) {
                if (welcomeEl) {
                    welcomeEl.innerHTML = `Witaj z powrotem, <span class="welcome-username">${username}</span>!`;
                }
                if (aboutWelcomeHeader) {
                    aboutWelcomeHeader.innerHTML = `Witaj, <strong class="welcome-username">${username}</strong>! Cieszymy się, że wróciłeś do <strong>Astroworld 🌎</strong>.`;
                }
            }
        } catch (error) {
            console.error('Could not get username:', error);
            if (welcomeEl) welcomeEl.style.display = 'none';
        }
    }
    displayWelcomeMessage();
 
    // === LOGIKA LICZNIKA DO PREMIERY ===
    function updateAllCountdowns() {
        const countdownElements = document.querySelectorAll('.pre-release-countdown');
        if (countdownElements.length === 0) return;

        const now = new Date().getTime();

        countdownElements.forEach(el => {
            const releaseDateAttr = el.dataset.releaseDate;
            if (!releaseDateAttr) {
                el.remove();
                return;
            }
            const releaseDate = new Date(releaseDateAttr).getTime();
            const distance = releaseDate - now;

            if (distance < 0) {
                el.textContent = 'Premiera!';
                setTimeout(() => el.remove(), 10000); // Daj użytkownikowi czas na zobaczenie
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            // NOWOŚĆ: Dodaj animację pulsowania, gdy zostało mniej niż godzina
            if (days === 0 && hours === 0) {
                el.classList.add('countdown-urgent');
            } else {
                el.classList.remove('countdown-urgent');
            }

            let countdownText = '';
            if (days > 0) {
                countdownText = `Premiera za: ${days}d ${hours}g`;
            } else {
                countdownText = `Premiera za: ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            }
            el.textContent = countdownText;
        });
    }
    setInterval(updateAllCountdowns, 1000);
 
    // Wczytaj ustawienia z localStorage
    // === GRA TYGODNIA ===
    function getWeekNumber(d) {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        return d.getUTCFullYear() + weekNo;
    }

    function displayFeaturedGame() {
        const featuredSection = document.getElementById('featuredGameSection');
        const featuredCardContainer = document.getElementById('featuredGameCard');

        if (!featuredSection || !featuredCardContainer || !gamesData || gamesData.length === 0) {
            if (featuredSection) featuredSection.classList.add('hidden');
            return;
        }

        // Użyj numeru tygodnia jako "ziarna" losowania, aby gra była taka sama przez cały tydzień
        const weekSeed = getWeekNumber(new Date());
        const availableGames = gamesData.filter(g => allFiles.some(f => cleanGameFileName(f.name) === g.name));
        if (availableGames.length === 0) {
            featuredSection.classList.add('hidden');
            return;
        }

        const gameIndex = weekSeed % availableGames.length;
        const featuredGame = availableGames[gameIndex];
        const correspondingFile = allFiles.find(file => cleanGameFileName(file.name) === featuredGame.name);

        if (!featuredGame || !correspondingFile) {
            featuredSection.classList.add('hidden');
            return;
        }

        const gameBaseName = cleanGameFileName(correspondingFile.name);
        const coverImageSrc = `./covers/${gameBaseName}.jpg`;

        featuredCardContainer.innerHTML = `
            <img src="${coverImageSrc}" alt="${featuredGame.name}" class="featured-game-img" onerror="this.onerror=null; this.src='./covers/placeholder.jpg';">
            <div class="featured-game-info">
                <h4>${featuredGame.name}</h4>
                <p>${featuredGame.description.substring(0, 120)}...</p>
                <div class="featured-game-genres">
                    ${(featuredGame.genres || []).slice(0, 3).map(genre => `<span>${genre}</span>`).join('')}
                </div>
            </div>
        `;

        featuredCardContainer.onclick = () => {
            handleGameClick(correspondingFile);
        };

        featuredSection.classList.remove('hidden');
    }





    // === NOWE ELEMENTY USTAWIEŃ ===
    const animationsToggle = document.getElementById('animationsToggle');
    const soundsToggle = document.getElementById('soundsToggle');
    const trayToggle = document.getElementById('trayToggle');
    const clearCacheBtn = document.getElementById('clearCacheBtn');
    const resetSettingsBtn = document.getElementById('resetSettingsBtn');
    
    // Nowe elementy ustawień pobierania
    const selectDownloadFolderBtn = document.getElementById('selectDownloadFolderBtn');
    const downloadFolderPath = document.getElementById('downloadFolderPath');
    const downloadSpeedLimit = document.getElementById('downloadSpeedLimit');
    const autoRunAfterDownload = document.getElementById('autoRunAfterDownload');
    const pauseOnSleep = document.getElementById('pauseOnSleep');
    
    // Nowe elementy powiadomień
    const downloadNotifications = document.getElementById('downloadNotifications');
    const errorNotifications = document.getElementById('errorNotifications');
    const notificationSound = document.getElementById('notificationSound');
    
    // Nowe elementy wyświetlania
    const tileSizeSelect = document.getElementById('tileSizeSelect');
    const defaultSortSelect = document.getElementById('defaultSortSelect');
    const itemsPerPage = document.getElementById('itemsPerPage');
    const showThumbnails = document.getElementById('showThumbnails');
    
    // Nowe elementy sieci i bezpieczeństwa
    const useProxy = document.getElementById('useProxy');
    const proxySettings = document.getElementById('proxySettings');
    const proxyAddress = document.getElementById('proxyAddress');
    const verifySSL = document.getElementById('verifySSL');
    const autoDeleteHistoryDays = document.getElementById('autoDeleteHistoryDays');
    
    // Nowe elementy eksportu/importu
    const exportSettingsBtn = document.getElementById('exportSettingsBtn');
    const importSettingsBtn = document.getElementById('importSettingsBtn');

    function loadSettings() {
        // Istniejące ustawienia
        if (animationsToggle) animationsToggle.checked = localStorage.getItem('animations') !== 'off';
        if (soundsToggle) soundsToggle.checked = localStorage.getItem('sounds') !== 'off';
        if (trayToggle) trayToggle.checked = localStorage.getItem('tray') === 'on';
        
        // Ustawienia pobierania
        const savedDownloadFolder = localStorage.getItem('downloadFolder');
        if (downloadFolderPath) {
            downloadFolderPath.textContent = savedDownloadFolder || 'Nie wybrano';
        }
        if (downloadSpeedLimit) {
            downloadSpeedLimit.value = localStorage.getItem('downloadSpeedLimit') || '';
        }
        if (autoRunAfterDownload) {
            autoRunAfterDownload.checked = localStorage.getItem('autoRunAfterDownload') === 'on';
        }
        if (pauseOnSleep) {
            pauseOnSleep.checked = localStorage.getItem('pauseOnSleep') !== 'off';
        }
        
        // Ustawienia powiadomień
        if (downloadNotifications) {
            downloadNotifications.checked = localStorage.getItem('downloadNotifications') !== 'off';
        }
        if (errorNotifications) {
            errorNotifications.checked = localStorage.getItem('errorNotifications') !== 'off';
        }
        if (notificationSound) {
            notificationSound.checked = localStorage.getItem('notificationSound') !== 'off';
        }
        
        // Ustawienia wyświetlania
        if (tileSizeSelect) {
            tileSizeSelect.value = localStorage.getItem('tileSize') || 'medium';
        }
        if (defaultSortSelect) {
            defaultSortSelect.value = localStorage.getItem('defaultSort') || 'name-asc';
        }
        if (itemsPerPage) {
            itemsPerPage.value = localStorage.getItem('itemsPerPage') || '20';
        }
        if (showThumbnails) {
            showThumbnails.checked = localStorage.getItem('showThumbnails') !== 'off';
        }
        
        // Ustawienia sieci i bezpieczeństwa
        if (useProxy) {
            useProxy.checked = localStorage.getItem('useProxy') === 'on';
            updateProxySettingsVisibility();
        }
        if (proxyAddress) {
            proxyAddress.value = localStorage.getItem('proxyAddress') || '';
        }
        if (verifySSL) {
            verifySSL.checked = localStorage.getItem('verifySSL') !== 'off';
        }
        if (autoDeleteHistoryDays) {
            autoDeleteHistoryDays.value = localStorage.getItem('autoDeleteHistoryDays') || '0';
        }
    }
    
    // Zapisz ustawienia do localStorage
    function saveSettings() {
        // Istniejące ustawienia
        if (animationsToggle) localStorage.setItem('animations', animationsToggle.checked ? 'on' : 'off');
        if (soundsToggle) localStorage.setItem('sounds', soundsToggle.checked ? 'on' : 'off');
        if (trayToggle) localStorage.setItem('tray', trayToggle.checked ? 'on' : 'off');
        
        // Ustawienia pobierania
        if (downloadSpeedLimit) {
            const speedLimit = downloadSpeedLimit.value.trim();
            if (speedLimit) {
                localStorage.setItem('downloadSpeedLimit', speedLimit);
            } else {
                localStorage.removeItem('downloadSpeedLimit');
            }
        }
        if (autoRunAfterDownload) {
            localStorage.setItem('autoRunAfterDownload', autoRunAfterDownload.checked ? 'on' : 'off');
        }
        if (pauseOnSleep) {
            localStorage.setItem('pauseOnSleep', pauseOnSleep.checked ? 'on' : 'off');
        }
        
        // Ustawienia powiadomień
        if (downloadNotifications) {
            localStorage.setItem('downloadNotifications', downloadNotifications.checked ? 'on' : 'off');
        }
        if (errorNotifications) {
            localStorage.setItem('errorNotifications', errorNotifications.checked ? 'on' : 'off');
        }
        if (notificationSound) {
            localStorage.setItem('notificationSound', notificationSound.checked ? 'on' : 'off');
        }
        
        // Ustawienia wyświetlania
        if (tileSizeSelect) {
            localStorage.setItem('tileSize', tileSizeSelect.value);
        }
        if (defaultSortSelect) {
            localStorage.setItem('defaultSort', defaultSortSelect.value);
        }
        if (itemsPerPage) {
            localStorage.setItem('itemsPerPage', itemsPerPage.value);
        }
        if (showThumbnails) {
            localStorage.setItem('showThumbnails', showThumbnails.checked ? 'on' : 'off');
        }
        
        // Ustawienia sieci i bezpieczeństwa
        if (useProxy) {
            localStorage.setItem('useProxy', useProxy.checked ? 'on' : 'off');
        }
        if (proxyAddress) {
            const proxy = proxyAddress.value.trim();
            if (proxy) {
                localStorage.setItem('proxyAddress', proxy);
            } else {
                localStorage.removeItem('proxyAddress');
            }
        }
        if (verifySSL) {
            localStorage.setItem('verifySSL', verifySSL.checked ? 'on' : 'off');
        }
        if (autoDeleteHistoryDays) {
            const days = autoDeleteHistoryDays.value.trim();
            if (days) {
                localStorage.setItem('autoDeleteHistoryDays', days);
            } else {
                localStorage.setItem('autoDeleteHistoryDays', '0');
            }
        }
    }
    
    // Funkcja do pokazywania/ukrywania ustawień proxy
    function updateProxySettingsVisibility() {
        if (proxySettings && useProxy) {
            proxySettings.style.display = useProxy.checked ? 'block' : 'none';
        }
    }
    // Obsługa przełączników - istniejące
    if (animationsToggle) animationsToggle.addEventListener('change', () => {
        saveSettings();
        showToast(animationsToggle.checked ? 'Animacje włączone' : 'Animacje wyłączone');
        document.body.classList.toggle('no-animations', !animationsToggle.checked);
    });
    if (soundsToggle) soundsToggle.addEventListener('change', () => {
        saveSettings();
        showToast(soundsToggle.checked ? 'Dźwięki włączone' : 'Dźwięki wyłączone');
    });
    if (trayToggle) trayToggle.addEventListener('change', () => {
        saveSettings();
        showToast(trayToggle.checked ? 'Minimalizacja do tray: TAK' : 'Minimalizacja do tray: NIE');
    });
    
    // Obsługa ustawień pobierania
    if (selectDownloadFolderBtn) {
        selectDownloadFolderBtn.addEventListener('click', async () => {
            try {
                // Użyj dedykowanej funkcji z preload.js
                if (window.api && window.api.selectDownloadFolder) {
                    const result = await window.api.selectDownloadFolder();
                    if (result && !result.canceled && result.path) {
                        localStorage.setItem('downloadFolder', result.path);
                        if (downloadFolderPath) {
                            downloadFolderPath.textContent = result.path;
                        }
                        showToast('Folder docelowy został wybrany!', 3000, 'success');
                        return;
                    } else if (result && result.canceled) {
                        // Użytkownik anulował wybór
                        return;
                    }
                }
                
                // Fallback: użyj generycznego invoke
                if (window.api && window.api.invoke) {
                    const result = await window.api.invoke('select-download-folder');
                    if (result && !result.canceled && result.path) {
                        localStorage.setItem('downloadFolder', result.path);
                        if (downloadFolderPath) {
                            downloadFolderPath.textContent = result.path;
                        }
                        showToast('Folder docelowy został wybrany!', 3000, 'success');
                        return;
                    }
                }
                
                // Ostatni fallback: użyj prompt do wprowadzenia ścieżki
                const path = prompt('Wprowadź ścieżkę do folderu docelowego pobrań:');
                if (path && path.trim()) {
                    localStorage.setItem('downloadFolder', path.trim());
                    if (downloadFolderPath) {
                        downloadFolderPath.textContent = path.trim();
                    }
                    showToast('Folder docelowy został zapisany!', 3000, 'success');
                }
            } catch (error) {
                console.error('Błąd przy wyborze folderu:', error);
                // Fallback: użyj prompt
                const path = prompt('Wprowadź ścieżkę do folderu docelowego pobrań:');
                if (path && path.trim()) {
                    localStorage.setItem('downloadFolder', path.trim());
                    if (downloadFolderPath) {
                        downloadFolderPath.textContent = path.trim();
                    }
                    showToast('Folder docelowy został zapisany!', 3000, 'success');
                } else {
                    showToast('Nie udało się wybrać folderu', 3000, 'danger');
                }
            }
        });
    }
    
    if (downloadSpeedLimit) {
        downloadSpeedLimit.addEventListener('change', () => {
            saveSettings();
            const value = downloadSpeedLimit.value.trim();
            if (value) {
                showToast(`Limit prędkości ustawiony na ${value} MB/s`);
            } else {
                showToast('Limit prędkości usunięty');
            }
        });
    }
    
    if (autoRunAfterDownload) {
        autoRunAfterDownload.addEventListener('change', () => {
            saveSettings();
            showToast(autoRunAfterDownload.checked ? 'Automatyczne uruchamianie włączone' : 'Automatyczne uruchamianie wyłączone');
        });
    }
    
    if (pauseOnSleep) {
        pauseOnSleep.addEventListener('change', () => {
            saveSettings();
            showToast(pauseOnSleep.checked ? 'Wstrzymywanie przy uśpieniu włączone' : 'Wstrzymywanie przy uśpieniu wyłączone');
        });
    }
    
    // Obsługa ustawień powiadomień
    if (downloadNotifications) {
        downloadNotifications.addEventListener('change', () => {
            saveSettings();
            showToast(downloadNotifications.checked ? 'Powiadomienia o pobieraniu włączone' : 'Powiadomienia o pobieraniu wyłączone');
        });
    }
    
    if (errorNotifications) {
        errorNotifications.addEventListener('change', () => {
            saveSettings();
            showToast(errorNotifications.checked ? 'Powiadomienia o błędach włączone' : 'Powiadomienia o błędach wyłączone');
        });
    }
    
    if (notificationSound) {
        notificationSound.addEventListener('change', () => {
            saveSettings();
            showToast(notificationSound.checked ? 'Dźwięk powiadomień włączony' : 'Dźwięk powiadomień wyłączony');
        });
    }
    
    // Obsługa ustawień wyświetlania
    if (tileSizeSelect) {
        tileSizeSelect.addEventListener('change', () => {
            saveSettings();
            const sizes = { small: 'Mały', medium: 'Średni', large: 'Duży' };
            showToast(`Rozmiar kafelków: ${sizes[tileSizeSelect.value]}`);
            // Można dodać logikę zmiany rozmiaru kafelków
            document.body.setAttribute('data-tile-size', tileSizeSelect.value);
        });
    }
    
    if (defaultSortSelect) {
        defaultSortSelect.addEventListener('change', () => {
            saveSettings();
            showToast('Domyślne sortowanie zapisane');
        });
    }
    
    if (itemsPerPage) {
        itemsPerPage.addEventListener('change', () => {
            saveSettings();
            showToast(`Liczba elementów na stronie: ${itemsPerPage.value}`);
        });
    }
    
    if (showThumbnails) {
        showThumbnails.addEventListener('change', () => {
            saveSettings();
            showToast(showThumbnails.checked ? 'Miniaturki włączone' : 'Miniaturki wyłączone');
        });
    }
    
    // Obsługa ustawień sieci i bezpieczeństwa
    if (useProxy) {
        useProxy.addEventListener('change', () => {
            saveSettings();
            updateProxySettingsVisibility();
            showToast(useProxy.checked ? 'Proxy włączony' : 'Proxy wyłączony');
        });
    }
    
    if (proxyAddress) {
        proxyAddress.addEventListener('change', () => {
            saveSettings();
            if (proxyAddress.value.trim()) {
                showToast('Adres proxy zapisany');
            }
        });
    }
    
    if (verifySSL) {
        verifySSL.addEventListener('change', () => {
            saveSettings();
            showToast(verifySSL.checked ? 'Weryfikacja SSL włączona' : 'Weryfikacja SSL wyłączona');
        });
    }
    
    if (autoDeleteHistoryDays) {
        autoDeleteHistoryDays.addEventListener('change', () => {
            saveSettings();
            const days = autoDeleteHistoryDays.value.trim();
            if (days === '0' || !days) {
                showToast('Automatyczne usuwanie historii wyłączone');
            } else {
                showToast(`Historia będzie usuwana po ${days} dniach`);
            }
        });
    }
    
    // Obsługa eksportu/importu ustawień
    if (exportSettingsBtn) {
        exportSettingsBtn.addEventListener('click', () => {
            try {
                const settings = {};
                // Zbierz wszystkie ustawienia z localStorage
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && !key.startsWith('_')) { // Pomijamy wewnętrzne klucze
                        settings[key] = localStorage.getItem(key);
                    }
                }
                
                const dataStr = JSON.stringify(settings, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `astroworld-settings-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                
                showToast('Ustawienia wyeksportowane!', 3000, 'success');
            } catch (error) {
                console.error('Błąd przy eksporcie:', error);
                showToast('Nie udało się wyeksportować ustawień', 3000, 'danger');
            }
        });
    }
    
    if (importSettingsBtn) {
        importSettingsBtn.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const settings = JSON.parse(event.target.result);
                        // Załaduj ustawienia do localStorage
                        Object.keys(settings).forEach(key => {
                            localStorage.setItem(key, settings[key]);
                        });
                        
                        // Przeładuj ustawienia w interfejsie
                        loadSettings();
                        showToast('Ustawienia zaimportowane! Odśwież stronę, aby zastosować zmiany.', 5000, 'success');
                    } catch (error) {
                        console.error('Błąd przy imporcie:', error);
                        showToast('Nieprawidłowy plik ustawień', 3000, 'danger');
                    }
                };
                reader.readAsText(file);
            };
            input.click();
        });
    }
    // Przycisk: wyczyść cache
    if (clearCacheBtn) {
        clearCacheBtn.addEventListener('click', () => {
            // Zachowaj tylko ustawienia, resztę usuń
            const keep = [
                'theme', 'lang', 'animations', 'sounds', 'tray',
                'downloadFolder', 'downloadSpeedLimit', 'autoRunAfterDownload', 'pauseOnSleep',
                'downloadNotifications', 'errorNotifications', 'notificationSound',
                'tileSize', 'defaultSort', 'itemsPerPage', 'showThumbnails',
                'useProxy', 'proxyAddress', 'verifySSL', 'autoDeleteHistoryDays'
            ];
            const toRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && !keep.includes(key)) toRemove.push(key);
            }
            toRemove.forEach(key => localStorage.removeItem(key));
            showToast('🧹 Cache aplikacji wyczyszczony!', 5000, 'success');
        });
    }
    
    // Przycisk: sprawdź aktualizacje aplikacji
    const checkAppUpdatesBtn = document.getElementById('checkAppUpdatesBtn');
    if (checkAppUpdatesBtn) {
        checkAppUpdatesBtn.addEventListener('click', async () => {
            checkAppUpdatesBtn.disabled = true;
            checkAppUpdatesBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sprawdzanie...';
            
            try {
                await checkForAppUpdates();
                showToast('Sprawdzono aktualizacje aplikacji', 3000, 'info');
            } catch (error) {
                console.error('Błąd sprawdzania aktualizacji:', error);
                showToast('Błąd podczas sprawdzania aktualizacji', 3000, 'error');
            } finally {
                setTimeout(() => {
                    checkAppUpdatesBtn.disabled = false;
                    checkAppUpdatesBtn.innerHTML = '<i class="fas fa-download"></i> Sprawdź aktualizacje';
                }, 2000);
            }
        });
    }
    
    // Przycisk: przywróć domyślne
    if (resetSettingsBtn) resetSettingsBtn.addEventListener('click', () => {
        // Usuń wszystkie ustawienia
        localStorage.removeItem('theme');
        localStorage.removeItem('lang');
        localStorage.removeItem('animations');
        localStorage.removeItem('sounds');
        localStorage.removeItem('tray');
        localStorage.removeItem('downloadFolder');
        localStorage.removeItem('downloadSpeedLimit');
        localStorage.removeItem('autoRunAfterDownload');
        localStorage.removeItem('pauseOnSleep');
        localStorage.removeItem('downloadNotifications');
        localStorage.removeItem('errorNotifications');
        localStorage.removeItem('notificationSound');
        localStorage.removeItem('tileSize');
        localStorage.removeItem('defaultSort');
        localStorage.removeItem('itemsPerPage');
        localStorage.removeItem('showThumbnails');
        localStorage.removeItem('useProxy');
        localStorage.removeItem('proxyAddress');
        localStorage.removeItem('verifySSL');
        localStorage.removeItem('autoDeleteHistoryDays');
        
        // Przywróć domyślne wartości w interfejsie
        if (animationsToggle) animationsToggle.checked = true;
        if (soundsToggle) soundsToggle.checked = true;
        if (trayToggle) trayToggle.checked = false;
        if (downloadFolderPath) downloadFolderPath.textContent = 'Nie wybrano';
        if (downloadSpeedLimit) downloadSpeedLimit.value = '';
        if (autoRunAfterDownload) autoRunAfterDownload.checked = false;
        if (pauseOnSleep) pauseOnSleep.checked = true;
        if (downloadNotifications) downloadNotifications.checked = true;
        if (errorNotifications) errorNotifications.checked = true;
        if (notificationSound) notificationSound.checked = true;
        if (tileSizeSelect) tileSizeSelect.value = 'medium';
        if (defaultSortSelect) defaultSortSelect.value = 'name-asc';
        if (itemsPerPage) itemsPerPage.value = '20';
        if (showThumbnails) showThumbnails.checked = true;
        if (useProxy) useProxy.checked = false;
        if (proxyAddress) proxyAddress.value = '';
        if (verifySSL) verifySSL.checked = true;
        if (autoDeleteHistoryDays) autoDeleteHistoryDays.value = '0';
        
        updateProxySettingsVisibility();
        document.body.classList.remove('no-animations');
        document.body.removeAttribute('data-tile-size');
        
        showToast('Przywrócono domyślne ustawienia!', 3000, 'success');
    });
    // Klasa do wyłączania animacji w CSS (opcjonalnie)
    if (animationsToggle && !animationsToggle.checked) document.body.classList.add('no-animations');
    
    // Załaduj ustawienia przy starcie
    loadSettings();
    
    // Zastosuj rozmiar kafelków przy starcie
    if (tileSizeSelect) {
        const savedTileSize = localStorage.getItem('tileSize') || 'medium';
        document.body.setAttribute('data-tile-size', savedTileSize);
    }
    // --- TOAST / SNACKBAR NOTIFICATION ---
    let toastHideTimeout;
    let toastRemoveTimeout;

    function showToast(message, duration = 3000, type = '') {
        const toast = document.getElementById('toast');
        if (!toast) return;

        // Anuluj poprzednie timery, jeśli powiadomienie jest wywoływane szybko po sobie
        clearTimeout(toastHideTimeout);
        clearTimeout(toastRemoveTimeout);

        let iconHtml = '';
        switch (type) {
            case 'success':
                iconHtml = '<i class="fas fa-check-circle"></i>';
                break;
            case 'info':
                iconHtml = '<i class="fas fa-info-circle"></i>';
                break;
            case 'warning':
                iconHtml = '<i class="fas fa-exclamation-triangle"></i>';
                break;
            case 'danger':
                iconHtml = '<i class="fas fa-times-circle"></i>';
                break;
            default:
                iconHtml = '<i class="fas fa-bell"></i>'; // Domyślna ikona
        }

        toast.innerHTML = `${iconHtml} <span>${message}</span>`;
        toast.className = 'toast-message'; // Reset klas

        // Wymuś reflow, aby animacja mogła się ponownie uruchomić
        void toast.offsetWidth;

        toast.classList.add('show', `toast-${type}`);

        toastHideTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    }

    // === AUTO-UPDATER EVENT LISTENERS ===
    if (window.api) {
        // Dostępna aktualizacja
        window.api.onUpdateAvailable((updateInfo) => {
            console.log('Dostępna aktualizacja:', updateInfo);
            showUpdateModal(updateInfo);
        });

        // Postęp pobierania
        window.api.onDownloadProgress((progress) => {
            console.log('Postęp pobierania:', progress.percent + '%');
            updateDownloadProgressBar(progress);
        });

        // Aktualizacja pobrana
        window.api.onUpdateDownloaded((info) => {
            console.log('Aktualizacja pobrana:', info);
            const downloadBtn = document.getElementById('updateDownloadBtn');
            const progressDiv = document.getElementById('updateProgress');
            
            if (downloadBtn) {
                const btnIcon = downloadBtn.querySelector('i');
                const btnText = downloadBtn.querySelector('span');
                if (btnIcon) btnIcon.className = 'fas fa-rocket';
                if (btnText) btnText.textContent = 'Execute & Restart';
                downloadBtn.disabled = false;
                downloadBtn.onclick = () => installAppUpdate();
            }
            
            if (progressDiv) {
                const progressFill = document.getElementById('progressFill');
                const progressText = document.getElementById('progressText');
                if (progressFill) progressFill.style.width = '100%';
                if (progressText) progressText.textContent = 'DOWNLOAD COMPLETE ✅ READY TO INSTALL';
            }
            
            showToast('Aktualizacja pobrana! Kliknij aby zainstalować.', 10000, 'success');
        });

        // Błąd aktualizacji
        if (window.api.onUpdateError) {
            window.api.onUpdateError((error) => {
                console.error('Błąd aktualizacji:', error);
                showToast('Błąd podczas sprawdzania aktualizacji: ' + error.message, 5000, 'error');
            });
        }
    }
    const fileListDiv = document.getElementById('file-list');
    const noFilesMessage = document.getElementById('no-files-message');
    const noResultsMessage = document.getElementById('no-results-message');
    const searchInput = document.getElementById('searchInput'); // Already defined
    const sortSelect = document.getElementById('sortSelect'); // Already defined
    const categorySelect = document.getElementById('categorySelect');
    const loadingIndicator = document.getElementById('loading-indicator');
    const mainContentContainer = document.querySelector('.content-area .container');
    const healthWarning = document.getElementById('healthWarning');

    let activeDownloads = {}; // { infoHash: { fileName, progress, downloadSpeed, uploadSpeed, peers, timeRemaining, downloaded, total, ratio } }

    let filesDirectoryPath = ''; // Będzie ustawiona po pobraniu z głównego procesu
    let allFiles = []; // Przechowuje wszystkie pobrane pliki
    let gamesData = []; // NOWA ZMIENNA: Przechowuje dane o grach z JSONa
    let selectedGameDetails = null; // Przechowuje szczegóły aktualnie wybranej gry
 
    let lastScrollPosition = 0; // Zmienna do przechowywania pozycji przewijania
    // Mapowanie ikon dla gatunków i platform
    const iconMap = {
        // Gatunki
        'Akcja': 'fas fa-gun',
        'RPG': 'fas fa-scroll',
        'Przygodowa': 'fas fa-compass',
        'Strategiczna': 'fas fa-chess-king',
        'Symulacja': 'fas fa-plane',
        'Sportowa': 'fas fa-futbol',
        'Wyścigi': 'fas fa-car-side',
        'Horror': 'fas fa-skull',
        'Muzyczna': 'fas fa-music',
        'VR': 'fas fa-vr-cardboard',
        'Rytmiczna': 'fas fa-compact-disc',
        'Indie': 'fas fa-leaf',
        'Survival': 'fas fa-campground',
        'Sandbox': 'fas fa-cubes',
        'MMORPG': 'fas fa-users',
        'Fantasy': 'fas fa-dragon',
        'Sci-fi': 'fas fa-robot',
        'Logic Games': 'fas fa-brain',
        'Casual': 'fas fa-coffee', // Dodatkowa ikona dla gatunku Casual
        'Edukacyjna': 'fas fa-book', // Dodatkowa ikona dla gatunku Edukacyjna
        'Logiczna': 'fas fa-puzzle-piece', // Dodatkowa ikona dla gatunku Logiczna
        'Puzzle': 'fas fa-puzzle-piece', // Dodatkowa ikona dla gatunku Puzzle

        // Platformy
        'PC': 'fas fa-desktop',
        'PC (VR)': 'fas fa-headset',
        'PlayStation': 'fab fa-playstation',
        'PlayStation VR': 'fab fa-playstation',
        'Xbox': 'fab fa-xbox',
        'Nintendo Switch': 'fas fa-gamepad',
        'Mobile': 'fas fa-mobile-alt',
        'Meta Quest': 'fas fa-vr-cardboard',
        'Android': 'fab fa-android', // Dodatkowa ikona dla platformy Android
        'iOS': 'fab fa-apple', // Dodatkowa ikona dla platformy iOS

        // Domyślna ikona, jeśli nie znaleziono konkretnego mapowania
        'default': 'fas fa-tag'
    };
 
    // Fullscreen Game Details Elements
    const gameDetailsView = document.getElementById('gameDetailsView');
    const gdBackButton = document.getElementById('gdBackButton');
    const sidebarEl = document.querySelector('aside.sidebar');

    let gameDetailsCloseTimer = null;

    const gdTitle = document.getElementById('gdTitle');
    const gdDescription = document.getElementById('gdDescription');
    const gdTrailer = document.getElementById('gdTrailer');
    const gdScreenshots = document.getElementById('gdScreenshots');
    const gdMinRequirements = document.getElementById('gdMinRequirements');
    const gdRecRequirements = document.getElementById('gdRecRequirements');
    const gdDeveloper = document.getElementById('gdDeveloper');
    const gdPublisher = document.getElementById('gdPublisher');
    const gdReleaseDate = document.getElementById('gdReleaseDate');
    const gdGenres = document.getElementById('gdGenres');
    const gdPlatforms = document.getElementById('gdPlatforms');
    const gdDownloadButton = document.getElementById('gdDownloadButton');
    // Nowe pola meta
    const gdAgeRating = document.getElementById('gdAgeRating');
    const gdDRM = document.getElementById('gdDRM');
    const gdAnticheat = document.getElementById('gdAnticheat');
    const gdDLC = document.getElementById('gdDLC');
 
    // === UPLOAD APP MODAL (KREATOR) ===
    // === PRE-RELEASE MODAL ===
    const preReleaseModal = document.getElementById('preReleaseModal');
    const preReleaseOverlay = document.getElementById('preReleaseModalOverlay');
    const preReleaseBackBtn = document.getElementById('preReleaseBackBtn');
    const preReleaseProceedBtn = document.getElementById('preReleaseProceedBtn');
    const preReleaseCountdownText = document.getElementById('preReleaseCountdownText');
    let gameToShowDetails = null; // Zmienna do przechowywania gry do pokazania po kliknięciu "Rozumiem"

    const randomGameBtn = document.getElementById('randomGameBtn');

    if (randomGameBtn) {
        randomGameBtn.addEventListener('click', () => {
            if (gamesData && gamesData.length > 0) {
                // Znajdź odpowiadający plik w `allFiles` na podstawie nazwy gry
                const randomGame = gamesData[Math.floor(Math.random() * gamesData.length)];
                const correspondingFile = allFiles.find(file => cleanGameFileName(file.name) === randomGame.name);

                if (correspondingFile) {
                    showGameDetails(correspondingFile);
                    showToast(`Wylosowano: ${randomGame.name}!`, 3000, 'info');
                } else {
                    showToast('Nie udało się znaleźć pliku dla wylosowanej gry.', 4000, 'warning');
                }
            } else {
                showToast('Biblioteka gier jest pusta lub nie została jeszcze załadowana.', 4000, 'warning');
            }
        });
    }
    const uploadAppModal = document.getElementById('uploadAppModal');
    const uploadAppOverlay = document.getElementById('uploadAppOverlay');
    const uploadAppOpenBtn = document.getElementById('uploadAppOpenBtn');
    const uploadAppCloseBtn = document.getElementById('uploadAppCloseBtn');
    const uploadAppStep1 = document.getElementById('uploadAppStep1');
    const uploadAppStep2 = document.getElementById('uploadAppStep2');
    const uploadAppNextBtn = document.getElementById('uploadAppNextBtn');
    const uploadAppBackBtn = document.getElementById('uploadAppBackBtn');
    const uploadAppSaveBtn = document.getElementById('uploadAppSaveBtn');
    const uploadAppExeInput = document.getElementById('uploadAppExeInput');
    const uploadAppExeDrop = document.getElementById('uploadAppExeDrop');
    const uploadAppExeInfo = document.getElementById('uploadAppExeInfo');
    const uploadAppExeError = document.getElementById('uploadAppExeError');
    const uploadAppIconOptions = document.getElementById('uploadAppIconOptions');
    const uploadAppIconPreview = document.getElementById('uploadAppIconPreview');
    const uploadAppIconError = document.getElementById('uploadAppIconError');
    const uploadAppExtractIconsBtn = document.getElementById('uploadAppExtractIconsBtn');
    const uploadAppCustomIconInput = document.getElementById('uploadAppCustomIconInput');
    const uploadAppNoIconBtn = document.getElementById('uploadAppNoIconBtn');
    const uploadAppProgress = document.getElementById('uploadAppProgress');
 
    let uploadAppState = {
        exe: null, // { path, size, name, sha256, meta }
        icon: null, // { source: 'exe'|'custom'|'none', data: ... }
        iconsFromExe: [], // [{id, nativeImageDataURL, size}]
        selectedExeIconId: null,
        customIcon: null, // { filePath, dataUrl }
        step: 1
    };
 
    // Otwieranie modala uploadu
    if (uploadAppOpenBtn && uploadAppModal && uploadAppOverlay) {
        uploadAppOpenBtn.addEventListener('click', () => {
            resetUploadAppModal();
            // Dodaj animację fade-in
            uploadAppModal.classList.remove('hidden', 'fade-out-upload');
            uploadAppOverlay.classList.remove('hidden', 'fade-out-upload');
            void uploadAppModal.offsetWidth; // force reflow
            uploadAppModal.classList.add('fade-in-upload');
            document.body.classList.add('modal-open');
            uploadAppOverlay.classList.add('fade-in-upload');
        });
    }
    if (uploadAppCloseBtn && uploadAppModal && uploadAppOverlay) {
        uploadAppCloseBtn.addEventListener('click', closeUploadAppModal);
        uploadAppOverlay.addEventListener('click', closeUploadAppModal);
    }
    function closeUploadAppModal() {
        // Dodaj animację fade-out
        uploadAppModal.classList.remove('fade-in-upload');
        uploadAppOverlay.classList.remove('fade-in-upload');
        uploadAppModal.classList.add('fade-out-upload');
        uploadAppOverlay.classList.add('fade-out-upload');
        document.body.classList.remove('modal-open');
        // Po animacji ukryj modal
        setTimeout(() => {
            uploadAppModal.classList.add('hidden');
            uploadAppOverlay.classList.add('hidden');
            uploadAppModal.classList.remove('fade-out-upload');
            uploadAppOverlay.classList.remove('fade-out-upload');
            resetUploadAppModal();
        }, 320);
    }
    function resetUploadAppModal() {
        uploadAppState = { exe: null, icon: null, iconsFromExe: [], selectedExeIconId: null, customIcon: null, step: 1 };
        if (uploadAppExeInfo) uploadAppExeInfo.textContent = '';
        if (uploadAppExeError) uploadAppExeError.textContent = '';
        if (uploadAppIconError) uploadAppIconError.textContent = '';
        if (uploadAppIconPreview) uploadAppIconPreview.innerHTML = '';
        if (uploadAppProgress) uploadAppProgress.value = 0;
        showUploadAppStep(1);
    }
    function showUploadAppStep(step) {
        uploadAppState.step = step;
        if (uploadAppStep1) uploadAppStep1.style.display = step === 1 ? 'block' : 'none';
        if (uploadAppStep2) uploadAppStep2.style.display = step === 2 ? 'block' : 'none';
        if (uploadAppBackBtn) uploadAppBackBtn.style.display = step === 2 ? 'inline-block' : 'none';
        if (uploadAppNextBtn) uploadAppNextBtn.style.display = step === 1 ? 'inline-block' : 'none';
        if (uploadAppSaveBtn) uploadAppSaveBtn.style.display = step === 2 ? 'inline-block' : 'none';
    }
 
    // Krok 1: Wybór .exe
    if (uploadAppExeInput) {
        uploadAppExeInput.addEventListener('change', async (e) => {
            if (e.target.files && e.target.files[0]) {
                await handleExeFile(e.target.files[0].path, e.target.files[0]);
            }
        });
    }
    if (uploadAppExeDrop) {
        uploadAppExeDrop.addEventListener('dragover', e => { e.preventDefault(); uploadAppExeDrop.classList.add('dragover'); });
        uploadAppExeDrop.addEventListener('dragleave', e => { e.preventDefault(); uploadAppExeDrop.classList.remove('dragover'); });
        uploadAppExeDrop.addEventListener('drop', async e => {
            e.preventDefault(); uploadAppExeDrop.classList.remove('dragover');
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                await handleExeFile(e.dataTransfer.files[0].path, e.dataTransfer.files[0]);
            }
        });
    }
    async function handleExeFile(filePath, fileObj) {
        if (!filePath || !fileObj) return;
        if (!filePath.toLowerCase().endsWith('.exe')) {
            if (uploadAppExeError) uploadAppExeError.textContent = 'Dozwolone tylko pliki .exe';
            return;
        }
        if (fileObj.size > 500 * 1024 * 1024) {
            if (uploadAppExeError) uploadAppExeError.textContent = 'Plik przekracza 500 MB';
            return;
        }
        if (uploadAppExeError) uploadAppExeError.textContent = '';
        // Wywołaj hash i meta przez window.api
        let sha256 = '', meta = {};
        try {
            sha256 = await window.api.hashExe(filePath);
        } catch { sha256 = ''; }
        try {
            meta = await window.api.readExeMeta(filePath);
        } catch { meta = {}; }
        uploadAppState.exe = {
            path: filePath,
            size: fileObj.size,
            name: fileObj.name,
            sha256,
            meta
        };
        if (uploadAppExeInfo) {
            uploadAppExeInfo.innerHTML =
                `<b>Nazwa:</b> ${fileObj.name}<br>`+
                `<b>Rozmiar:</b> ${formatBytes(fileObj.size)}<br>`+
                `<b>SHA-256:</b> ${sha256 || 'Nieznany'}<br>`+
                `<b>Wersja:</b> ${meta.fileVersion || '-'}<br>`+
                `<b>Producent:</b> ${meta.companyName || '-'}<br>`;
        }
    }

    // Przycisk "Wybierz plik" (systemowy dialog)
    if (document.getElementById('uploadAppSelectExeBtn')) {
        document.getElementById('uploadAppSelectExeBtn').addEventListener('click', async () => {
            const result = await window.api.selectExe();
            if (result && result.path && result.size) {
                await handleExeFile(result.path, { name: result.path.split(/[/\\]/).pop(), size: result.size });
            }
        });
    }
 
    // Dalej (do kroku 2)
    if (uploadAppNextBtn) {
        uploadAppNextBtn.addEventListener('click', () => {
            if (!uploadAppState.exe) {
                if (uploadAppExeError) uploadAppExeError.textContent = 'Najpierw wybierz plik .exe';
                return;
            }
            showUploadAppStep(2);
        });
    }
    // Wstecz
    if (uploadAppBackBtn) {
        uploadAppBackBtn.addEventListener('click', () => {
            // Animacja powrotu
            const step1 = document.getElementById('uploadAppStep1');
            const step2 = document.getElementById('uploadAppStep2');
            if (step1 && step2) {
                step2.classList.replace('active-step', 'hidden-step');
                step1.classList.replace('hidden-step', 'active-step');
                step1.classList.remove('exit-step'); // Upewnij się, że klasa wyjścia jest usunięta
            }
        });
    }

    // Krok 2: Ikona
    // a) Użyj ikony z .exe (Windows only)
    if (uploadAppExtractIconsBtn) {
        uploadAppExtractIconsBtn.addEventListener('click', async () => {
            if (!uploadAppState.exe) return;
            try {
                const icons = await window.api.extractIcons(uploadAppState.exe.path);
                uploadAppState.iconsFromExe = icons;
                // Pokaż grid wyboru
                if (uploadAppIconOptions) {
                    uploadAppIconOptions.innerHTML = icons.map(icon =>
                        `<label class="icon-option"><input type="radio" name="exeIcon" value="${icon.id}"><img src="${icon.nativeImageDataURL}" width="48" height="48"><span>${icon.size}x${icon.size}</span></label>`
                    ).join('');
                    // Obsługa wyboru
                    uploadAppIconOptions.querySelectorAll('input[type=radio][name=exeIcon]').forEach(radio => {
                        radio.addEventListener('change', (e) => {
                            uploadAppState.selectedExeIconId = e.target.value;
                            uploadAppState.icon = { source: 'exe', data: uploadAppState.iconsFromExe.find(i => i.id == e.target.value) };
                            showIconPreview();
                        });
                    });
                }
            } catch (e) {
                if (uploadAppIconError) uploadAppIconError.textContent = 'Nie udało się wyodrębnić ikon z pliku .exe';
            }
        });
    }
    // b) Wgraj własną ikonę
    if (uploadAppCustomIconInput) {
        uploadAppCustomIconInput.addEventListener('change', async (e) => {
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                const ext = file.name.split('.').pop().toLowerCase();
                if (!['ico', 'png'].includes(ext)) {
                    if (uploadAppIconError) uploadAppIconError.textContent = 'Dozwolone tylko .ico lub .png';
                    return;
                }
                if (ext === 'png') {
                    // Sprawdź rozmiar obrazka (min 256x256)
                    const img = new window.Image();
                    img.onload = async function() {
                        if (img.width < 256 || img.height < 256) {
                            if (uploadAppIconError) uploadAppIconError.textContent = 'PNG musi mieć min. 256x256';
                            return;
                        }
                        // Wyślij do main do konwersji na .ico
                        try {
                            const iconData = await window.api.uploadCustomIcon(file.path);
                            uploadAppState.icon = { source: 'custom', data: iconData };
                            showIconPreview();
                        } catch {
                            if (uploadAppIconError) uploadAppIconError.textContent = 'Błąd konwersji PNG na ICO';
                        }
                    };
                    img.onerror = function() {
                        if (uploadAppIconError) uploadAppIconError.textContent = 'Nieprawidłowy plik PNG';
                    };
                    img.src = URL.createObjectURL(file);
                } else {
                    // .ico – wyślij do main do walidacji
                    try {
                        const iconData = await window.api.uploadCustomIcon(file.path);
                        uploadAppState.icon = { source: 'custom', data: iconData };
                        showIconPreview();
                    } catch {
                        if (uploadAppIconError) uploadAppIconError.textContent = 'Błąd walidacji pliku ICO';
                    }
                }
            }
        });
    }
    // c) Brak ikony
    if (uploadAppNoIconBtn) {
        uploadAppNoIconBtn.addEventListener('click', () => {
            uploadAppState.icon = { source: 'none', data: null };
            showIconPreview();
        });
    }
    function showIconPreview() {
        if (!uploadAppIconPreview) return;
        uploadAppIconPreview.innerHTML = '';
        if (uploadAppState.icon) {
            if (uploadAppState.icon.source === 'exe' && uploadAppState.icon.data) {
                uploadAppIconPreview.innerHTML = `<img src="${uploadAppState.icon.data.nativeImageDataURL}" width="64" height="64">`;
            } else if (uploadAppState.icon.source === 'custom' && uploadAppState.icon.data && uploadAppState.icon.data.dataUrl) {
                uploadAppIconPreview.innerHTML = `<img src="${uploadAppState.icon.data.dataUrl}" width="64" height="64">`;
            } else if (uploadAppState.icon.source === 'none') {
                uploadAppIconPreview.innerHTML = `<div class="icon-placeholder">Brak ikony</div>`;
            }
        }
    }

    // Zapisz
    if (uploadAppSaveBtn) {
        uploadAppSaveBtn.addEventListener('click', async () => {
            if (!uploadAppState.exe) {
                if (uploadAppExeError) uploadAppExeError.textContent = 'Najpierw wybierz plik .exe';
                return;
            }
            if (!uploadAppState.icon) {
                if (uploadAppIconError) uploadAppIconError.textContent = 'Najpierw wybierz ikonę lub pomiń';
                return;
            }
            // Wywołaj saveApp przez window.api
            try {
                if (uploadAppProgress) uploadAppProgress.value = 10;
                const result = await window.api.saveApp({
                    exePath: uploadAppState.exe.path,
                    sha256: uploadAppState.exe.sha256,
                    meta: uploadAppState.exe.meta,
                    iconSource: uploadAppState.icon.source,
                    iconData: uploadAppState.icon.data
                });
                if (uploadAppProgress) uploadAppProgress.value = 100;
                if (result && result.success) {
                    showToast('Aplikacja dodana!', 4000);
                    closeUploadAppModal();
                    // TODO: odśwież listę aplikacji jeśli jest
                } else {
                    showToast('Błąd zapisu aplikacji!', 4000, 'danger');
                }
            } catch (e) {
                showToast('Błąd zapisu aplikacji!', 4000, 'danger');
            }
        });
    }

    // NOWA FUNKCJA: Pomocnicza do czyszczenia nazwy pliku gry
    function cleanGameFileName(fullFileName) {
        // Usuń rozszerzenia takie jak .exe, .torrent, .zip, .rar, .iso, .7z na końcu nazwy pliku.
        // Robimy to dwukrotnie, aby obsłużyć nazwy typu "Gra.torrent.exe".
        let cleanedName = fullFileName.replace(/\.(exe|torrent|zip|rar|iso|7z)$/i, '');
        cleanedName = cleanedName.replace(/\.(torrent|zip|rar|iso|7z)$/i, ''); // Druga runda dla np. "Gra.torrent"

        return cleanedName;
    }

    // Funkcja do pobierania szczegółów gry z JSONa
    function getGameDetails(gameFileName) {
        // Użyj wyczyszczonej nazwy, aby dopasować do klucza "name" w JSON
        const cleanedName = cleanGameFileName(gameFileName);
        return gamesData.find(game => game.name === cleanedName);
    }

    // Pokaż fullscreen ze szczegółami gry
    function showGameDetails(file) {
        // Zapisz aktualną pozycję przewijania okna
        lastScrollPosition = window.scrollY;
        selectedGameDetails = file; // Zapisz wybraną grę

        const details = getGameDetails(file.name);
        const gameName = details ? details.name : cleanGameFileName(file.name);
        updateDiscordPresence(`Ogląda: ${gameName}`, 'W szczegółach gry');


        // NOWY DISCLAIMER: Ukryj domyślnie przy każdym otwarciu
        const gdDisclaimerBox = document.getElementById('gdPreReleaseDisclaimer');
        if (gdDisclaimerBox) gdDisclaimerBox.classList.add('hidden');
        const gdAstroDisclaimerBox = document.getElementById('gdAstroDisclaimer');
        if (gdAstroDisclaimerBox) gdAstroDisclaimerBox.classList.add('hidden');
        const gdHorrorDisclaimerBox = document.getElementById('gdHorrorDisclaimer');
        if (gdHorrorDisclaimerBox) gdHorrorDisclaimerBox.classList.add('hidden');

        const downloadDropdown = gdDownloadButton ? gdDownloadButton.closest('.download-dropdown') : null;
        let isPreRelease = false;

        // Tytuł i opis
        if (gdTitle) {
            const isMadison = details
              ? details.name && details.name.trim().toUpperCase() === 'MADISON'
              : cleanGameFileName(file.name).trim().toUpperCase() === 'MADISON';
            if (isMadison) {
                gdTitle.innerHTML = 'MADiSON <span id="gdBadge" class="game-badge horror-badge"><i class="fas fa-skull"></i> Najstraszniejsza gra 2022 roku</span>';
            } else {
                gdTitle.textContent = details ? details.name : cleanGameFileName(file.name);
            }
        }
        if (gdDescription) gdDescription.textContent = details ? details.description : 'Brak szczegółowego opisu.';

        // Uzupełnij dodatkowe meta (jeśli dostępne w JSON)
        if (gdAgeRating) gdAgeRating.textContent = (details && details.ageRating) ? details.ageRating : '-';
        if (gdDRM) gdDRM.textContent = (details && (details.drm || details.DRM)) ? (details.drm || details.DRM) : '-';
        if (gdAnticheat) gdAnticheat.textContent = (details && (details.anticheat || details.antiCheat || details.AntiCheat)) ? (details.anticheat || details.antiCheat || details.AntiCheat) : '-';
        if (gdDLC) {
            if (details && Array.isArray(details.dlc) && details.dlc.length > 0) {
                // pokaż listę lub licznik, w zależności od długości
                gdDLC.textContent = details.dlc.length <= 5 ? details.dlc.join(', ') : `${details.dlc.length} pozycje`;
            } else if (details && typeof details.dlc === 'string' && details.dlc.trim()) {
                gdDLC.textContent = details.dlc;
            } else {
                gdDLC.textContent = '-';
            }
        }

        // NEW: Horror game warning
        if (details && details.genres && details.genres.some(g => g.toLowerCase().includes('horror'))) {
            const gdHorrorDisclaimerText = document.getElementById('gdHorrorDisclaimerText');
            if (gdHorrorDisclaimerBox && gdHorrorDisclaimerText) {
                gdHorrorDisclaimerText.innerHTML = '<strong>Ostrzeżenie zdrowotne:</strong> Gry z gatunku horror mogą zawierać intensywne, przerażające sceny, które mogą wywoływać silne emocje, takie jak lęk, strach czy niepokój. Nie są zalecane dla osób wrażliwych, z problemami sercowymi, epilepsją lub zaburzeniami lękowymi. Pamiętaj o regularnych przerwach i dbaj o swoje samopoczucie. Jeśli poczujesz się źle, natychmiast przerwij grę.';
                gdHorrorDisclaimerBox.classList.remove('hidden');
                // Dodaj klasę animacji
                gdHorrorDisclaimerBox.classList.add('pulsing-warning');
            }
        }

        // NEW: Astro disclaimer
        if (details && details.astroDisclaimer) {
            const gdAstroDisclaimerText = document.getElementById('gdAstroDisclaimerText');
            if (gdAstroDisclaimerBox && gdAstroDisclaimerText) {
                gdAstroDisclaimerText.innerHTML = details.astroDisclaimer;
                gdAstroDisclaimerBox.classList.remove('hidden');
            }
        }

        // VR badge: pokaż informację gdy gra wymaga gogli VR
        let isVr = false;
        if (details) {
            const nameHasVr = /\bvr\b/i.test(details.name || '');
            const inArr = (arr, needles) => Array.isArray(arr) && arr.some(v => {
                const s = String(v).toLowerCase();
                return needles.some(n => s.includes(n));
            });
            const needles = ['vr', 'virtual reality', 'oculus', 'meta quest', 'vive', 'index'];
            isVr = nameHasVr
                || inArr(details.categories, needles)
                || inArr(details.genres, needles)
                || inArr(details.platforms, needles);
        } else {
            // Gdy nie znaleziono details – spróbuj z nazwy pliku
            isVr = /\bvr\b/i.test(cleanGameFileName(file.name));
        }
        if (gdTitle && gdTitle.parentElement) {
            // usuń poprzedni badge jeśli istnieje
            const prevVr = gdTitle.parentElement.querySelector('.gd-vr-badge');
            if (prevVr) prevVr.remove();
            // usuń poprzednie odznaki sklepów
            gdTitle.parentElement.querySelectorAll('.gd-store-badge').forEach(n => n.remove());
            // usuń poprzednią odznakę premiery
            const prevPreRelease = gdTitle.parentElement.querySelector('.gd-pre-release-badge');
            if (prevPreRelease) prevPreRelease.remove();

            // NOWA LOGIKA: Usuń poprzednią niestandardową odznakę, jeśli istnieje
            const prevCustomBadge = gdTitle.parentElement.querySelector('.gd-custom-badge');
            if (prevCustomBadge) {
                prevCustomBadge.remove();
            }

            if (isVr) {
                const badge = document.createElement('span');
                badge.className = 'gd-vr-badge';
                badge.textContent = 'Wymagane gogle VR';
                gdTitle.parentElement.appendChild(badge);
            }

            // NOWY EMBLEMAT: Sprawdź datę wydania i dodaj odznakę
            if (details && details.releaseDate) {
                // Wyodrębnij datę w formacie YYYY-MM-DD z ciągu znaków
                const dateMatch = details.releaseDate.match(/(\d{4})-(\d{2})-(\d{2})/);
                // Sprawdź, czy data jest w przyszłości, nawet jeśli nie ma dokładnego dnia/miesiąca
                const yearMatch = details.releaseDate.match(/\b(202[5-9]|20[3-9]\d)\b/);

                if (dateMatch && dateMatch.length > 1) {
                    const releaseDate = new Date(dateMatch[0]); // Użyj tylko dopasowanej daty
                    const today = new Date();
                    today.setHours(0, 0, 0, 0); // Porównujemy tylko daty, bez czasu

                    if (!isNaN(releaseDate.getTime()) && releaseDate > today) {
                        isPreRelease = true;
                        const preReleaseBadge = document.createElement('span');
                        preReleaseBadge.className = 'gd-pre-release-badge';
                        preReleaseBadge.innerHTML = `<i class="fas fa-clock"></i> Premiera wkrótce`;
                        gdTitle.parentElement.appendChild(preReleaseBadge);

                        // Pokaż i uzupełnij disclaimer
                        const gdDisclaimerText = document.getElementById('gdDisclaimerText');
                        if (gdDisclaimerBox && gdDisclaimerText) {
                            gdDisclaimerText.textContent = `Uwaga: Ta gra nie miała jeszcze swojej premiery. Planowana data wydania to ${details.releaseDate}.`;
                            gdDisclaimerBox.classList.remove('hidden');
                        }

                        // Pokaż i uzupełnij drugi, czerwony disclaimer
                        const gdAstroDisclaimerText = document.getElementById('gdAstroDisclaimerText');
                        if (gdAstroDisclaimerBox && gdAstroDisclaimerText) {
                            gdAstroDisclaimerText.textContent = `Staramy się udostępnić grę jak najszybciej. Szacowany czas dodania do Astroworld to 2-3 tygodnie od daty premiery, jednak termin ten może ulec wydłużeniu.`;
                            gdAstroDisclaimerBox.classList.remove('hidden');
                            // Zmieniamy klasę, aby zastosować pomarańczowy styl
                            gdAstroDisclaimerBox.className = 'gd-disclaimer-box gd-disclaimer-orange';
                        }
                    }
                } else if (yearMatch) {
                    // Jeśli nie ma pełnej daty, ale jest rok z przyszłości
                    const releaseYear = parseInt(yearMatch[0], 10);
                    const currentYear = new Date().getFullYear();

                    if (releaseYear >= currentYear) {
                        isPreRelease = true;
                        const preReleaseBadge = document.createElement('span');
                        preReleaseBadge.className = 'gd-pre-release-badge';
                        preReleaseBadge.innerHTML = `<i class="fas fa-clock"></i> Premiera wkrótce`;
                        if (gdTitle && gdTitle.parentElement) gdTitle.parentElement.appendChild(preReleaseBadge);

                        const gdDisclaimerText = document.getElementById('gdDisclaimerText');
                        if (gdDisclaimerBox && gdDisclaimerText) {
                            gdDisclaimerText.textContent = `Uwaga: Ta gra nie miała jeszcze swojej premiery. Planowana data wydania to ${details.releaseDate}.`;
                            gdDisclaimerBox.classList.remove('hidden');
                        }
                        // Można też dodać drugi disclaimer, jeśli to potrzebne
                        // ...
                    }
                }
            }

            // Pokaż lub ukryj przycisk pobierania
            if (downloadDropdown) {
                downloadDropdown.classList.toggle('hidden', isPreRelease);
            }



            // Odznaki sklepów (Steam / Epic)
            const displayName = details ? (details.name || cleanGameFileName(file.name)) : cleanGameFileName(file.name);
            const stores = [];
            if (details && details.steamUrl) {
                stores.push({ key: 'steam', label: 'Steam', url: details.steamUrl });
            } else {
                stores.push({ key: 'steam', label: 'Steam', url: `https://store.steampowered.com/search/?term=${encodeURIComponent(displayName)}` });
            }
            if (details && details.epicUrl) {
                stores.push({ key: 'epic', label: 'Epic Games', url: details.epicUrl });
            } else {
                stores.push({ key: 'epic', label: 'Epic Games', url: `https://store.epicgames.com/en-US/browse?q=${encodeURIComponent(displayName)}` });
            }

            // Wstaw odznaki sklepów
            stores.forEach(store => {
                const a = document.createElement('a');
                a.className = `gd-store-badge ${store.key}`;
                a.href = store.url;
                a.target = '_blank';
                a.rel = 'noopener noreferrer';

                let iconHtml = '';
                if (store.key === 'steam') {
                    iconHtml = '<i class="fab fa-steam"></i>';
                } else if (store.key === 'epic') {
                    // Używamy pobranego obrazka .jpg
                    iconHtml = '<img src="assets/epic-logo.jpg" class="store-logo-img" alt="Epic Games Logo">';
                }

                a.innerHTML = `${iconHtml} <span>${store.label}</span>`;

                // Otwieraj w zewnętrznej przeglądarce (Electron)
                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (window.api && typeof window.api.openLink === 'function') {
                        window.api.openLink(store.url);
                    } else {
                        // Fallback dla przeglądarki
                        window.open(store.url, '_blank', 'noopener,noreferrer');
                    }
                });
                gdTitle.parentElement.appendChild(a);
            });
        }

        // Trailer
        if (gdTrailer) gdTrailer.innerHTML = '';
        if (details && details.trailerUrl) {
            const iframe = document.createElement('iframe');
            let videoId = '';

            // Próbujemy wyodrębnić ID wideo z Twojego "specyficznego" formatu
            // Używamy RegEx, aby być bardziej elastycznym, jeśli numer na końcu URL się zmienia.
            const googleusercontentMatch = details.trailerUrl.match(/http:\/\/googleusercontent\.com\/youtube\.com\/(\d+)/);

            if (googleusercontentMatch && googleusercontentMatch[1]) {
                // Jeśli dopasowanie znajdzie liczbę na końcu, użyjemy jej jako ID wideo.
                videoId = googleusercontentMatch[1];
            } else {
                // Alternatywnie, jeśli link jest już standardowym linkiem do osadzenia (z /embed/)
                // lub jeśli jest to zwykły link do wideo (z ?v=)
                const youtubeEmbedMatch = details.trailerUrl.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
                const youtubeWatchMatch = details.trailerUrl.match(/[?&]v=([a-zA-Z0-9_-]+)/);

                if (youtubeEmbedMatch && youtubeEmbedMatch[1]) {
                    videoId = youtubeEmbedMatch[1];
                } else if (youtubeWatchMatch && youtubeWatchMatch[1]) {
                    videoId = youtubeWatchMatch[1];
                } else {
                    // Ostateczny fallback: spróbuj wziąć ostatni segment,
                    // ale jest to bardzo ryzykowne dla nietypowych URLi
                    videoId = details.trailerUrl.split('/').pop();
                }
            }

            if (videoId) {
                // Używamy youtube-nocookie.com, co jest zalecane i masz to w CSP
                iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}`;
                iframe.setAttribute('frameborder', '0');
                iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
                iframe.setAttribute('allowfullscreen', '');
                if (gdTrailer) gdTrailer.appendChild(iframe);
            } else {
                if (gdTrailer) gdTrailer.textContent = 'Brak poprawnego URL-a trailera.';
            }
        } else {
            if (gdTrailer) gdTrailer.textContent = 'Brak trailera.';
        }

        // Zrzuty ekranu
        if (gdScreenshots) gdScreenshots.innerHTML = '';
        if (details && details.screenshots && details.screenshots.length > 0) {
            details.screenshots.forEach(src => {
                const img = document.createElement('img');
                img.src = src;
                img.alt = 'Zrzut ekranu gry';
                img.classList.add('modal-screenshot');
                // Obsługa fallbacków: png, webp, jpg, placeholder
                img.onerror = function fallbackExt() {
                    const exts = ['jpg', 'png', 'webp'];
                    let currentSrc = this.src;
                    let found = false;
                    for (let ext of exts) {
                        if (!currentSrc.endsWith('.' + ext)) {
                            const trySrc = currentSrc.replace(/\.(jpg|png|webp)$/i, '.' + ext);
                            if (trySrc !== currentSrc) {
                                this.onerror = fallbackExt;
                                this.src = trySrc;
                                found = true;
                                break;
                            }
                        }
                    }
                    if (!found) {
                        this.onerror = null;
                        this.src = './covers/placeholder.jpg';
                    }
                };
                if (gdScreenshots) gdScreenshots.appendChild(img);

                // Dodaj obsługę kliknięcia, aby otworzyć lightbox
                img.addEventListener('click', () => {
                    openLightbox(src, 'Zrzut ekranu gry');
                });
            });
        } else {
            if (gdScreenshots) gdScreenshots.textContent = 'Brak zrzutów ekranu.';
        }

        // Wymagania
        if (gdMinRequirements) gdMinRequirements.innerHTML = formatRequirements(details?.minRequirements);
        if (gdRecRequirements) gdRecRequirements.innerHTML = formatRequirements(details?.recRequirements);

        // Pozostałe informacje
        if (gdDeveloper) gdDeveloper.textContent = details && details.developer ? details.developer : 'Brak danych.';
        if (gdPublisher) gdPublisher.textContent = details && details.publisher ? details.publisher : 'Brak danych.';
        if (gdReleaseDate) gdReleaseDate.textContent = details && details.releaseDate ? details.releaseDate : 'Brak danych.';

        // Wyświetl gatunki z ikonami w modalu
        if (gdGenres) gdGenres.innerHTML = '';
        if (details && details.genres && details.genres.length > 0) {
            details.genres.forEach(genre => {
                const iconClass = iconMap[genre] || iconMap['default'];
                const span = document.createElement('span');
                span.classList.add('icon-label');
                span.innerHTML = `<i class="${iconClass}"></i> ${genre}`;
                if (gdGenres) gdGenres.appendChild(span);
            });
        } else {
            if (gdGenres) gdGenres.textContent = 'Brak danych.';
        }

        // Wyświetl platformy z ikonami
        if (gdPlatforms) gdPlatforms.innerHTML = '';
        if (details && details.platforms && details.platforms.length > 0) {
            details.platforms.forEach(platform => {
                const span = document.createElement('span');
                span.classList.add('icon-label');

                let iconHtml = '';
                const lowerCasePlatform = platform.toLowerCase();

                if (lowerCasePlatform.includes('playstation') || lowerCasePlatform.startsWith('ps')) {
                    iconHtml = `<img src="assets/ps-logo.svg" class="platform-logo-img" alt="PlayStation">`;
                } else if (platform.toLowerCase().includes('xbox')) {
                    iconHtml = `<img src="assets/xbox-logo.svg" class="platform-logo-img" alt="Xbox">`;
                } else if (lowerCasePlatform.includes('pc')) {
                    iconHtml = `<img src="assets/pc-logo.svg" class="platform-logo-img" alt="PC">`;
                } else if (lowerCasePlatform.includes('switch')) {
                    iconHtml = `<img src="assets/switch-logo.svg" class="platform-logo-img" alt="Nintendo Switch">`;
                } else if (lowerCasePlatform.includes('vr') || lowerCasePlatform.includes('quest') || lowerCasePlatform.includes('headset')) {
                    iconHtml = `<img src="assets/vr-logo.svg" class="platform-logo-img" alt="VR">`;
                } else {
                    const iconClass = iconMap[platform] || iconMap['default'];
                    iconHtml = `<i class="${iconClass}"></i>`;
                }

                span.innerHTML = `${iconHtml} ${platform}`;
                if (gdPlatforms) gdPlatforms.appendChild(span);
            });
        } else {
            if (gdPlatforms) gdPlatforms.textContent = 'Brak danych.';
        }

        // --- NOWA LOGIKA PRZYCISKU POBIERANIA (DROPDOWN) ---
        const gdDownloadMenu = document.getElementById('gdDownloadMenu');
        const gdWebTorrentDownloadBtn = document.getElementById('gdWebTorrentDownloadBtn');
        const gdTorrentFileDownloadBtn = document.getElementById('gdTorrentFileDownloadBtn');

        if (gdDownloadButton) {
            // Pokaż/ukryj menu
            gdDownloadButton.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                gdDownloadMenu.classList.toggle('hidden');
            };
        }

        // Handler dla "Pobierz w Astroworld"
        if (gdWebTorrentDownloadBtn) {
            gdWebTorrentDownloadBtn.onclick = async (e) => {
                e.preventDefault();
                e.stopPropagation();
                gdDownloadMenu.classList.add('hidden');
                await handleWebTorrentDownload(file);
            };
        }

        // Handler dla "Pobierz plik .torrent"
        if (gdTorrentFileDownloadBtn) {
            // Sprawdź, czy opcja powinna być widoczna
            if (details && details.torrentFile) {
                gdTorrentFileDownloadBtn.style.display = 'flex';
                gdTorrentFileDownloadBtn.onclick = async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    gdDownloadMenu.classList.add('hidden');
                    await handleTorrentFileDownload(file);
                };
            } else {
                // Jeśli gra nie ma pliku .torrent, ukryj tę opcję
                gdTorrentFileDownloadBtn.style.display = 'none';
            }
        }

        // Zamykanie menu po kliknięciu poza nim
        const closeDropdown = (e) => {
            if (!gdDownloadButton.contains(e.target) && !gdDownloadMenu.contains(e.target)) {
                gdDownloadMenu.classList.add('hidden');
                window.removeEventListener('click', closeDropdown);
            }
        };
        
        gdDownloadButton.addEventListener('click', (e) => {
            if (!gdDownloadMenu.classList.contains('hidden')) {
                // Jeśli menu jest otwarte, dodaj listener do zamykania
                setTimeout(() => window.addEventListener('click', closeDropdown), 0);
            } else {
                // Jeśli menu jest zamknięte, usuń listener
                window.removeEventListener('click', closeDropdown);
            }
        });
        // --- KONIEC NOWEJ LOGIKI ---

        if (gdDownloadButton) {
            // Sprawdź, czy dla tej gry jest aktywne pobieranie i zaktualizuj pasek postępu
            const progressContainer = document.getElementById('gdProgressContainer');
            const progressFill = document.getElementById('gdProgressFill');
            const progressPercent = document.getElementById('gdProgressPercent');
            const detailsSpeed = document.getElementById('gdDownloadSpeed');
            const detailsUploadSpeed = document.getElementById('gdUploadSpeed');
            const detailsPeers = document.getElementById('gdPeers');
            const detailsTime = document.getElementById('gdTimeRemaining');
            const detailsDownloaded = document.getElementById('gdDownloaded');
            const detailsRatio = document.getElementById('gdRatio');

            const activeDownload = Object.values(activeDownloads).find(d => d.fileName === file.name);

            if (activeDownload && progressContainer && progressFill && progressPercent) {
                progressContainer.classList.remove('hidden', 'completed', 'error');
                progressFill.style.width = `${activeDownload.progress}%`;
                progressPercent.textContent = `${activeDownload.progress}%`;
                if (detailsSpeed) detailsSpeed.innerHTML = `<i class="fas fa-arrow-down"></i> ${formatBytes(activeDownload.downloadSpeed)}/s`;
                if (detailsUploadSpeed) detailsUploadSpeed.innerHTML = `<i class="fas fa-arrow-up"></i> ${formatBytes(activeDownload.uploadSpeed)}/s`;
                if (detailsPeers) detailsPeers.innerHTML = `<i class="fas fa-users"></i> Peerów: ${activeDownload.peers}`;
                if (detailsTime) detailsTime.innerHTML = `<i class="fas fa-clock"></i> ${formatTime(activeDownload.timeRemaining)}`;
                if (detailsDownloaded) detailsDownloaded.innerHTML = `<i class="fas fa-hdd"></i> ${formatBytes(activeDownload.downloaded)} / ${formatBytes(activeDownload.total)}`;
                if (detailsRatio) detailsRatio.innerHTML = `<i class="fas fa-exchange-alt"></i> ${activeDownload.ratio.toFixed(2)}`;
            } else if (progressContainer) {
                progressContainer.classList.add('hidden');
            };
        }

        // Pokaż fullscreen i ukryj sidebar + główną zawartość (ale nie ukrywaj całego kontenera, bo zawiera #gameDetailsView)
        if (sidebarEl) sidebarEl.classList.add('hidden');
        if (mainContentContainer) {
            // Ukryj wszystkie dzieci kontenera poza #gameDetailsView
            Array.from(mainContentContainer.children).forEach(child => {
                if (child !== gameDetailsView) child.classList.add('hidden');
            });
        }
        if (gameDetailsCloseTimer) {
            clearTimeout(gameDetailsCloseTimer);
            gameDetailsCloseTimer = null;
        }
        if (gameDetailsView) {
            gameDetailsView.classList.remove('hidden', 'fade-in', 'is-closing');
            gameDetailsView.classList.remove('is-open');
            requestAnimationFrame(() => {
                if (gameDetailsView) gameDetailsView.classList.add('is-open');
            });
        }
        document.body.classList.add('modal-open');

        
    }

    // Ukryj fullscreen widok gry
    function hideGameDetailsView() {
        if (gameDetailsCloseTimer) {
            clearTimeout(gameDetailsCloseTimer);
            gameDetailsCloseTimer = null;
        }

        if (gameDetailsView) {
            gameDetailsView.classList.remove('fade-in', 'is-open', 'is-closing');
            gameDetailsView.classList.add('hidden');
        }

        if (gdTrailer) gdTrailer.innerHTML = '';
        document.body.classList.remove('modal-open');
        if (sidebarEl) sidebarEl.classList.remove('hidden');
        const mainContent = document.getElementById('mainContentContainer');
        if (mainContent) showSection(mainContent);
    }

    // Back button handler
    if (gdBackButton) {
        gdBackButton.addEventListener('click', (e) => {
            e.preventDefault();
            hideGameDetailsView();
        });
    }
    
    // Funkcja do ukrywania wszystkich głównych sekcji treści i pokazywania wybranej
    function showSection(sectionToShow) {
        // Znajdź wszystkie sekcje, które mają być przełączane
        const sections = document.querySelectorAll('.page-section');
        const mainContent = document.getElementById('mainContentContainer'); // Nowy kontener

        // Ukryj wszystkie sekcje z animacją
        sections.forEach(sec => {
            if (sec && sec !== sectionToShow) {
                sec.classList.remove('fade-in');
                sec.classList.add('fade-out');
                setTimeout(() => {
                    sec.classList.add('hidden');
                    sec.classList.remove('fade-out');
                }, 450); // czas = czas animacji fadeOutSection
            }
        });
        // Pokaż wybraną sekcję z animacją
        setTimeout(() => {
            sectionToShow.classList.remove('hidden', 'fade-out');
            sectionToShow.classList.add('fade-in');
        }, 50); // Małe opóźnienie dla płynności
        // Zablokuj/odblokuj przewijanie tła
        if (sectionToShow.classList.contains('settings-fullscreen')) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }

        // Update Discord Presence
        switch (sectionToShow) {
            case mainContent:
                updateDiscordPresence('W menu głównym', 'Przegląda bibliotekę');
                break;
            case aboutProgramPage:
                updateDiscordPresence('Czyta o programie', 'W sekcji "O Programie"');
                break;
            case settingsProgramPage:
                updateDiscordPresence('Zmienia ustawienia', 'W sekcji "Ustawienia"');
                break;
            case logoutMessage:
                updateDiscordPresence('Wylogowany');
                break;
        }


    // (Usunięto kod obsługi fallback UI optymalizatora)

        // Usuń klasę 'active' ze wszystkich linków w sidebarze
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.classList.remove('active');
        });

        // Dodaj klasę 'active' do odpowiedniego linku w sidebarze
        if (sectionToShow === mainContent) {
            const homeLink = document.getElementById('homeLink');
            if (homeLink) homeLink.classList.add('active');
        } else if (sectionToShow === aboutProgramPage) {
            const aboutLink = document.getElementById('aboutProgramLink');
            if (aboutLink) aboutLink.classList.add('active');
        } else if (sectionToShow === settingsProgramPage) {
            const settingsLink = document.getElementById('settingsProgramLink');
            if (settingsLink) settingsLink.classList.add('active');
        } else if (sectionToShow === document.getElementById('aboutProgramPage')) {
            const helpLink = document.getElementById('helpPageLink');
            if (helpLink) helpLink.classList.add('active');
        }
    }
    const mainContent = document.getElementById('mainContentContainer');

    // --- DARK/LIGHT MODE & LANGUAGE SWITCHER ---

    // Prosta funkcja do tłumaczeń
    function t(key) {
        // Sprawdź czy mamy dostęp do API tłumaczeń
        if (window.api && typeof window.api.t === 'function') {
            return window.api.t(key);
        }
        
        // Domyślne tłumaczenia (jeśli API nie jest dostępne)
        const translations = {
            'common.appTitle': 'Prywatny Serwer Plików',
            'common.save': 'Zapisz',
            'common.cancel': 'Anuluj',
            'common.loading': 'Ładowanie...'
            // Dodaj więcej tłumaczeń według potrzeb
        };
        
        return translations[key] || key;
    }

    // Elementy ustawień
    const themeToggle = document.getElementById('themeToggle');
    
    // Funkcja do aktualizacji stanu przycisków językowych
    function updateLanguageButtons(lang) {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            if (btn.getAttribute('data-lang') === lang) {
                btn.classList.add('active');
                btn.style.opacity = '1';
            } else {
                btn.classList.remove('active');
                btn.style.opacity = '0.6';
            }
        });
    }

    // Inicjalizacja tłumaczeń
    document.addEventListener('DOMContentLoaded', () => {
        // Ustaw domyślny język
        const savedLang = localStorage.getItem('userLanguage') || 'pl';
        updateLanguageButtons(savedLang);
        
        // Zastosuj tłumaczenia dla elementów z atrybutem data-i18n
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (key) {
                if (element.tagName === 'INPUT' && element.type === 'placeholder') {
                    element.placeholder = t(key);
                } else {
                    element.textContent = t(key);
                }
            }
        });
        
        // Obsługa kliknięcia przycisków językowych
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.getAttribute('data-lang');
                updateLanguageButtons(lang);
            });
        });
    });
    
    // Nasłuchiwanie zmiany języka
    window.addEventListener('languageChanged', () => {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (key) {
                if (element.tagName === 'INPUT' && element.type === 'placeholder') {
                    element.placeholder = t(key);
                } else {
                    element.textContent = t(key);
                }
            }
        });
    });
    const languageSelect = document.getElementById('languageSelect');

    // Ustaw domyślny motyw na ciemny jeśli nie ma nic w localStorage
    if (!localStorage.getItem('theme')) {
        document.documentElement.setAttribute('data-theme', 'dark');
        if (themeToggle) themeToggle.checked = true;
    }

    // Tryb jasny/ciemny
    if (themeToggle) {
        // Sprawdź preferencje zapisane w localStorage
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
            themeToggle.checked = savedTheme === 'dark';
        }
        themeToggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
            } else {
                document.documentElement.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
            }
        });
    }

    // Translation system
    let currentLanguage = 'en';
    let translations = {};
    const supportedLanguages = [
        { code: 'en', name: 'English' },
        { code: 'pl', name: 'Polski' },
        { code: 'de', name: 'Deutsch' },
        { code: 'fr', name: 'Français' },
        { code: 'es', name: 'Español' },
        { code: 'ru', name: 'Русский' },
        { code: 'uk', name: 'Українська' },
        { code: 'ko', name: '한국어' },
        { code: 'ja', name: '日本語' },
        { code: 'tr', name: 'Türkçe' },
        { code: 'zh-CN', name: '简体中文' }
    ];

    // Load translations for a specific language
    async function loadTranslations(lang) {
        console.log(`Attempting to load translations for: ${lang}`);
        
        try {
            // Try to import the JSON file directly
            const modulePath = `./locales/${lang}.json`;
            console.log(`Importing translations from: ${modulePath}`);
            
            // Dynamic import of JSON file
            const response = await fetch(modulePath);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const translations = await response.json();
            console.log(`Successfully loaded translations for ${lang}`);
            return translations;
            
        } catch (error) {
            console.error(`Error loading translations for ${lang}:`, error);
            
            // Fallback to English if current language is not English
            if (lang !== 'en') {
                console.log('Falling back to English...');
                return await loadTranslations('en');
            }
            
            // If English also fails, return empty translations
            console.warn('Could not load any translations');
            return {};
        }
    }

    // Set the application language
    async function setLanguage(lang) {
        try {
            console.log(`Setting language to: ${lang}`);
            
            if (!supportedLanguages.some(l => l.code === lang)) {
                console.warn(`Language ${lang} is not supported, falling back to English`);
                lang = 'en';
            }
            
            currentLanguage = lang;
            translations = await loadTranslations(lang);
            console.log('Loaded translations:', translations);
            
            // Save language preference
            localStorage.setItem('lang', lang);
            
            // Update the language selector
            const languageSelect = document.getElementById('languageSelect');
            if (languageSelect) {
                languageSelect.value = lang;
            }
            
            // Update document language attribute
            document.documentElement.lang = lang;
            
            // Update all translatable elements
            updateUITranslations();
            
            // Force refresh any dynamic content if needed
            if (typeof renderContent === 'function') {
                renderContent();
            }
            
            console.log(`Language set to: ${lang}`);
        } catch (error) {
            console.error('Error in setLanguage:', error);
        }
    }
    
    // Update UI elements with translations
    function updateUITranslations() {
        const t = translations;
        if (!t) {
            console.warn('No translations loaded');
            return;
        }
        
        console.log('Updating UI translations');
        
        // Common elements
        const elements = {
            // App title and headers
            'title': { selector: 'title', text: true },
            'h1.astroworld-fancy': { text: true },
            
            // Sidebar
            'homeLink': { html: true, prefix: '<i class="fas fa-home"></i> ' },
            'aboutProgramLink': { html: true, prefix: '<i class="fas fa-info-circle"></i> ' },
            'settingsProgramLink': { html: true, prefix: '<i class="fas fa-cogs"></i> ' },
            '#searchInput': { attr: 'placeholder' },
            
            // Buttons and controls
            '.download-button': { html: true, prefix: '<i class="fas fa-download"></i> ' },
            '.details-button': { html: true, prefix: '<i class="fas fa-info-circle"></i> ' },
            '#refreshBtn': { text: true },
            
            // Settings
            '#darkModeLabel': { text: true },
            '#animationsLabel': { text: true },
            '#notificationsLabel': { text: true },
            '#clearCacheBtn': { text: true },
            '#resetSettingsBtn': { text: true },
            
            // Categories and filters
            '#categorySelect option[value="all"]': { text: true },
            
            // Page sections
            '#aboutProgramPage h2': { text: true },
            '#settingsProgramPage h2': { text: true },
            
            // Common text
            '.app-title': { text: true },
            '.app-subtitle': { text: true },
            
            // Settings sections
            '.settings-section h3': { text: true },
            '.settings-option label': { text: true },
            
            // Modal buttons
            '.modal .btn-close': { text: true },
            '.modal .btn-save': { text: true },
            '.modal .btn-cancel': { text: true }
        };
        
        // Update each element
        Object.entries(elements).forEach(([selector, config]) => {
            const elements = document.querySelectorAll(selector);
            if (!elements.length) return;
            
            const key = selector.startsWith('.') || selector.startsWith('#') 
                ? selector.replace(/^[.#]/, '').replace(/([A-Z])/g, (m) => `_${m.toLowerCase()}`)
                : selector.replace(/([A-Z])/g, (m) => `_${m.toLowerCase()}`);
                
            const translation = getNestedTranslation(t, key) || key;
            
            elements.forEach(element => {
                if (config.text) {
                    element.textContent = translation;
                } else if (config.html) {
                    element.innerHTML = (config.prefix || '') + translation;
                } else if (config.attr) {
                    element.setAttribute(config.attr, translation);
                }
            });
        });
        
        // Update data-i18n attributes
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const keys = element.getAttribute('data-i18n').split('.');
            let translation = t;
            
            for (const key of keys) {
                if (translation && translation[key]) {
                    translation = translation[key];
                } else {
                    translation = keys.join('.');
                    break;
                }
            }
            
            if (translation && typeof translation === 'string') {
                if (element.tagName === 'INPUT' && element.type === 'text' || 
                    element.tagName === 'INPUT' && element.type === 'search' ||
                    element.tagName === 'TEXTAREA') {
                    element.placeholder = translation;
                } else if (element.tagName === 'INPUT' && element.type === 'submit' ||
                          element.tagName === 'BUTTON') {
                    element.textContent = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });
        
        // Update title if it has data-i18n attribute
        const title = document.querySelector('title');
        if (title && title.hasAttribute('data-i18n')) {
            const titleKey = title.getAttribute('data-i18n');
            const titleTranslation = getNestedTranslation(t, titleKey);
            if (titleTranslation) {
                document.title = titleTranslation;
            }
        }
    }
    
    // Helper function to get nested translation
    function getNestedTranslation(obj, path) {
        return path.split('.').reduce((o, p) => o && o[p], obj);
    }
    
    // Initialize language system
    async function initLanguage() {
        console.log('=== INITIALIZING LANGUAGE SYSTEM ===');
        console.log('Supported languages:', supportedLanguages);
        
        // Check for saved language preference
        const savedLang = localStorage.getItem('lang');
        console.log('Saved language from localStorage:', savedLang);
        
        const browserLang = navigator.language.split('-')[0];
        console.log('Browser language:', browserLang);
        
        const defaultLang = supportedLanguages.some(lang => lang.code === browserLang) 
            ? browserLang 
            : 'en';
            
        console.log('Default language to use:', defaultLang);
        console.log('Calling setLanguage with:', savedLang || defaultLang);
            
        await setLanguage(savedLang || defaultLang);
        console.log('=== LANGUAGE SYSTEM INITIALIZED ===');
        
        // Populate language selector
        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            // Clear existing options
            languageSelect.innerHTML = '';
            
            // Add supported languages
            supportedLanguages.forEach(lang => {
                const option = document.createElement('option');
                option.value = lang.code;
                option.textContent = lang.name;
                if (lang.code === currentLanguage) {
                    option.selected = true;
                }
                languageSelect.appendChild(option);
            });
            
            // Add event listener for language change
            languageSelect.addEventListener('change', (e) => {
                setLanguage(e.target.value);
            });
        }
    }
    
    // Initialize language when DOM is fully loaded
    document.addEventListener('DOMContentLoaded', () => {
        initLanguage();
    });

    let genreChartInstance = null;

    // --- Library Stats Logic ---
    async function calculateAndDisplayLibraryStats() {
        const statsList = document.getElementById('libraryStatsList');
        if (!statsList) return;

        // Ensure data is loaded
        if (allFiles.length === 0 || gamesData.length === 0) {
            statsList.innerHTML = '<li><i class="fas fa-info-circle"></i> Brak danych do wygenerowania statystyk. Odśwież listę gier.</li>';
            return;
        }

        // 1. Total number of games
        const totalGames = allFiles.length;

        // 2. Total size of all files
        const totalSize = gamesData.reduce((sum, game) => {
            // Użyj zalecanych wymagań, a jeśli ich nie ma, to minimalnych
            const requirementsString = game.recRequirements || game.minRequirements;
            if (requirementsString) {
                return sum + parseSizeToBytes(requirementsString);
            }
            return sum;
        }, 0);
        const formattedTotalSize = formatBytes(totalSize);

        // 3. Number of unique genres
        const allGenres = gamesData.flatMap(game => game.genres || []);
        const uniqueGenresCount = new Set(allGenres).size;

        // 4. Most common genre
        const genreCounts = allGenres.reduce((acc, genre) => {
            acc[genre] = (acc[genre] || 0) + 1;
            return acc;
        }, {});
        const mostCommonGenre = Object.keys(genreCounts).length > 0 ? Object.keys(genreCounts).reduce((a, b) => genreCounts[a] > genreCounts[b] ? a : b) : 'Brak';

        // 5. Number of favorited games
        const favoriteCount = getFavorites().length;

        // Display stats
        statsList.innerHTML = `
            <li><i class="fas fa-gamepad"></i> Łączna liczba gier: <span class="stat-value">${totalGames}</span></li>
            <li><i class="fas fa-hdd"></i> Całkowity rozmiar biblioteki: <span class="stat-value">${formattedTotalSize}</span></li>
            <li><i class="fas fa-tags"></i> Liczba unikalnych gatunków: <span class="stat-value">${uniqueGenresCount}</span></li>
            <li><i class="fas fa-fire"></i> Najpopularniejszy gatunek: <span class="stat-value">${mostCommonGenre}</span></li>
            <li><i class="fas fa-star"></i> Oznaczone jako ulubione: <span class="stat-value">${favoriteCount}</span></li>
        `;

        // Oznacz, że statystyki zostały obliczone, aby uniknąć ponownego liczenia
        statsList.setAttribute('data-calculated', 'true');

        // --- NOWA LOGIKA WYKRESU ---
        const chartCanvas = document.getElementById('genreChart');
        if (!chartCanvas || typeof Chart === 'undefined') return;

        // Destroy previous chart instance if it exists
        if (genreChartInstance) {
            genreChartInstance.destroy();
        }

        // Sort genres by count and take top N (e.g., top 8 + "Other")
        const sortedGenres = Object.entries(genreCounts).sort(([,a],[,b]) => b-a);
        const topN = 8;
        const chartLabels = sortedGenres.slice(0, topN).map(entry => entry[0]);
        const chartData = sortedGenres.slice(0, topN).map(entry => entry[1]);

        if (sortedGenres.length > topN) {
            const otherCount = sortedGenres.slice(topN).reduce((sum, [,count]) => sum + count, 0);
            chartLabels.push('Inne');
            chartData.push(otherCount);
        }

        // Nowa, bardziej żywa paleta kolorów
        const astroworldPalette = [
            '#ff3b3b', '#00cfff', '#a259ff', '#ffc107', '#28a745',
            '#fd7e14', '#6f42c1', '#20c997', '#e83e8c', '#6c757d'
        ];
        const chartColors = astroworldPalette.slice(0, chartLabels.length);
        const chartBorderColors = '#1a1a2e'; // Ciemna ramka dla segmentów

        // Create the chart
        genreChartInstance = new Chart(chartCanvas, {
            type: 'doughnut',
            data: {
                labels: chartLabels,
                datasets: [{
                    label: 'Liczba gier',
                    data: chartData,
                    backgroundColor: chartColors,
                    borderColor: chartBorderColors, // Ciemna ramka
                    borderWidth: 3,
                    hoverOffset: 12,
                    hoverBorderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%', // Grubość "pączka"
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#e0e0e0',
                            font: { family: "'Montserrat', sans-serif", size: 13, weight: '600' },
                            padding: 15,
                            boxWidth: 15,
                            usePointStyle: true,
                            pointStyle: 'rectRounded'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Podział gier według gatunku',
                        color: '#fff',
                        font: { size: 16, weight: 'bold', family: "'Montserrat', sans-serif" },
                        padding: { top: 10, bottom: 20 }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(10, 10, 20, 0.9)',
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 12 },
                        padding: 10,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed !== null) {
                                    label += `${context.parsed} gier (${(context.parsed / chartData.reduce((a, b) => a + b, 0) * 100).toFixed(1)}%)`;
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }

    // Dodaj obsługę kliknięcia linku "O Programie"
    if (aboutProgramLink) {
        aboutProgramLink.addEventListener('click', (event) => {
            event.preventDefault();
            showSection(aboutProgramPage);
            aboutProgramLink.classList.add('active');
            // Oblicz statystyki tylko jeśli nie zostały jeszcze obliczone
            if (!document.getElementById('libraryStatsList').hasAttribute('data-calculated')) {
                calculateAndDisplayLibraryStats();
            }
            calculateAndDisplayLibraryStats();
        });
    }

    // Funkcja pomocnicza do parsowania rozmiaru z tekstu (np. "45 GB") na bajty
    function parseSizeToBytes(sizeString) {
        if (!sizeString || typeof sizeString !== 'string') return 0;

        // Szukamy wzorca "Storage: [liczba] [jednostka]"
        const match = sizeString.match(/Storage:\s*(\d+(\.\d+)?)\s*(GB|MB|TB)/i);
        if (!match) return 0;

        const value = parseFloat(match[1]);
        const unit = match[3].toUpperCase();

        switch (unit) {
            case 'TB':
                return value * 1024 * 1024 * 1024 * 1024;
            case 'GB':
                return value * 1024 * 1024 * 1024;
            case 'MB':
                return value * 1024 * 1024;
            default:
                return 0;
        }
    }

    // --- System Info Card Logic ---
    const systemInfoList = document.getElementById('systemInfoList');
    const copySystemInfoBtn = document.getElementById('copySystemInfoBtn');
    let systemInfoText = ''; // Zmienna do przechowywania tekstu do skopiowania

    async function loadSystemInfo() {
        if (!systemInfoList || !systemInfoList.querySelector('.fa-spinner')) return; // Nie ładuj ponownie, jeśli już załadowano

        try {
            const info = await window.api.getSystemInfo();
            systemInfoList.innerHTML = `
                <li><i class="fas fa-desktop"></i> <strong>System:</strong> ${info.platform} ${info.arch}</li>
                <li><i class="fas fa-microchip"></i> <strong>Wersja OS:</strong> ${info.release}</li>
                <li><i class="fas fa-memory"></i> <strong>Pamięć RAM:</strong> ${info.totalMem}</li>
                <li><i class="fas fa-cogs"></i> <strong>Rdzenie CPU:</strong> ${info.cpuCores}</li>
            `;
            // Przygotuj tekst do skopiowania
            systemInfoText = `
System: ${info.platform} ${info.arch}
Wersja OS: ${info.release}
Pamięć RAM: ${info.totalMem}
Rdzenie CPU: ${info.cpuCores}
Wersja aplikacji: 1.0.0
            `.trim();
        } catch (error) {
            console.error('Błąd podczas ładowania informacji o systemie:', error);
            systemInfoList.innerHTML = '<li><i class="fas fa-exclamation-circle"></i> Nie udało się załadować informacji.</li>';
            systemInfoText = 'Nie udało się załadować informacji o systemie.';
        }
    }

    if (copySystemInfoBtn) {
        copySystemInfoBtn.addEventListener('click', () => {
            if (systemInfoText) window.api.copyToClipboard(systemInfoText).then(() => showToast('Informacje skopiowane do schowka!'));
        });
    }


    // Dodaj obsługę kliknięcia linku "Ustawienia"
    if (settingsProgramLink && settingsProgramPage) {
        settingsProgramLink.addEventListener('click', (event) => {
            event.preventDefault();
            showSection(settingsProgramPage); // Użyj nowej funkcji showSection
            settingsProgramLink.classList.add('active');
        });
    }
    // Dodaj obsługę kliknięcia linku "Strona Główna"
    if (homeLink) {
        homeLink.addEventListener('click', (event) => {
            event.preventDefault();
            showSection(mainContent); // Użyj nowej funkcji showSection
            homeLink.classList.add('active');
        });
    }

    // Dodaj obsługę kliknięcia linku "Kalendarz Premier"
    const calendarLink = document.getElementById('calendarLink');
    const calendarPage = document.getElementById('calendarPage');
    if (calendarLink && calendarPage) {
        calendarLink.addEventListener('click', (event) => {
            event.preventDefault();
            showSection(calendarPage);
            loadCalendarData();
            updateDiscordPresence('Przegląda kalendarz premier', 'Sprawdza nadchodzące gry');
        });
    }

    // Dodaj obsługę kliknięcia linku "Pomoc" jako osobne okno (jak O Programie)
    const helpPageLink = document.getElementById('helpPageLink');
    const helpPage = document.getElementById('helpPage');
    if (helpPageLink && helpPage) {
        helpPageLink.addEventListener('click', (event) => {
            event.preventDefault();
            showSection(helpPage);
            helpPageLink.classList.add('active');
        });
    }


    // Upewnij się, że domyślnie po załadowaniu strony widoczny jest główny kontener (lista plików)
    showSection(mainContent);
    if (homeLink) {
        homeLink.classList.add('active');
    }

    // Funkcja do tworzenia elementu pliku na liście








    // ...existing code...
    // --- ULUBIONE ---
    function getFavorites() {
        try {
            return JSON.parse(localStorage.getItem('favorites') || '[]');
        } catch { return []; }
    }
    function setFavorites(favs) {
        localStorage.setItem('favorites', JSON.stringify(favs));
    }
    function isFavorite(fileName) {
        return getFavorites().includes(fileName);
    }
    function toggleFavorite(fileName) {
        let favs = getFavorites();
        if (favs.includes(fileName)) {
            favs = favs.filter(f => f !== fileName);
        } else {
            favs.push(fileName);
        }
        setFavorites(favs);
    }

    // Nowa funkcja do obsługi kliknięcia w grę
    function handleGameClick(file) {
        const gameDetails = getGameDetails(file.name);
        if (gameDetails && gameDetails.releaseDate) {
            const releaseDate = new Date(gameDetails.releaseDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Porównujemy tylko daty

            if (releaseDate > today) {
                gameToShowDetails = file; // Zapisz grę, którą chcemy pokazać
                preReleaseModal.classList.remove('hidden');
                preReleaseOverlay.classList.remove('hidden');
                document.body.classList.add('modal-open');

                // Uruchom licznik w modalu
                if (preReleaseCountdownText) {
                    const updateCountdown = () => {
                        const now = new Date().getTime();
                        const distance = releaseDate.getTime() - now;

                        if (distance < 0) {
                            preReleaseCountdownText.textContent = "Premiera już była!";
                            return;
                        }

                        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                        preReleaseCountdownText.textContent = `${days}d ${hours}g ${minutes}m ${seconds}s`;
                    };
                    updateCountdown();
                    setInterval(updateCountdown, 1000);
                }
                return;
            }
        }
        // Jeśli data nie jest w przyszłości, od razu pokaż szczegóły
        showGameDetails(file);
    }

    // Obsługa przycisków modala premiery
    if (preReleaseModal) {
        const closePreReleaseModal = () => {
            preReleaseModal.classList.add('closing');
            preReleaseOverlay.classList.add('fade-out'); // Używamy istniejącej animacji dla tła

            setTimeout(() => {
                preReleaseModal.classList.add('hidden');
                preReleaseOverlay.classList.add('hidden');
                document.body.classList.remove('modal-open');

                // Sprzątanie klas po animacji
                preReleaseModal.classList.remove('closing');
                preReleaseOverlay.classList.remove('fade-out');

                gameToShowDetails = null; // Resetuj
            }, 300); // Czas musi pasować do długości animacji w CSS
        };

        preReleaseBackBtn.addEventListener('click', closePreReleaseModal);
        preReleaseOverlay.addEventListener('click', closePreReleaseModal);

        preReleaseProceedBtn.addEventListener('click', () => {
            if (gameToShowDetails) {
                closePreReleaseModal();
                // Użyj setTimeout, aby dać czas na zniknięcie modala przed pokazaniem następnego
                setTimeout(() => {
                    showGameDetails(gameToShowDetails);
                }, 150); // Krótkie opóźnienie dla płynniejszego przejścia
            }
        });
    }
    // Funkcja do formatowania wymagań systemowych
    function formatRequirements(requirementsString) {
        if (!requirementsString || typeof requirementsString !== 'string') {
            return '<span>Brak danych.</span>';
        }
        const parts = requirementsString.split(', ');
        return parts.map(part => {
            const [key, ...valueParts] = part.split(':');
            const value = valueParts.join(':').trim();
            if (key && value) {
                // Używamy `div` dla każdej linii i `strong` dla etykiety
                return `<div><strong>${key.trim()}:</strong> ${value}</div>`;
            }
            return `<div>${part}</div>`; // Fallback, jeśli format jest inny
        }).join('');
    }

    function createFileCard(file) {
    const gameBaseName = cleanGameFileName(file.name);
    const game = getGameDetails(file.name);

        const fileCard = document.createElement('div');
        fileCard.classList.add('file-item');
        fileCard.dataset.fileName = file.name;
    
    // Dodaj opóźnienie animacji dla efektu "stagger"
    const index = allFiles.findIndex(f => f.name === file.name);
    const delay = Math.min(index * 50, 1000); // Opóźnienie do 1 sekundy
    fileCard.style.animationDelay = `${delay}ms`;

        // Gwiazdka ulubionych
        const favBtn = document.createElement('button');
        favBtn.className = 'favorite-btn';
        favBtn.title = isFavorite(file.name) ? 'Usuń z ulubionych' : 'Dodaj do ulubionych';
        favBtn.innerHTML = isFavorite(file.name)
            ? '<i class="fas fa-star"></i>'
            : '<i class="far fa-star"></i>';
        favBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(file.name);
            favBtn.innerHTML = isFavorite(file.name)
                ? '<i class="fas fa-star"></i>'
                : '<i class="far fa-star"></i>';
            favBtn.title = isFavorite(file.name) ? 'Usuń z ulubionych' : 'Dodaj do ulubionych';
            fileCard.classList.toggle('favorite', isFavorite(file.name));
        });
        fileCard.appendChild(favBtn);

        // NOWOŚĆ: Odznaki "Nowość" i "Klasyk"
        if (game && game.releaseDate) {
            const releaseDate = new Date(game.releaseDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Resetuj czas dla dokładnego porównania dat
            const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
            const tenYearsAgo = new Date(today.getFullYear() - 10, today.getMonth(), today.getDate());
            const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));

            if (!isNaN(releaseDate.getTime())) {
                if (releaseDate > today && releaseDate <= thirtyDaysFromNow) {
                    const soonBadge = document.createElement('div');
                    soonBadge.className = 'game-badge soon-badge';
                    soonBadge.textContent = 'Wkrótce';
                    fileCard.appendChild(soonBadge);
                } else if (releaseDate > thirtyDaysAgo && releaseDate <= today) {
                    const newBadge = document.createElement('div');
                    newBadge.className = 'game-badge new-badge';
                    newBadge.textContent = 'Nowość!';
                    fileCard.appendChild(newBadge);
                } else if (releaseDate < tenYearsAgo) {
                    const classicBadge = document.createElement('div');
                    classicBadge.className = 'game-badge classic-badge';
                    classicBadge.textContent = 'Klasyk';
                    fileCard.appendChild(classicBadge);
                }
            }
        }


        // NOWOŚĆ: Licznik do premiery
        if (game && game.releaseDate) {
            const dateMatch = game.releaseDate.match(/\d{4}-\d{2}-\d{2}/);
            if (dateMatch) {
                const releaseDate = new Date(dateMatch[0]);
                const today = new Date();
                if (!isNaN(releaseDate.getTime()) && releaseDate > today) {
                    const countdownEl = document.createElement('div');
                    countdownEl.className = 'pre-release-countdown';
                    countdownEl.dataset.releaseDate = releaseDate.toISOString();
                    fileCard.appendChild(countdownEl);
                }
            }
        }

        // Okładka
        const coverImageSrc = `./covers/${gameBaseName}.jpg`;
        const bgImg = document.createElement('img');
        bgImg.src = coverImageSrc;
        bgImg.alt = game ? game.name : gameBaseName;
        bgImg.className = 'file-bg-img';
        bgImg.style.opacity = '0'; // Start hidden for fade-in effect
        bgImg.onerror = (e) => {
            e.target.src = `./covers/${gameBaseName}.png`;
            e.target.onerror = (err) => {
                err.target.src = './covers/placeholder.jpg';
            };
        };

        // Fade-in image on load
        bgImg.onload = () => { bgImg.style.opacity = '0.32'; };

        const bgFade = document.createElement('div');
        bgFade.className = 'file-bg-fade';

        const cardContent = document.createElement('div');
        cardContent.classList.add('card-content');
        cardContent.innerHTML = `
            <h3 class="file-name">${game ? game.name : gameBaseName}</h3>
            <p class="file-size">${formatBytes(file.size)}</p>
        `;

        // Gatunki
        const genresElement = document.createElement('p');
        genresElement.classList.add('card-genres');
        genresElement.innerHTML = `<strong>Gatunki:</strong> `;
        if (game && game.genres && game.genres.length > 0) {
            game.genres.forEach(genre => {
                const iconClass = iconMap[genre] || iconMap['default'];
                genresElement.innerHTML += `<span class="icon-label"><i class="${iconClass}"></i> ${genre}</span>`;
            });
        } else {
            genresElement.innerHTML += 'Brak danych.';
        }
        cardContent.appendChild(genresElement);

        // Platformy
        const platformsElement = document.createElement('p');
        platformsElement.classList.add('card-platforms');
        platformsElement.innerHTML = `<strong>Platformy:</strong> `;
        if (game && game.platforms && game.platforms.length > 0) {
            const platformSpans = game.platforms.map(platform => {
                const lowerCasePlatform = platform.toLowerCase();
                let iconHtml = '';

                if (lowerCasePlatform.includes('playstation') || lowerCasePlatform.startsWith('ps')) {
                    iconHtml = `<img src="assets/ps-logo.svg" class="platform-logo-img" alt="PlayStation">`;
                } else if (lowerCasePlatform.includes('xbox')) {
                    iconHtml = `<img src="assets/xbox-logo.svg" class="platform-logo-img" alt="Xbox">`;
                } else if (lowerCasePlatform.includes('pc')) {
                    iconHtml = `<img src="assets/pc-logo.svg" class="platform-logo-img" alt="PC">`;
                } else if (lowerCasePlatform.includes('switch')) {
                    iconHtml = `<img src="assets/switch-logo.svg" class="platform-logo-img" alt="Nintendo Switch">`;
                } else {
                    const iconClass = iconMap[platform] || iconMap['default'];
                    iconHtml = `<i class="${iconClass}"></i>`;
                }
                return `<span class="icon-label">${iconHtml} ${platform}</span>`;
            }).join('');
            platformsElement.innerHTML += platformSpans;
        } else {
            platformsElement.innerHTML += 'Brak danych.';
        }
        cardContent.appendChild(platformsElement);


    // Dodaj tło, fade, gwiazdkę
    fileCard.appendChild(bgImg);
    fileCard.appendChild(bgFade);

        // Przyciski
        const buttonsContainer = document.createElement('div');
        buttonsContainer.classList.add('card-buttons');
        buttonsContainer.innerHTML = `
            <button class="download-button" data-path="${file.path}" data-name="${file.name}"><i class="fas fa-download"></i> Pobierz</button>
        `;
        
        // Add progress bar container
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-card-container hidden';
        progressContainer.id = `progress-card-container-${file.name}`;
        progressContainer.innerHTML = `
            <div class="progress-bar-label">Pobieranie...</div>
            <div class="progress-bar">
                <div class="progress-bar-fill" id="progress-card-fill-${file.name}" style="width: 0%;"></div>
            </div>
            <div class="progress-extra-info">
                <span class="progress-percentage" id="progress-card-percent-${file.name}">0%</span>
                <span class="progress-speed" id="progress-card-speed-${file.name}"></span>
                <span class="progress-upload-speed" id="progress-card-upload-speed-${file.name}"></span>
                <span class="progress-time" id="progress-card-time-${file.name}"></span>
            </div>
        `;
        buttonsContainer.appendChild(progressContainer);

        fileCard.appendChild(cardContent);
        fileCard.appendChild(buttonsContainer);

        // Wyróżnij ulubione
        if (isFavorite(file.name)) fileCard.classList.add('favorite');

        // Kliknięcie w kafelek otwiera detale
        fileCard.addEventListener('click', (event) => {
            if (event.target.closest('.download-button') || event.target.closest('.favorite-btn')) return;
            handleGameClick(file);
        });

        // Pobieranie
        const downloadButton = fileCard.querySelector('.download-button');
        downloadButton.addEventListener('click', (event) => {
            event.stopPropagation();
            handleGameClick(file);
        });

        return fileCard;
    }


    // Funkcja do filtrowania i sortowania plików
    function filterAndSortFiles() {
        let filteredFiles = [...allFiles];
        const searchTerm = searchInput.value.toLowerCase();
        const selectedCategory = categorySelect.value;
        const sortOrder = sortSelect.value;

        // Show/hide health warning for Horror category
        if (healthWarning) {
            if (selectedCategory.toLowerCase().includes('horror')) {
                healthWarning.classList.remove('hidden');
                healthWarning.classList.add('pulsing-warning'); // Dodaj klasę animacji
            } else {
                healthWarning.classList.add('hidden');
                healthWarning.classList.remove('pulsing-warning'); // Usuń klasę animacji
            }
        }

        // Filtrowanie
        if (searchTerm) {
            filteredFiles = filteredFiles.filter(file => cleanGameFileName(file.name).toLowerCase().includes(searchTerm));
        }

        if (selectedCategory === 'favorites') {
            const favs = getFavorites();
            filteredFiles = filteredFiles.filter(file => favs.includes(file.name));
        } else if (selectedCategory !== 'all') {
            filteredFiles = filteredFiles.filter(file => {
                const gameDetails = getGameDetails(file.name);
                if (!gameDetails) return false;
                const allTags = [...(gameDetails.genres || []), ...(gameDetails.platforms || [])].map(tag => tag.toLowerCase());
                return allTags.includes(selectedCategory.toLowerCase());
            });
        }


        // Sortowanie
        filteredFiles.sort((a, b) => {
            const nameA = cleanGameFileName(a.name);
            const nameB = cleanGameFileName(b.name);
            switch (sortOrder) {
                case 'name-asc':
                    return nameA.localeCompare(nameB);
                case 'name-desc':
                    return nameB.localeCompare(nameA);
                case 'date-asc':
                    return new Date(a.mtime) - new Date(b.mtime);
                case 'date-desc':
                    return new Date(b.mtime) - new Date(a.mtime);
                case 'size-asc':
                    return a.size - b.size;
                case 'size-desc':
                    return b.size - a.size;
                default:
                    return 0;
            }
        });

        fileListDiv.innerHTML = ''; // Wyczyść listę przed dodaniem nowych elementów

        if (filteredFiles.length === 0) {
            noResultsMessage.classList.remove('hidden');
            noFilesMessage.classList.add('hidden'); // Ukryj wiadomość o braku plików ogólnie
        } else {
            noResultsMessage.classList.add('hidden');
            noFilesMessage.classList.add('hidden'); // Ukryj wiadomość o braku plików ogólnie
            filteredFiles.forEach(file => {
                fileListDiv.appendChild(createFileCard(file));
            });
        }
    }


    // Funkcja do formatowania rozmiaru pliku
    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bajtów';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bajtów', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    // --- NOWE FUNKCJE OBSŁUGI POBIERANIA ---

    /**
     * Rozpoczyna pobieranie w aplikacji przy użyciu WebTorrent.
     * @param {object} file - Obiekt pliku z `allFiles`.
     */
    async function handleWebTorrentDownload(file) {
        loadingIndicator.classList.remove('hidden');
        try {
            const gameDetails = getGameDetails(file.name);
            let torrentData = null;

            if (gameDetails && gameDetails.magnet) {
                torrentData = gameDetails.magnet;
                showToast('Rozpoczynanie pobierania (magnet)...', 3000, 'info');
                updateDiscordPresence(`Pobiera: ${gameDetails.name}`, 'Przez magnet...');
            } else if (gameDetails && gameDetails.torrentFile) {
                showToast('Rozpoczynanie pobierania (plik .torrent z JSON)...', 3000, 'info');
                updateDiscordPresence(`Pobiera: ${gameDetails.name}`, 'Z pliku .torrent...');
                const torrentPath = `${filesDirectoryPath}\\${gameDetails.torrentFile}`;
                try {
                    torrentData = await window.api.readFileAsBuffer(torrentPath);
                } catch (error) {
                    showToast(`Błąd odczytu pliku .torrent: ${error.message}`, 5000, 'danger');
                    return;
                }
            } else if (file.name.toLowerCase().endsWith('.torrent')) {
                showToast('Rozpoczynanie pobierania (plik lokalny)...', 3000, 'info');
                updateDiscordPresence(`Pobiera torrent: ${cleanGameFileName(file.name)}`, 'Przygotowanie...');
                torrentData = await window.api.readFileAsBuffer(file.path);
            } else {
                showToast('Brak linku magnet lub pliku .torrent dla tej gry.', 5000, 'danger');
                return;
            }

            if (torrentData) {
                await startTorrent(torrentData, file.name);
            }
        } catch (error) {
            showToast(`Błąd podczas pobierania: ${error.message}`, 5000, 'danger');
            console.error('Błąd podczas pobierania:', error);
        } finally {
            loadingIndicator.classList.add('hidden');
        }
    }

    /**
     * Umożliwia pobranie samego pliku .torrent.
     * @param {object} file - Obiekt pliku z `allFiles`.
     */
    async function handleTorrentFileDownload(file) {
        loadingIndicator.classList.remove('hidden');
        try {
            const gameDetails = getGameDetails(file.name);
            if (!gameDetails || !gameDetails.torrentFile) {
                showToast('Brak pliku .torrent do pobrania dla tej gry.', 5000, 'danger');
                return;
            }

            const sourcePath = `${filesDirectoryPath}\\${gameDetails.torrentFile}`;
            const defaultFileName = gameDetails.torrentFile;

            const result = await window.api.showSaveDialogAndCopy(sourcePath, defaultFileName);
            
            if (result && result.success) {
                showToast('Plik .torrent został zapisany.', 3000, 'success');
            }
        } catch (error) {
            showToast(`Błąd zapisu pliku .torrent: ${error.message}`, 5000, 'danger');
        } finally {
            loadingIndicator.classList.add('hidden');
        }
    }

    function formatTime(ms) {
        if (!isFinite(ms) || ms <= 0) {
            return '~';
        }
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const pad = (num) => num.toString().padStart(2, '0');
        if (hours > 0) {
            return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
        }
        return `${minutes}:${pad(seconds)}`;
    }

    /**
     * Główna funkcja uruchamiająca torrent w kliencie.
     * @param {string|Buffer} torrentData - Link magnet lub bufor pliku .torrent.
     * @param {string} fileName - Nazwa pliku/gry do śledzenia.
     */
    async function startTorrent(torrentData, fileName) {
        try {
            const result = await window.api.addTorrent(torrentData);
            if (result.success) {
                activeDownloads[result.infoHash] = { fileName: fileName, progress: 0, downloadSpeed: 0, uploadSpeed: 0, peers: 0, timeRemaining: 0, downloaded: 0, total: 0, ratio: 0 };

                // Pokaż paski postępu
                const cardProgress = document.getElementById(`progress-card-container-${fileName}`);
                if (cardProgress) {
                    cardProgress.classList.remove('hidden', 'completed', 'error');
                    cardProgress.querySelector('.progress-bar-label').textContent = 'Pobieranie...';
                    cardProgress.querySelector('.progress-bar-fill').style.width = '0%';
                    cardProgress.querySelector('.progress-percentage').textContent = '0%';
                }
                const detailsProgress = document.getElementById('gdProgressContainer');
                if (detailsProgress && selectedGameDetails && selectedGameDetails.name === fileName) {
                    detailsProgress.classList.remove('hidden', 'completed', 'error');
                    document.getElementById('gdProgressFill').style.width = '0%';
                    document.getElementById('gdProgressPercent').textContent = '0%';
                }

                if (result.alreadyAdded) {
                    showToast(`Torrent "${result.name}" jest już pobierany lub zakończony.`, 5000, 'info');
                } else {
                    showToast(`Pobieranie torrenta "${result.name}" rozpoczęte!`, 5000, 'success');
                }
            } else {
                showToast(`Błąd pobierania torrenta: ${result.error}`, 7000, 'danger');
                console.error('WebTorrent error:', result.error);
            }
        } catch (error) {
            showToast(`Błąd podczas uruchamiania torrenta: ${error.message}`, 5000, 'danger');
            console.error('Błąd podczas uruchamiania torrenta:', error);
        }
    }

    // Listen for torrent progress updates
    window.api.onTorrentProgress(({ progress, name, infoHash, downloadSpeed, uploadSpeed, peers, timeRemaining, downloaded, total, ratio }) => {
        const download = activeDownloads[infoHash];
        if (!download) return;

        download.progress = progress;
        download.downloadSpeed = downloadSpeed || 0;
        download.uploadSpeed = uploadSpeed || 0;
        download.peers = peers || 0;
        download.timeRemaining = timeRemaining || 0;
        download.downloaded = downloaded || 0;
        download.total = total || 0;
        download.ratio = ratio || 0;

        const fileName = download.fileName;
        const formattedDownloadSpeed = `${formatBytes(download.downloadSpeed)}/s`;
        const formattedUploadSpeed = `<i class="fas fa-arrow-up"></i> ${formatBytes(download.uploadSpeed)}/s`;
        const formattedDownloaded = `${formatBytes(download.downloaded)} / ${formatBytes(download.total)}`;
        const formattedRatio = download.ratio.toFixed(2);
        const formattedTime = formatTime(download.timeRemaining);

        // Update progress bar on the game card
        const cardFill = document.getElementById(`progress-card-fill-${fileName}`);
        const cardPercent = document.getElementById(`progress-card-percent-${fileName}`);
        const cardSpeed = document.getElementById(`progress-card-speed-${fileName}`);
        const cardUploadSpeed = document.getElementById(`progress-card-upload-speed-${fileName}`);
        const cardTime = document.getElementById(`progress-card-time-${fileName}`);
        if (cardFill) cardFill.style.width = `${progress}%`;
        if (cardPercent) cardPercent.textContent = `${progress}%`;
        if (cardSpeed) cardSpeed.innerHTML = `<i class="fas fa-arrow-down"></i> ${formattedDownloadSpeed}`;
        if (cardUploadSpeed) cardUploadSpeed.innerHTML = formattedUploadSpeed;
        if (cardTime) cardTime.innerHTML = `<i class="fas fa-clock"></i> ${formattedTime}`;

        // Update progress bar in the details view (if open)
        if (selectedGameDetails && selectedGameDetails.name === fileName) {
            const detailsFill = document.getElementById('gdProgressFill');
            const detailsPercent = document.getElementById('gdProgressPercent');
            const detailsSpeed = document.getElementById('gdDownloadSpeed');
            const detailsUploadSpeed = document.getElementById('gdUploadSpeed');
            const detailsPeers = document.getElementById('gdPeers');
            const detailsTime = document.getElementById('gdTimeRemaining');
            const detailsDownloaded = document.getElementById('gdDownloaded');
            const detailsRatio = document.getElementById('gdRatio');
            if (detailsFill) detailsFill.style.width = `${progress}%`;
            if (detailsPercent) detailsPercent.textContent = `${progress}%`;
            if (detailsSpeed) detailsSpeed.innerHTML = `<i class="fas fa-arrow-down"></i> ${formattedDownloadSpeed}`;
            if (detailsUploadSpeed) detailsUploadSpeed.innerHTML = `<i class="fas fa-arrow-up"></i> ${formattedUploadSpeed}`;
            if (detailsPeers) detailsPeers.innerHTML = `<i class="fas fa-users"></i> Peerów: ${download.peers}`;
            if (detailsTime) detailsTime.innerHTML = `<i class="fas fa-clock"></i> ${formattedTime}`;
            if (detailsDownloaded) detailsDownloaded.innerHTML = `<i class="fas fa-hdd"></i> ${formattedDownloaded}`;
            if (detailsRatio) detailsRatio.innerHTML = `<i class="fas fa-exchange-alt"></i> ${formattedRatio}`;
        }

        updateDiscordPresence(`Pobiera: ${name}`, `${progress}%`);
    });

    window.api.onTorrentDone(({ name, infoHash }) => {
        const download = activeDownloads[infoHash];
        if (!download) return;

        const fileName = download.fileName;
        showToast(`✅ Zakończono pobieranie: ${name}`, 5000, 'success');
        addToDownloadHistory(name);
        incrementDownloadStats(name);
        updateDiscordPresence('W menu głównym', 'Przegląda bibliotekę');

        const containers = [document.getElementById(`progress-card-container-${fileName}`), document.getElementById('gdProgressContainer')];
        containers.forEach(container => {
            if (container && (!container.id.startsWith('gd') || (selectedGameDetails && selectedGameDetails.name === fileName))) {
                container.querySelector('.progress-bar-label').textContent = 'Pobrano!';
                container.classList.add('completed');
                setTimeout(() => container.classList.add('hidden'), 4000);
            }
        });
        delete activeDownloads[infoHash];
    });

    window.api.onTorrentError(({ name, infoHash, error }) => {
        const download = activeDownloads[infoHash];
        if (!download) return;

        const fileName = download.fileName;
        showToast(`❌ Błąd pobierania ${name}: ${error}`, 8000, 'danger');

        const containers = [document.getElementById(`progress-card-container-${fileName}`), document.getElementById('gdProgressContainer')];
        containers.forEach(container => {
            if (container && (!container.id.startsWith('gd') || (selectedGameDetails && selectedGameDetails.name === fileName))) {
                container.querySelector('.progress-bar-label').textContent = 'Błąd!';
                container.classList.add('error');
                setTimeout(() => container.classList.add('hidden'), 5000);
            }
        });
        delete activeDownloads[infoHash];
    });

    // Dummy functions for download history and stats (if not already defined)
    function addToDownloadHistory(fileName) {
        console.log(`Added to download history: ${fileName}`);
        // Implement actual history saving here
    }

    function incrementDownloadStats(fileName) {
        console.log(`Incremented download stats for: ${fileName}`);
        // Implement actual stats saving here
    }

    // Funkcja do wczytywania danych JSON o grach
    async function readGameDataJson() {
        try {
            const data = await window.api.readGameDataJson();
            // NORMALIZACJA: Upewnij się, że dane o grach są zawsze tablicą.
            // To rozwiązuje problem, gdy games_data.json jest obiektem, a nie tablicą.
            if (data && !Array.isArray(data) && typeof data === 'object') {
                gamesData = Object.values(data);
            } else {
                gamesData = data || [];
            }
            console.log('Dane gier wczytane:', gamesData.length, 'gier');

            populateCategorySelect();
        } catch (error) {
            console.error('Błąd podczas wczytywania danych gier:', error);
            gamesData = []; // Ustaw na pustą tablicę w razie błędu
        }
    }

    // Funkcja do wypełniania selecta kategorii na podstawie danych JSON
    function populateCategorySelect() {
        const categories = new Set();
        gamesData.forEach(game => {
            if (game.genres) {
                game.genres.forEach(genre => categories.add(genre));
            }
            if (game.platforms) {
                game.platforms.forEach(platform => categories.add(platform));
            }
        });


        // Wyczyść istniejące opcje, z wyjątkiem "Wszystkie"
        categorySelect.innerHTML = '<option value="all">Wszystkie</option><option value="favorites">Ulubione</option>';

        // Dodaj posortowane kategorie
        Array.from(categories).sort().forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });
    }

    // Główna funkcja pobierająca pliki i dane gier
    async function fetchFilesAndGameData() {
        noFilesMessage.classList.add('hidden');
        noResultsMessage.classList.add('hidden');
        fileListDiv.innerHTML = ''; // Wyczyść listę przed załadowaniem

        // Pokaż szkielety ładowania
        for (let i = 0; i < 12; i++) {
            const skeletonCard = document.createElement('div');
            skeletonCard.className = 'skeleton-card';
            skeletonCard.innerHTML = `
                <div>
                    <div class="skeleton-item skeleton-title"></div>
                    <div class="skeleton-item skeleton-text"></div>
                </div>
            `;
            fileListDiv.appendChild(skeletonCard);
        }

        // Ukryj stary wskaźnik ładowania, jeśli jest
        if (loadingIndicator) loadingIndicator.classList.add('hidden');

        try {
            filesDirectoryPath = await window.api.getFilesDirectory();
            allFiles = await window.api.readFilesInDirectory(filesDirectoryPath);

            await readGameDataJson(); // Wczytaj dane gier

            filterAndSortFiles(); // Wyświetl początkową listę

            // NOWOŚĆ: Wyświetl grę tygodnia
            displayFeaturedGame();

            // Po załadowaniu danych, usuń szkielety (filterAndSortFiles już wyczyścił listę)

            if (allFiles.length === 0) {
                noFilesMessage.classList.remove('hidden');
                noResultsMessage.classList.add('hidden');
                fileListDiv.innerHTML = '';
            }
        } catch (error) {
            console.error('Błąd podczas pobierania plików lub danych gier:', error);
            noFilesMessage.textContent = 'Wystąpił błąd podczas ładowania plików.';
            noFilesMessage.classList.remove('hidden');
            noResultsMessage.classList.add('hidden');
            fileListDiv.innerHTML = '';
        } finally {
            // Upewnij się, że stary wskaźnik jest ukryty
            if (loadingIndicator) loadingIndicator.classList.add('hidden');
        }
    }


    // Początkowe pobieranie plików i danych gier po załadowaniu strony
    fetchFilesAndGameData();

    // Obsługa przycisku Odśwież w sidebarze
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            // Dodaj klasę animacji i zablokuj przycisk
            refreshBtn.classList.add('refreshing');
            refreshBtn.disabled = true;

            try {
                await fetchFilesAndGameData();
                if (typeof showToast === 'function') showToast('Odświeżono listę plików/gier!');
            } catch (error) {
                console.error("Błąd podczas odświeżania:", error);
                if (typeof showToast === 'function') showToast('Błąd podczas odświeżania!', 4000, 'danger');
            } finally {
                // Usuń animację i odblokuj przycisk po zakończeniu
                refreshBtn.classList.remove('refreshing');
                refreshBtn.disabled = false;
            }
        });
    }

    // Dodaj event listenery dla wyszukiwania i sortowania
    searchInput.addEventListener('input', filterAndSortFiles);
    sortSelect.addEventListener('change', filterAndSortFiles);
    categorySelect.addEventListener('change', filterAndSortFiles);

    // === LOGIKA LIGHTBOXA DLA ZRZUTÓW EKRANU ===
    const lightbox = document.getElementById('screenshotLightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxCaption = document.querySelector('.lightbox-caption');

    function openLightbox(src, captionText) {
        if (!lightbox || !lightboxImage) return;
        
        lightboxImage.src = src;
        if (lightboxCaption) {
            lightboxCaption.textContent = captionText;
        }
        
        lightbox.classList.remove('hidden');
        document.body.classList.add('modal-open'); // Zablokuj przewijanie tła
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.add('hidden');
        document.body.classList.remove('modal-open'); // Odblokuj przewijanie tła
    }

    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    }
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !lightbox.classList.contains('hidden')) closeLightbox();
    });
});

// === LOGIKA ZWIJANIA I ROZWIJANIA SIDEBARA ===
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.sidebar');
    const contentArea = document.querySelector('.content-area');

    if (sidebar && contentArea) {
        const handleSidebarState = () => {
            if (window.innerWidth < 768) {
                // Na małych ekranach sidebar jest zawsze rozwinięty (lub obsługiwany przez inne style, np. ukryty)
                sidebar.classList.remove('collapsed');
                contentArea.classList.remove('collapsed');
            } else {
                // Na większych ekranach sidebar jest zwinięty
                sidebar.classList.add('collapsed');
                contentArea.classList.add('collapsed');
            }
        };

        const expandSidebar = () => {
            if (window.innerWidth >= 768) {
                sidebar.classList.remove('collapsed');
                contentArea.classList.remove('collapsed');
            }
        };

        // Ustaw stan początkowy i dodaj listenery
        handleSidebarState();
        sidebar.addEventListener('mouseenter', expandSidebar);
        sidebar.addEventListener('mouseleave', handleSidebarState);
        window.addEventListener('resize', handleSidebarState);
    }
});

// === KALENDARZ PREMIER FUNCTIONALITY ===
let calendarData = [];
let currentCalendarView = 'list'; // 'list' lub 'grid'
let currentCalendarDate = new Date();

// Ładowanie danych kalendarza
async function loadCalendarData() {
    console.log('🗓️ Ładowanie danych kalendarza...');
    try {
        // Spróbuj załadować przez API
        if (window.api && window.api.readCalendarData) {
            calendarData = await window.api.readCalendarData();
        } else {
            // Fallback - załaduj bezpośrednio z pliku
            const response = await fetch('./calendar_data.json');
            calendarData = await response.json();
        }
        console.log('📅 Załadowano dane kalendarza:', calendarData.length, 'gier');
        
        // Sortuj według daty premiery
        calendarData.sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate));
        
        // Aktualizuj status gier
        updateGameStatuses();
        
        // Wyświetl dane
        if (currentCalendarView === 'list') {
            displayCalendarList();
        } else {
            displayCalendarGrid();
        }
        
        // Inicjalizuj filtry
        initializeCalendarFilters();
        
        // Sprawdź nadchodzące premiery
        setTimeout(checkUpcomingReleases, 2000);
        
    } catch (error) {
        console.error('❌ Błąd ładowania danych kalendarza:', error);
        
        // Pokaż komunikat o błędzie
        const calendarList = document.getElementById('calendarList');
        if (calendarList) {
            calendarList.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #ff4444;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3em; margin-bottom: 20px;"></i>
                    <h3>Błąd ładowania kalendarza</h3>
                    <p>Nie udało się załadować danych premier gier.</p>
                    <button onclick="loadCalendarData()" style="background: #ff0000; color: #fff; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; margin-top: 15px;">
                        <i class="fas fa-redo"></i> Spróbuj ponownie
                    </button>
                </div>
            `;
        }
        
        showToast('Błąd ładowania kalendarza premier', 3000, 'error');
    }
}

// Aktualizacja statusów gier
function updateGameStatuses() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    calendarData.forEach(game => {
        const releaseDate = new Date(game.releaseDate);
        releaseDate.setHours(0, 0, 0, 0);
        
        if (releaseDate.getTime() === today.getTime()) {
            game.status = 'today';
        } else if (releaseDate > today) {
            game.status = 'upcoming';
        } else {
            game.status = 'past';
        }
    });
}

// Wyświetlanie listy premier
function displayCalendarList() {
    console.log('📋 Wyświetlanie listy kalendarza...');
    const calendarList = document.getElementById('calendarList');
    const calendarGrid = document.getElementById('calendarGrid');
    const noCalendarMessage = document.getElementById('noCalendarMessage');
    
    if (!calendarList) {
        console.error('❌ Nie znaleziono elementu calendarList');
        return;
    }
    
    calendarList.style.display = 'block';
    calendarGrid.style.display = 'none';
    
    const filteredGames = getFilteredGames();
    
    if (filteredGames.length === 0) {
        calendarList.innerHTML = '';
        noCalendarMessage.classList.remove('hidden');
        return;
    }
    
    noCalendarMessage.classList.add('hidden');
    
    calendarList.innerHTML = filteredGames.map(game => createReleaseCard(game)).join('');
    
    // Dodaj event listenery
    addReleaseCardListeners();
}

// Tworzenie karty premiery
function createReleaseCard(game) {
    const releaseDate = new Date(game.releaseDate);
    const today = new Date();
    const timeDiff = releaseDate - today;
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    let dateClass = 'upcoming';
    let dateText = formatDate(releaseDate);
    
    if (game.status === 'today') {
        dateClass = 'today';
        dateText = 'DZIŚ!';
    } else if (game.status === 'past') {
        dateClass = 'past';
        dateText = formatDate(releaseDate);
    }
    
    const countdownHtml = game.status === 'upcoming' && daysDiff <= 30 ? 
        `<div class="release-countdown ${daysDiff <= 7 ? 'urgent' : ''}">
            ${daysDiff > 0 ? `Za ${daysDiff} dni` : 'Już dostępne!'}
        </div>` : '';
    
    const platformIcons = game.platforms.map(platform => {
        const iconMap = {
            'PC': 'fas fa-desktop',
            'PlayStation 5': 'fab fa-playstation',
            'PlayStation': 'fab fa-playstation',
            'Xbox Series X/S': 'fab fa-xbox',
            'Xbox': 'fab fa-xbox',
            'Nintendo Switch': 'fas fa-gamepad'
        };
        return `<i class="${iconMap[platform] || 'fas fa-gamepad'}" title="${platform}"></i>`;
    }).join('');
    
    return `
        <div class="release-card" data-game="${game.name}">
            <div class="release-header">
                <h3 class="release-title">${game.name}</h3>
                <div class="release-date ${dateClass}">${dateText}</div>
            </div>
            <div class="release-info">
                <img src="${game.coverImage}" alt="${game.name}" class="release-cover" 
                     onerror="this.src='./covers/placeholder.jpg'">
                <div class="release-details">
                    <h4>${game.developer}</h4>
                    <p class="release-description">${game.description}</p>
                    <div class="release-genres">
                        ${game.genres.map(genre => `<span>${genre}</span>`).join('')}
                    </div>
                    <div class="release-platforms">
                        ${platformIcons}
                    </div>
                    ${countdownHtml}
                </div>
            </div>
        </div>
    `;
}

// Wyświetlanie siatki kalendarza
function displayCalendarGrid() {
    const calendarList = document.getElementById('calendarList');
    const calendarGrid = document.getElementById('calendarGrid');
    
    if (!calendarGrid) return;
    
    calendarList.style.display = 'none';
    calendarGrid.style.display = 'block';
    
    updateCalendarHeader();
    generateCalendarDays();
}

// Aktualizacja nagłówka kalendarza
function updateCalendarHeader() {
    const currentMonthEl = document.getElementById('calendarCurrentMonth');
    if (currentMonthEl) {
        const monthNames = [
            'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
            'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
        ];
        currentMonthEl.textContent = `${monthNames[currentCalendarDate.getMonth()]} ${currentCalendarDate.getFullYear()}`;
    }
}

// Generowanie dni kalendarza
function generateCalendarDays() {
    const calendarDaysGrid = document.getElementById('calendarDaysGrid');
    if (!calendarDaysGrid) return;
    
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    // Pierwszy dzień miesiąca
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Pierwszy poniedziałek do wyświetlenia
    const startDate = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(firstDay.getDate() - daysToSubtract);
    
    const days = [];
    const currentDate = new Date(startDate);
    
    // Generuj 42 dni (6 tygodni)
    for (let i = 0; i < 42; i++) {
        const dayData = {
            date: new Date(currentDate),
            isCurrentMonth: currentDate.getMonth() === month,
            isToday: isToday(currentDate),
            releases: getReleasesForDate(currentDate)
        };
        days.push(dayData);
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    calendarDaysGrid.innerHTML = days.map(day => createCalendarDay(day)).join('');
}

// Tworzenie dnia kalendarza
function createCalendarDay(dayData) {
    const { date, isCurrentMonth, isToday, releases } = dayData;
    
    let classes = 'calendar-day';
    if (!isCurrentMonth) classes += ' other-month';
    if (isToday) classes += ' today';
    if (releases.length > 0) classes += ' has-releases';
    
    const releasesText = releases.length > 0 ? 
        `${releases.length} ${releases.length === 1 ? 'premiera' : 'premier'}` : '';
    
    const tooltip = releases.length > 0 ? 
        `<div class="calendar-day-tooltip">${releases.map(r => r.name).join(', ')}</div>` : '';
    
    return `
        <div class="${classes}" data-date="${date.toISOString().split('T')[0]}">
            <div class="calendar-day-number">${date.getDate()}</div>
            <div class="calendar-day-releases">${releasesText}</div>
            ${tooltip}
        </div>
    `;
}

// Pomocnicze funkcje
function isToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
}

function getReleasesForDate(date) {
    const dateStr = date.toISOString().split('T')[0];
    return calendarData.filter(game => game.releaseDate === dateStr);
}

function formatDate(date) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return date.toLocaleDateString('pl-PL', options);
}

// Filtrowanie gier
function getFilteredGames() {
    const monthFilter = document.getElementById('calendarMonthFilter')?.value;
    const yearFilter = document.getElementById('calendarYearFilter')?.value;
    const genreFilter = document.getElementById('calendarGenreFilter')?.value;
    
    return calendarData.filter(game => {
        const releaseDate = new Date(game.releaseDate);
        
        // Filtr miesiąca
        if (monthFilter !== 'all' && releaseDate.getMonth() !== parseInt(monthFilter)) {
            return false;
        }
        
        // Filtr roku
        if (yearFilter !== 'all' && releaseDate.getFullYear() !== parseInt(yearFilter)) {
            return false;
        }
        
        // Filtr gatunku
        if (genreFilter !== 'all') {
            const genreMap = {
                'action': 'Akcja',
                'rpg': 'RPG',
                'strategy': 'Strategia',
                'adventure': 'Przygodowa',
                'horror': 'Horror',
                'indie': 'Indie'
            };
            const genreName = genreMap[genreFilter];
            if (genreName && !game.genres.includes(genreName)) {
                return false;
            }
        }
        
        return true;
    });
}

// Inicjalizacja filtrów
function initializeCalendarFilters() {
    console.log('🔧 Inicjalizacja filtrów kalendarza...');
    
    // Sprawdź czy wszystkie elementy istnieją
    const requiredElements = [
        'calendarListView', 'calendarGridView', 'calendarList', 'calendarGrid',
        'calendarMonthFilter', 'calendarYearFilter', 'calendarGenreFilter'
    ];
    
    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    if (missingElements.length > 0) {
        console.error('❌ Brakujące elementy DOM:', missingElements);
        return;
    }
    
    // Przełączanie widoków
    const listViewBtn = document.getElementById('calendarListView');
    const gridViewBtn = document.getElementById('calendarGridView');
    
    if (listViewBtn && gridViewBtn) {
        listViewBtn.addEventListener('click', () => {
            currentCalendarView = 'list';
            listViewBtn.classList.add('active');
            gridViewBtn.classList.remove('active');
            displayCalendarList();
        });
        
        gridViewBtn.addEventListener('click', () => {
            currentCalendarView = 'grid';
            gridViewBtn.classList.add('active');
            listViewBtn.classList.remove('active');
            displayCalendarGrid();
        });
    }
    
    // Filtry
    const monthFilter = document.getElementById('calendarMonthFilter');
    const yearFilter = document.getElementById('calendarYearFilter');
    const genreFilter = document.getElementById('calendarGenreFilter');
    
    [monthFilter, yearFilter, genreFilter].forEach(filter => {
        if (filter) {
            filter.addEventListener('change', () => {
                if (currentCalendarView === 'list') {
                    displayCalendarList();
                } else {
                    displayCalendarGrid();
                }
            });
        }
    });
    
    // Przycisk "Dzisiaj"
    const todayBtn = document.getElementById('calendarTodayBtn');
    if (todayBtn) {
        todayBtn.addEventListener('click', () => {
            currentCalendarDate = new Date();
            if (currentCalendarView === 'grid') {
                displayCalendarGrid();
            }
            // Resetuj filtry
            if (monthFilter) monthFilter.value = 'all';
            if (yearFilter) yearFilter.value = 'all';
            if (genreFilter) genreFilter.value = 'all';
            if (currentCalendarView === 'list') {
                displayCalendarList();
            }
        });
    }
    
    // Przycisk eksportu
    const exportBtn = document.getElementById('calendarExportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportCalendarToICS);
    }
    
    // Nawigacja kalendarza
    const prevBtn = document.getElementById('calendarPrevMonth');
    const nextBtn = document.getElementById('calendarNextMonth');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
            displayCalendarGrid();
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
            displayCalendarGrid();
        });
    }
}

// Event listenery dla kart premier
function addReleaseCardListeners() {
    document.querySelectorAll('.release-card').forEach(card => {
        card.addEventListener('click', () => {
            const gameName = card.dataset.game;
            const game = calendarData.find(g => g.name === gameName);
            if (game) {
                showGameReleaseDetails(game);
            }
        });
    });
}

// Pokazywanie szczegółów premiery
function showGameReleaseDetails(game) {
    const releaseDate = new Date(game.releaseDate);
    const today = new Date();
    const timeDiff = releaseDate - today;
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    // Stwórz modal z szczegółami
    const modal = document.createElement('div');
    modal.className = 'calendar-details-modal';
    modal.innerHTML = `
        <div class="calendar-details-overlay"></div>
        <div class="calendar-details-content">
            <button class="calendar-details-close">
                <i class="fas fa-times"></i>
            </button>
            
            <div class="calendar-details-header">
                <img src="${game.coverImage}" alt="${game.name}" class="calendar-details-cover" 
                     onerror="this.src='./covers/placeholder.jpg'">
                <div class="calendar-details-info">
                    <h2>${game.name}</h2>
                    <p class="calendar-details-dev">${game.developer}</p>
                    <div class="calendar-details-date ${game.status}">
                        ${game.status === 'today' ? 'PREMIERA DZIŚ!' : 
                          game.status === 'upcoming' ? `Za ${daysDiff} dni` : 
                          'Już dostępne'}
                    </div>
                </div>
            </div>
            
            <div class="calendar-details-body">
                <p class="calendar-details-description">${game.description}</p>
                
                <div class="calendar-details-meta">
                    <div><strong>Data premiery:</strong> ${formatDate(releaseDate)}</div>
                    <div><strong>Wydawca:</strong> ${game.publisher}</div>
                    <div><strong>Gatunki:</strong> ${game.genres.join(', ')}</div>
                    <div><strong>Platformy:</strong> ${game.platforms.join(', ')}</div>
                </div>
                
                <div class="calendar-details-actions">
                    ${game.trailerUrl ? `
                        <button class="calendar-action-btn trailer-btn" onclick="window.api.openLink('${game.trailerUrl}')">
                            <i class="fas fa-play"></i> Obejrzyj trailer
                        </button>
                    ` : ''}
                    <button class="calendar-action-btn wishlist-btn" onclick="addToWishlist('${game.name}')">
                        <i class="fas fa-heart"></i> Dodaj do życzeń
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event listeners
    const closeBtn = modal.querySelector('.calendar-details-close');
    const overlay = modal.querySelector('.calendar-details-overlay');
    
    const closeModal = () => {
        modal.remove();
    };
    
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);
    
    // Animacja pojawiania
    setTimeout(() => modal.classList.add('show'), 10);
}

// Funkcja dodawania do wishlisty (placeholder)
function addToWishlist(gameName) {
    let wishlist = JSON.parse(localStorage.getItem('calendar-wishlist') || '[]');
    
    if (!wishlist.includes(gameName)) {
        wishlist.push(gameName);
        localStorage.setItem('calendar-wishlist', JSON.stringify(wishlist));
        showToast(`${gameName} dodano do listy życzeń!`, 3000, 'success');
    } else {
        showToast(`${gameName} już jest na liście życzeń`, 3000, 'info');
    }
}

// === KONIEC KALENDARZ PREMIER FUNCTIONALITY ===
// === POWIADOMIENIA O PREMIERACH ===
function checkUpcomingReleases() {
    if (!calendarData || calendarData.length === 0) return;
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    // Sprawdź premiery na jutro
    const tomorrowReleases = calendarData.filter(game => {
        const releaseDate = new Date(game.releaseDate);
        return releaseDate.toDateString() === tomorrow.toDateString();
    });
    
    // Sprawdź premiery w tym tygodniu
    const thisWeekReleases = calendarData.filter(game => {
        const releaseDate = new Date(game.releaseDate);
        return releaseDate > today && releaseDate <= nextWeek;
    });
    
    // Pokaż powiadomienia
    if (tomorrowReleases.length > 0) {
        const gameNames = tomorrowReleases.map(g => g.name).join(', ');
        showToast(`🎮 Jutro premiera: ${gameNames}`, 8000, 'info');
        
        // Powiadomienie systemowe
        if (window.Notification && Notification.permission === 'granted') {
            new Notification('Premiera jutro!', {
                body: `${gameNames}`,
                icon: 'icon.ico'
            });
        }
    }
    
    if (thisWeekReleases.length > 0 && tomorrowReleases.length === 0) {
        const count = thisWeekReleases.length;
        showToast(`📅 W tym tygodniu ${count} ${count === 1 ? 'premiera' : 'premier'}`, 5000, 'info');
    }
}

// Sprawdzaj powiadomienia co godzinę
setInterval(checkUpcomingReleases, 60 * 60 * 1000);

// === KONIEC POWIADOMIENIA O PREMIERACH ===
// === EKSPORT KALENDARZA ===
function exportCalendarToICS() {
    if (!calendarData || calendarData.length === 0) {
        showToast('Brak danych do eksportu', 3000, 'error');
        return;
    }
    
    let icsContent = 'BEGIN:VCALENDAR\n';
    icsContent += 'VERSION:2.0\n';
    icsContent += 'PRODID:-//AstroWorld//Calendar//EN\n';
    icsContent += 'CALSCALE:GREGORIAN\n';
    
    calendarData.forEach(game => {
        const releaseDate = new Date(game.releaseDate);
        const dateStr = releaseDate.toISOString().replace(/[-:]/g, '').split('T')[0] + 'T000000Z';
        
        icsContent += 'BEGIN:VEVENT\n';
        icsContent += `UID:${game.name.replace(/\s+/g, '-').toLowerCase()}@astroworld.app\n`;
        icsContent += `DTSTART:${dateStr}\n`;
        icsContent += `DTEND:${dateStr}\n`;
        icsContent += `SUMMARY:Premiera: ${game.name}\n`;
        icsContent += `DESCRIPTION:${game.description}\\n\\nDeweloper: ${game.developer}\\nGatunki: ${game.genres.join(', ')}\n`;
        icsContent += `LOCATION:${game.platforms.join(', ')}\n`;
        icsContent += 'END:VEVENT\n';
    });
    
    icsContent += 'END:VCALENDAR';
    
    // Pobierz plik
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'astroworld-premiery.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Kalendarz wyeksportowany!', 3000, 'success');
}

// === KONIEC EKSPORT KALENDARZA ===