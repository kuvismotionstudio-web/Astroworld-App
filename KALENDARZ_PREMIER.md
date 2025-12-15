# 📅 Kalendarz Premier - AstroWorld

## Opis funkcji

Kalendarz Premier to nowa sekcja w aplikacji AstroWorld, która pozwala użytkownikom śledzić nadchodzące premiery gier.

## Funkcjonalności

### 🎮 **Wyświetlanie premier**
- **Widok listy** - Szczegółowe karty z informacjami o grach
- **Widok kalendarza** - Siatka kalendarza z oznaczonymi datami premier
- **Informacje o grach** - Okładki, opisy, gatunki, platformy, deweloperzy

### 🔍 **Filtrowanie**
- **Filtr miesiąca** - Wyświetlanie premier z konkretnego miesiąca
- **Filtr roku** - Premiery z wybranego roku
- **Filtr gatunku** - Gry z określonych kategorii (Akcja, RPG, Horror, itp.)

### 📊 **Statusy premier**
- **Dziś** - Gry, które mają premierę dzisiaj (czerwone oznaczenie)
- **Nadchodzące** - Przyszłe premiery z licznikiem dni
- **Przeszłe** - Już wydane gry (szare oznaczenie)

### 🔔 **Powiadomienia**
- **Powiadomienia systemowe** - Automatyczne przypomnienia o premierach
- **Toast notifications** - Powiadomienia w aplikacji
- **Sprawdzanie co godzinę** - Regularne kontrole nadchodzących premier

### 📤 **Eksport**
- **Eksport do ICS** - Możliwość wyeksportowania kalendarza do pliku .ics
- **Kompatybilność** - Plik można zaimportować do Google Calendar, Outlook, itp.

## Struktura plików

```
├── calendar_data.json          # Dane premier gier
├── covers/                     # Okładki gier
│   ├── gta6.jpg
│   ├── tes6.jpg
│   └── ...
├── locales/                    # Tłumaczenia
│   ├── pl.json                 # Polski
│   └── en.json                 # Angielski
└── KALENDARZ_PREMIER.md        # Ta dokumentacja
```

## Dodawanie nowych premier

Aby dodać nową premierę, edytuj plik `calendar_data.json`:

```json
{
  "name": "Nazwa Gry",
  "description": "Opis gry...",
  "releaseDate": "2025-12-31",
  "genres": ["Akcja", "RPG"],
  "platforms": ["PC", "PlayStation 5"],
  "developer": "Studio Deweloperskie",
  "publisher": "Wydawca",
  "coverImage": "covers/nazwa_gry.jpg",
  "trailerUrl": "https://youtube.com/...",
  "status": "upcoming",
  "hypeLevel": 4
}
```

## Obsługiwane gatunki

- **Akcja** - Gry akcji
- **RPG** - Gry fabularne
- **Strategia** - Gry strategiczne
- **Przygodowa** - Gry przygodowe
- **Horror** - Gry grozy
- **Indie** - Gry niezależne
- **Symulacja** - Symulatory
- **Sport** - Gry sportowe
- **Wyścigi** - Gry wyścigowe

## Obsługiwane platformy

- **PC** - Komputer osobisty
- **PlayStation 5** - Sony PlayStation 5
- **PlayStation** - Sony PlayStation (ogólnie)
- **Xbox Series X/S** - Microsoft Xbox Series X/S
- **Xbox** - Microsoft Xbox (ogólnie)
- **Nintendo Switch** - Nintendo Switch

## Integracja z Discord

Kalendarz Premier jest zintegrowany z Discord Rich Presence:
- Wyświetla status "Przegląda kalendarz premier"
- Pokazuje aktywność "Sprawdza nadchodzące gry"

## Wielojęzyczność

Kalendarz obsługuje tłumaczenia:
- **Polski** (pl) - Domyślny język
- **Angielski** (en) - Język alternatywny

## Responsywność

Kalendarz jest w pełni responsywny:
- **Desktop** - Pełna funkcjonalność
- **Tablet** - Dostosowany layout
- **Mobile** - Uproszczony widok

## Animacje

- **Fade in** - Płynne pojawianie się kart
- **Hover effects** - Efekty przy najechaniu
- **Pulse** - Pulsowanie dla pilnych premier
- **Smooth transitions** - Płynne przejścia między widokami

## Przyszłe ulepszenia

- [ ] Synchronizacja z zewnętrznymi API (Steam, Epic Games)
- [ ] Personalizowane powiadomienia
- [ ] Wishlist integration
- [ ] Social features (udostępnianie premier)
- [ ] Więcej formatów eksportu
- [ ] Integracja z kalendarzami mobilnymi

---

**Autor:** AstroWorld Team  
**Wersja:** 1.0.0  
**Data:** Grudzień 2025