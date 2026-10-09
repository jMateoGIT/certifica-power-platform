import clsx from 'clsx'
import { Check, CircleCheck, CircleX } from 'lucide-react'
import { useMemo } from 'react'
import type { MultipleQuestion, SingleQuestion } from '../../content/schema'
import { createRng, hashSeed, shuffle } from '../../engine/random'
import type { Answer } from '../../engine/types'
import { requiredSelections } from '../../engine/grading'
import { LETTERS, RichText, WhyNote } from './shared'

interface Props {
  question: SingleQuestion | MultipleQuestion
  answer: Answer | undefined
  onChange: (a: Answer) => void
  revealed: boolean
  seed: number
}

export function ChoiceQuestion({ question: q, answer, onChange, revealed, seed }: Props) {
  const options = useMemo(() => shuffle(q.options, createRng(hashSeed(seed, q.id))), [q, seed])
  const multi = q.type === 'multiple'
  const need = requiredSelections(q)
  const selected = new Set(
    answer?.type === 'single' ? (answer.optionId ? [answer.optionId] : []) : answer?.type === 'multiple' ? answer.optionIds : [],
  )

  const toggle = (id: string) => {
    if (revealed) return
    if (!multi) return onChange({ type: 'single', optionId: id })
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else {
      if (next.size >= need) return
      next.add(id)
    }
    onChange({ type: 'multiple', optionIds: [...next] })
  }

  return (
    <fieldset>
      <legend className="sr-only">{multi ? `Selecciona ${need} opciones` : 'Selecciona una opción'}</legend>
      {multi && !revealed && (
        <p className="mb-3 text-sm font-medium text-muted">
          Seleccionadas {selected.size} de {need}
        </p>
      )}
      <ul className="space-y-2.5">
        {options.map((o, i) => {
          const isSel = selected.has(o.id)
          const state = !revealed ? (isSel ? 'selected' : 'idle') : o.correct ? 'correct' : isSel ? 'wrong' : 'muted'
          const disabled = revealed || (multi && !isSel && selected.size >= need)
          return (
            <li key={o.id}>
              <button
                type="button"
                role={multi ? 'checkbox' : 'radio'}
                aria-checked={isSel}
                aria-disabled={disabled}
                onClick={() => toggle(o.id)}
                className={clsx(
                  'group flex w-full items-start gap-3 rounded-xl border-2 p-3.5 text-left transition-all',
                  state === 'idle' && 'border-border bg-surface hover:border-primary/50 hover:bg-surface-2',
                  state === 'selected' && 'border-primary bg-primary-soft',
                  state === 'correct' && 'border-ok bg-ok-soft/60',
                  state === 'wrong' && 'border-bad bg-bad-soft/60',
                  state === 'muted' && 'border-border bg-surface opacity-80',
                  disabled && !revealed && 'cursor-not-allowed opacity-60',
                )}
              >
                <span
                  className={clsx(
                    'grid h-7 w-7 shrink-0 place-items-center text-sm font-bold',
                    multi ? 'rounded-md' : 'rounded-full',
                    state === 'idle' && 'bg-surface-2 text-muted',
                    state === 'selected' && 'bg-primary text-white dark:text-[#120d2b]',
                    state === 'correct' && 'bg-ok text-white dark:text-[#06150f]',
                    state === 'wrong' && 'bg-bad text-white dark:text-[#1d0609]',
                    state === 'muted' && 'bg-surface-2 text-muted',
                  )}
                  aria-hidden
                >
                  {state === 'correct' ? (
                    <CircleCheck size={16} />
                  ) : state === 'wrong' ? (
                    <CircleX size={16} />
                  ) : multi && isSel ? (
                    <Check size={16} />
                  ) : (
                    LETTERS[i]
                  )}
                </span>
                <span className="flex-1 pt-0.5 leading-relaxed">
                  <RichText text={o.text} />
                  {revealed && (isSel || o.correct) && (
                    <span className="ml-2 align-middle text-xs font-semibold">
                      {o.correct && isSel && <span className="text-ok">· Tu respuesta, correcta</span>}
                      {o.correct && !isSel && <span className="text-ok">· Respuesta correcta</span>}
                      {!o.correct && isSel && <span className="text-bad">· Tu respuesta</span>}
                    </span>
                  )}
                </span>
              </button>
              {revealed && (
                <WhyNote ok={o.correct} label={o.correct ? 'Por qué sí:' : 'Por qué no:'}>
                  {o.explanation}
                </WhyNote>
              )}
            </li>
          )
        })}
      </ul>
    </fieldset>
  )
}
