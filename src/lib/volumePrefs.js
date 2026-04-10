export const VOLUME_LS_KEY = 'focus-system-brown-noise-volume'

export function readSavedVolumePercent() {
  try {
    const raw = localStorage.getItem(VOLUME_LS_KEY)
    if (raw == null) return 50
    const n = Number.parseInt(raw, 10)
    if (Number.isFinite(n)) return Math.max(0, Math.min(100, n))
  } catch {
    /* ignore */
  }
  return 50
}

export function persistVolumePercent(value) {
  try {
    localStorage.setItem(VOLUME_LS_KEY, String(value))
  } catch {
    /* quota */
  }
}
