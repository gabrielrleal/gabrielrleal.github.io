const GAMES_URL = './games.json';

const launcher = document.getElementById('launcher');
const stage = document.getElementById('game-stage');
const frame = document.getElementById('game-frame');
const grid = document.getElementById('game-grid');

function isValidGame(game) {
  return game && typeof game.id === 'string' && /^[a-z0-9-]+$/i.test(game.id)
    && typeof game.title === 'string' && game.title.trim()
    && typeof game.description === 'string'
    && typeof game.icon === 'string'
    && typeof game.path === 'string' && /^\.\/[\w./-]+\.html$/i.test(game.path)
    && typeof game.enabled === 'boolean';
}

function openGame(game) {
  if (!isValidGame(game)) return;
  frame.src = game.path;
  launcher.classList.add('hidden');
  stage.classList.remove('hidden');
  frame.focus();
  history.replaceState({ game: game.id }, '', `#jogo=${encodeURIComponent(game.id)}`);
}

function closeGame() {
  frame.src = 'about:blank';
  stage.classList.add('hidden');
  launcher.classList.remove('hidden');
  history.replaceState({}, '', location.pathname);
  const card = document.querySelector('.game-card');
  card?.focus();
}

function renderGames(games) {
  grid.replaceChildren();

  if (!Array.isArray(games)) {
    throw new TypeError('O catálogo de jogos é inválido');
  }

  const validGames = games.filter(isValidGame);
  const ids = new Set(validGames.map(game => game.id));
  if (ids.size !== validGames.length) {
    throw new TypeError('O catálogo contém IDs duplicados');
  }

  validGames.filter(game => game.enabled).forEach(game => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'game-card';

    const icon = document.createElement('span');
    icon.className = 'game-card__icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = game.icon;

    const title = document.createElement('h2');
    title.textContent = game.title;

    const description = document.createElement('p');
    description.textContent = game.description;

    card.append(icon, title, description);
    card.addEventListener('click', () => openGame(game));
    grid.appendChild(card);
  });

  if (!validGames.some(game => game.enabled)) {
    const empty = document.createElement('p');
    empty.textContent = 'Nenhum jogo disponível no momento.';
    grid.appendChild(empty);
  }
}

async function init() {
  try {
    const response = await fetch(GAMES_URL, { cache: 'no-store' });
    if (!response.ok) throw new Error('Não foi possível carregar os jogos');

    const games = await response.json();
    renderGames(games);

    const selectedId = new URLSearchParams(location.hash.slice(1)).get('jogo');
    const selected = Array.isArray(games)
      ? games.find(game => isValidGame(game) && game.enabled && game.id === selectedId)
      : null;
    if (selected) {
      openGame(selected);
    } else {
      document.querySelector('.game-card')?.focus();
    }
  } catch (error) {
    grid.replaceChildren();
    const message = document.createElement('p');
    message.textContent = 'Não foi possível abrir a central de jogos.';
    grid.appendChild(message);
    console.error(error);
  }
}

document.getElementById('fullscreen-button').addEventListener('click', async () => {
  try {
    await document.documentElement.requestFullscreen?.();
  } catch (error) {
    console.warn(error);
  }
});

const BACK_KEYS = new Set(['Escape', 'BrowserBack', 'XF86Back']);

function handleLauncherArrows(key) {
  const focusables = Array.from(document.querySelectorAll('#fullscreen-button, .game-card'))
    .filter(el => el.offsetParent !== null);
  if (!focusables.length) return;

  const currentIndex = focusables.indexOf(document.activeElement);
  if (currentIndex === -1) {
    focusables[0].focus();
    return;
  }

  const delta = (key === 'ArrowRight' || key === 'ArrowDown') ? 1 : -1;
  const nextIndex = (currentIndex + delta + focusables.length) % focusables.length;
  focusables[nextIndex].focus();
}

window.addEventListener('keydown', event => {
  const stageOpen = !stage.classList.contains('hidden');
  if (stageOpen) {
    if (BACK_KEYS.has(event.key) || event.key === 'Backspace') {
      event.preventDefault();
      closeGame();
    }
    return;
  }

  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    event.preventDefault();
    handleLauncherArrows(event.key);
  }
});
window.addEventListener('message', event => {
  if (event.source !== frame.contentWindow) return;
  if (event.origin !== location.origin && event.origin !== 'null') return;
  if (event.data?.type === 'kukukaya:close' || event.data?.type === 'arcana:close') closeGame();
});

init();
