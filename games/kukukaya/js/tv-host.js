import {
  WITCH_CARDS,
  DESTINY_SEALS,
  SECRET_QUESTIONS,
  BOT_NAMES,
  BOT_CARD_NAMES,
  BOT_STARTS,
  BOT_ENDS,
  STEP_DURATION
} from './data.js';
import { SoundFX } from './sound.js';
import {
  showToast,
  randomItem,
  generateRoomCode,
  drawTwoRealmEmojis,
  escapeHtml,
  isEmbeddedOrLocal,
  getPublicInviteUrl,
  Typewriter
} from './utils.js';
import { downloadStoryCard } from './story-card.js';

export const TV = {
  peer: null,
  roomCode: '',
  round: 1,
  phase: 'lobby',
  phaseStartedAt: 0,
  transitionPending: false,
  minWritingPhaseMs: 3500,
  players: [],
  cards: [],
  timer: null,
  timeLeft: 0,
  revealCardIdx: 0,
  revealTempo: 0, // 0=abertura, 1=Presságio, 2=Bruxa, 3=Destino
  autoReveal: false,
  autoRevealTimer: null,
  phaseController: null,

  startHost() {
    if (window.KukukayaState) {
      this.phaseController = new window.KukukayaState.TvPhaseController({
        lobby: 'tv-view-lobby',
        step1: 'tv-view-writing',
        step2: 'tv-view-writing',
        step3: 'tv-view-writing',
        reveal: 'tv-view-reveal',
        voting: 'tv-view-voting',
        results: 'tv-view-results'
      });
      this.phaseController.onChange = (phase) => { this.phase = phase; };
    }

    SoundFX.init();
    document.getElementById('screen-landing').classList.add('hidden');
    document.getElementById('screen-tv').classList.remove('hidden');

    this.roomCode = generateRoomCode();
    document.getElementById('tv-room-code-header').textContent = this.roomCode;
    document.getElementById('tv-room-code-big').textContent = this.roomCode;

    // Mostra botão de configurar link apenas se estiver em iframe (Google Sites) ou file://
    if (isEmbeddedOrLocal()) {
      document.getElementById('btn-config-url').classList.remove('hidden');
    }

    this.renderQRCode();
    this.renderLobbySlots();
    this.initPeer();
  },

  initPeer() {
    const statusEl = document.getElementById('tv-peer-status');
    statusEl.textContent = 'Conectando à rede PeerJS...';

    try {
      this.peer = new Peer('kukukaya-' + this.roomCode, { debug: 1 });
    } catch (e) {
      statusEl.textContent = 'Erro ao iniciar PeerJS. Recarregue a página.';
      return;
    }

    this.peer.on('open', () => {
      statusEl.textContent = '● Portal P2P ativo! Aguardando celulares...';
    });

    this.peer.on('error', (err) => {
      if (err.type === 'unavailable-id') {
        this.roomCode = generateRoomCode();
        document.getElementById('tv-room-code-header').textContent = this.roomCode;
        document.getElementById('tv-room-code-big').textContent = this.roomCode;
        this.renderQRCode();
        this.initPeer();
      } else {
        statusEl.textContent = 'Aviso PeerJS: ' + err.type;
      }
    });

    this.peer.on('connection', (conn) => {
      conn.on('data', (msg) => this.handlePlayerMessage(conn, msg));
      conn.on('close', () => {
        const p = this.players.find(pl => pl.conn === conn);
        if (p) showToast(`${p.name} desconectou momentaneamente.`);
      });
    });
  },

  renderQRCode() {
    const qrContainer = document.getElementById('tv-qrcode');
    qrContainer.innerHTML = '';
    const inviteUrl = getPublicInviteUrl(this.roomCode);

    const hintEl = document.getElementById('tv-qr-hint');
    hintEl.textContent = inviteUrl;

    try {
      new QRCode(qrContainer, {
        text: inviteUrl,
        width: 192,
        height: 192,
        colorDark: '#090b14',
        colorLight: '#f4ecd8',
        correctLevel: QRCode.CorrectLevel.M
      });
    } catch (e) {
      qrContainer.innerHTML = `<p class="text-xs text-amber-300">Código: ${this.roomCode}</p>`;
    }
  },

  sendToPlayer(player, payload) {
    if (player && !player.isBot && player.conn && player.conn.open) {
      try { player.conn.send(payload); } catch (e) {}
    }
  },

  broadcast(payload) {
    this.players.forEach(p => this.sendToPlayer(p, payload));
  },

  handlePlayerMessage(conn, msg) {
    if (!msg || !msg.type) return;

    const senderIdx = this.players.findIndex(p => p.conn === conn);

    if (msg.type === 'join') {
      const cleanName = (msg.name || 'Viajante').trim().slice(0, 16) || 'Viajante';
      const existing = this.players.find(p => !p.isBot && p.name.toLowerCase() === cleanName.toLowerCase());
      if (existing) {
        if (existing.id !== conn.peer) {
          conn.send({ type: 'error', message: 'Este nome já está sendo usado na mesa.' });
          return;
        }
        existing.conn = conn;
        const idx = this.players.indexOf(existing);
        this.sendToPlayer(existing, {
          type: 'joined',
          playerIdx: idx,
          name: existing.name,
          isLeader: idx === 0,
          roomCode: this.roomCode
        });
        showToast(`${existing.name} reconectou à mesa!`);
        this.syncSinglePlayer(idx);
        return;
      }

      if (this.players.length >= 4) {
        conn.send({ type: 'error', message: 'A mesa já está cheia (4 jogadores).' });
        return;
      }

      const newPlayer = {
        id: conn.peer,
        name: cleanName,
        isBot: false,
        conn,
        score: 0,
        question: '',
        submitted: false
      };
      this.players.push(newPlayer);
      const idx = this.players.length - 1;

      SoundFX.playCardFlip();
      this.sendToPlayer(newPlayer, {
        type: 'joined',
        playerIdx: idx,
        name: newPlayer.name,
        isLeader: idx === 0,
        roomCode: this.roomCode
      });

      this.renderLobbySlots();
      this.notifyLobbyReady();
    }

    if (msg.type === 'host_start_from_phone') {
      if (senderIdx === 0 && this.players.length === 4 && this.phase === 'lobby') {
        this.startRound();
      }
    }

    if (msg.type === 'submit_step1' && this.phase === 'step1') {
      const p = this.players[senderIdx];
      if (senderIdx < 0 || !p || p.submitted) return;
      this.cards[senderIdx].cardName = (msg.cardName || '').trim() || randomItem(BOT_CARD_NAMES);
      p.question = (msg.question || '').trim() || randomItem(SECRET_QUESTIONS);
      p.submitted = true;
      SoundFX.playCardFlip();
      this.updateWritingStatusUI();
      this.checkAllSubmitted(() => this.startStep2());
    }

    if (msg.type === 'submit_step2' && this.phase === 'step2') {
      const p = this.players[senderIdx];
      if (senderIdx < 0 || !p || p.submitted) return;
      const cardIdx = (senderIdx + 3) % 4;
      this.cards[cardIdx].startText = (msg.startText || '').trim() || randomItem(BOT_STARTS);
      p.submitted = true;
      SoundFX.playCardFlip();
      this.updateWritingStatusUI();
      this.checkAllSubmitted(() => this.startStep3());
    }

    if (msg.type === 'submit_step3' && this.phase === 'step3') {
      const p = this.players[senderIdx];
      if (senderIdx < 0 || !p || p.submitted) return;
      const cardIdx = (senderIdx + 2) % 4;
      this.cards[cardIdx].endText = (msg.endText || '').trim() || randomItem(BOT_ENDS);
      if (msg.sealId && DESTINY_SEALS.some(s => s.id === msg.sealId)) {
        this.cards[cardIdx].sealId = msg.sealId;
      }
      p.submitted = true;
      SoundFX.playCardFlip();
      this.updateWritingStatusUI();
      this.checkAllSubmitted(() => this.startRevealPhase());
    }

    if (msg.type === 'submit_vote' && this.phase === 'voting') {
      const p = this.players[senderIdx];
      if (senderIdx < 0 || !p || p.submitted) return;
      const votedCard = this.cards[msg.cardIdx];
      if (votedCard && votedCard.endAuthorIdx !== senderIdx) {
        votedCard.votes += 1;
        p.submitted = true;
        SoundFX.playCardFlip();
        const totalVotes = this.players.filter(pl => pl.submitted).length;
        document.getElementById('tv-votes-count').textContent = totalVotes;
        this.checkAllSubmitted(() => this.finishVoting());
      }
    }
  },

  syncSinglePlayer(idx) {
    const p = this.players[idx];
    if (!p || p.isBot) return;
    if (this.phase === 'lobby') this.notifyLobbyReady();
    else if (this.phase === 'step1' && !p.submitted)
      this.sendToPlayer(p, { type: 'phase_step1', emojis: this.cards[idx].emojis, timeLeft: this.timeLeft });
    else if (this.phase === 'step2' && !p.submitted) {
      const c = this.cards[(idx + 3) % 4];
      this.sendToPlayer(p, { type: 'phase_step2', emojis: c.emojis, cardName: c.cardName, timeLeft: this.timeLeft });
    } else if (this.phase === 'step3' && !p.submitted) {
      const c = this.cards[(idx + 2) % 4];
      this.sendToPlayer(p, { type: 'phase_step3', emojis: c.emojis, cardName: c.cardName, startText: c.startText, bridgeId: c.bridge.id, timeLeft: this.timeLeft });
    } else if (this.phase === 'reveal')
      this.sendToPlayer(p, { type: 'phase_wait', title: 'Olhe para a TV!', sub: 'A Bruxa está virando as cartas!' });
    else if (this.phase === 'voting' && !p.submitted)
      this.sendToPlayer(p, { type: 'phase_vote', readings: this.getReadingsPayload(), myIdx: idx });
    else if (this.phase === 'results')
      this.sendToPlayer(p, { type: 'phase_gallery', readings: this.getReadingsPayload() });
  },

  fillWithBots() {
    SoundFX.init();
    let botIdx = 0;
    while (this.players.length < 4) {
      const name = BOT_NAMES[botIdx % BOT_NAMES.length];
      botIdx++;
      if (this.players.some(p => p.name.startsWith(name))) continue;
      this.players.push({ id: 'bot-' + Math.random().toString(36).slice(2, 7), name: name + ' (Bot)', isBot: true, conn: null, score: 0, question: '', submitted: false });
    }
    this.renderLobbySlots();
    this.notifyLobbyReady();
    showToast('Círculo completo com Bots! Pronto para iniciar o ritual.');
  },

  renderLobbySlots() {
    const container = document.getElementById('tv-lobby-slots');
    container.innerHTML = '';
    for (let i = 0; i < 4; i++) {
      const p = this.players[i];
      const div = document.createElement('div');
      if (p) {
        div.className = 'xilo-card-tarot rounded-xl p-4 text-center anim-fade';
        div.innerHTML = `<div class="text-3xl mb-2">${p.isBot ? '🤖' : '🧙'}</div><div class="font-serif-drama font-bold text-amber-300 text-sm truncate">${escapeHtml(p.name)}</div><div class="text-[10px] font-mono-code text-emerald-400 uppercase mt-1">Conectado</div>`;
      } else {
        div.className = 'rounded-xl border-2 border-dashed border-amber-500/25 bg-[#111527]/50 p-4 text-center flex flex-col items-center justify-center min-h-[122px]';
        div.innerHTML = `<div class="text-2xl opacity-30 mb-1">✦</div><div class="text-xs font-mono-code text-[#f4ecd8]/40">Lugar ${i + 1}</div>`;
      }
      container.appendChild(div);
    }
    const btnStart = document.getElementById('btn-start-ritual');
    btnStart.textContent = `🕯️ Começar Ritual (${this.players.length}/4)`;
    btnStart.disabled = this.players.length < 4;
  },

  notifyLobbyReady() {
    this.players.forEach((p, idx) => this.sendToPlayer(p, {
      type: 'lobby_update', count: this.players.length,
      canStart: idx === 0 && this.players.length === 4
    }));
  },

  showTvView(viewId) {
    ['tv-view-lobby', 'tv-view-writing', 'tv-view-reveal', 'tv-view-voting', 'tv-view-results'].forEach(id => {
      document.getElementById(id).classList.add('hidden');
    });
    document.getElementById(viewId).classList.remove('hidden');
  },

  updateWritingStatusUI() {
    const container = document.getElementById('tv-writing-status');
    container.innerHTML = '';
    this.players.forEach(p => {
      const div = document.createElement('div');
      div.className = `rounded-xl p-4 border ${p.submitted ? 'bg-emerald-950/40 border-emerald-400/60' : 'bg-[#121629] border-amber-500/25'}`;
      div.innerHTML = `<div class="text-2xl mb-1">${p.submitted ? '✅' : '✍️'}</div><div class="font-serif-drama font-bold text-sm truncate text-[#f4ecd8]">${escapeHtml(p.name)}</div><div class="text-[11px] font-mono-code mt-1 ${p.submitted ? 'text-emerald-300' : 'text-amber-300/70'}">${p.submitted ? 'Pronto!' : 'Escrevendo...'}</div>`;
      container.appendChild(div);
    });
  },

  startTimer(seconds, onExpire) {
    clearInterval(this.timer);
    this.timeLeft = seconds;
    const el = document.getElementById('tv-timer-display');
    el.textContent = this.timeLeft;
    this.broadcast({ type: 'timer_sync', timeLeft: this.timeLeft });

    this.timer = setInterval(() => {
      this.timeLeft--;
      el.textContent = Math.max(0, this.timeLeft);
      if (this.timeLeft <= 5 && this.timeLeft > 0) SoundFX.playTick();
      if (this.timeLeft % 3 === 0 || this.timeLeft <= 5) {
        this.broadcast({ type: 'timer_sync', timeLeft: Math.max(0, this.timeLeft) });
      }
      if (this.timeLeft <= 0) {
        clearInterval(this.timer);
        onExpire();
      }
    }, 1000);
  },

  checkAllSubmitted(nextFn) {
    if (this.players.every(p => p.submitted) && !this.transitionPending) {
      this.transitionPending = true;
      clearInterval(this.timer);
      const elapsed = Date.now() - this.phaseStartedAt;
      const remaining = Math.max(600, this.minWritingPhaseMs - elapsed);
      setTimeout(nextFn, remaining);
    }
  },

  setPhase(nextPhase) {
    if (this.phaseController) {
      this.phaseController.setPhase(nextPhase);
    } else {
      this.phase = nextPhase;
      this.showTvView(nextPhase === 'lobby' ? 'tv-view-lobby'
        : nextPhase === 'reveal' ? 'tv-view-reveal'
        : nextPhase === 'voting' ? 'tv-view-voting'
        : nextPhase === 'results' ? 'tv-view-results'
        : 'tv-view-writing');
    }
  },

  /* --- PASSO 1 --- */
  startRound() {
    SoundFX.init();
    SoundFX.playDrum(95);
    this.setPhase('step1');
    this.phaseStartedAt = Date.now();
    this.transitionPending = false;
    document.getElementById('tv-round-badge').textContent = `Rodada ${this.round} • Mesa da Bruxa`;

    const bridges = [...WITCH_CARDS].sort(() => Math.random() - 0.5).slice(0, 4);
    const seals = [...DESTINY_SEALS].sort(() => Math.random() - 0.5).slice(0, 4);

    this.cards = [0, 1, 2, 3].map(i => ({
      idx: i,
      emojis: drawTwoRealmEmojis(),
      creatorIdx: i,
      cardName: '',
      startAuthorIdx: (i + 1) % 4,
      startText: '',
      bridge: bridges[i],
      endAuthorIdx: (i + 2) % 4,
      endText: '',
      sealId: seals[i].id,
      targetIdx: (i + 3) % 4,
      votes: 0
    }));

    this.players.forEach(p => { p.submitted = false; p.question = ''; });

    document.getElementById('tv-step-tag').textContent = 'Passo 1 de 4';
    document.getElementById('tv-step-title').textContent = 'O Presságio';
    document.getElementById('tv-step-desc').textContent =
      'No celular: batize sua carta de tarô e faça sua Pergunta Secreta à Bruxa.';
    this.updateWritingStatusUI();

    this.players.forEach((p, idx) => {
      if (p.isBot) {
        setTimeout(() => {
          if (this.phase !== 'step1' || p.submitted) return;
          this.cards[idx].cardName = BOT_CARD_NAMES[(idx + this.round * 2) % BOT_CARD_NAMES.length];
          p.question = randomItem(SECRET_QUESTIONS);
          p.submitted = true;
          this.updateWritingStatusUI();
          this.checkAllSubmitted(() => this.startStep2());
        }, 850 + idx * 380);
      } else {
        this.sendToPlayer(p, {
          type: 'phase_step1',
          emojis: this.cards[idx].emojis,
          timeLeft: STEP_DURATION
        });
      }
    });

    this.startTimer(STEP_DURATION, () => {
      this.players.forEach((p, idx) => {
        if (!p.submitted) {
          this.cards[idx].cardName = randomItem(BOT_CARD_NAMES);
          p.question = randomItem(SECRET_QUESTIONS);
          p.submitted = true;
        }
      });
      showToast('Tempo esgotado! A Bruxa completou as cartas pendentes.');
      this.startStep2();
    });
  },

  /* --- PASSO 2 --- */
  startStep2() {
    SoundFX.playDrum(100);
    this.setPhase('step2');
    this.phaseStartedAt = Date.now();
    this.transitionPending = false;
    this.players.forEach(p => { p.submitted = false; });

    document.getElementById('tv-step-tag').textContent = 'Passo 2 de 4';
    document.getElementById('tv-step-title').textContent = 'O Início';
    document.getElementById('tv-step-desc').textContent =
      'As cartas giraram no círculo! Escreva uma frase livre sobre a carta que caiu no seu celular.';
    this.updateWritingStatusUI();

    this.players.forEach((p, idx) => {
      const cardIdx = (idx + 3) % 4;
      const c = this.cards[cardIdx];
      if (p.isBot) {
        setTimeout(() => {
          if (this.phase !== 'step2' || p.submitted) return;
          c.startText = BOT_STARTS[(idx + this.round) % BOT_STARTS.length];
          p.submitted = true;
          this.updateWritingStatusUI();
          this.checkAllSubmitted(() => this.startStep3());
        }, 850 + idx * 380);
      } else {
        this.sendToPlayer(p, {
          type: 'phase_step2',
          emojis: c.emojis,
          cardName: c.cardName,
          timeLeft: STEP_DURATION
        });
      }
    });

    this.startTimer(STEP_DURATION, () => {
      this.players.forEach((p, idx) => {
        if (!p.submitted) {
          const cardIdx = (idx + 3) % 4;
          this.cards[cardIdx].startText = randomItem(BOT_STARTS);
          p.submitted = true;
        }
      });
      showToast('Tempo esgotado! Seguindo para as Cartas da Bruxa.');
      this.startStep3();
    });
  },

  /* --- PASSO 3 --- */
  startStep3() {
    SoundFX.playDrum(92);
    this.setPhase('step3');
    this.phaseStartedAt = Date.now();
    this.transitionPending = false;
    this.players.forEach(p => { p.submitted = false; });

    document.getElementById('tv-step-tag').textContent = 'Passo 3 de 4';
    document.getElementById('tv-step-title').textContent = 'A Carta da Bruxa';
    document.getElementById('tv-step-desc').textContent =
      'A Bruxa baixou uma Ponte em cada profecia! Complete o desfecho e escolha o Selo do Destino.';
    this.updateWritingStatusUI();

    this.players.forEach((p, idx) => {
      const cardIdx = (idx + 2) % 4;
      const c = this.cards[cardIdx];
      if (p.isBot) {
        setTimeout(() => {
          if (this.phase !== 'step3' || p.submitted) return;
          c.endText = BOT_ENDS[(idx + this.round * 2) % BOT_ENDS.length];
          p.submitted = true;
          this.updateWritingStatusUI();
          this.checkAllSubmitted(() => this.startRevealPhase());
        }, 900 + idx * 380);
      } else {
        this.sendToPlayer(p, {
          type: 'phase_step3',
          emojis: c.emojis,
          cardName: c.cardName,
          startText: c.startText,
          bridgeId: c.bridge.id,
          timeLeft: STEP_DURATION
        });
      }
    });

    this.startTimer(STEP_DURATION, () => {
      this.players.forEach((p, idx) => {
        if (!p.submitted) {
          const cardIdx = (idx + 2) % 4;
          this.cards[cardIdx].endText = randomItem(BOT_ENDS);
          p.submitted = true;
        }
      });
      showToast('Tempo esgotado! Hora da revelação das três cartas!');
      this.startRevealPhase();
    });
  },

  /* --- PASSO 4: MESA DA BRUXA (3 CARTAS 2:3 + DIGITAÇÃO UNIFICADA) --- */
  startRevealPhase() {
    clearInterval(this.timer);
    this.setPhase('reveal');
    this.phaseStartedAt = Date.now();
    this.transitionPending = false;
    this.revealCardIdx = 0;
    this.revealTempo = 0;

    this.broadcast({
      type: 'phase_wait',
      title: 'Olhe para a TV!',
      sub: 'A Bruxa vai revelar o Presságio, a Carta da Bruxa e o Destino.'
    });

    this.renderRevealState();
  },

  advanceReveal() {
    clearTimeout(this.autoRevealTimer);
    if (this.revealTempo < 3) {
      this.revealTempo++;
      this.renderRevealState();
    } else if (this.revealCardIdx < 3) {
      this.revealCardIdx++;
      this.revealTempo = 0;
      this.renderRevealState();
    } else {
      this.autoReveal = false;
      document.getElementById('btn-reveal-auto').textContent = '⏱️ Modo Automático: OFF';
      this.startVotingPhase();
    }
  },

  renderRevealState() {
    if (typeof Typewriter?.stopAndFlush === 'function') Typewriter.stopAndFlush();

    const c = this.cards[this.revealCardIdx];
    if (!c) return;

    const target = this.players[c.targetIdx];
    const creator = this.players[c.creatorIdx];
    const starter = this.players[c.startAuthorIdx];
    const ender = this.players[c.endAuthorIdx];
    const seal = DESTINY_SEALS.find(s => s.id === c.sealId) || DESTINY_SEALS[0];

    document.getElementById('tv-reveal-index').textContent = this.revealCardIdx + 1;
    document.getElementById('tv-reveal-target').textContent = target.name;
    document.getElementById('tv-reveal-question').textContent = `“${target.question}”`;
    document.getElementById('card1-emojis').textContent = `${c.emojis[0]} ${c.emojis[1]}`;
    document.getElementById('card1-title').textContent = c.cardName;
    document.getElementById('card2-svg').innerHTML = '';
    document.getElementById('card2-svg').textContent = c.bridge.icon || '✨';
    document.getElementById('card2-arcana').textContent = c.bridge.title;
    document.getElementById('card3-svg').innerHTML = '';
    document.getElementById('card3-svg').textContent = seal.icon || '🔮';
    document.getElementById('card3-title').textContent = seal.title;

    const slot1 = document.getElementById('tarot-slot-1');
    const slot2 = document.getElementById('tarot-slot-2');
    const slot3 = document.getElementById('tarot-slot-3');
    [slot1, slot2, slot3].forEach(slot => slot.classList.remove('is-flipped', 'just-flipped'));
    if (this.revealTempo >= 1) slot1.classList.add('is-flipped', 'just-flipped');
    if (this.revealTempo >= 2) slot2.classList.add('is-flipped', 'just-flipped');
    if (this.revealTempo >= 3) slot3.classList.add('is-flipped', 'just-flipped');

    document.getElementById('interp-idle').classList.toggle('hidden', this.revealTempo > 0);
    document.getElementById('interp-part1').textContent = this.revealTempo >= 1 ? `“${c.startText}` : '';
    document.getElementById('interp-part2').textContent = this.revealTempo >= 2 ? `... ${c.bridge.word.replace(/\.+$/, '')} ...` : '';
    document.getElementById('interp-part3').textContent = this.revealTempo >= 3 ? `${c.endText}”` : '';

    const credits = document.getElementById('tv-interpretation-credits');
    if (this.revealTempo >= 3) {
      credits.textContent = `Carta: ${creator.name}  •  Início: ${starter.name}  •  Destino: ${ender.name}`;
      credits.classList.remove('hidden');
    } else {
      credits.classList.add('hidden');
    }

    document.getElementById('tv-reveal-tempo-label').textContent =
      ['Abertura da Consulta', 'Carta I • O Presságio', 'Carta II • A Bruxa', 'Carta III • O Destino'][this.revealTempo];

    const btnNext = document.getElementById('btn-reveal-next');
    btnNext.textContent = this.revealTempo === 0 ? 'Carta I — Virar o Presságio'
      : this.revealTempo === 1 ? 'Carta II — Virar a Bruxa'
      : this.revealTempo === 2 ? 'Carta III — Revelar o Destino'
      : this.revealCardIdx < 3 ? '➡️ Próxima Tiragem'
      : '🗳️ Abrir Votação nos Celulares';

    clearTimeout(this.autoRevealTimer);
    if (this.autoReveal && this.phase === 'reveal') {
      const delay = this.revealTempo === 3 ? 5600 : 3400;
      this.autoRevealTimer = setTimeout(() => this.advanceReveal(), delay);
    }
  },

  /* --- PASSO 5: VOTAÇÃO, PLACAR & GALERIA --- */
  getReadingsPayload() {
    return this.cards.map(c => ({
      idx: c.idx,
      emojis: c.emojis,
      cardName: c.cardName,
      startText: c.startText,
      bridge: { id: c.bridge.id, title: c.bridge.title, word: c.bridge.word, icon: c.bridge.icon || '✨' },
      endText: c.endText,
      sealId: c.sealId,
      targetName: this.players[c.targetIdx].name,
      question: this.players[c.targetIdx].question,
      creatorName: this.players[c.creatorIdx].name,
      startAuthorName: this.players[c.startAuthorIdx].name,
      endAuthorName: this.players[c.endAuthorIdx].name,
      endAuthorIdx: c.endAuthorIdx,
      votes: c.votes
    }));
  },

  startVotingPhase() {
    Typewriter.stopAndFlush();
    this.setPhase('voting');
    this.phaseStartedAt = Date.now();
    this.transitionPending = false;
    this.players.forEach(p => { p.submitted = false; });
    this.cards.forEach(c => { c.votes = 0; });

    document.getElementById('tv-votes-count').textContent = '0';
    const readings = this.getReadingsPayload();

    const grid = document.getElementById('tv-voting-grid');
    grid.innerHTML = '';
    readings.forEach(r => {
      const seal = DESTINY_SEALS.find(s => s.id === r.sealId) || DESTINY_SEALS[0];
      const el = document.createElement('div');
      el.className = 'xilo-card-tarot rounded-xl p-4 flex flex-col justify-between';
      el.innerHTML = `
        <div>
          <div class="flex items-center justify-between text-xs font-mono-code text-amber-300/85 mb-1">
            <span>Sorte de ${escapeHtml(r.targetName)}</span>
            <span class="text-base">${r.emojis[0]}${r.emojis[1]} → ${seal.icon}</span>
          </div>
          <p class="text-xs italic text-[#f4ecd8]/65 mb-1.5">“${escapeHtml(r.question)}”</p>
          <p class="font-serif-drama text-sm text-[#f4ecd8] leading-snug">
            “${escapeHtml(r.startText)}
            <span class="inline-block px-2 py-0.5 mx-1 rounded bg-[#8f1d20] text-amber-200 font-mono-code text-xs font-bold">${escapeHtml(r.bridge.word)}</span>
            ${escapeHtml(r.endText)}”
          </p>
        </div>
        <div class="text-[11px] font-mono-code text-amber-300/60 mt-3 pt-2 border-t border-amber-500/20">
          ${escapeHtml(r.cardName)} • ${escapeHtml(r.bridge.title)} • ${escapeHtml(seal.title)}
        </div>
      `;
      grid.appendChild(el);
    });

    this.players.forEach((p, idx) => {
      if (p.isBot) {
        setTimeout(() => {
          if (this.phase !== 'voting' || p.submitted) return;

          const valid = this.cards.filter(c => c.endAuthorIdx !== idx);
          if (valid.length) randomItem(valid).votes += 1;
          p.submitted = true;
          const totalVotes = this.players.filter(pl => pl.submitted).length;
          document.getElementById('tv-votes-count').textContent = totalVotes;
          this.checkAllSubmitted(() => this.finishVoting());
        }, 1000 + idx * 450);
      } else {
        this.sendToPlayer(p, { type: 'phase_vote', readings, myIdx: idx });
      }
    });
  },

  finishVoting() {
    this.setPhase('results');
    SoundFX.playKayaChord();

    const maxVotes = Math.max(...this.cards.map(c => c.votes));
    const winners = this.cards.filter(c => c.votes === maxVotes);

    winners.forEach(w => {
      this.players[w.startAuthorIdx].score += 100;
      this.players[w.endAuthorIdx].score += 100;
    });

    const readings = this.getReadingsPayload();
    const top = readings[winners[0].idx];

    document.getElementById('tv-winner-banner').innerHTML = `
      <div class="text-xs font-mono-code uppercase text-amber-300 mb-1">
        A Sorte de ${escapeHtml(top.targetName)} • ${top.votes} voto(s) ${winners.length > 1 ? '(Empate!)' : ''}
      </div>
      <p class="text-sm italic text-[#f4ecd8]/75 mb-2">“${escapeHtml(top.question)}”</p>
      <p class="font-serif-drama text-lg sm:text-2xl text-[#f4ecd8]">
        “${escapeHtml(top.startText)}
        <span class="text-amber-300 font-ritual mx-1">${escapeHtml(top.bridge.word)}</span>
        ${escapeHtml(top.endText)}”
      </p>
      <div class="text-xs font-mono-code text-emerald-300 mt-3">
        +100 pts para ${escapeHtml(top.startAuthorName)} (Início) e ${escapeHtml(top.endAuthorName)} (Destino)
      </div>
    `;

    const sb = document.getElementById('tv-scoreboard');
    sb.innerHTML = '';
    [...this.players].sort((a, b) => b.score - a.score).forEach((p, rank) => {
      const card = document.createElement('div');
      card.className = `rounded-xl p-3 text-center border ${
        rank === 0 ? 'bg-amber-500/15 border-amber-400' : 'bg-[#121629] border-amber-500/25'
      }`;
      card.innerHTML = `
        <div class="text-xs font-mono-code text-amber-300/80">#${rank + 1}</div>
        <div class="font-serif-drama font-bold text-base truncate text-[#f4ecd8]">${escapeHtml(p.name)}</div>
        <div class="font-mono-code text-xl font-bold text-amber-300 mt-1">${p.score} pts</div>
      `;
      sb.appendChild(card);
    });

    const gal = document.getElementById('tv-gallery');
    gal.innerHTML = '';
    readings.forEach(r => {
      const seal = DESTINY_SEALS.find(s => s.id === r.sealId) || DESTINY_SEALS[0];
      const item = document.createElement('div');
      item.className = 'xilo-card-tarot rounded-xl p-4 flex flex-col justify-between gap-2';
      item.innerHTML = `
        <div>
          <div class="flex justify-between items-center text-xs font-mono-code text-amber-300">
            <span class="truncate">${escapeHtml(r.targetName)}</span>
            <span class="text-lg">${r.emojis[0]}${r.emojis[1]} ${seal.icon}</span>
          </div>
          <div class="font-tarot text-xs font-bold text-[#f4ecd8] uppercase mt-1">${escapeHtml(r.cardName)}</div>
          <p class="text-[11px] text-[#f4ecd8]/75 mt-1 line-clamp-3">
            ${escapeHtml(r.startText)} <strong>${escapeHtml(r.bridge.word)}</strong> ${escapeHtml(r.endText)}
          </p>
        </div>
      `;
      const btn = document.createElement('button');
      btn.className = 'btn-gold w-full py-2.5 rounded-xl text-xs font-mono-code cursor-pointer';
      btn.textContent = '📸 Baixar Carta 9:16 (PNG para Story)';
      btn.onclick = () => downloadStoryCard(r);
      item.appendChild(btn);
      gal.appendChild(item);
    });

    this.showTvView('tv-view-results');
    this.broadcast({ type: 'phase_gallery', readings });
  },

  newRound() {
    this.round++;
    this.setPhase('lobby');
    this.startRound();
  }
};
