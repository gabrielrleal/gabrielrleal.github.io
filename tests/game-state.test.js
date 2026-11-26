const test = require('node:test');
const assert = require('node:assert/strict');

const state = require('../games/kukukaya/game-state.js');

test('fase inicial da TV é lobby', () => {
  const controller = new state.TvPhaseController({ lobby: 'tv-view-lobby' });
  assert.equal(controller.phase, 'lobby');
});

test('transições válidas seguem o ritual', () => {
  let current = 'lobby';
  const phases = ['step1', 'step2', 'step3', 'reveal', 'voting', 'results', 'lobby'];

  for (const next of phases) {
    assert.equal(state.canTransition(current, next), true);
    current = next;
  }
});

test('transição lobby -> results é rejeitada', () => {
  assert.equal(state.canTransition('lobby', 'results'), false);
});

test('todas as fases são validadas', () => {
  assert.equal(state.validatePhase('lobby'), true);
  assert.equal(state.validatePhase('not-a-phase'), false);
});

test('controlador aplica a visão correta', () => {
  const views = new Map();
  global.document = {
    getElementById(id) {
      if (!views.has(id)) views.set(id, { hidden: true });
      const view = views.get(id);
      return {
        classList: {
          toggle(name, hidden) {
            if (name === 'hidden') view.hidden = hidden;
          }
        }
      };
    }
  };

  const viewMap = {
    lobby: 'lobby-view',
    step1: 'writing-view',
    step2: 'writing-view',
    step3: 'writing-view',
    reveal: 'reveal-view'
  };
  const controller = new state.TvPhaseController(viewMap);

  assert.equal(controller.setPhase('step1'), 'step1');
  assert.equal(controller.visibleViewId(), 'writing-view');
  assert.equal(views.get('writing-view').hidden, false);
  assert.equal(views.get('lobby-view').hidden, true);
  assert.equal(views.get('reveal-view').hidden, true);
  controller.setPhase('step2');
  assert.equal(views.get('writing-view').hidden, false);
  delete global.document;
});
