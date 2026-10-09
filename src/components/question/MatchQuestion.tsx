import clsx from 'clsx'
import { ArrowRight } from 'lucide-react'
import { useMemo } from 'react'
import type { MatchQuestion as Q } from '../../content/schema'
import { createRng, hashSeed, shuffle } from '../../engine/random'
import type { Answer } from '../../engine/types'
import { plainText, RichText, WhyNote } from './shared'

interface Props {
  question: Q
  answer: Answer | undefined
  onChange: (a: Answer) => void
  revealed: boolean
  seed: number
}

export function MatchQuestion({ question: q, answer, onChange, revealed, seed }: Props) {
  const choices = useMemo(() => shuffle(q.choices, createRng(hashSeed(seed, q.id, 'choices'))), [q, seed])
  const values = answer?.type === 'match' ? answer.values : {}
  const textOf = (id: string) => plainText(q.choices.find((c) => c.id === id)?.text ?? '')

  return (
    <div>
      <p className="mb-3 text-sm text-muted">
        Empareja cada elemento con la opción adecuada. Cada opción puede usarse una vez, varias veces o ninguna.
      </p>
      <ul className="space-y-2.5">
        {q.prompts.map((p) => {
          const v = values[p.id] ?? ''
          const ok = v === p.answerId
          return (
            <li
              key={p.id}
              className={clsx(
                'rounded-xl border-2 p-3 transition-colors',
                !revealed && (v ? 'border-primary/50 bg-surface' : 'border-border bg-surface'),
                revealed && ok && 'border-ok bg-ok-soft/40',
                revealed && !ok && 'border-bad bg-bad-soft/40',
              )}
            >
              <div className="grid items-center gap-2 sm:grid-cols-[1fr_auto_minmax(0,1fr)]">
                <label htmlFor={`m-${q.id}-${p.id}`} className="leading-relaxed">
                  <RichText text={p.text} />
                </label>
                <ArrowRight size={16} className="hidden text-muted sm:block" aria-hidden />
                <select
                  id={`m-${q.id}-${p.id}`}
                  value={v}
                  disabled={revealed}
                  onChange={(e) => onChange({ type: 'match', values: { ...values, [p.id]: e.target.value } })}
                  className={clsx(
                    'w-full rounded-lg border-2 bg-surface px-3 py-2 text-sm font-medium',
                    !revealed && 'border-border focus:border-primary',
                    revealed && ok && 'border-ok text-ok',
                    revealed && !ok && 'border-bad text-bad',
                  )}
                >
                  <option value="">Elige una opción…</option>
                  {choices.map((c) => (
                    <option key={c.id} value={c.id}>
                      {plainText(c.text)}
                    </option>
                  ))}
                </select>
              </div>
              {revealed && (
                <WhyNote ok={ok} label={ok ? 'Correcto:' : `Correcto: «${textOf(p.answerId)}».`}>
                  {p.explanation}
                </WhyNote>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
