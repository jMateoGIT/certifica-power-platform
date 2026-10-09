import clsx from 'clsx'
import type { YesNoQuestion as Q } from '../../content/schema'
import type { Answer } from '../../engine/types'
import { RichText, WhyNote } from './shared'

interface Props {
  question: Q
  answer: Answer | undefined
  onChange: (a: Answer) => void
  revealed: boolean
}

export function YesNoQuestion({ question: q, answer, onChange, revealed }: Props) {
  const values = answer?.type === 'yesno' ? answer.values : {}
  const set = (id: string, v: boolean) => !revealed && onChange({ type: 'yesno', values: { ...values, [id]: v } })

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">Indica para cada afirmación si es verdadera (Sí) o falsa (No).</p>
      {q.statements.map((s, i) => {
        const v = values[s.id]
        const ok = v === s.answer
        return (
          <div
            key={s.id}
            className={clsx(
              'rounded-xl border-2 p-3.5 transition-colors',
              !revealed && 'border-border bg-surface',
              revealed && ok && 'border-ok bg-ok-soft/40',
              revealed && !ok && 'border-bad bg-bad-soft/40',
            )}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <p className="flex-1 leading-relaxed" id={`st-${q.id}-${s.id}`}>
                <span className="mr-2 font-semibold text-muted">{i + 1}.</span>
                <RichText text={s.text} />
              </p>
              <div className="flex shrink-0 gap-2" role="radiogroup" aria-labelledby={`st-${q.id}-${s.id}`}>
                {[true, false].map((opt) => {
                  const chosen = v === opt
                  const isAnswer = s.answer === opt
                  return (
                    <button
                      key={String(opt)}
                      type="button"
                      role="radio"
                      aria-checked={chosen}
                      onClick={() => set(s.id, opt)}
                      className={clsx(
                        'min-w-16 rounded-lg border-2 px-4 py-1.5 text-sm font-semibold transition-colors',
                        !revealed && !chosen && 'border-border text-muted hover:border-primary/50',
                        !revealed && chosen && 'border-primary bg-primary text-white dark:text-[#120d2b]',
                        revealed && isAnswer && 'border-ok bg-ok text-white dark:text-[#06150f]',
                        revealed && !isAnswer && chosen && 'border-bad bg-bad-soft text-bad line-through',
                        revealed && !isAnswer && !chosen && 'border-border text-muted opacity-60',
                      )}
                    >
                      {opt ? 'Sí' : 'No'}
                    </button>
                  )
                })}
              </div>
            </div>
            {revealed && (
              <WhyNote ok={ok} label={`Es ${s.answer ? 'verdadera' : 'falsa'}:`}>
                {s.explanation}
              </WhyNote>
            )}
          </div>
        )
      })}
    </div>
  )
}
