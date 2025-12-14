# Auto-Update Setup dla AstroWorld

## Konfiguracja GitHub Auto-Update

### 1. Przygotowanie repozytorium GitHub

1. Utwórz repozytorium na GitHub (jeśli jeszcze nie istnieje)
2. Upewnij się, że masz odpowiednie uprawnienia do tworzenia releases
3. Zaktualizuj `package.json` z właściwymi danymi repozytorium:

```json
"build": {
  "publish": {
    "provider": "github",
    "owner": "TWOJA-NAZWA-UZYTKOWNIKA",
    "repo": "NAZWA-REPOZYTORIUM"
  }
}
```

### 2. Konfiguracja GitHub Actions

Plik `.github/workflows/build-and-release.yml` został już utworzony i skonfiguruje:
- Automatyczne budowanie aplikacji dla Windows, macOS i Linux
- Tworzenie GitHub Releases przy tagowaniu wersji
- Upload plików instalacyjnych do release

### 3. Tworzenie nowej wersji

Aby wydać nową wersję z auto-update:

```bash
# Zwiększ wersję w package.json i utwórz tag
npm run release

# Lub ręcznie:
npm version patch  # lub minor/major
git push
git push --tags
```

### 4. Jak działa auto-update

1. **Sprawdzanie aktualizacji**: Aplikacja automatycznie sprawdza GitHub Releases co 24h
2. **Powiadomienie**: Użytkownik otrzymuje powiadomienie o dostępnej aktualizacji
3. **Pobieranie**: Aktualizacja jest pobierana w tle
4. **Instalacja**: Po pobraniu użytkownik może zainstalować jednym kliknięciem

### 5. Funkcje zaimplementowane

- ✅ Automatyczne sprawdzanie aktualizacji przy starcie
- ✅ Modal z informacją o nowej wersji
- ✅ Pasek postępu pobierania
- ✅ Przycisk ręcznego sprawdzania w ustawieniach
- ✅ Wyświetlanie aktualnej wersji w "O programie"
- ✅ GitHub Actions workflow
- ✅ Konfiguracja electron-builder

### 6. Testowanie

Aby przetestować auto-update:

1. Zbuduj aplikację: `npm run dist`
2. Zainstaluj wersję lokalną
3. Zwiększ wersję w package.json
4. Utwórz release na GitHub
5. Uruchom aplikację - powinna wykryć aktualizację

### 7. Konfiguracja dodatkowa

W `main.js` możesz dostosować:
- Częstotliwość sprawdzania aktualizacji
- Automatyczne pobieranie vs. pytanie użytkownika
- Logi i powiadomienia

```javascript
// Sprawdzaj aktualizacje co 6 godzin
setInterval(() => {
  autoUpdater.checkForUpdatesAndNotify();
}, 6 * 60 * 60 * 1000);
```

### 8. Bezpieczeństwo

- Aktualizacje są weryfikowane przez GitHub
- Używane są oficjalne kanały dystrybucji
- Electron-updater automatycznie weryfikuje podpisy

### 9. Rozwiązywanie problemów

**Problem**: Aktualizacje nie są wykrywane
- Sprawdź czy `owner` i `repo` w package.json są poprawne
- Upewnij się, że releases są publiczne
- Sprawdź logi w DevTools (F12)

**Problem**: Błąd pobierania
- Sprawdź połączenie internetowe
- Upewnij się, że GitHub nie blokuje dostępu
- Sprawdź czy release zawiera odpowiednie pliki

**Problem**: Instalacja nie działa
- Upewnij się, że aplikacja ma uprawnienia do zapisu
- Sprawdź czy antywirus nie blokuje instalacji
- Uruchom jako administrator (Windows)