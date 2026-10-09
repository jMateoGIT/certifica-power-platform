import clsx from 'clsx'
import { Fragment, useMemo } from 'react'
import type { DropdownQuestion as Q } from '../../content/schema'
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

export function DropdownQuestion({ question: q, answer, onChange, revealed, seed }: Props) {
  const values = answer?.type === 'dropdown' ? answer.values : {}
  const blanks = useMemo(
    () =>
      Object.fromEntries(
        q.blanks.map((b) => [b.id, { ...b, options: shuffle(b.options, createRng(hashSeed(seed, q.id, b.id))) }]),
      ),
    [q, seed],
  )
  const parts = q.template.split(/(\{\{[a-z0-9-]+\}\})/g)

  return (
    <div>
      <p className="mb-3 text-sm text-muted">Completa la frase eligiendo la opción correcta en cada desplegable.</p>
      <div className="rounded-xl border-2 border-border bg-surface p-4 text-lg leading-[2.6]">
        {parts.map((part, i) => {
          const m = part.match(/^\{\{([a-z0-9-]+)\}\}$/)
          if (!m) return <Fragment key={i}><RichText text={part} /></Fragment>
          const b = blanks[m[1]]
          if (!b) return null
          const v = values[b.id] ?? ''
          const ok = v === b.correctId
          return (
            <select
              key={i}
              aria-label={`Hueco ${q.blanks.findIndex((x) => x.id === b.id) + 1}`}
              value={v}
              disabled={revealed}
              onChange={(e) => onChange({ type: 'dropdown', values: { ...values, [b.id]: e.target.value } })}
              className={clsx(
                'mx-1 max-w-full rounded-lg border-2 px-2 py-1 align-middle text-base font-semibold',
                !revealed && (v ? 'border-primary bg-primary-soft text-primary' : 'border-dashed border-primary/60 bg-surface'),
                revealed && ok && 'border-ok bg-ok-soft text-ok',
                revealed && !ok && 'border-bad bg-bad-soft text-bad',
              )}
            >
              <option value="">Elige…</option>
              {b.options.map((o) => (
                <option key={o.id} value={o.id}>
                  {plainText(o.text)}
                </option>
              ))}
            </select>
          )
        })}
      </div>
      {revealed &&
        q.blanks.map((b, i) => {
          const ok = values[b.id] === b.correctId
          const correctText = plainText(b.options.find((o) => o.id === b.correctId)?.text ?? '')
          return (
            <WhyNote key={b.id} ok={ok} label={`Hueco ${i + 1} → «${correctText}»:`}>
              {b.explanation}
            </WhyNote>
          )
        })}
    </div>
  )
}
