import { motion } from 'framer-motion'
import { getDailyPrayer, getDailyStudy } from '../lib/dailyStudy'

export default function DailyBibleStudy({ dayKey }) {
  const study = getDailyStudy(dayKey)
  const prayer = getDailyPrayer(dayKey)
  const href = `https://www.biblegateway.com/passage/?search=${study.bgSearch}&version=NIV`

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-4"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-amber-500/90">
        Daily Bible study
      </p>
      <p className="mt-1 text-[11px] text-zinc-500">
        One passage for {dayKey} — journal, pray, or discuss. Changes at the next
        calendar day.
      </p>
      <p className="mt-3 text-sm font-semibold text-zinc-100">{study.ref}</p>
      <blockquote className="mt-3 max-h-[min(22rem,50svh)] overflow-y-auto border-l-2 border-amber-600/45 pl-3 pr-1">
        <p className="text-sm leading-relaxed text-zinc-300">{study.text}</p>
      </blockquote>
      <p className="mt-4 text-xs font-medium uppercase tracking-wide text-zinc-500">
        Study prompts
      </p>
      <ul className="mt-2 list-inside list-disc space-y-2 text-sm leading-relaxed text-zinc-400">
        {study.prompts.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>

      <div className="mt-5 border-t border-amber-900/35 pt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-amber-500/90">
          Prayer for today
        </p>
        <p className="mt-1 text-[11px] text-zinc-500">
          Written to pair with today&apos;s passage — speak it, adapt it, or use
          it as a starting point.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-zinc-200">{prayer}</p>
      </div>

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-amber-800/50 bg-amber-950/40 py-3 text-sm font-medium text-amber-100/95 transition hover:bg-amber-950/60"
      >
        Open in Bible Gateway (NIV)
      </a>
      <p className="mt-2 text-center text-[10px] text-zinc-600">
        You can switch translation on Bible Gateway. Wording here is for study,
        not a published translation.
      </p>
    </motion.div>
  )
}
