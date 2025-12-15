# 🌌 Witamy w AstroWorld

**Najlepszy pobierator gier na Windows z wbudowanym klientem torrent**

[![Version](https://img.shields.io/badge/version-1.0.8-blue.svg)](https://github.com/kuvismotionstudio-web/Astroworld-App/releases)
[![Platform](https://img.shields.io/badge/platform-Windows-blue.svg)](#)
[![License](https://img.shields.io/badge/license-ISC-green.svg)](LICENSE)
[![Discord](https://img.shields.io/discord/YOUR_DISCORD_ID?color=7289da&label=Discord&logo=discord&logoColor=white)](https://discord.gg/UBhtYzNu)

## 🚀 Witamy w przyszłości pobierania gier!

Witamy w **AstroWorld** - nowoczesnej aplikacji desktopowej stworzonej specjalnie dla graczy na Windows! 

AstroWorld to nie tylko kolejny pobierator - to kompletne centrum gier, które łączy w sobie elegancki interfejs z potężnym systemem pobierania torrentów. Dzięki wbudowanemu klientowi WebTorrent, szczegółowym informacjom o grach i automatycznym aktualizacjom, AstroWorld staje się twoim niezastąpionym towarzyszem w świecie gamingu.

**Dlaczego AstroWorld?** Bo zasługujesz na więcej niż zwykły pobierator. Zasługujesz na aplikację, która nie tylko pobiera gry, ale też pomaga je odkrywać, organizować i cieszyć się nimi w pełni!

## ✨ Główne funkcje

### 🎮 Zarządzanie grami
- **Biblioteka gier** - Przeglądaj i organizuj swoją kolekcję gier
- **Szczegółowe informacje** - Wyświetlanie wymagań systemowych, opisów i zrzutów ekranu
- **Gra tygodnia** - System rekomendacji wyróżniających wybrane tytuły
- **Kategorie i filtry** - Zaawansowane sortowanie i wyszukiwanie

### 🎯 Pobieranie gier
- **Wbudowany klient torrent** - Szybkie i bezpieczne pobieranie przez WebTorrent
- **Magnet linki** - Obsługa magnet linków i plików .torrent
- **Pasek postępu** - Szczegółowe informacje o pobieraniu w czasie rzeczywistym
- **Zarządzanie pobieraniami** - Kontrola nad aktywnymi transferami

### 🌐 Zaawansowane funkcje pobierania
- **Optymalizacja sieci** - Automatyczna konfiguracja trackerów dla maksymalnej prędkości
- **Statystyki pobierania** - Prędkość, liczba peerów, czas pozostały
- **Automatyczne uruchamianie** - Opcja automatycznego uruchomienia gry po pobraniu
- **Zarządzanie folderami** - Organizacja pobranych gier w wybranych lokalizacjach

### 🔄 Automatyczne aktualizacje
- **Auto-updater** - Automatyczne sprawdzanie i instalacja aktualizacji
- **Powiadomienia** - Informacje o dostępnych aktualizacjach
- **Bezpieczne pobieranie** - Weryfikacja cyfrowych podpisów
- **Changelog** - Szczegółowe informacje o zmianach

### 🎨 Interfejs użytkownika
- **Nowoczesny design** - Elegancki interfejs z animacjami
- **Tryb ciemny/jasny** - Przełączanie między motywami
- **Responsywność** - Dostosowanie do różnych rozdzielczości
- **Wielojęzyczność** - Obsługa języka polskiego i angielskiego

### 🔧 Zaawansowane funkcje
- **Discord Rich Presence** - Integracja z Discordem
- **Ustawienia** - Kompleksowa konfiguracja aplikacji
- **Logi systemowe** - Szczegółowe informacje diagnostyczne
- **Bezpieczeństwo** - CSP i inne mechanizmy ochrony

## 🚀 Instalacja

### Wymagania systemowe
- **Windows**: Windows 10 lub nowszy (64-bit)
- **RAM**: Minimum 4GB (zalecane 8GB)
- **Miejsce na dysku**: 1GB wolnego miejsca + miejsce na pobrane gry
- **Połączenie internetowe**: Wymagane do pobierania gier i aktualizacji

### Pobieranie
1. Przejdź do sekcji [Releases](https://github.com/kuvismotionstudio-web/Astroworld-App/releases)
2. Pobierz najnowszą wersję: `AstroWorld-Setup-{version}.exe`
3. Uruchom installer jako administrator
4. Postępuj zgodnie z instrukcjami instalatora
5. Gotowe! Możesz zacząć pobierać gry

## 🛠️ Rozwój

### Technologie
- **Electron** - Framework do aplikacji desktopowych
- **Node.js** - Środowisko uruchomieniowe JavaScript
- **Express** - Serwer HTTP
- **WebTorrent** - Klient BitTorrent
- **Sharp** - Przetwarzanie obrazów
- **Discord RPC** - Integracja z Discordem

### Struktura projektu
```
astroworld/
├── main.js              # Główny proces Electron
├── preload.js           # Skrypt preload
├── index.html           # Główny interfejs
├── style.css            # Style CSS
├── script.js            # Logika frontend
├── assets/              # Zasoby graficzne
├── locales/             # Pliki tłumaczeń
├── sections/            # Komponenty interfejsu
└── dist/                # Pliki dystrybucji
```

### Uruchomienie w trybie deweloperskim
```bash
# Klonowanie repozytorium
git clone https://github.com/kuvismotionstudio-web/Astroworld-App.git
cd Astroworld-App

# Instalacja zależności
npm install

# Uruchomienie aplikacji
npm start
```

### Budowanie
```bash
# Budowanie dla wszystkich platform
npm run dist

# Budowanie tylko dla Windows
npm run build

# Pakowanie bez instalatora
npm run pack
```

## 📖 Dokumentacja

### Konfiguracja
Aplikacja automatycznie tworzy folder konfiguracyjny w:
- **Windows**: `%APPDATA%/astro`

Pobrane gry są domyślnie zapisywane w folderze `downloads` w katalogu aplikacji, ale możesz zmienić tę lokalizację w ustawieniach.

### API
Aplikacja udostępnia wewnętrzne API przez `window.api` dla komunikacji między procesami:
- `window.api.invoke()` - Wywołania asynchroniczne
- `window.api.on()` - Nasłuchiwanie zdarzeń
- `window.api.changeLanguage()` - Zmiana języka

## 🤝 Współpraca

Zachęcamy do współpracy! Oto jak możesz pomóc:

1. **Fork** repozytorium
2. Stwórz **branch** dla swojej funkcji (`git checkout -b feature/AmazingFeature`)
3. **Commit** swoje zmiany (`git commit -m 'Add some AmazingFeature'`)
4. **Push** do brancha (`git push origin feature/AmazingFeature`)
5. Otwórz **Pull Request**

### Zgłaszanie błędów
Jeśli znajdziesz błąd, [stwórz issue](https://github.com/kuvismotionstudio-web/Astroworld-App/issues) z:
- Opisem problemu
- Krokami do reprodukcji
- Oczekiwanym zachowaniem
- Zrzutami ekranu (jeśli dotyczy)

## 📄 Licencja

Ten projekt jest licencjonowany na licencji ISC - zobacz plik [LICENSE](LICENSE) dla szczegółów.

## 📞 Kontakt

- **Discord**: [Dołącz do serwera](https://discord.gg/UBhtYzNu)
- **Email**: kuvismotionstudio@gmail.com
- **Website**: [astroworld.byethost8.com](https://astroworld.byethost8.com)

## 🙏 Podziękowania

- Społeczność Electron za doskonały framework
- Zespół WebTorrent za bibliotekę P2P
- Wszystkim kontrybutorów i testerów

---

<div align="center">
  <strong>Zbudowane z ❤️ przez zespół AstroWorld</strong>
  <br>
  <sub>© 2025 AstroWorld. Wszystkie prawa zastrzeżone.</sub>
</div>