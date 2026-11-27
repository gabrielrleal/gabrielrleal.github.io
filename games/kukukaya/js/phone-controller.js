import { WITCH_CARDS, DESTINY_SEALS } from './data.js';
import { SoundFX } from './sound.js';
import { showToast, vibrateMobile, requestWakeLock, escapeHtml } from './utils.js';
import { downloadStoryCard } from './story-card.js';

export const Phone = {
  peer: null,
  conn: null,
  roomCode: '',
  playerIdx: -1,
  playerName: '',
  selectedSealId: '',

  openPhoneMode(prefillRoom = '') {
    document.getElementById('screen-landing').classList.add('hidden');
    document.getElementById('screen-phone').classList.remove('hidden');
    const codeInput = document.getElementById('input-room-code');
    const nameInput = document.getElementById('input-player-name');
    try {
      const saved = localStorage.getItem('kukukaya_name');
               if (saved) nameInput.value = saved;
    } catch (e) {}
    if (prefillRoom) {
      codeInput.value = prefillRoom.trim().toUpperCase().slice(0, 4);
      setTimeout(() => nameInput.focus(), 120);
    }
  },

  showView(viewId) {
    ['phone-view-join', 'phone-view-lobby', 'phone-view-step1', 'phone-view-step2', 'phone-view-step3', 'phone-view-wait', 'phone-view-vote', 'phone-view-gallery'].forEach(id => {
      document.getElementById(id).classList.add('hidden');
    });
    document.getElementById(viewId).classList.remove('hidden');
  },

  renderSealSelector() {
    const grid = document.getElementById('phone-seal-grid');
    grid.innerHTML = '';
    grid.setAttribute('role', 'radiogroup');
    grid.setAttribute('aria-label', 'Selo do destino');
    this.selectedSealId = '';
    DESTINY_SEALS.forEach(seal => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-pressed', 'false');
      btn.setAttribute('aria-label', seal.title);
      btn.className = 'seal-btn rounded-xl p-2 flex flex-col items-center justify-center gap-0.5 cursor-pointer';
      btn.innerHTML = `<span class="text-xl leading-none" aria-hidden="true">${seal.icon}</span><span class="text-[9px] font-mono-code uppercase truncate w-full text-center">${seal.title}</span>`;
      btn.onclick = () => {
        vibrateMobile(30);
        this.selectedSealId = seal.id;
        grid.querySelectorAll('.seal-btn').forEach(b => {
          b.classList.remove('selected');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('selected');
        btn.setAttribute('aria-pressed', 'true');
      };
      grid.appendChild(btn);
    });
  },

  joinRoom() {
    SoundFX.init();
    requestWakeLock();
    const code = document.getElementById('input-room-code').value.trim().toUpperCase();
    const name = document.getElementById('input-player-name').value.trim();
    if (code.length !== 4) return showToast('Digite o código de 4 letras exibido na TV.');
    if (!name) return showToast('Digite seu nome para entrar na mesa.');

    this.roomCode = code;
    this.playerName = name;
    try { localStorage.setItem('kukukaya_name', name); } catch (e) {}

    const btn = document.getElementById('btn-join-room');
    btn.disabled = true;
    btn.textContent = 'Conectando à Bruxa...';
    this.peer = new Peer();
    this.peer.on('open', () => {
      this.conn = this.peer.connect('kukukaya-' + code, { reliable: true });
      this.conn.on('open', () => this.conn.send({ type: 'join', name }));
      this.conn.on('data', msg => this.handleHostMessage(msg));
      this.conn.on('error', () => {
        showToast('Erro de conexão com a TV. Confira o código.');
        btn.disabled = false;
        btn.textContent = '🔮 Entrar no Ritual';
      });
    });
    this.peer.on('error', err => {
      showToast('Sala não encontrada (' + err.type + '). Confira o código na TV.');
      btn.disabled = false;
      btn.textContent = '🔮 Entrar no Ritual';
    });
  },

  send(payload) {
    if (this.conn && this.conn.open) this.conn.send(payload);
  },

  handleHostMessage(msg) {
    if (!msg || !msg.type) return;
    if (msg.type === 'error') {
      showToast(msg.message);
      const btn = document.getElementById('btn-join-room');
      btn.disabled = false;
      btn.textContent = '🔮 Entrar no Ritual';
      return;
    }
    if (msg.type === 'joined') {
      this.playerIdx = msg.playerIdx;
      this.playerName = msg.name;
      document.getElementById('phone-player-badge').textContent = `${msg.name} • Sala ${msg.roomCode}`;
      vibrateMobile(80);
      this.showView('phone-view-lobby');
    }
    if (msg.type === 'lobby_update') {
      document.getElementById('phone-lobby-msg').textContent = msg.count < 4
        ? `${msg.count} de 4 jogadores conectados. Aguardando o círculo fechar...`
        : 'Os 4 jogadores estão na mesa! O ritual já pode começar.';
      const wrap = document.getElementById('phone-host-start-wrap');
      if (msg.canStart) wrap.classList.remove('hidden');
      else wrap.classList.add('hidden');
    }
    if (msg.type === 'timer_sync') {
      document.getElementById('phone-timer-pill').classList.remove('hidden');
      document.getElementById('phone-timer-val').textContent = msg.timeLeft;
    }
    if (msg.type === 'phase_step1') {
      vibrateMobile([90, 60, 90]);
      document.getElementById('phone-s1-emojis').textContent = `${msg.emojis[0]} ${msg.emojis[1]}`;
      document.getElementById('input-card-name').value = '';
      document.getElementById('input-secret-question').value = '';
      document.getElementById('phone-timer-pill').classList.remove('hidden');
      document.getElementById('phone-timer-val').textContent = msg.timeLeft;
      this.showView('phone-view-step1');
    }
    if (msg.type === 'phase_step2') {
      vibrateMobile([90, 60, 90]);
      document.getElementById('phone-s2-emojis').textContent = `${msg.emojis[0]} ${msg.emojis[1]}`;
      document.getElementById('phone-s2-name').textContent = msg.cardName;
      document.getElementById('input-start-text').value = '';
      document.getElementById('phone-timer-pill').classList.remove('hidden');
      document.getElementById('phone-timer-val').textContent = msg.timeLeft;
      this.showView('phone-view-step2');
    }
    if (msg.type === 'phase_step3') {
      vibrateMobile([120, 60, 120]);
      const bridge = WITCH_CARDS.find(w => w.id === msg.bridgeId) || WITCH_CARDS[0];
      document.getElementById('phone-s3-emojis').textContent = `${msg.emojis[0]} ${msg.emojis[1]}`;
      document.getElementById('phone-s3-name').textContent = msg.cardName;
      document.getElementById('phone-s3-start').textContent = `“${msg.startText}”`;
      document.getElementById('phone-s3-bridge-svg').innerHTML = '';
      document.getElementById('phone-s3-bridge-svg').textContent = bridge.icon || '✨';
      document.getElementById('phone-s3-bridge-title').textContent = bridge.title;
      document.getElementById('phone-s3-bridge-word').textContent = bridge.word;
      document.getElementById('input-end-text').value = '';
      document.getElementById('phone-timer-pill').classList.remove('hidden');
      document.getElementById('phone-timer-val').textContent = msg.timeLeft;
      this.renderSealSelector();
      this.showView('phone-view-step3');
    }
    if (msg.type === 'phase_wait') {
      document.getElementById('phone-timer-pill').classList.add('hidden');
      document.getElementById('phone-wait-title').textContent = msg.title || 'Olhe para a TV!';
      document.getElementById('phone-wait-sub').textContent = msg.sub || '';
      this.showView('phone-view-wait');
    }
    if (msg.type === 'phase_vote') {
      vibrateMobile(140);
      document.getElementById('phone-timer-pill').classList.add('hidden');
      const list = document.getElementById('phone-vote-list');
      list.innerHTML = '';
      msg.readings.forEach(r => {
        const isMine = r.endAuthorIdx === msg.myIdx;
        const seal = DESTINY_SEALS.find(s => s.id === r.sealId) || DESTINY_SEALS[0];
        const btn = document.createElement('button');
        btn.disabled = isMine;
        btn.className = `text-left rounded-2xl p-4 border ${isMine ? 'bg-[#101322] border-amber-500/15 opacity-50 cursor-not-allowed' : 'xilo-card-tarot hover:border-amber-300 cursor-pointer active:scale-[0.98]'}`;
        btn.innerHTML = `<div class="flex justify-between items-center text-xs font-mono-code text-amber-300"><span class="truncate">${escapeHtml(r.targetName)}</span><span class="text-lg">${r.emojis[0]}${r.emojis[1]} ${seal.icon}</span></div><p class="text-xs italic text-[#f4ecd8]/65 mb-1.5">“${escapeHtml(r.question)}”</p><p class="font-serif-drama text-sm text-[#f4ecd8] leading-snug">“${escapeHtml(r.startText)} <strong class="text-amber-300">${escapeHtml(r.bridge.word)}</strong> ${escapeHtml(r.endText)}”</p>${isMine ? '<div class="text-[11px] font-mono-code text-amber-400/75 mt-2">🔒 Você fechou esta profecia</div>' : ''}`;
        if (!isMine) {
          btn.onclick = () => {
            vibrateMobile(60);
            this.send({ type: 'submit_vote', cardIdx: r.idx });
            document.getElementById('phone-wait-title').textContent = 'Voto Registrado!';
            document.getElementById('phone-wait-sub').textContent = 'Olhe para a TV para ver o resultado!';
            this.showView('phone-view-wait');
          };
        }
        list.appendChild(btn);
      });
      this.showView('phone-view-vote');
    }
    if (msg.type === 'phase_gallery') {
      vibrateMobile(100);
      document.getElementById('phone-timer-pill').classList.add('hidden');
      const list = document.getElementById('phone-gallery-list');
      list.innerHTML = '';
      msg.readings.forEach(r => {
        const seal = DESTINY_SEALS.find(s => s.id === r.sealId) || DESTINY_SEALS[0];
        const card = document.createElement('div');
        card.className = 'xilo-card-tarot rounded-xl p-4';
        card.innerHTML = `<div class="flex justify-between items-center text-xs font-mono-code text-amber-300"><span>Sorte de ${escapeHtml(r.targetName)}</span><span class="text-lg">${r.emojis[0]}${r.emojis[1]} ${seal.icon}</span></div><p class="text-xs italic text-[#f4ecd8]/70 mb-1">“${escapeHtml(r.question)}”</p><p class="font-serif-drama text-sm text-[#f4ecd8] mb-3">“${escapeHtml(r.startText)} <strong class="text-amber-300">${escapeHtml(r.bridge.word)}</strong> ${escapeHtml(r.endText)}”</p>`;
        const btn = document.createElement('button');
        btn.className = 'btn-gold w-full py-2.5 rounded-xl text-xs font-mono-code cursor-pointer';
        btn.textContent = '📸 Baixar Carta 9:16 (PNG para Story)';
        btn.onclick = () => downloadStoryCard(r);
        card.appendChild(btn);
        list.appendChild(card);
      });
      this.showView('phone-view-gallery');
    }
  }
};
