const test = require('node:test');
const assert = require('node:assert/strict');

test('data.js expõe baralhos válidos e sem IDs duplicados', async () => {
  const data = await import('../games/kukukaya/js/data.js');

  assert.ok(Array.isArray(data.REALMS) && data.REALMS.length >= 2);
  assert.ok(Array.isArray(data.WITCH_CARDS) && data.WITCH_CARDS.length > 0);
  assert.ok(Array.isArray(data.DESTINY_SEALS) && data.DESTINY_SEALS.length > 0);
  assert.ok(Array.isArray(data.SECRET_QUESTIONS) && data.SECRET_QUESTIONS.length > 0);
  assert.equal(data.BOT_NAMES.length, 4);
  assert.equal(data.STEP_DURATION, 90);

  const witchIds = new Set(data.WITCH_CARDS.map(c => c.id));
  assert.equal(witchIds.size, data.WITCH_CARDS.length);

  const sealIds = new Set(data.DESTINY_SEALS.map(s => s.id));
  assert.equal(sealIds.size, data.DESTINY_SEALS.length);
});

test('utils.js: escapeHtml previne injeção de HTML/XSS', async () => {
  const { escapeHtml } = await import('../games/kukukaya/js/utils.js');
  const escaped = escapeHtml('<img src=x onerror="alert(\'xss\')">&');
  assert.equal(escaped.includes('<'), false);
  assert.equal(escaped.includes('>'), false);
  assert.equal(escaped.includes('"'), false);
  assert.ok(escaped.includes('&lt;img'));
  assert.ok(escaped.includes('&amp;'));
});

test('utils.js: generateRoomCode gera código de 4 letras válidas', async () => {
  const { generateRoomCode } = await import('../games/kukukaya/js/utils.js');
  for (let i = 0; i < 20; i++) {
    const code = generateRoomCode();
    assert.match(code, /^[A-Z]{4}$/);
    assert.equal(code.includes('I'), false);
    assert.equal(code.includes('O'), false);
  }
});

test('utils.js: drawTwoRealmEmojis sorteia dois emojis distintos', async () => {
  const { drawTwoRealmEmojis } = await import('../games/kukukaya/js/utils.js');
  for (let i = 0; i < 10; i++) {
    const pair = drawTwoRealmEmojis();
    assert.ok(Array.isArray(pair));
    assert.equal(pair.length, 2);
    assert.notEqual(pair[0], pair[1]);
  }
});
