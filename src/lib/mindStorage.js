import { todayKey } from './storage'

const MIND_KEY = 'focus-system-mind-v1'

export function defaultMindState() {
  return {
    parkingItems: [],
    winItems: [],
    winsDay: '',
    tipIndex: 0,
    preflightDate: '',
    preflightWater: false,
    preflightBathroom: false,
    preflightPhone: false,
  }
}

const MAX_PARKING_TEXT = 2000
const MAX_WIN_TEXT = 500

function normalizeParkingItems(raw) {
  if (Array.isArray(raw.parkingItems)) {
    return raw.parkingItems
      .filter(
        (x) =>
          x &&
          typeof x === 'object' &&
          typeof x.text === 'string' &&
          x.text.trim(),
      )
      .map((x) => ({
        id:
          typeof x.id === 'string' && x.id
            ? x.id
            : `p-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        text: x.text.trim().slice(0, MAX_PARKING_TEXT),
      }))
  }
  if (typeof raw.parkingLot === 'string' && raw.parkingLot.trim()) {
    return [
      {
        id: `migrated-${Date.now()}`,
        text: raw.parkingLot.trim().slice(0, MAX_PARKING_TEXT),
      },
    ]
  }
  return []
}

function normalizeWinItems(rawItems) {
  if (!Array.isArray(rawItems)) return []
  return rawItems
    .filter(
      (x) =>
        x &&
        typeof x === 'object' &&
        typeof x.text === 'string' &&
        x.text.trim(),
    )
    .map((x) => ({
      id:
        typeof x.id === 'string' && x.id
          ? x.id
          : `w-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      text: x.text.trim().slice(0, MAX_WIN_TEXT),
    }))
}

function normalizeWinsForToday(raw, t) {
  if (raw.winsDay === t && Array.isArray(raw.winItems)) {
    return {
      winItems: normalizeWinItems(raw.winItems),
      winsDay: t,
    }
  }
  if (raw.winDay === t && typeof raw.winLine === 'string' && raw.winLine.trim()) {
    return {
      winItems: [
        {
          id: `migrated-win-${Date.now()}`,
          text: raw.winLine.trim().slice(0, MAX_WIN_TEXT),
        },
      ],
      winsDay: t,
    }
  }
  return { winItems: [], winsDay: '' }
}

function normalize(raw) {
  const t = todayKey()
  const base = defaultMindState()
  if (!raw || typeof raw !== 'object') return base

  const samePreflight = raw.preflightDate === t
  const wins = normalizeWinsForToday(raw, t)

  return {
    parkingItems: normalizeParkingItems(raw),
    winItems: wins.winItems,
    winsDay: wins.winsDay,
    tipIndex: Number.isFinite(Number(raw.tipIndex))
      ? Math.max(0, Math.floor(Number(raw.tipIndex)))
      : 0,
    preflightDate: samePreflight ? t : '',
    preflightWater: samePreflight ? Boolean(raw.preflightWater) : false,
    preflightBathroom: samePreflight ? Boolean(raw.preflightBathroom) : false,
    preflightPhone: samePreflight ? Boolean(raw.preflightPhone) : false,
  }
}

export function loadMindState() {
  try {
    const raw = localStorage.getItem(MIND_KEY)
    if (!raw) return defaultMindState()
    return normalize(JSON.parse(raw))
  } catch {
    return defaultMindState()
  }
}

export function saveMindState(state) {
  try {
    localStorage.setItem(MIND_KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

export function clearLegacyInboxPath() {
  try {
    localStorage.removeItem('focus-system-inbox-path')
  } catch {
    /* ignore */
  }
}
