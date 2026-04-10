const STORAGE_KEY = 'focus-system-v1'

export function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

export function emptyTask() {
  return {
    title: '',
    nextStep: '',
    done: false,
    subtasks: [],
  }
}

export function newExtraTaskId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `extra-${crypto.randomUUID()}`
  }
  return `extra-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function defaultState() {
  return {
    dayKey: todayKey(),
    tasks: {
      main: emptyTask(),
      small: emptyTask(),
      admin: emptyTask(),
    },
    extraTaskIds: [],
  }
}

function mergeTask(base, saved) {
  if (!saved || typeof saved !== 'object') return base
  return {
    title: typeof saved.title === 'string' ? saved.title : base.title,
    nextStep: typeof saved.nextStep === 'string' ? saved.nextStep : base.nextStep,
    done: Boolean(saved.done),
    subtasks: Array.isArray(saved.subtasks) ? saved.subtasks : base.subtasks,
  }
}

function normalizeExtraTaskIds(raw) {
  if (!Array.isArray(raw)) return []
  return raw.filter((id) => typeof id === 'string' && id.startsWith('extra-'))
}

export function loadPersistedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState()
    const data = JSON.parse(raw)
    if (data.dayKey !== todayKey()) return defaultState()
    const base = defaultState()
    const tasks = {
      main: mergeTask(base.tasks.main, data.tasks?.main),
      small: mergeTask(base.tasks.small, data.tasks?.small),
      admin: mergeTask(base.tasks.admin, data.tasks?.admin),
    }
    const extraTaskIds = normalizeExtraTaskIds(data.extraTaskIds)
    for (const id of extraTaskIds) {
      tasks[id] = mergeTask(emptyTask(), data.tasks?.[id])
    }
    return {
      dayKey: data.dayKey,
      tasks,
      extraTaskIds,
    }
  } catch {
    return defaultState()
  }
}

export function savePersistedState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore quota */
  }
}
