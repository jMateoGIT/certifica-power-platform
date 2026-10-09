import clsx from 'clsx'
import { CircleCheck, CircleX } from 'lucide-react'
import type { ReactNode } from 'react'

/** Texto con soporte mínimo de *cursiva* y **negrita** (los términos en inglés van en cursiva). */
export function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('**') && p.endsWith('**') ? (
          <strong key={i}>{p.slice(2, -2)}</strong>
        ) : p.startsWith('*') && p.endsWith('*') && p.length > 2 ? (
          <em key={i}>{p.slice(1, -1)}</em>
        ) : (
          p
        ),
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
export const plainText = (text: string) => text.replace(/\*\*([^*]+)\*\*|\*([^*]+)\*/g, (_, b, i) => b ?? i)

/** Resumen de una pregunta para listados: si depende de un escenario, lo antepone. */
export function questionSummary(q: { scenario?: string; prompt: string }) {
  return q.scenario && q.prompt.length < 90 ? `${q.scenario} ${q.prompt}` : q.prompt
}
