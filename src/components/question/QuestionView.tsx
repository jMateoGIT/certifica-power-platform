import clsx from 'clsx'
import { Bookmark, BookmarkCheck, CircleCheck, CircleX, ExternalLink, Flag, Lightbulb, TriangleAlert } from 'lucide-react'
import type { ExamDefinition, Question, QuestionType } from '../../content/schema'
import { grade, requiredSelections } from '../../engine/grading'
import type { Answer } from '../../engine/types'
import { useProgress } from '../../store/progress'
import { reportQuestionUrl } from '../../lib/config'
import { Badge, DomainIcon } from '../ui'
import { ChoiceQuestion } from './ChoiceQuestion'
import { DropdownQuestion } from './DropdownQuestion'
import { MatchQuestion } from './MatchQuestion'
import { OrderQuestion } from './OrderQuestion'
import { RichText } from './shared'
import { YesNoQuestion } from './YesNoQuestion'

export const typeLabels: Record<QuestionType, string> = {
  single: 'Respuesta única',
  multiple: 'Respuesta múltiple',
  yesno: 'Sí / No',
  order: 'Ordenar pasos',
  match: 'Emparejar',
  dropdown: 'Completar frase',
}

const difficultyLabels = { 1: 'Básica', 2: 'Media', 3: 'Avanzada' } as const

interface Props {
  exam: ExamDefinition
  question: Question
  answer: Answer | undefined
  onChange: (a: Answer) => void
  revealed: boolean
  seed: number
  /** Posición, p. ej. «Pregunta 3 de 20». */
  position?: string
}

export function QuestionView({ exam, question: q, answer, onChange, revealed, seed, position }: Props) {
  const domain = exam.domains.find((d) => d.id === q.domain)
  const skill = domain?.skills.find((s) => s.id === q.skill)
  const bookmarked = useProgress((s) => s.bookmarks.includes(q.id))
  const toggleBookmark = useProgress((s) => s.toggleBookmark)

  const body = (() => {
    const common = { answer, onChange, revealed, seed }
    switch (q.type) {
      case 'single':
      case 'multiple':
        return <ChoiceQuestion question={q} {...common} />
      case 'yesno':
        return <YesNoQuestion question={q} {...common} />
      case 'order':
        return <OrderQuestion question={q} {...common} />
      case 'match':
        return <MatchQuestion question={q} {...common} />
      case 'dropdown':
        return <DropdownQuestion question={q} {...common} />
    }
  })()

  return (
    <article className="animate-pop" aria-labelledby={`q-${q.id}`}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {domain && <DomainIcon icon={domain.icon} color={domain.color} size="sm" />}
        {domain && (
          <span className="text-sm font-semibold" style={{ color: domain.color }}>
            {domain.shortName}
          </span>
        )}
        {skill && <span className="hidden text-sm text-muted sm:inline">· {skill.name}</span>}
        <span className="ml-auto flex items-center gap-2">
          <Badge>{typeLabels[q.type]}</Badge>
          <Badge tone={q.difficulty === 3 ? 'warn' : q.difficulty === 2 ? 'primary' : 'neutral'}>
            {difficultyLabels[q.difficulty]}
          </Badge>
          <button
            type="button"
            onClick={() => toggleBookmark(q.id)}
            className={clsx('rounded-lg p-1.5 hover:bg-surface-2', bookmarked ? 'text-primary' : 'text-muted')}
            aria-pressed={bookmarked}
            aria-label={bookmarked ? 'Quitar de guardadas' : 'Guardar para repasar'}
            title={bookmarked ? 'Quitar de guardadas' : 'Guardar para repasar'}
          >
            {bookmarked ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
          </button>
        </span>
      </div>

      {position && <div className="mb-1 text-sm font-medium text-muted">{position}</div>}

      {q.scenario && (
        <div className="mb-4 rounded-xl border-l-4 border-primary bg-primary-soft/60 p-4 text-[0.95rem] leading-relaxed">
          <div className="mb-1 text-xs font-bold uppercase tracking-wide text-primary">Escenario</div>
          <RichText text={q.scenario} />
        </div>
      )}

      <h2 id={`q-${q.id}`} className="mb-5 text-lg font-semibold leading-relaxed sm:text-xl">
        <RichText text={q.prompt} />
        {q.type === 'multiple' && !/selecciona/i.test(q.prompt) && (
          <span className="ml-1 text-muted"> (Selecciona {requiredSelections(q)}.)</span>
        )}
      </h2>

      {body}

      {revealed && <Feedback question={q} answer={answer} />}
    </article>
  )
}

export function Feedback({ question: q, answer }: { question: Question; answer: Answer | undefined }) {
  const result = grade(q, answer)
  const tone = result.correct ? 'ok' : result.score > 0 ? 'warn' : 'bad'
  return (
    <section className="mt-6 space-y-3 animate-pop" aria-live="polite">
      <div
        className={clsx(
          'flex items-center gap-3 rounded-xl p-4 font-semibold',
          tone === 'ok' && 'bg-ok-soft text-ok',
          tone === 'warn' && 'bg-warn-soft text-warn',
          tone === 'bad' && 'bg-bad-soft text-bad',
        )}
      >
        {tone === 'ok' ? <CircleCheck /> : tone === 'warn' ? <TriangleAlert /> : <CircleX />}
        <span>
          {tone === 'ok' && '¡Correcto!'}
          {tone === 'warn' && `Parcialmente correcto (${Math.round(result.score * 100)} % de los puntos)`}
          {tone === 'bad' && 'Incorrecto'}
        </span>
      </div>

      <div className="flex gap-3 rounded-xl border border-border bg-surface p-4">
        <Lightbulb className="mt-0.5 shrink-0 text-warn" size={20} />
        <div>
          <div className="text-sm font-bold">Idea clave</div>
          <p className="mt-0.5 leading-relaxed">
            <RichText text={q.keyPoint} />
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="mb-2 text-sm font-bold">Para profundizar en Microsoft Learn</div>
        <ul className="space-y-1">
          {q.references.map((r) => (
            <li key={r.url}>
              <a
                href={r.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                {r.title}
                <ExternalLink size={13} />
              </a>
            </li>
          ))}
        </ul>
      </div>

      <a
        href={reportQuestionUrl(q.id, q.prompt)}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-text"
      >
        <Flag size={12} /> ¿Ves un error en esta pregunta? Repórtalo
      </a>
    </section>
  )
}
