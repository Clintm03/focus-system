import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { createAudioContext, playFocusEndChime } from '../lib/audioSession'

const FOCUS_SEC = 15 * 60

function formatTime(sec) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function Timer({ startFocusSignal = 0, noisePercent = 50 }) {
  const [mode, setMode] = useState('focus')
  const [remaining, setRemaining] = useState(FOCUS_SEC)
  /** Count-up seconds while on break (until you press Start Focus). */
  const [breakElapsed, setBreakElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const lastSignalRef = useRef(0)
  const ctxRef = useRef(null)
  const focusZeroSoundRef = useRef(false)

  const getCtx = () => {
    if (!ctxRef.current) {
      ctxRef.current = createAudioContext()
    }
    if (ctxRef.current.state === 'suspended') {
      void ctxRef.current.resume()
    }
    return ctxRef.current
  }

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      if (mode === 'focus') {
        setRemaining((r) => (r <= 1 ? 0 : r - 1))
      } else {
        setBreakElapsed((e) => e + 1)
      }
    }, 1000)
    return () => clearInterval(id)
  }, [running, mode])

  useEffect(() => {
    if (!running || remaining > 0 || mode !== 'focus') return
    const id = setTimeout(() => {
      setMode('break')
      setBreakElapsed(0)
    }, 0)
    return () => clearTimeout(id)
  }, [running, remaining, mode])

  useEffect(() => {
    if (remaining !== 0) {
      focusZeroSoundRef.current = false
      return
    }
    if (!running || mode !== 'focus' || focusZeroSoundRef.current) return
    focusZeroSoundRef.current = true
    const ctx = ctxRef.current
    if (ctx) playFocusEndChime(ctx, noisePercent)
  }, [remaining, running, mode, noisePercent])

  useEffect(() => {
    if (startFocusSignal === 0 || startFocusSignal === lastSignalRef.current)
      return
    lastSignalRef.current = startFocusSignal
    getCtx()
    setMode('focus')
    setRemaining(FOCUS_SEC)
    setBreakElapsed(0)
    setRunning(true)
  }, [startFocusSignal])

  const startFocus = () => {
    getCtx()
    setMode('focus')
    setRemaining(FOCUS_SEC)
    setBreakElapsed(0)
    setRunning(true)
  }

  const pause = () => {
    setRunning(false)
  }

  const reset = () => {
    setRunning(false)
    setMode('focus')
    setRemaining(FOCUS_SEC)
    setBreakElapsed(0)
  }

  const modeLabel = mode === 'focus' ? 'Focus' : 'On break'
  const modeColor =
    mode === 'focus'
      ? 'text-teal-400 bg-teal-950/40 border-teal-800/60'
      : 'text-amber-200 bg-amber-950/30 border-amber-900/50'

  const onBreak = mode === 'break'

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

      {onBreak ? (
        <>
          <p className="mb-1 text-center text-sm text-amber-400/90">
            Break time — counting up
          </p>
          <p className="mb-1 text-center text-4xl font-light tabular-nums tracking-tight text-amber-100">
            {formatTime(breakElapsed)}
          </p>
          <p className="mb-1 text-center text-sm tabular-nums text-zinc-500">
            {breakElapsed} second{breakElapsed === 1 ? '' : 's'} on break
          </p>
          <p className="mb-2 text-center text-xs text-zinc-500">
            Counts 1, 2, 3… until you press{' '}
            <span className="text-zinc-400">I&apos;m back · Start focus</span> (or
            start Gentle start again from the left).
          </p>
        </>
      ) : (
        <p className="mb-2 text-center text-4xl font-light tabular-nums tracking-tight text-zinc-100">
          {formatTime(remaining)}
        </p>
      )}

      <p className="mb-6 text-center text-sm text-zinc-500">
        15 min focus · break has no countdown — it runs until you say you&apos;re
        back.
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={startFocus}
          className="min-w-[140px] rounded-xl bg-zinc-100 px-5 py-3.5 text-base font-semibold text-zinc-900 transition hover:bg-white"
        >
          {onBreak ? "I'm back · Start focus" : 'Start Focus'}
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
