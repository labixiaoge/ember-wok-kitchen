// Ember Wok Kitchen — every sound is synthesized with WebAudio.
// No audio files, no network: just oscillators and filtered noise.

let ctx = null;
let muted = false;
let sizzleNodes = null;

export function isMuted() {
  return muted;
}

export function toggleMute() {
  muted = !muted;
  if (muted) stopSizzle();
  return muted;
}

function audio() {
  if (!ctx) {
    const AC = window.AudioContext ?? window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function noiseBuffer(ac, seconds = 0.5) {
  const buffer = ac.createBuffer(1, Math.floor(ac.sampleRate * seconds), ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

function tone(freq, dur, type = 'sine', vol = 0.15, when = 0, slideTo = null) {
  const ac = audio();
  if (!ac || muted) return;
  const t0 = ac.currentTime + when;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(vol, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

function noiseHit(dur, filterFreq, vol = 0.2, type = 'bandpass', when = 0) {
  const ac = audio();
  if (!ac || muted) return;
  const t0 = ac.currentTime + when;
  const src = ac.createBufferSource();
  src.buffer = noiseBuffer(ac, dur + 0.1);
  const filter = ac.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = filterFreq;
  const gain = ac.createGain();
  gain.gain.setValueAtTime(vol, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filter).connect(gain).connect(ac.destination);
  src.start(t0);
  src.stop(t0 + dur + 0.05);
}

export function playChop() {
  noiseHit(0.08, 1800, 0.25);
  tone(160, 0.07, 'triangle', 0.18, 0, 90);
}

export function playPick() {
  tone(520, 0.06, 'sine', 0.1, 0, 700);
}

export function playToss() {
  noiseHit(0.18, 900, 0.16, 'bandpass');
  tone(300, 0.14, 'sine', 0.08, 0, 520);
}

export function playStir() {
  noiseHit(0.1, 1400, 0.1, 'highpass');
}

export function playDing() {
  tone(880, 0.35, 'sine', 0.16);
  tone(1318, 0.4, 'sine', 0.12, 0.09);
}

export function playCoin() {
  tone(988, 0.09, 'square', 0.07);
  tone(1319, 0.12, 'square', 0.07, 0.08);
  tone(1568, 0.18, 'square', 0.06, 0.16);
}

export function playError() {
  tone(180, 0.18, 'sawtooth', 0.1, 0, 120);
}

export function playBurn() {
  tone(220, 0.4, 'sawtooth', 0.1, 0, 70);
  noiseHit(0.35, 300, 0.14, 'lowpass');
}

export function playOrder() {
  tone(660, 0.1, 'triangle', 0.12);
  tone(880, 0.14, 'triangle', 0.12, 0.1);
}

export function playClick() {
  tone(440, 0.05, 'sine', 0.08);
}

export function startSizzle() {
  const ac = audio();
  if (!ac || muted || sizzleNodes) return;
  const src = ac.createBufferSource();
  src.buffer = noiseBuffer(ac, 1);
  src.loop = true;
  const filter = ac.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 4200;
  filter.Q.value = 0.6;
  const gain = ac.createGain();
  gain.gain.value = 0.045;
  src.connect(filter).connect(gain).connect(ac.destination);
  src.start();
  sizzleNodes = { src, gain };
}

export function stopSizzle() {
  if (!sizzleNodes) return;
  try {
    sizzleNodes.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
    sizzleNodes.src.stop(ctx.currentTime + 0.3);
  } catch {
    // already stopped
  }
  sizzleNodes = null;
}
