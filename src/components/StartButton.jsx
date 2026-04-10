import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  createAudioContext,
  noiseGainFromPercent,
  playBreakEndPing,
  playFocusEndChime,
  startBrownNoise,
} from '../lib/audioSession'

const FOCUS_SEC = 5 * 60
const BREAK_SEC = 2 * 60
const VOLUME_LS_KEY = 'focus-system-brown-noise-volume'

function readSavedVolumePercent() {
  try {
    const raw = localStorage.getItem(VOLUME_LS_KEY)
    if (raw == null) return 50
    const n = Number.parseInt(raw, 10)
    if (Number.isFinite(n)) return Math.max(0, Math.min(100, n))
  } catch {
    /* ignore */
  }
  return 50
}

function formatTime(sec) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function StartButton({ onContinueToFocus }) {
  const [phase, setPhase] = useState('idle')
  const [remaining, setRemaining] = useState(FOCUS_SEC)
  const [noisePercent, setNoisePercent] = useState(readSavedVolumePercent)
  const ctxRef = useRef(null)
  const noiseCtrlRef = useRef(null)
  const focusZeroHandledRef = useRef(false)
  const breakZeroHandledRef = useRef(false)

  const getCtx = () => {
    if (!ctxRef.current) {
      ctxRef.current = createAudioContext()
    }
    if (ctxRef.current.state === 'suspended') {
      void ctxRef.current.resume()
    }
    return ctxRef.current
  }

  const stopNoise = () => {
    noiseCtrlRef.current?.stop()
    noiseCtrlRef.current = null
  }

  useEffect(() => {
    if (phase !== 'focus') {
      stopNoise()
      return
    }
    const ctx = getCtx()
    stopNoise()
    noiseCtrlRef.current = startBrownNoise(
      ctx,
      noiseGainFromPercent(noisePercent),
    )
    return () => {
      stopNoise()
    }
  }, [phase])

  useEffect(() => {
    noiseCtrlRef.current?.setVolume?.(noiseGainFromPercent(noisePercent))
  }, [noisePercent])

  useEffect(() => {
    if (phase !== 'focus' && phase !== 'break') return
    const id = setInterval(() => {
      setRemaining((r) => (r <= 1 ? 0 : r - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [phase])

  useEffect(() => {
    if (remaining !== 0) {
      focusZeroHandledRef.current = false
      breakZeroHandledRef.current = false
      return
    }
    if (phase === 'focus' && !focusZeroHandledRef.current) {
      focusZeroHandledRef.current = true
      const ctx = ctxRef.current
      if (ctx) playFocusEndChime(ctx)
      stopNoise()
      setPhase('break')
      setRemaining(BREAK_SEC)
      return
    }
    if (phase === 'break' && !breakZeroHandledRef.current) {
      breakZeroHandledRef.current = true
      const ctx = ctxRef.current
      if (ctx) playBreakEndPing(ctx)
      setPhase('cycleDone')
    }
  }, [remaining, phase])

  const resetToIdle = () => {
    stopNoise()
    setPhase('idle')
    setRemaining(FOCUS_SEC)
    focusZeroHandledRef.current = false
    breakZeroHandledRef.current = false
  }

  const startFocus = () => {
    getCtx()
    focusZeroHandledRef.current = false
    breakZeroHandledRef.current = false
    setRemaining(FOCUS_SEC)
    setPhase('focus')
  }

  const cancelSession = () => {
    stopNoise()
    setPhase('idle')
    setRemaining(FOCUS_SEC)
    focusZeroHandledRef.current = false
    breakZeroHandledRef.current = false
  }

  return (
    <motion.section
      layout
      className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6"
    >
      <h2 className="mb-4 text-center text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
        Gentle start
      </h2>

      <div className="mb-5 flex w-full max-w-md items-center gap-3">
        <label
          htmlFor="brown-noise-volume"
          className="shrink-0 text-xs font-medium text-zinc-500"
        >
          Brown noise
        </label>
        <input
          id="brown-noise-volume"
          type="range"
          min={0}
          max={100}
          value={noisePercent}
          onChange={(e) => {
            const v = Number(e.target.value)
            setNoisePercent(v)
            try {
              localStorage.setItem(VOLUME_LS_KEY, String(v))
            } catch {
              /* quota */
            }
          }}
          className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-zinc-800 accent-teal-500 [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-teal-500 [&::-webkit-slider-thumb]:shadow [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-teal-500"
        />
        <span className="w-9 shrink-0 text-right text-xs tabular-nums text-zinc-500">
          {noisePercent}%
        </span>
      </div>

      <AnimatePresence mode="wait">
        {phase === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <button
              type="button"
              onClick={startFocus}
              className="w-full rounded-2xl bg-teal-600 px-6 py-5 text-lg font-semibold text-white shadow-lg shadow-teal-900/30 transition hover:bg-teal-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
            >
              Start (5 Minutes)
            </button>
            <p className="text-center text-sm text-zinc-500">
              Brown noise during focus, then a chime. After that, a 2-minute break.
            </p>
          </motion.div>
        )}

        {phase === 'focus' && (
          <motion.div
            key="focus"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <p className="text-center text-xs font-medium uppercase tracking-wider text-teal-500/90">
              Focus · brown noise on
            </p>
            <p className="text-center text-xl font-medium tabular-nums text-zinc-100">
              {formatTime(remaining)}
            </p>
            <p className="text-center text-base leading-relaxed text-zinc-400">
              Just start small. Momentum matters.
            </p>
            <button
              type="button"
              onClick={cancelSession}
              className="rounded-xl border border-zinc-700 px-5 py-2.5 text-sm text-zinc-300 transition hover:bg-zinc-800"
            >
              Cancel
            </button>
          </motion.div>
        )}

        {phase === 'break' && (
          <motion.div
            key="break"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <p className="text-center text-xs font-medium uppercase tracking-wider text-amber-400/90">
              Break
            </p>
            <p className="text-center text-xl font-medium tabular-nums text-zinc-100">
              {formatTime(remaining)}
            </p>
            <p className="text-center text-base leading-relaxed text-zinc-400">
              Step away, breathe, or stretch. Noise is off.
            </p>
            <button
              type="button"
              onClick={cancelSession}
              className="rounded-xl border border-zinc-700 px-5 py-2.5 text-sm text-zinc-300 transition hover:bg-zinc-800"
            >
              End break early
            </button>
          </motion.div>
        )}

        {phase === 'cycleDone' && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <p className="text-center text-zinc-300">
              Nice. You showed up — break is done when you&apos;re ready for another
              round.
            </p>
            <div className="flex w-full flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={startFocus}
                className="flex-1 rounded-xl bg-teal-600 py-4 text-base font-semibold text-white transition hover:bg-teal-500"
              >
                Start again (5 min)
              </button>
              <button
                type="button"
                onClick={() => {
                  onContinueToFocus()
                  resetToIdle()
                }}
                className="flex-1 rounded-xl border border-zinc-600 py-4 text-base font-semibold text-zinc-100 transition hover:bg-zinc-800"
              >
                Continue (15 min focus)
              </button>
            </div>
            <button
              type="button"
              onClick={resetToIdle}
              className="w-full rounded-xl border border-zinc-700 py-3 text-base font-medium text-zinc-400 transition hover:bg-zinc-800/80"
            >
              Stop
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  )
}
