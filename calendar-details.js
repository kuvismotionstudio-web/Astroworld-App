// Obsługa kliknięcia na kafelek gry w kalendarzu premier
// Otwiera modal szczegółów gry z danymi z atrybutów data-*



window.attachCalendarCardListeners = function attachCalendarCardListeners() {
  const list = document.querySelector('.release-list');
  if (!list) return;
  if (list._calendarListenerAttached) return; // zapobiegaj wielokrotnemu podpinaniu
  list._calendarListenerAttached = true;
  list.addEventListener('click', function (e) {
    const card = e.target.closest('.calendar-game-card');
    if (!card) return;
    const title = card.getAttribute('data-title') || '';
    const date = card.getAttribute('data-date') || '';
    const platforms = card.getAttribute('data-platforms') || '';
    const description = card.getAttribute('data-description') || '';
    const trailer = card.getAttribute('data-trailer') || '';
    const screenshots = (card.getAttribute('data-screenshots') || '').split(',');
    const minreq = card.getAttribute('data-minreq') || '';
    const recreq = card.getAttribute('data-recreq') || '';
    const developer = card.getAttribute('data-developer') || '';
    const publisher = card.getAttribute('data-publisher') || '';

    // Wypełnij modal szczegółów gry z kalendarza
    const modal = document.getElementById('calendarGameModal');
    if (!modal) return;
    document.getElementById('calendarModalGameTitle').textContent = title;
    document.getElementById('calendarModalGameDescription').textContent = description;
    document.getElementById('calendarModalGameReleaseDate').textContent = date;
    document.getElementById('calendarModalGameDeveloper').textContent = developer;
    document.getElementById('calendarModalGamePublisher').textContent = publisher;
    document.getElementById('calendarModalMinRequirements').textContent = minreq;
    document.getElementById('calendarModalRecRequirements').textContent = recreq;
    document.getElementById('calendarModalGamePlatforms').textContent = platforms;

    // Trailer
    const trailerDiv = document.getElementById('calendarModalGameTrailer');
    if (trailerDiv) {
      trailerDiv.innerHTML = trailer ? `<iframe width=\"100%\" height=\"260\" src=\"${trailer}\" frameborder=\"0\" allowfullscreen></iframe>` : '';
    }
    // Screeny
    const screenshotsDiv = document.getElementById('calendarModalGameScreenshots');
    if (screenshotsDiv) {
      screenshotsDiv.innerHTML = screenshots.filter(Boolean).map(url => `<img src=\"${url}\" style=\"max-width:120px;margin:4px;border-radius:8px;" loading=\"lazy\">`).join('');
    }
    // Pokaż modal
    modal.classList.remove('hidden');
    document.getElementById('calendarModalOverlay').classList.remove('hidden');
  });
}

// Po każdym załadowaniu/odkryciu sekcji kalendarza premier, dołącz listener
document.addEventListener('DOMContentLoaded', attachCalendarCardListeners);
// Gdy sekcja jest dynamicznie ładowana przez calendar.js, nasłuchuj na mutacje DOM
const observer = new MutationObserver(() => {
  attachCalendarCardListeners();
});
observer.observe(document.body, { childList: true, subtree: true });
