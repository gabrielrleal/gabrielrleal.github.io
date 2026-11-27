import { REALMS } from './data.js';
import { SoundFX } from './sound.js';

export function showToast(msg, duration = 3500) {
  const container = document.getElementById('toast-container');
  const div = document.createElement('div');
  div.className = 'toast-msg';
  div.textContent = msg;
  container.appendChild(div);
  setTimeout(() => {
    div.style.opacity = '0';
    div.style.transition = 'opacity 0.3s';
    setTimeout(() => div.remove(), 300);
  }, duration);
}

export function vibrateMobile(pattern = 90) {
  if (navigator.vibrate) {
    try { navigator.vibrate(pattern); } catch (e) {}
  }
}

export async function requestWakeLock() {
  if ('wakeLock' in navigator) {
    try { await navigator.wakeLock.request('screen'); } catch (e) {}
  }
}

export function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateRoomCode() {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) code += letters[Math.floor(Math.random() * letters.length)];
  return code;
}

export function drawTwoRealmEmojis() {
  const shuffled = [...REALMS].sort(() => Math.random() - 0.5);
  return [randomItem(shuffled[0].emojis), randomItem(shuffled[1].emojis)];
}

export function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Detector Inteligente de URL (GitHub Pages / Netlify / Vercel vs Google Sites iframe / file://)
export function isEmbeddedOrLocal() {
  let inIframe = false;
  try { inIframe = window.self !== window.top; } catch (e) { inIframe = true; }
  const host = window.location.hostname || '';
  const isGoogleEmbed = host.includes('googleusercontent.com') || host.includes('gstatic.com');
  const isFile = window.location.protocol === 'file:';
  return inIframe || isGoogleEmbed || isFile;
}

export function getPublicInviteUrl(roomCode) {
  const savedUrl = (() => {
    try { return (localStorage.getItem('kukukaya_public_url') || '').trim(); } catch (e) { return ''; }
  })();

  if (!isEmbeddedOrLocal()) {
    // GitHub Pages, Netlify, Vercel, servidor próprio: 100% automático
    const cleanBase = window.location.origin + window.location.pathname;
    return `${cleanBase}?sala=${encodeURIComponent(roomCode)}`;
  }

  if (savedUrl) {
    const cleanSaved = savedUrl.split('?')[0].split('#')[0];
    return `${cleanSaved}?sala=${encodeURIComponent(roomCode)}`;
  }

  // Tenta usar referrer se vier de um domínio real (ex: sites.google.com)
  if (document.referrer && !document.referrer.includes('googleusercontent.com')) {
    const refBase = document.referrer.split('?')[0].split('#')[0];
    return `${refBase}?sala=${encodeURIComponent(roomCode)}`;
  }

  const fallbackBase = window.location.href.split('?')[0].split('#')[0];
  return `${fallbackBase}?sala=${encodeURIComponent(roomCode)}`;
}

/* =========================================================================
   4. MOTOR DE DIGITAÇÃO LETRA POR LETRA (INTERPRETAÇÃO DA BRUXA)
========================================================================= */
export const Typewriter = {
  timer: null,
  activeEl: null,
  activeText: '',

  stopAndFlush() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      if (this.activeEl) {
        this.activeEl.textContent = this.activeText;
      }
    }
    this.activeEl = null;
    this.activeText = '';
  },

  typeInto(el, text, speedMs = 28, onDone = null) {
    this.stopAndFlush();
    this.activeEl = el;
    this.activeText = text;
    el.textContent = '';

    const cursor = document.getElementById('interp-cursor');
    cursor.classList.remove('hidden');

    let i = 0;
    this.timer = setInterval(() => {
      if (i >= text.length) {
        clearInterval(this.timer);
        this.timer = null;
        this.activeEl = null;
        this.activeText = '';
        if (onDone) onDone();
        return;
      }
      const ch = text[i];
      el.textContent += ch;
      if (ch !== ' ' && i % 2 === 0) SoundFX.playTypeTick();
      i++;
    }, speedMs);
  }
};
