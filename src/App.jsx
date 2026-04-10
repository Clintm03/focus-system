import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import TaskList from './components/TaskList'
import StartButton from './components/StartButton'
import Timer from './components/Timer'
import MindSupport from './components/MindSupport'
import {
  defaultState,
  emptyTask,
  loadPersistedState,
  newExtraTaskId,
  savePersistedState,
  todayKey,
} from './lib/storage'
import { clearLegacyInboxPath } from './lib/mindStorage'
import {
  persistVolumePercent,
  readSavedVolumePercent,
} from './lib/volumePrefs'

export default function App() {
  const [persisted, setPersisted] = useState(() => loadPersistedState())
  const [noisePercent, setNoisePercent] = useState(readSavedVolumePercent)
  const { tasks, extraTaskIds = [] } = persisted
  const [focusKick, setFocusKick] = useState(0)

  useEffect(() => {
    savePersistedState(persisted)
  }, [persisted])

  useEffect(() => {
    clearLegacyInboxPath()
  }, [])

  useEffect(() => {
    const day = todayKey()
    const id = setInterval(() => {
      if (todayKey() !== day) {
        setPersisted(defaultState())
      }
    }, 60_000)
    return () => clearInterval(id)
  }, [persisted.dayKey])

  const updateTask = (id, patch) => {
    setPersisted((p) => ({
      ...p,
      tasks: {
        ...p.tasks,
        [id]: { ...p.tasks[id], ...patch },
      },
    }))
  }

  const updateSubtasks = (id, subtasks) => {
    setPersisted((p) => ({
      ...p,
      tasks: {
        ...p.tasks,
        [id]: { ...p.tasks[id], subtasks },
      },
    }))
  }

  const addExtraTask = () => {
    const id = newExtraTaskId()
    setPersisted((p) => ({
      ...p,
      extraTaskIds: [...(p.extraTaskIds ?? []), id],
      tasks: { ...p.tasks, [id]: emptyTask() },
    }))
  }

  const removeExtraTask = (id) => {
    if (typeof id !== 'string' || !id.startsWith('extra-')) return
    setPersisted((p) => ({
      ...p,
      extraTaskIds: (p.extraTaskIds ?? []).filter((x) => x !== id),
      tasks: Object.fromEntries(
        Object.entries(p.tasks).filter(([k]) => k !== id),
      ),
    }))
  }

  const setNoisePercentPersisted = (v) => {
    setNoisePercent(v)
    persistVolumePercent(v)
  }

  return (
    <div className="min-h-svh bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900 text-zinc-100">
      <motion.header
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-zinc-800/80 bg-zinc-950/80 py-4 backdrop-blur-sm sm:py-5"
      >
        <div className="mx-auto max-w-2xl px-4 text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500 sm:text-xs">
            Calm productivity
          </p>
          <h1 className="mt-1.5 text-xl font-semibold tracking-tight text-zinc-50 sm:text-2xl">
            Focus System
          </h1>
          <p className="mx-auto mt-1.5 max-w-md text-xs leading-relaxed text-zinc-500 sm:text-sm">
            Three tasks, gentle starts, and timers that respect low energy days.
          </p>
        </div>
      </motion.header>

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-12 lg:grid-cols-2 lg:items-start lg:gap-12 xl:max-w-7xl">
        <div className="flex w-full flex-col items-center gap-10">
          <TaskList
            tasks={tasks}
            extraTaskIds={extraTaskIds}
            onUpdateTask={updateTask}
            onUpdateSubtasks={updateSubtasks}
            onAddExtraTask={addExtraTask}
            onRemoveExtraTask={removeExtraTask}
          />
          <MindSupport
            tasks={tasks}
            extraTaskIds={extraTaskIds}
            onSelectTask={(id) => {
              document
                .getElementById(`task-slot-${id}`)
                ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
            }}
          />
        </div>
        <div className="flex w-full flex-col items-center gap-10 lg:sticky lg:top-8">
          <StartButton
            onContinueToFocus={() => setFocusKick((k) => k + 1)}
            noisePercent={noisePercent}
            onNoisePercentChange={setNoisePercentPersisted}
          />
          <Timer
            startFocusSignal={focusKick}
            noisePercent={noisePercent}
          />
        </div>
      </main>

      <footer className="pb-10 text-center text-xs text-zinc-600">
        Stored on this device only · {persisted.dayKey}
      </footer>

    </div>
  )
}
