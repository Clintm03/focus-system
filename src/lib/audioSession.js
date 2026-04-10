/** Browser AudioContext (Safari webkit prefix). */
export function createAudioContext() {
  const AC = window.AudioContext || window.webkitAudioContext
  return new AC()
}

const MAX_NOISE_GAIN = 0.26

/** Map slider 0–100 to a safe gain for brown noise. */
export function noiseGainFromPercent(percent) {
  const p = Math.max(0, Math.min(100, Number(percent) || 0))
  return (p / 100) * MAX_NOISE_GAIN
}

/**
 * Soft brown noise: leaky integrator on white noise, looped buffer, light low-pass.
 * Returns `{ stop, setVolume }` — `setVolume` accepts linear gain (same scale as initial).
 */
export function startBrownNoise(audioContext, volume = 0.12) {
  if (!audioContext) {
    return {
      stop: () => {},
      setVolume: () => {},
    }
  }
  if (audioContext.state === 'suspended') {
    void audioContext.resume()
  }

  const seconds = 2.5
  const length = Math.floor(audioContext.sampleRate * seconds)
  const buffer = audioContext.createBuffer(1, length, audioContext.sampleRate)
  const data = buffer.getChannelData(0)
  let last = 0
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1
    last = (last + 0.02 * white) / 1.02
    data[i] = Math.max(-1, Math.min(1, last * 3.2))
  }

  const src = audioContext.createBufferSource()
  src.buffer = buffer
  src.loop = true

  const filter = audioContext.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 2600
  filter.Q.value = 0.7

  const gain = audioContext.createGain()
  gain.gain.value = Math.min(MAX_NOISE_GAIN, Math.max(0, volume))

  src.connect(filter)
  filter.connect(gain)
  gain.connect(audioContext.destination)
  src.start()

  const stop = () => {
    try {
      src.stop()
      src.disconnect()
      filter.disconnect()
      gain.disconnect()
    } catch {
      /* already stopped */
    }
  }

  const setVolume = (v) => {
    gain.gain.value = Math.min(MAX_NOISE_GAIN, Math.max(0, v))
  }

  return { stop, setVolume }
}

/** Pleasant two-tone chime when the focus block ends. `volumePercent` 0–100 matches the brown-noise slider. */
export function playFocusEndChime(audioContext, volumePercent = 100) {
  if (!audioContext) return
  const p = Math.max(0, Math.min(100, Number(volumePercent) || 0))
  if (p <= 0) return
  if (audioContext.state === 'suspended') {
    void audioContext.resume()
  }
  const t = audioContext.currentTime
  const peak = 0.12 * (p / 100)
  const g = audioContext.createGain()
  g.connect(audioContext.destination)
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(peak, t + 0.03)
  g.gain.exponentialRampToValueAtTime(0.0008, t + 0.75)

  const freqs = [523.25, 659.25]
  freqs.forEach((freq, i) => {
    const osc = audioContext.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, t)
    osc.connect(g)
    osc.start(t + i * 0.04)
    osc.stop(t + 0.8)
  })
}

/** Shorter ping when the break ends — “you can go again.” */
export function playBreakEndPing(audioContext) {
  if (!audioContext) return
  if (audioContext.state === 'suspended') {
    void audioContext.resume()
  }
  const t = audioContext.currentTime
  const osc = audioContext.createOscillator()
  const g = audioContext.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(440, t)
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(0.08, t + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0008, t + 0.35)
  osc.connect(g)
  g.connect(audioContext.destination)
  osc.start(t)
  osc.stop(t + 0.4)
}
