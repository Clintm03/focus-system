import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TaskList from './components/TaskList'
import StartButton from './components/StartButton'
import Timer from './components/Timer'
import TaskDetail from './components/TaskDetail'
import MindSupport from './components/MindSupport'
import {
  defaultState,
  loadPersistedState,
  savePersistedState,
  todayKey,
} from './lib/storage'
import { clearLegacyInboxPath } from './lib/mindStorage'

export default function App() {
  const [persisted, setPersisted] = useState(() => loadPersistedState())
  const { tasks } = persisted
  const [selectedId, setSelectedId] = useState(null)
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
        setSelectedId(null)
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
            onUpdateTask={updateTask}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
          <MindSupport tasks={tasks} onSelectTask={setSelectedId} />
        </div>
        <div className="flex w-full flex-col items-center gap-10 lg:sticky lg:top-8">
          <StartButton
            onContinueToFocus={() => setFocusKick((k) => k + 1)}
          />
          <Timer startFocusSignal={focusKick} />
        </div>
      </main>

      <footer className="pb-10 text-center text-xs text-zinc-600">
        Stored on this device only · {persisted.dayKey}
      </footer>

      <AnimatePresence>
        {selectedId && tasks[selectedId] && (
          <TaskDetail
            key={selectedId}
            taskId={selectedId}
            task={tasks[selectedId]}
            onClose={() => setSelectedId(null)}
            onUpdateSubtasks={updateSubtasks}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
