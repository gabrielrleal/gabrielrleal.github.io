import { SECRET_QUESTIONS } from './data.js';
import { SoundFX } from './sound.js';
import { showToast, vibrateMobile, randomItem, getPublicInviteUrl } from './utils.js';
import { TV } from './tv-host.js';
import { Phone } from './phone-controller.js';

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-choose-tv').addEventListener('click', () => TV.startHost());
  document.getElementById('btn-choose-phone').addEventListener('click', () => Phone.openPhoneMode());
  document.getElementById('btn-back-central').addEventListener('click', () => {
    if (window.parent !== window) window.parent.postMessage({ type: 'kukukaya:close' }, '*');
    else {
      document.getElementById('screen-tv').classList.add('hidden');
      document.getElementById('screen-phone').classList.add('hidden');
      document.getElementById('screen-landing').classList.remove('hidden');
    }
  });
  document.getElementById('btn-fill-bots').addEventListener('click', () => TV.fillWithBots());
  document.getElementById('btn-start-ritual').addEventListener('click', () => TV.startRound());
  document.getElementById('btn-new-round').addEventListener('click', () => TV.newRound());
  document.getElementById('btn-reveal-next').addEventListener('click', () => TV.advanceReveal());
  document.getElementById('btn-reveal-auto').addEventListener('click', event => {
    TV.autoReveal = !TV.autoReveal;
    event.currentTarget.textContent = `⏱️ Modo Automático: ${TV.autoReveal ? 'ON' : 'OFF'}`;
    if (TV.autoReveal) TV.autoRevealTimer = setTimeout(() => TV.advanceReveal(), 2500);
    else clearTimeout(TV.autoRevealTimer);
  });
  document.getElementById('btn-toggle-sound').addEventListener('click', event => {
    SoundFX.enabled = !SoundFX.enabled;
    event.currentTarget.innerHTML = `<span id="sound-icon">${SoundFX.enabled ? '🥁' : '🔕'}</span> Som: ${SoundFX.enabled ? 'ON' : 'OFF'}`;
  });
  document.getElementById('btn-copy-link').addEventListener('click', () => {
    const inviteUrl = getPublicInviteUrl(TV.roomCode);
    const tmp = document.createElement('textarea');
    tmp.value = inviteUrl;
    document.body.appendChild(tmp);
    tmp.select();
    try { document.execCommand('copy'); showToast('Link da sala copiado!'); }
    catch (err) { showToast('Código da sala: ' + TV.roomCode); }
    tmp.remove();
  });

  const modalUrl = document.getElementById('modal-url-config');
  const inputCustomUrl = document.getElementById('input-custom-url');
  document.getElementById('btn-config-url').addEventListener('click', () => {
    try { inputCustomUrl.value = localStorage.getItem('kukukaya_public_url') || ''; } catch (e) {}
    modalUrl.classList.remove('hidden');
    setTimeout(() => inputCustomUrl.focus(), 100);
  });
  document.getElementById('btn-cancel-url').addEventListener('click', () => modalUrl.classList.add('hidden'));
  document.getElementById('btn-save-url').addEventListener('click', () => {
    const val = inputCustomUrl.value.trim();
    try {
      if (val) localStorage.setItem('kukukaya_public_url', val);
      else localStorage.removeItem('kukukaya_public_url');
    } catch (e) {}
    modalUrl.classList.add('hidden');
    TV.renderQRCode();
    showToast('QR Code atualizado com o link do seu site!');
  });

  document.getElementById('btn-join-room').addEventListener('click', () => Phone.joinRoom());
  document.getElementById('btn-phone-back').addEventListener('click', () => {
    document.getElementById('screen-phone').classList.add('hidden');
    document.getElementById('screen-landing').classList.remove('hidden');
  });
  document.getElementById('btn-phone-start-ritual').addEventListener('click', () => Phone.send({ type: 'host_start_from_phone' }));
  document.getElementById('btn-roll-question').addEventListener('click', () => {
    vibrateMobile(40);
    document.getElementById('input-secret-question').value = randomItem(SECRET_QUESTIONS);
  });
  document.getElementById('btn-submit-step1').addEventListener('click', () => {
    const cardName = document.getElementById('input-card-name').value.trim();
    const question = document.getElementById('input-secret-question').value.trim();
    if (!cardName) return showToast('Dê um nome para sua carta de tarô!');
    if (!question) return showToast('Escreva ou sorteie sua pergunta secreta!');
    vibrateMobile(60);
    Phone.send({ type: 'submit_step1', cardName, question });
    document.getElementById('phone-wait-title').textContent = 'Presságio Enviado!';
    document.getElementById('phone-wait-sub').textContent = 'Aguardando os outros jogadores do círculo...';
    Phone.showView('phone-view-wait');
  });
  document.getElementById('btn-submit-step2').addEventListener('click', () => {
    const startText = document.getElementById('input-start-text').value.trim();
    if (!startText) return showToast('Escreva uma frase inicial sobre a carta!');
    vibrateMobile(60);
    Phone.send({ type: 'submit_step2', startText });
    document.getElementById('phone-wait-title').textContent = 'Início Enviado!';
    document.getElementById('phone-wait-sub').textContent = 'A Bruxa já vai baixar a Ponte...';
    Phone.showView('phone-view-wait');
  });
  document.getElementById('btn-submit-step3').addEventListener('click', () => {
    const endText = document.getElementById('input-end-text').value.trim();
    if (!endText) return showToast('Escreva o fechamento após a Ponte!');
    vibrateMobile(60);
    Phone.send({ type: 'submit_step3', endText, sealId: Phone.selectedSealId || null });
    document.getElementById('phone-wait-title').textContent = 'Destino Selado!';
    document.getElementById('phone-wait-sub').textContent = 'Prepare-se e olhe para a TV!';
    Phone.showView('phone-view-wait');
  });

  const params = new URLSearchParams(window.location.search);
  let roomParam = params.get('sala') || params.get('room');
  if (!roomParam && window.location.hash) {
    const match = window.location.hash.match(/sala=([A-Za-z0-9]{4})/i);
    if (match) roomParam = match[1];
  }
  if (roomParam) {
    Phone.openPhoneMode(roomParam);
  } else {
    document.getElementById('btn-choose-tv')?.focus();
  }

  window.addEventListener('keydown', event => {
    if (event.key !== 'Escape' && event.key !== 'BrowserBack' && event.key !== 'XF86Back') return;
    if (!modalUrl.classList.contains('hidden')) {
      modalUrl.classList.add('hidden');
      return;
    }
    if (window.parent && window.parent !== window) {
      const targetOrigin = window.location.origin === 'null' ? '*' : window.location.origin;
      window.parent.postMessage({ type: 'kukukaya:close' }, targetOrigin);
    }
  });

  window.addEventListener('message', event => {
    if (event.source !== window.parent) return;
    if (event.origin !== window.location.origin && event.origin !== 'null') return;
    if (event.data?.type === 'kukukaya:close') {
      document.getElementById('screen-tv').classList.add('hidden');
      document.getElementById('screen-phone').classList.add('hidden');
      document.getElementById('screen-landing').classList.remove('hidden');
    }
  });
});
