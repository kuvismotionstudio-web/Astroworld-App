// === Lista darmowych gier ze Steama ===
const games = [
    // Ulepszona lista z większą ilością danych
    { name: "Counter-Strike 2", url: "https://store.steampowered.com/app/730/CounterStrike_2/", category: "fps", popularity: 1, cover: "https://cdn.akamai.steamstatic.com/steam/apps/730/header.jpg" },
    { name: "Dota 2", url: "https://store.steampowered.com/app/570/Dota_2/", category: "moba", popularity: 2, cover: "https://cdn.akamai.steamstatic.com/steam/apps/570/header.jpg" },
    { name: "Apex Legends", url: "https://store.steampowered.com/app/1172470/Apex_Legends/", category: "battle-royale", popularity: 3, cover: "https://cdn.akamai.steamstatic.com/steam/apps/1172470/header.jpg" },
    { name: "Warframe", url: "https://store.steampowered.com/app/230410/Warframe/", category: "mmorpg", popularity: 4, cover: "https://cdn.akamai.steamstatic.com/steam/apps/230410/header.jpg" },
    { name: "PUBG: Battlegrounds", url: "https://store.steampowered.com/app/578080/PUBG_BATTLEGROUNDS/", category: "battle-royale", popularity: 5, cover: "https://cdn.akamai.steamstatic.com/steam/apps/578080/header.jpg" },
    { name: "Valorant", url: "https://store.steampowered.com/app/1085660/Valorant/", category: "fps", popularity: 6, cover: "https://cdn.akamai.steamstatic.com/steam/apps/1085660/header.jpg" },
    { name: "EA SPORTS FC™ 24", url: "https://store.steampowered.com/app/1811260/EA_SPORTS_FC_24/", category: "sport", popularity: 7, cover: "https://cdn.akamai.steamstatic.com/steam/apps/1811260/header.jpg" }
  ];
  
  // === Elementy DOM ===
  const listEl = document.getElementById("freeToPlayList");
  const searchEl = document.getElementById("freeToPlaySearch");
  const categoryEl = document.getElementById("freeToPlayCategory");
  const sortEl = document.getElementById("freeToPlaySort");
  const noMessageEl = document.getElementById("noFreeToPlayMessage");

  // === Funkcja tworząca kartę gry F2P (podobna do createFileCard) ===
  function createF2PGameCard(game) {
    const fileCard = document.createElement('div');
    fileCard.className = 'file-card'; // Używamy tej samej klasy co główne karty

    const coverContainer = document.createElement('div');
    coverContainer.className = 'file-card-cover';

    const coverImg = document.createElement('img');
    coverImg.src = game.cover || './covers/placeholder.jpg'; // Użyj okładki lub placeholdera
    coverImg.alt = game.name;
    coverImg.className = 'file-card-img';
    coverImg.loading = 'lazy';
    coverImg.onerror = () => { coverImg.src = './covers/placeholder.jpg'; };
    coverContainer.appendChild(coverImg);

    const content = document.createElement('div');
    content.className = 'file-card-content';
    content.innerHTML = `
      <div>
        <h3 class="file-card-title">${game.name}</h3>
        <p class="file-card-desc">Kategoria: ${game.category}</p>
      </div>
      <div class="file-card-actions">
        <button class="file-card-btn download-btn"><i class="fab fa-steam"></i> Zagraj na Steam</button>
      </div>
    `;

    fileCard.appendChild(coverContainer);
    fileCard.appendChild(content);

    // Dodajemy obsługę kliknięcia na całą kartę i na przycisk
    fileCard.addEventListener('click', (e) => {
        if (e.target.closest('.download-btn')) return; // Jeśli kliknięto przycisk, nie rób nic więcej
        window.api.openLink(game.url);
    });
    fileCard.querySelector('.download-btn').addEventListener('click', () => window.api.openLink(game.url));
    return fileCard;
  }
  
  // === Funkcja renderująca gry ===
  function renderGames() {
    listEl.innerHTML = "";
    noMessageEl.classList.add("hidden");
  
    let filtered = games.filter(g =>
      g.name.toLowerCase().includes(searchEl.value.toLowerCase())
    );
  
    if (categoryEl.value !== "all") {
      filtered = filtered.filter(g => g.category === categoryEl.value);
    }
  
    switch (sortEl.value) {
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "popularity":
        filtered.sort((a, b) => a.popularity - b.popularity);
        break;
    }
  
    if (filtered.length === 0) {
      noMessageEl.classList.remove("hidden");
      return;
    }
  
    filtered.forEach(game => {
      const card = createF2PGameCard(game);
      listEl.appendChild(card);
    });
  }
  
  // === Eventy ===
  searchEl.addEventListener("input", renderGames);
  categoryEl.addEventListener("change", renderGames);
  sortEl.addEventListener("change", renderGames);
  
  // === Start ===
  renderGames();
  