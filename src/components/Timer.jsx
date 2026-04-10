import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

const FOCUS_SEC = 15 * 60
const BREAK_SEC = 5 * 60

function formatTime(sec) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function Timer({ startFocusSignal = 0 }) {
  const [mode, setMode] = useState('focus')
  const [remaining, setRemaining] = useState(FOCUS_SEC)
  const [running, setRunning] = useState(false)
  /** During break only: 'countdown' until 0, then 'over' = past break (your time). */
  const [breakPhase, setBreakPhase] = useState('countdown')
  const [breakOverSec, setBreakOverSec] = useState(0)
  const lastSignalRef = useRef(0)

  // Count down only when not in "over break" stretch
  useEffect(() => {
    if (!running) return
    if (mode === 'break' && breakPhase === 'over') return
    const id = setInterval(() => {
      setRemaining((r) => (r <= 1 ? 0 : r - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [running, mode, breakPhase])

  // Count up during over-break (for your own awareness)
  useEffect(() => {
    if (!running || mode !== 'break' || breakPhase !== 'over') return
    const id = setInterval(() => {
      setBreakOverSec((s) => s + 1)
    }, 1000)
    return () => clearInterval(id)
  }, [running, mode, breakPhase])

  useEffect(() => {
    if (!running || remaining > 0) return
    const id = setTimeout(() => {
      if (mode === 'focus') {
        setMode('break')
        setRemaining(BREAK_SEC)
        setBreakPhase('countdown')
        setBreakOverSec(0)
        return
      }
      if (mode === 'break' && breakPhase === 'countdown') {
        setBreakPhase('over')
        setBreakOverSec(0)
      }
    }, 0)
    return () => clearTimeout(id)
  }, [running, remaining, mode, breakPhase])

  useEffect(() => {
    if (startFocusSignal === 0 || startFocusSignal === lastSignalRef.current)
      return
    lastSignalRef.current = startFocusSignal
    setMode('focus')
    setRemaining(FOCUS_SEC)
    setBreakPhase('countdown')
    setBreakOverSec(0)
    setRunning(true)
  }, [startFocusSignal])

  const startFocus = () => {
    setMode('focus')
    setRemaining(FOCUS_SEC)
    setBreakPhase('countdown')
    setBreakOverSec(0)
    setRunning(true)
  }

  const pause = () => {
    setRunning(false)
  }

  const reset = () => {
    setRunning(false)
    setMode('focus')
    setRemaining(FOCUS_SEC)
    setBreakPhase('countdown')
    setBreakOverSec(0)
  }

  const modeLabel =
    mode === 'break' && breakPhase === 'over' ? 'Break · over' : mode === 'focus'
      ? 'Focus'
      : 'Break'
  const modeColor =
    mode === 'focus'
      ? 'text-teal-400 bg-teal-950/40 border-teal-800/60'
      : breakPhase === 'over'
        ? 'text-amber-300 bg-amber-950/50 border-amber-800/60'
        : 'text-amber-200 bg-amber-950/30 border-amber-900/50'

  const inBreakOver = mode === 'break' && breakPhase === 'over'

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05 }}
      className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6"
    >
      <div className="mb-4 flex items-center justify-center gap-3">
        <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
          Pomodoro
        </h2>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${modeColor}`}
        >
          {modeLabel}
        </span>
      </div>

      {inBreakOver ? (
        <>
          <p className="mb-1 text-center text-sm text-amber-400/90">
            5 minutes are up — stay on break as long as you need.
          </p>
          <p className="mb-1 text-center text-3xl font-light tabular-nums tracking-tight text-amber-200">
            +{formatTime(breakOverSec)}
          </p>
          <p className="mb-2 text-center text-xs text-zinc-500">
            Time past break (just for you — no score, no guilt).
          </p>
        </>
      ) : (
        <p className="mb-2 text-center text-4xl font-light tabular-nums tracking-tight text-zinc-100">
          {formatTime(remaining)}
        </p>
      )}

      <p className="mb-6 text-center text-sm text-zinc-500">
        15 min focus · 5 min break · after break ends, timer shows extra break time;
        press Start Focus when you&apos;re ready (no auto-start).
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={startFocus}
          className="min-w-[140px] rounded-xl bg-zinc-100 px-5 py-3.5 text-base font-semibold text-zinc-900 transition hover:bg-white"
        >
          Start Focus
        </button>
        <button
          type="button"
          onClick={pause}
          className="min-w-[120px] rounded-xl border border-zinc-600 px-5 py-3.5 text-base font-medium text-zinc-200 transition hover:bg-zinc-800"
        >
          Pause
        </button>
        <button
          type="button"
          onClick={reset}
          className="min-w-[120px] rounded-xl border border-zinc-700 px-5 py-3.5 text-base font-medium text-zinc-400 transition hover:bg-zinc-800/80"
        >
          Reset
        </button>
      </div>
    </motion.section>
  )
}
