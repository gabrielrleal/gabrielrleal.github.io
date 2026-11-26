(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.KukukayaState = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const PHASES = Object.freeze([
    'landing', 'lobby', 'step1', 'step2', 'step3',
    'reveal', 'voting', 'results', 'phone_join', 'phone_lobby'
  ]);

  const TV_PHASES = Object.freeze([
    'lobby', 'step1', 'step2', 'step3', 'reveal', 'voting', 'results'
  ]);

  const TV_TRANSITIONS = Object.freeze({
    lobby: ['step1'],
    step1: ['step2'],
    step2: ['step3'],
    step3: ['reveal'],
    reveal: ['voting', 'reveal'],
    voting: ['results'],
    results: ['lobby']
  });

  function validatePhase(phase) {
    return PHASES.includes(phase);
  }

  function canTransition(from, to) {
    return validatePhase(from) && validatePhase(to) &&
      (TV_TRANSITIONS[from] || []).includes(to);
  }

  class TvPhaseController {
    constructor(viewMap) {
      if (!viewMap) throw new TypeError('viewMap is required');
      this.viewMap = viewMap;
      this.phase = 'lobby';
      this.onChange = null;
    }

    setPhase(nextPhase) {
      if (!TV_PHASES.includes(nextPhase)) throw new RangeError('Fase da TV inválida: ' + nextPhase);
      if (nextPhase !== this.phase && !canTransition(this.phase, nextPhase)) {
        throw new RangeError(`Transição inválida: ${this.phase} -> ${nextPhase}`);
      }

      this.phase = nextPhase;
      const visibleViewId = this.viewMap[nextPhase];
      new Set(Object.values(this.viewMap)).forEach(id => {
        const el = typeof document !== 'undefined' ? document.getElementById(id) : null;
        if (el) el.classList.toggle('hidden', id !== visibleViewId);
      });

      if (typeof this.onChange === 'function') this.onChange(nextPhase);
      return nextPhase;
    }

    visibleViewId() {
      return this.viewMap[this.phase] || null;
    }
  }

  return { PHASES, TV_PHASES, TV_TRANSITIONS, validatePhase, canTransition, TvPhaseController };
});
