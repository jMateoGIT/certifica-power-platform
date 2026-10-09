import clsx from 'clsx'
import { Building2, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { getCase } from '../../content'
import { RichText } from './shared'

/** Texto de un caso con saltos de línea y listas numeradas respetados. */
function CaseBody({ text }: { text: string }) {
  return (
    <div className="space-y-1.5">
      {text.split('\n').filter(Boolean).map((line, i) => (
        <p key={i} className={clsx(/^\d+\.\s/.test(line) && 'pl-4 -indent-4')}>
          <RichText text={line} />
        </p>
      ))}
    </div>
  )
}

/**
 * Contexto de un caso práctico, visible junto a cada una de sus preguntas.
 * Se puede plegar para centrarse en la pregunta.
 */
export function CaseContext({ examCode, caseId, defaultOpen = true }: { examCode: string; caseId: string; defaultOpen?: boolean }) {
  const study = getCase(examCode, caseId)
  const [open, setOpen] = useState(defaultOpen)
  if (!study) return null
  return (
    <section className="mb-5 overflow-hidden rounded-xl border-2 border-primary/40 bg-primary-soft/40">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 p-4 text-left hover:bg-primary-soft/60"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary text-white dark:text-[#120d2b]">
          <Building2 size={18} />
        </span>
        <span className="flex-1">
          <span className="block text-xs font-bold uppercase tracking-wide text-primary">Caso práctico</span>
          <span className="font-semibold">
            {study.title} · {study.company}
          </span>
        </span>
        <ChevronDown size={18} className={clsx('shrink-0 text-muted transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="max-h-[50vh] space-y-4 overflow-y-auto border-t border-primary/20 px-4 py-4 text-[0.95rem] leading-relaxed">
          {study.sections.map((s) => (
            <div key={s.title}>
              <h3 className="mb-1 text-sm font-bold">{s.title}</h3>
              <CaseBody text={s.body} />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
