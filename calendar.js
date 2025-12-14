// Ta funkcja będzie wywoływana z pliku script.js, gdy sekcja kalendarza zostanie pokazana.
function renderReleaseCalendar() {
    const releaseList = document.getElementById('release-list');
    if (!releaseList) {
        console.error('Błąd kalendarza: Nie znaleziono elementu #release-list.');
        return;
    }

    // Jeśli lista jest już wypełniona, nie renderuj jej ponownie, aby uniknąć migotania.
    if (releaseList.hasAttribute('data-rendered')) {
        return;
    }

    // Przykładowe dane premier.
    const upcomingReleases = [
        {
            name: "S.T.A.L.K.E.R. 2: Heart of Chornobyl",
            releaseDate: "2025-09-05",
            description: "Długo wyczekiwana kontynuacja kultowej serii, oferująca ogromny, otwarty świat w Zonie.",
            platforms: ["PC", "Xbox"]
        },
        {
            name: "The Precinct",
            releaseDate: "2025-08-15",
            description: "Neon-noirowy sandbox policyjny, w którym wcielasz się w funkcjonariusza patrolującego Averno City.",
            platforms: ["PC", "PlayStation", "Xbox"]
        },
        {
            name: "inZOI",
            releaseDate: "2025-10-25",
            description: "Nowy symulator życia od Krafton, który ma konkurować z serią The Sims.",
            platforms: ["PC"]
        },
        {
            name: "Assassin's Creed Codename Red",
            releaseDate: "2025-11-11",
            description: "Kolejna odsłona serii Assassin's Creed, tym razem osadzona w feudalnej Japonii.",
            platforms: ["PC", "PlayStation", "Xbox"]
        },
        {
            name: "The Witcher 4 (Polaris)",
            releaseDate: "2025-12-05",
            description: "Początek nowej sagi w uniwersum Wiedźmina, tworzony na silniku Unreal Engine 5.",
            platforms: ["PC", "PlayStation", "Xbox"]
        }
    ];

    // Mapowanie ikon dla platform (można to przenieść do wspólnego pliku)
    const iconMap = {
        'PC': 'fas fa-desktop',
        'PlayStation': 'fab fa-playstation',
        'Xbox': 'fab fa-xbox',
        'Nintendo Switch': 'fas fa-gamepad',
        'default': 'fas fa-gamepad'
    };

    // Sortuj premiery od najwcześniejszej do najpóźniejszej
    const sortedReleases = upcomingReleases.sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate));

    releaseList.innerHTML = sortedReleases.map(release => {
        const date = new Date(release.releaseDate);
        const formattedDate = date.toLocaleDateString('pl-PL', { day: '2-digit', month: 'long', year: 'numeric' });

        const platformIcons = release.platforms.map(platform => {
            const iconClass = iconMap[platform] || iconMap['default'];
            return `<i class="${iconClass}" title="${platform}"></i>`;
        }).join('');

        return `
            <li class="release-card">
                <div class="release-card-content">
                    <h3>${release.name}</h3>
                    <div class="release-date">${formattedDate}</div>
                    <p>${release.description}</p>
                    <div class="platform-icons">
                        ${platformIcons}
                    </div>
                </div>
            </li>
        `;
    }).join('');

    // Oznacz listę jako wyrenderowaną, aby uniknąć ponownego renderowania
    releaseList.setAttribute('data-rendered', 'true');
}

// Upublicznij funkcję, aby script.js mógł ją wywołać.
window.renderCalendar = renderReleaseCalendar;

