import clsx from 'clsx'
import { CircleCheck, CircleX } from 'lucide-react'
import type { ReactNode } from 'react'

/**
 * Marcado mínimo: **negrita** y *cursiva* (los términos en inglés van en cursiva).
 * Solo se interpreta si el contenido empieza y acaba sin espacio y contiene alguna
 * letra, para que asteriscos literales como «(*:*)», «TOTAL*» o «a * b» se muestren tal cual.
 */
const MARKUP = /\*\*([^\s*](?:[^*]*?[^\s*])?)\*\*|\*([^\s*](?:[^*]*?[^\s*])?)\*/g
const hasLetter = (s: string) => /\p{L}/u.test(s)

export type MarkupPart = { kind: 'text' | 'strong' | 'em'; text: string }

export function parseMarkup(text: string): MarkupPart[] {
  const parts: MarkupPart[] = []
  let last = 0
  for (const m of text.matchAll(MARKUP)) {
    const inner = m[1] ?? m[2]
    if (!hasLetter(inner)) continue
    if (m.index! > last) parts.push({ kind: 'text', text: text.slice(last, m.index) })
    parts.push({ kind: m[1] !== undefined ? 'strong' : 'em', text: inner })
    last = m.index! + m[0].length
  }
  if (last < text.length) parts.push({ kind: 'text', text: text.slice(last) })
  return parts
}

export function RichText({ text }: { text: string }) {
  return (
    <>
      {parseMarkup(text).map((p, i) =>
        p.kind === 'strong' ? <strong key={i}>{p.text}</strong> : p.kind === 'em' ? <em key={i}>{p.text}</em> : p.text,
      )}
    </>
  )
}

/** Explicación de por qué una opción/parte es correcta o incorrecta. */
export function WhyNote({ ok, children, label }: { ok: boolean; children: ReactNode; label?: string }) {
  return (
    <div
      className={clsx(
        'mt-2 flex gap-2 rounded-lg px-3 py-2 text-sm leading-relaxed animate-pop',
        ok ? 'bg-ok-soft text-text' : 'bg-bad-soft text-text',
      )}
    >
      {ok ? <CircleCheck size={16} className="mt-0.5 shrink-0 text-ok" /> : <CircleX size={16} className="mt-0.5 shrink-0 text-bad" />}
      <div>
        {label && <span className={clsx('font-semibold', ok ? 'text-ok' : 'text-bad')}>{label} </span>}
        <RichText text={String(children)} />
      </div>
    </div>
  )
}

export const LETTERS = 'ABCDEFGH'

/** Quita las marcas de *cursiva* y **negrita** (para textos dentro de <option>). */
export const plainText = (text: string) => parseMarkup(text).map((p) => p.text).join('')

/** Resumen de una pregunta para listados: si depende de un escenario, lo antepone. */
export function questionSummary(q: { scenario?: string; prompt: string }) {
  return q.scenario && q.prompt.length < 90 ? `${q.scenario} ${q.prompt}` : q.prompt
}
