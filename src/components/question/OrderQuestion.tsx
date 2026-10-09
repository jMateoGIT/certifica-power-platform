import clsx from 'clsx'
import { ArrowDown, ArrowUp, GripVertical } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { OrderQuestion as Q } from '../../content/schema'
import { createRng, hashSeed, shuffle } from '../../engine/random'
import type { Answer } from '../../engine/types'
import { RichText, WhyNote } from './shared'

interface Props {
  question: Q
  answer: Answer | undefined
  onChange: (a: Answer) => void
  revealed: boolean
  seed: number
}

/** Orden inicial barajado, garantizando que no coincida con el correcto. */
function initialOrder(q: Q, seed: number): string[] {
  const ids = q.items.map((i) => i.id)
  const rng = createRng(hashSeed(seed, q.id))
  for (let attempt = 0; attempt < 10; attempt++) {
    const s = shuffle(ids, rng)
    if (s.some((id, i) => id !== ids[i])) return s
  }
  return [...ids].reverse()
}

export function OrderQuestion({ question: q, answer, onChange, revealed, seed }: Props) {
  const start = useMemo(() => initialOrder(q, seed), [q, seed])
  const order = answer?.type === 'order' && answer.order.length === q.items.length ? answer.order : start
  const [dragging, setDragging] = useState<string | null>(null)

  // La disposición inicial cuenta como respuesta: así nadie pierde la pregunta por no tocarla.
  useEffect(() => {
    if (!revealed && (answer?.type !== 'order' || answer.order.length !== q.items.length)) {
      onChange({ type: 'order', order: start })
    }
  }, [q.id])

  const byId = Object.fromEntries(q.items.map((i) => [i.id, i]))
  const move = (from: number, to: number) => {
    if (revealed || to < 0 || to >= order.length) return
    const next = [...order]
    const [it] = next.splice(from, 1)
    next.splice(to, 0, it)
    onChange({ type: 'order', order: next })
  }

  return (
    <div>
      <p className="mb-3 text-sm text-muted">
        Ordena los pasos de primero a último. Arrastra los elementos o usa las flechas.
      </p>
      <ol className="space-y-2">
        {order.map((id, i) => {
          const item = byId[id]
          const correctPos = q.items.findIndex((x) => x.id === id)
          const ok = correctPos === i
          return (
            <li
              key={id}
              draggable={!revealed}
              onDragStart={() => setDragging(id)}
              onDragEnd={() => setDragging(null)}
              onDragOver={(e) => {
                e.preventDefault()
                if (dragging && dragging !== id) move(order.indexOf(dragging), i)
              }}
              className={clsx(
                'rounded-xl border-2 p-3 transition-colors',
                !revealed && 'cursor-grab border-border bg-surface active:cursor-grabbing',
                dragging === id && 'border-primary opacity-60',
                revealed && ok && 'border-ok bg-ok-soft/40',
                revealed && !ok && 'border-bad bg-bad-soft/40',
              )}
            >
              <div className="flex items-center gap-3">
                {!revealed && <GripVertical size={18} className="shrink-0 text-muted" aria-hidden />}
                <span
                  className={clsx(
                    'grid h-7 w-7 shrink-0 place-items-center rounded-full text-sm font-bold',
                    revealed ? (ok ? 'bg-ok text-white' : 'bg-bad text-white') : 'bg-primary-soft text-primary',
                  )}
                >
                  {i + 1}
                </span>
                <span className="flex-1 leading-relaxed">
                  <RichText text={item.text} />
                </span>
                {!revealed && (
                  <span className="flex shrink-0 flex-col">
                    <button
                      type="button"
                      className="rounded p-0.5 text-muted hover:bg-surface-2 hover:text-text disabled:opacity-30"
                      onClick={() => move(i, i - 1)}
                      disabled={i === 0}
                      aria-label={`Subir «${item.text}»`}
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      type="button"
                      className="rounded p-0.5 text-muted hover:bg-surface-2 hover:text-text disabled:opacity-30"
                      onClick={() => move(i, i + 1)}
                      disabled={i === order.length - 1}
                      aria-label={`Bajar «${item.text}»`}
                    >
                      <ArrowDown size={16} />
                    </button>
                  </span>
                )}
              </div>
              {revealed && (
                <WhyNote ok={ok} label={ok ? 'Posición correcta:' : `Va en la posición ${correctPos + 1}:`}>
                  {item.explanation}
                </WhyNote>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
