import { motion } from 'framer-motion'

const SLOTS = [
  { id: 'main', label: 'Main task', hint: 'The one thing that moves the needle' },
  { id: 'small', label: 'Small task', hint: 'Quick win' },
  { id: 'admin', label: 'Life / admin', hint: 'Bill, email, chore' },
]

function formatSubtaskCount(task) {
  const n = task.subtasks?.length ?? 0
  if (n === 0) return null
  const done = task.subtasks.filter((s) => s.done).length
  return `${done}/${n} steps`
}

export default function TaskList({ tasks, onUpdateTask, selectedId, onSelect }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-lg space-y-4"
    >
      <h2 className="text-center text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
        Today (3 tasks)
      </h2>
      <ul className="space-y-3">
        {SLOTS.map((slot, i) => {
          const task = tasks[slot.id]
          const selected = selectedId === slot.id
          const subHint = formatSubtaskCount(task)
          return (
            <motion.li
              key={slot.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.3 }}
            >
              <div
                role="button"
                tabIndex={0}
                onClick={() => onSelect(slot.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelect(slot.id)
                  }
                }}
                className={`w-full cursor-pointer rounded-2xl border text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-teal-500/50 ${
                  selected
                    ? 'border-teal-500/50 bg-teal-950/30 ring-1 ring-teal-500/20'
                    : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                }`}
              >
                <div className="flex gap-3 p-4">
                  <label className="flex shrink-0 cursor-pointer items-start pt-0.5">
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={(e) => {
                        e.stopPropagation()
                        onUpdateTask(slot.id, { done: e.target.checked })
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-0.5 size-5 rounded border-zinc-600 bg-zinc-950 text-teal-500 focus:ring-teal-500/40"
                    />
                  </label>
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                        {slot.label}
                      </span>
                      {subHint && (
                        <span className="text-xs text-zinc-600">{subHint}</span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={task.title}
                      onChange={(e) =>
                        onUpdateTask(slot.id, { title: e.target.value })
                      }
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Title"
                      className="w-full border-0 bg-transparent text-lg font-medium text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-0"
                    />
                    <input
                      type="text"
                      value={task.nextStep}
                      onChange={(e) =>
                        onUpdateTask(slot.id, { nextStep: e.target.value })
                      }
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Next step (optional)"
                      className="w-full border-0 bg-transparent text-sm text-zinc-400 placeholder:text-zinc-600 focus:outline-none focus:ring-0"
                    />
                    <p className="text-xs text-zinc-600">{slot.hint}</p>
                  </div>
                </div>
              </div>
            </motion.li>
          )
        })}
      </ul>
    </motion.section>
  )
}
