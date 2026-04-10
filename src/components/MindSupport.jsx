import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { todayKey } from '../lib/storage'
import { loadMindState, saveMindState } from '../lib/mindStorage'
import DailyBibleStudy from './DailyBibleStudy'

/** Motivational verses — wording aligned with common English Bible translations. */
const SCRIPTURE_TIPS = [
  {
    quote:
      'I can do all this through him who gives me strength.',
    ref: 'Philippians 4:13',
  },
  {
    quote:
      'So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.',
    ref: 'Isaiah 41:10',
  },
  {
    quote:
      'Come to me, all you who are weary and burdened, and I will give you rest.',
    ref: 'Matthew 11:28',
  },
  {
    quote:
      'For the Spirit God gave us does not make us timid, but gives us power, love and self-discipline.',
    ref: '2 Timothy 1:7',
  },
  {
    quote:
      'Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.',
    ref: 'Joshua 1:9',
  },
  {
    quote:
      'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.',
    ref: 'Proverbs 3:5–6',
  },
  {
    quote:
      'Whatever you do, work at it with all your heart, as working for the Lord, not for human masters.',
    ref: 'Colossians 3:23',
  },
  {
    quote:
      'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.',
    ref: 'Romans 8:28',
  },
  {
    quote:
      'Cast your cares on the Lord and he will sustain you; he will never let the righteous be shaken.',
    ref: 'Psalm 55:22',
  },
  {
    quote:
      'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.',
    ref: 'Philippians 4:6–7',
  },
  {
    quote: 'Be still, and know that I am God.',
    ref: 'Psalm 46:10',
  },
  {
    quote:
      'Because of the Lord’s great love we are not consumed, for his compassions never fail. They are new every morning; great is your faithfulness.',
    ref: 'Lamentations 3:22–23',
  },
  {
    quote:
      'Let us run with perseverance the race marked out for us, fixing our eyes on Jesus, the pioneer and perfecter of faith.',
    ref: 'Hebrews 12:1–2',
  },
  {
    quote:
      'If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault, and it will be given to you.',
    ref: 'James 1:5',
  },
  {
    quote:
      'Stand firm. Let nothing move you. Always give yourselves fully to the work of the Lord, because you know that your labor in the Lord is not in vain.',
    ref: '1 Corinthians 15:58',
  },
  {
    quote:
      'I lift up my eyes to the mountains—where does my help come from? My help comes from the Lord, the Maker of heaven and earth.',
    ref: 'Psalm 121:1–2',
  },
]

/** Classic box / tactical 4-4-4-4: inhale → hold full → exhale → hold empty (4s each). */
const BOX_SECONDS = 4
const BOX_PHASES = [
  { label: 'Inhale', cue: 'Through the nose — fill the lungs' },
  { label: 'Hold (full)', cue: 'Keep lungs full — easy, no strain' },
  { label: 'Exhale', cue: 'Let the breath out — slow and steady' },
  { label: 'Hold (empty)', cue: 'Lungs empty — brief pause' },
]

function pickSlot(tasks) {
  const ids = ['main', 'small', 'admin']
  const notDone = ids.filter((id) => !tasks[id]?.done)
  const pool = notDone.length ? notDone : ids
  const titled = pool.filter((id) => tasks[id]?.title?.trim())
  const pickFrom = titled.length ? titled : pool
  return pickFrom[Math.floor(Math.random() * pickFrom.length)]
}

function BoxBreathing() {
  /** One object updated each tick so phase + countdown never drift apart. */
  const [session, setSession] = useState(null)
  const running = session !== null
  const phase = session?.phase ?? 0
  const secLeft = session?.secLeft ?? BOX_SECONDS

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      setSession((st) => {
        if (!st) return null
        if (st.secLeft > 1) {
          return { phase: st.phase, secLeft: st.secLeft - 1 }
        }
        if (st.phase >= BOX_PHASES.length - 1) {
          return null
        }
        return { phase: st.phase + 1, secLeft: BOX_SECONDS }
      })
    }, 1000)
    return () => clearInterval(id)
  }, [running])

  const stop = () => setSession(null)

  const start = () => setSession({ phase: 0, secLeft: BOX_SECONDS })

  return (
    <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        Box breathing (4-4-4-4)
      </p>
      <p className="mt-1 text-sm text-zinc-500">
        True box breath:{' '}
        <span className="text-zinc-400">
          inhale 4s → hold full 4s → exhale 4s → hold empty 4s
        </span>
        . That’s four sides of the square—then it stops. Start again anytime;
        use Stop early if you need out.
      </p>
      <p className="mt-2 font-mono text-[11px] leading-relaxed text-zinc-600">
        Inhale ↑ · hold full → · exhale ↓ · hold empty ←
      </p>
      <AnimatePresence mode="wait">
        {running ? (
          <motion.div
            key="run"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 flex flex-col items-center gap-2"
          >
            <p className="text-sm font-medium text-teal-400/90">
              {BOX_PHASES[phase]?.label}
            </p>
            <p className="max-w-[16rem] text-center text-xs leading-relaxed text-zinc-500">
              {BOX_PHASES[phase]?.cue}
            </p>
            <p className="text-4xl font-light tabular-nums text-zinc-100">
              {secLeft}
            </p>
            <p className="text-[11px] text-zinc-600">
              {BOX_SECONDS} seconds · step {phase + 1} of {BOX_PHASES.length}
            </p>
            <button
              type="button"
              onClick={stop}
              className="mt-2 rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
            >
              Stop early
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4"
          >
            <button
              type="button"
              onClick={start}
              className="rounded-xl bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-100 hover:bg-zinc-700"
            >
              Start one box (4×4s ≈ 16s)
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function newParkingId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `p-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export default function MindSupport({ tasks, onSelectTask }) {
  const [mind, setMind] = useState(loadMindState)
  const [parkingDraft, setParkingDraft] = useState('')

  useEffect(() => {
    saveMindState(mind)
  }, [mind])

  const t = todayKey()
  const verse =
    SCRIPTURE_TIPS[mind.tipIndex % SCRIPTURE_TIPS.length]

  const setPreflight = (key, value) => {
    setMind((m) => ({
      ...m,
      preflightDate: t,
      [key]: value,
    }))
  }

  const pickForMe = () => {
    const id = pickSlot(tasks)
    onSelectTask(id)
  }

  const parkingItems = mind.parkingItems ?? []

  const addParkingItem = () => {
    const text = parkingDraft.trim()
    if (!text) return
    setMind((m) => ({
      ...m,
      parkingItems: [...(m.parkingItems ?? []), { id: newParkingId(), text }],
    }))
    setParkingDraft('')
  }

  const removeParkingItem = (id) => {
    setMind((m) => ({
      ...m,
      parkingItems: (m.parkingItems ?? []).filter((x) => x.id !== id),
    }))
  }

  const clearParkingLot = () => {
    setMind((m) => ({ ...m, parkingItems: [] }))
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full min-w-0 max-w-lg space-y-4"
    >
      <h2 className="text-center text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
        Mind &amp; focus tools
      </h2>
      <p className="text-center text-xs text-zinc-600">
        Practical supports (parking lot, breathing, picks), a daily Bible study
        passage, and Scripture in Today&apos;s tip — externalize time and anchor
        your day.
      </p>

      <div className="min-w-0 space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Brain parking lot
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            Add a thought or reminder; it saves here. Remove items when you&apos;re
            done or they no longer need a slot in your head.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
            <textarea
              value={parkingDraft}
              onChange={(e) => setParkingDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault()
                  addParkingItem()
                }
              }}
              rows={2}
              placeholder="Type a worry, idea, or reminder — Ctrl+Enter to save"
              className="min-h-[2.75rem] min-w-0 flex-1 resize-y rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
            <button
              type="button"
              onClick={addParkingItem}
              className="shrink-0 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-500"
            >
              Save
            </button>
          </div>
          <div className="mt-4 min-w-0 rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-600">
                Parked ({parkingItems.length})
              </p>
              {parkingItems.length > 0 && (
                <button
                  type="button"
                  onClick={clearParkingLot}
                  className="text-[11px] text-zinc-500 hover:text-zinc-400"
                >
                  Clear all
                </button>
              )}
            </div>
            {parkingItems.length === 0 ? (
              <p className="py-6 text-center text-sm text-zinc-600">
                Nothing parked yet — add something above when your brain gets loud.
              </p>
            ) : (
              <ul className="max-h-60 min-w-0 space-y-2 overflow-y-auto overflow-x-hidden pr-1">
                {parkingItems.map((item) => (
                  <li
                    key={item.id}
                    className="flex min-w-0 gap-2 rounded-lg border border-zinc-800/90 bg-zinc-900/50 px-3 py-2.5"
                  >
                    <p className="min-w-0 flex-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-zinc-200">
                      {item.text}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeParkingItem(item.id)}
                      className="shrink-0 self-start rounded-md px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
                      aria-label="Remove item"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="border-t border-zinc-800 pt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Pre-flight (today)
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            Tiny setup reduces mid-session bounce-outs.
          </p>
          <ul className="mt-3 space-y-2">
            {[
              ['preflightWater', 'Water within reach', mind.preflightWater],
              ['preflightBathroom', 'Bathroom if needed', mind.preflightBathroom],
              ['preflightPhone', 'Phone face-down / away', mind.preflightPhone],
            ].map(([key, label, checked]) => (
              <li key={key}>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => setPreflight(key, e.target.checked)}
                    className="size-4 rounded border-zinc-600 bg-zinc-950 text-teal-500"
                  />
                  {label}
                </label>
              </li>
            ))}
          </ul>
        </div>

        <BoxBreathing />

        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Stuck choosing?
          </p>
          <button
            type="button"
            onClick={pickForMe}
            className="mt-3 w-full rounded-xl border border-teal-800/60 bg-teal-950/30 py-3 text-sm font-semibold text-teal-100 hover:bg-teal-950/50"
          >
            Pick a task for me
          </button>
          <p className="mt-2 text-center text-xs text-zinc-600">
            Opens a random incomplete slot (prefers one with a title).
          </p>
        </div>

        <DailyBibleStudy dayKey={t} />

        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Today&apos;s tip
          </p>
          <p className="mt-0.5 text-[11px] text-zinc-600">
            From Scripture — tap below for another verse.
          </p>
          <blockquote className="mt-3 border-l-2 border-teal-600/50 pl-3">
            <p className="text-sm italic leading-relaxed text-zinc-200">
              &ldquo;{verse.quote}&rdquo;
            </p>
            <footer className="mt-2 text-xs font-medium text-teal-500/90">
              {verse.ref}
            </footer>
          </blockquote>
          <button
            type="button"
            onClick={() =>
              setMind((m) => ({
                ...m,
                tipIndex: (m.tipIndex + 1) % SCRIPTURE_TIPS.length,
              }))
            }
            className="mt-3 text-xs text-teal-500/90 hover:text-teal-400"
          >
            Another verse
          </button>
        </div>

        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Today&apos;s win (one line)
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            No streaks—just what you want to remember about showing up.
          </p>
          <input
            type="text"
            value={mind.winLine}
            onChange={(e) => {
              const v = e.target.value
              setMind((m) => ({
                ...m,
                winLine: v,
                winDay: v.trim() ? t : '',
              }))
            }}
            placeholder="e.g. Started the scary email / sat for 5 minutes"
            className="mt-3 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
          />
        </div>
      </div>
    </motion.section>
  )
}
