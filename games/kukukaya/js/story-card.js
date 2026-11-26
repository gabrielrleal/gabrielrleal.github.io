import { DESTINY_SEALS } from './data.js';
import { showToast } from './utils.js';

export function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 6) {
  const words = String(text).split(/\s+/);
  let line = '';
  const lines = [];
  for (let n = 0; n < words.length; n++) {
    const testLine = line ? line + ' ' + words[n] : words[n];
    if (ctx.measureText(testLine).width > maxWidth && line) {
      lines.push(line);
      line = words[n];
      if (lines.length >= maxLines - 1) break;
    } else {
      line = testLine;
    }
  }
  if (line) lines.push(line);
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight));
  return y + lines.length * lineHeight;
}

// Desenho vetorial nativo no Canvas para o símbolo da Carta da Bruxa (sem risco de taint)
export function drawWitchMotifCanvas(ctx, bridgeId, cx, cy, r) {
  ctx.save();
  ctx.strokeStyle = '#f4ecd8';
  ctx.fillStyle = '#d4af37';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (bridgeId === 'traicao') {
    ctx.beginPath(); ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy); ctx.strokeStyle = '#d4af37'; ctx.stroke();
    ctx.strokeStyle = '#f4ecd8';
    ctx.beginPath(); ctx.moveTo(cx, cy - r); ctx.lineTo(cx + 12, cy); ctx.lineTo(cx, cy + r); ctx.lineTo(cx - 12, cy); ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 26, cy - 18); ctx.lineTo(cx + 26, cy - 18); ctx.stroke();
  } else if (bridgeId === 'segredo') {
    ctx.beginPath(); ctx.moveTo(cx - r, cy); ctx.quadraticCurveTo(cx, cy - r * 0.85, cx + r, cy); ctx.quadraticCurveTo(cx, cy + r * 0.85, cx - r, cy); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.36, 0, Math.PI * 2); ctx.strokeStyle = '#d4af37'; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.16, 0, Math.PI * 2); ctx.fillStyle = '#f4ecd8'; ctx.fill();
  } else if (bridgeId === 'sentenca') {
    ctx.beginPath(); ctx.moveTo(cx, cy - r * 0.8); ctx.lineTo(cx, cy + r * 0.85); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - r * 0.8, cy - r * 0.45); ctx.lineTo(cx + r * 0.8, cy - r * 0.45); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx - r * 0.65, cy + r * 0.15, 18, 0, Math.PI); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx + r * 0.65, cy + r * 0.15, 18, 0, Math.PI); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 24, cy + r * 0.85); ctx.lineTo(cx + 24, cy + r * 0.85); ctx.stroke();
  } else if (bridgeId === 'pacto') {
    ctx.beginPath(); ctx.moveTo(cx, cy - r); ctx.quadraticCurveTo(cx + 16, cy - r * 0.5, cx, cy - r * 0.35); ctx.quadraticCurveTo(cx - 16, cy - r * 0.5, cx, cy - r); ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx - r * 0.65, cy - 4); ctx.lineTo(cx + r * 0.65, cy - 4); ctx.quadraticCurveTo(cx + r * 0.45, cy + r * 0.55, cx, cy + r * 0.55); ctx.quadraticCurveTo(cx - r * 0.45, cy + r * 0.55, cx - r * 0.65, cy - 4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy + r * 0.55); ctx.lineTo(cx, cy + r * 0.9); ctx.moveTo(cx - 22, cy + r * 0.9); ctx.lineTo(cx + 22, cy + r * 0.9); ctx.stroke();
  } else if (bridgeId === 'teimosia') {
    ctx.beginPath(); ctx.moveTo(cx - 28, cy + r * 0.85); ctx.lineTo(cx - 20, cy - r * 0.75); ctx.lineTo(cx + 20, cy - r * 0.75); ctx.lineTo(cx + 28, cy + r * 0.85); ctx.closePath(); ctx.stroke();
    ctx.strokeStyle = '#d4af37';
    ctx.beginPath(); ctx.moveTo(cx + 4, cy - r * 0.7); ctx.lineTo(cx - 8, cy - 6); ctx.lineTo(cx + 8, cy + 12); ctx.lineTo(cx - 6, cy + 38); ctx.stroke();
  } else if (bridgeId === 'espelho') {
    ctx.beginPath(); ctx.ellipse(cx, cy - 6, r * 0.6, r * 0.8, 0, 0, Math.PI * 2); ctx.strokeStyle = '#d4af37'; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy + r * 0.75); ctx.lineTo(cx, cy + r); ctx.stroke();
    ctx.fillStyle = '#d4af37';
    ctx.beginPath(); ctx.arc(cx, cy - 10, 7, 0, Math.PI * 2); ctx.fill();
  } else {
    // exagero (chama)
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.bezierCurveTo(cx + r * 0.85, cy - 10, cx + r * 0.7, cy + r * 0.9, cx, cy + r * 0.9);
    ctx.bezierCurveTo(cx - r * 0.7, cy + r * 0.9, cx - r * 0.85, cy - 10, cx, cy - r);
    ctx.stroke();
    ctx.fillStyle = 'rgba(212,175,55,0.5)';
    ctx.beginPath(); ctx.arc(cx, cy + 16, 18, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

export function downloadStoryCard(reading) {
  const canvas = document.getElementById('story-canvas');
  const ctx = canvas.getContext('2d');
  const W = 1080, H = 1920;

  // 1. Fundo Azul-Noite
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, '#080a12');
  bgGrad.addColorStop(0.5, '#111528');
  bgGrad.addColorStop(1, '#070910');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Lua no topo
  ctx.save();
  ctx.beginPath();
  ctx.arc(W / 2, 220, 165, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(244, 236, 216, 0.08)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  ctx.stroke();
  ctx.restore();

  // Moldura Dupla Xilogravura
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 6;
  ctx.strokeRect(46, 46, W - 92, H - 92);
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
  ctx.lineWidth = 2;
  ctx.strokeRect(64, 64, W - 128, H - 128);

  // Título
  ctx.textAlign = 'center';
  ctx.fillStyle = '#d4af37';
  ctx.font = 'bold 64px "Cinzel Decorative", Georgia, serif';
  ctx.fillText('KUKUKAYA', W / 2, 160);

  ctx.fillStyle = '#f4ecd8';
  ctx.font = 'italic 30px "Playfair Display", Georgia, serif';
  ctx.fillText('O Jogo da Bruxa', W / 2, 208);

  // Pergunta Secreta
  ctx.fillStyle = '#d4af37';
  ctx.font = 'bold 28px "Space Mono", monospace';
  ctx.fillText(`A SORTE DE ${reading.targetName.toUpperCase()}`, W / 2, 305);

  ctx.fillStyle = '#f4ecd8';
  ctx.font = 'italic 42px "Playfair Display", Georgia, serif';
  wrapCanvasText(ctx, `“${reading.question}”`, W / 2, 368, W - 180, 54, 3);

  // 2. AS 3 MINI-CARTAS VERTICAIS DE TARÔ (2:3 — 276 x 414 px cada)
  const cW = 276, cH = 414, gap = 36;
  const startX = (W - (cW * 3 + gap * 2)) / 2;
  const cardY = 525;

  // --- CARTA I (Azul-Noite) ---
  const x1 = startX;
  ctx.fillStyle = '#0e1326';
  ctx.fillRect(x1, cardY, cW, cH);
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 4;
  ctx.strokeRect(x1, cardY, cW, cH);
  ctx.strokeStyle = 'rgba(212,175,55,0.45)';
  ctx.lineWidth = 2;
  ctx.strokeRect(x1 + 12, cardY + 12, cW - 24, cH - 24);

  ctx.fillStyle = '#d4af37';
  ctx.font = 'bold 28px "Cinzel", Georgia, serif';
  ctx.fillText('I', x1 + cW / 2, cardY + 52);

  // Medalhão
  ctx.beginPath();
  ctx.arc(x1 + cW / 2, cardY + 190, 92, 0, Math.PI * 2);
  ctx.fillStyle = '#080b16';
  ctx.fill();
  ctx.strokeStyle = 'rgba(212,175,55,0.6)';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.font = '74px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
  ctx.fillText(`${reading.emojis[0]}${reading.emojis[1]}`, x1 + cW / 2, cardY + 216);

  ctx.fillStyle = '#f4ecd8';
  ctx.font = 'bold 22px "Cinzel", Georgia, serif';
  wrapCanvasText(ctx, reading.cardName.toUpperCase(), x1 + cW / 2, cardY + 340, cW - 36, 28, 2);

  // --- CARTA II (Vermelho-Sangue — Bruxa) ---
  const x2 = startX + cW + gap;
  const wGrad = ctx.createLinearGradient(x2, cardY, x2, cardY + cH);
  wGrad.addColorStop(0, '#961e21');
  wGrad.addColorStop(1, '#470b0d');
  ctx.fillStyle = wGrad;
  ctx.fillRect(x2, cardY, cW, cH);
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 4;
  ctx.strokeRect(x2, cardY, cW, cH);
  ctx.strokeStyle = 'rgba(244,236,216,0.55)';
  ctx.lineWidth = 2;
  ctx.strokeRect(x2 + 12, cardY + 12, cW - 24, cH - 24);

  ctx.fillStyle = '#f4ecd8';
  ctx.font = 'bold 28px "Cinzel", Georgia, serif';
  ctx.fillText('II', x2 + cW / 2, cardY + 52);

  drawWitchMotifCanvas(ctx, reading.bridge.id, x2 + cW / 2, cardY + 185, 62);

  ctx.fillStyle = '#f7df94';
  ctx.font = 'italic 22px "Playfair Display", Georgia, serif';
  ctx.fillText(reading.bridge.title, x2 + cW / 2, cardY + 322);

  ctx.fillStyle = '#f4ecd8';
  ctx.font = 'bold 26px "Cinzel Decorative", Georgia, serif';
  wrapCanvasText(ctx, reading.bridge.word, x2 + cW / 2, cardY + 362, cW - 30, 30, 2);

  // --- CARTA III (Pergaminho — Destino) ---
  const x3 = startX + (cW + gap) * 2;
  ctx.fillStyle = '#f4ecd8';
  ctx.fillRect(x3, cardY, cW, cH);
  ctx.strokeStyle = '#161210';
  ctx.lineWidth = 4;
  ctx.strokeRect(x3, cardY, cW, cH);
  ctx.lineWidth = 2;
  ctx.strokeRect(x3 + 12, cardY + 12, cW - 24, cH - 24);

  ctx.fillStyle = '#2b1e14';
  ctx.font = 'bold 28px "Cinzel", Georgia, serif';
  ctx.fillText('III', x3 + cW / 2, cardY + 52);

  const sealObj = DESTINY_SEALS.find(s => s.id === reading.sealId) || DESTINY_SEALS[0];
  ctx.font = '106px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
  ctx.fillText(sealObj.icon, x3 + cW / 2, cardY + 230);

  ctx.fillStyle = '#161210';
  ctx.font = 'bold 24px "Cinzel", Georgia, serif';
  ctx.fillText(sealObj.title.toUpperCase(), x3 + cW / 2, cardY + 355);

  // 3. FAIXA UNIFICADA DA INTERPRETAÇÃO DA BRUXA
  const boxY = cardY + cH + 62;
  const boxH = 630;
  ctx.fillStyle = '#101425';
  ctx.fillRect(92, boxY, W - 184, boxH);
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 4;
  ctx.strokeRect(92, boxY, W - 184, boxH);
  ctx.strokeStyle = 'rgba(212,175,55,0.4)';
  ctx.lineWidth = 2;
  ctx.strokeRect(106, boxY + 14, W - 212, boxH - 28);

  ctx.fillStyle = '#d4af37';
  ctx.font = 'bold 24px "Space Mono", monospace';
  ctx.fillText('✦  INTERPRETAÇÃO DA BRUXA  ✦', W / 2, boxY + 64);

  const fullProphecy = `“${reading.startText} ${reading.bridge.word.toUpperCase()} ${reading.endText}”`;
  ctx.fillStyle = '#f4ecd8';
  ctx.font = '46px "Playfair Display", Georgia, serif';
  wrapCanvasText(ctx, fullProphecy, W / 2, boxY + 150, W - 260, 64, 7);

  // Créditos
  ctx.fillStyle = 'rgba(244, 236, 216, 0.65)';
  ctx.font = '24px "Space Mono", monospace';
  ctx.fillText(
    `Carta: ${reading.creatorName}  •  Início: ${reading.startAuthorName}  •  Destino: ${reading.endAuthorName}`,
    W / 2,
    H - 160
  );

  ctx.fillStyle = '#d4af37';
  ctx.font = 'bold 28px "Space Mono", monospace';
  ctx.fillText('🌙  KUKUKAYA  •  O JOGO DA BRUXA  🌙', W / 2, H - 102);

  try {
    const link = document.createElement('a');
    const safeName = reading.targetName.toLowerCase().replace(/[^a-z0-9]/g, '');
    link.download = `kukukaya-sorte-${safeName || 'bruxa'}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast(`Carta 9:16 de ${reading.targetName} salva em PNG!`);
  } catch (err) {
    showToast('Não foi possível baixar a imagem neste navegador.');
  }
}
