import { useState } from 'react'
import { motion } from 'framer-motion'

const LABELS = { main: 'Main task', small: 'Small task', admin: 'Life / admin' }

export default function TaskDetail({
  taskId,
  task,
  onClose,
  onUpdateSubtasks,
}) {
  const [draft, setDraft] = useState('')

  if (!taskId || !task) return null

  const addSubtask = () => {
    const text = draft.trim()
    if (!text) return
    const id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `s-${Date.now()}`
    onUpdateSubtasks(taskId, [
      ...(task.subtasks ?? []),
      { id, text, done: false },
    ])
    setDraft('')
  }

  const toggle = (id) => {
    onUpdateSubtasks(
      taskId,
      task.subtasks.map((s) =>
        s.id === id ? { ...s, done: !s.done } : s,
      ),
    )
  }

  const remove = (id) => {
    onUpdateSubtasks(
      taskId,
      task.subtasks.filter((s) => s.id !== id),
    )
  }

  return (
    <motion.div
      role="presentation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/55 p-4 sm:items-center"
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-detail-title"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-zinc-800 p-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
              Break it down
            </p>
            <h3
              id="task-detail-title"
              className="mt-1 text-lg font-semibold text-zinc-100"
            >
              {LABELS[taskId] ?? 'Task'}
            </h3>
            {task.title ? (
              <p className="mt-1 line-clamp-2 text-sm text-zinc-400">
                {task.title}
              </p>
            ) : (
              <p className="mt-1 text-sm text-zinc-600">No title yet</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm text-zinc-400 transition hover:bg-zinc-900 hover:text-zinc-200"
          >
            Close
          </button>
        </div>

        <div className="max-h-[55vh] space-y-3 overflow-y-auto p-5">
          {(task.subtasks ?? []).length === 0 && (
            <p className="text-center text-sm text-zinc-500">
              Add tiny steps. Small lists feel lighter.
            </p>
          )}
          <ul className="space-y-2">
            {(task.subtasks ?? []).map((s) => (
              <li
                key={s.id}
                className="flex items-center gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/40 px-3 py-2"
              >
                <input
                  type="checkbox"
                  checked={s.done}
                  onChange={() => toggle(s.id)}
                  className="size-4 shrink-0 rounded border-zinc-600 bg-zinc-950 text-teal-500"
                />
                <span
                  className={`min-w-0 flex-1 text-sm ${
                    s.done ? 'text-zinc-500 line-through' : 'text-zinc-200'
                  }`}
                >
                  {s.text}
                </span>
                <button
                  type="button"
                  onClick={() => remove(s.id)}
                  className="shrink-0 text-xs text-zinc-600 hover:text-zinc-400"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-zinc-800 p-5">
          <div className="flex gap-2">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addSubtask()
              }}
              placeholder="Next tiny step…"
              className="min-w-0 flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
            <button
              type="button"
              onClick={addSubtask}
              className="rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-500"
            >
              Add
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
