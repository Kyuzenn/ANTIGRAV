/**
 * LUMINA // Micro-Haptics & Ethereal Audio Engine
 * Pure Web Audio API synthesized harmonic chime and tactile cues.
 * Zero external audio files, ultra-lightweight, gentle volume.
 */

window.LuminaAudio = (function () {
  'use strict';

  let audioCtx = null;
  let isMuted = localStorage.getItem('lumina_audio_muted') === 'true';

  function getAudioContext() {
    if (!audioCtx && typeof window.AudioContext !== 'undefined') {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  /**
   * Warm harmonic celebration chime for reaching Honors / target grade.
   * Synthesizes 440Hz -> 880Hz sine frequencies with warm exponential decay.
   */
  function playTargetChime() {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        // Soft, gentle bell envelope
        gain.gain.setValueAtTime(0.0001, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.06, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.65);
      });
    } catch (e) {
      // Audio autoplay or permissions restriction silently caught
    }
  }

  /**
   * Subtle tactile micro-click for key interactive events.
   */
  function playClick() {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.03);

      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.035);
    } catch (e) {}
  }

  /**
   * Warm harmonic celebration chime for reaching Honors / target grade or onboarding launch.
   */
  function playCelebration() {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // Uplifting C5, E5, G5, C6 arpeggio with celebratory finish
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        gain.gain.setValueAtTime(0.0001, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.06, now + idx * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 0.55);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.6);
      });
    } catch (e) {
      // Audio autoplay or permissions restriction silently caught
    }
  }

  function toggleMute() {
    isMuted = !isMuted;
    localStorage.setItem('lumina_audio_muted', isMuted);
    return isMuted;
  }

  function getMuted() {
    return isMuted;
  }

  return {
    playTargetChime,
    playCelebration,
    playClick,
    toggleMute,
    getMuted
  };
})();
