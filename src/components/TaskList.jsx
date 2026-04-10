import { useState } from 'react'
import { motion } from 'framer-motion'
import { emptyTask } from '../lib/storage'

const SLOTS = [
  { id: 'main', label: 'Main task', hint: 'The one thing that moves the needle' },
  { id: 'small', label: 'Small task', hint: 'Quick win' },
  { id: 'admin', label: 'Life / admin', hint: 'Bill, email, chore' },
]

function buildSlots(extraTaskIds) {
  const core = SLOTS.map((s) => ({ ...s, removable: false }))
  const extras = (extraTaskIds ?? []).map((id) => ({
    id,
    label: 'Additional task',
    hint: 'Extra slot for today — remove the slot when you no longer need it',
    removable: true,
  }))
  return [...core, ...extras]
}

function formatSubtaskCount(task) {
  const n = task.subtasks?.length ?? 0
  if (n === 0) return null
  const done = task.subtasks.filter((s) => s.done).length
  return `${done}/${n} steps`
}

function newSubtaskId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `s-${Date.now()}`
}

function TaskInlineSubtasks({ taskId, task, onUpdateSubtasks }) {
  const [draft, setDraft] = useState('')
  const subtasks = task.subtasks ?? []

  const add = () => {
    const text = draft.trim()
    if (!text) return
    onUpdateSubtasks(taskId, [
      ...subtasks,
      { id: newSubtaskId(), text, done: false },
    ])
    setDraft('')
  }

  const toggle = (sid) => {
    onUpdateSubtasks(
      taskId,
      subtasks.map((s) => (s.id === sid ? { ...s, done: !s.done } : s)),
    )
  }

  const remove = (sid) => {
    onUpdateSubtasks(
      taskId,
      subtasks.filter((s) => s.id !== sid),
    )
  }

  return (
    <div className="mt-3 border-t border-zinc-800/80 pt-3">
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
        Break it down
      </p>
      {subtasks.length === 0 && (
        <p className="mt-1.5 text-xs text-zinc-600">
          Add tiny steps. Small lists feel lighter.
        </p>
      )}
      {subtasks.length > 0 && (
        <ul className="mt-2 max-h-40 space-y-1.5 overflow-y-auto overflow-x-hidden pr-0.5">
          {subtasks.map((s) => (
            <li
              key={s.id}
              className="flex items-center gap-2 rounded-lg border border-zinc-800/80 bg-zinc-950/50 px-2.5 py-1.5"
            >
              <input
                type="checkbox"
                checked={s.done}
                onChange={() => toggle(s.id)}
                className="size-4 shrink-0 rounded border-zinc-600 bg-zinc-950 text-teal-500"
              />
              <span
                className={`min-w-0 flex-1 text-sm leading-snug ${
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
      )}
      <div className="mt-2 flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') add()
          }}
          placeholder="Next tiny step..."
          className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
        />
        <button
          type="button"
          onClick={add}
          className="shrink-0 rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-500"
        >
          Add
        </button>
      </div>
    </div>
  )
}

export default function TaskList({
  tasks,
  extraTaskIds = [],
  onUpdateTask,
  onUpdateSubtasks,
  onAddExtraTask,
  onRemoveExtraTask,
}) {
  const slots = buildSlots(extraTaskIds)
  const taskCount = slots.length

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-lg space-y-4"
    >
      <h2 className="text-center text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
        Today ({taskCount} {taskCount === 1 ? 'task' : 'tasks'})
      </h2>
      <ul className="space-y-3">
        {slots.map((slot, i) => {
          const task = tasks[slot.id] ?? emptyTask()
          const subHint = formatSubtaskCount(task)
          return (
            <motion.li
              key={slot.id}
              id={`task-slot-${slot.id}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.3 }}
              className="scroll-mt-24"
            >
              <div
                className="w-full rounded-2xl border border-zinc-700 bg-zinc-900/40 text-left transition-colors hover:border-zinc-600"
              >
                <div className="flex gap-3 p-4">
                  <label className="flex shrink-0 cursor-pointer items-start pt-0.5">
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={(e) =>
                        onUpdateTask(slot.id, { done: e.target.checked })
                      }
                      className="mt-0.5 size-5 rounded border-zinc-600 bg-zinc-950 text-teal-500 focus:ring-teal-500/40"
                    />
                  </label>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                        {slot.label}
                      </span>
                      <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
                        {subHint && (
                          <span className="text-xs text-zinc-600">{subHint}</span>
                        )}
                        {slot.removable && (
                          <button
                            type="button"
                            onClick={() => onRemoveExtraTask(slot.id)}
                            className="text-xs text-zinc-500 hover:text-zinc-400"
                          >
                            Remove slot
                          </button>
                        )}
                      </div>
                    </div>
                    <input
                      type="text"
                      value={task.title}
                      onChange={(e) =>
                        onUpdateTask(slot.id, { title: e.target.value })
                      }
                      placeholder="Enter Title"
                      className="w-full border-0 bg-transparent text-lg font-medium text-zinc-100 placeholder:font-normal placeholder:text-zinc-400 focus:outline-none focus:ring-0"
                    />
                    <input
                      type="text"
                      value={task.nextStep}
                      onChange={(e) =>
                        onUpdateTask(slot.id, { nextStep: e.target.value })
                      }
                      placeholder="Enter Next step (optional)"
                      className="w-full border-0 bg-transparent text-sm text-zinc-400 placeholder:text-zinc-500 focus:outline-none focus:ring-0"
                    />
                    <p className="text-xs text-zinc-600">{slot.hint}</p>
                    <TaskInlineSubtasks
                      taskId={slot.id}
                      task={task}
                      onUpdateSubtasks={onUpdateSubtasks}
                    />
                  </div>
                </div>
              </div>
            </motion.li>
          )
        })}
      </ul>
      <button
        type="button"
        onClick={onAddExtraTask}
        className="w-full rounded-2xl border border-dashed border-zinc-600 bg-zinc-900/20 px-4 py-3.5 text-sm font-medium text-zinc-400 transition hover:border-zinc-500 hover:bg-zinc-900/40 hover:text-zinc-300"
      >
        Add another task
      </button>
    </motion.section>
  )
}
