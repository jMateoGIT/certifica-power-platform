import clsx from 'clsx'
import { ChevronDown, CircleCheck, CircleX, Clock, Flag, RotateCcw, Target, TriangleAlert, Trophy } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useParams } from 'react-router'
import { QuestionView } from '../components/question/QuestionView'
import { questionSummary, RichText } from '../components/question/shared'
import { Badge, ButtonLink, Card, DomainIcon, ProgressBar } from '../components/ui'
import { getQuestion } from '../content'
import { formatDateTime, formatDuration } from '../lib/format'
import { useExam } from '../lib/useExam'
import { useProgress } from '../store/progress'
import { NotFound } from './NotFound'

type Filter = 'todas' | 'incorrectas' | 'marcadas'

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        duration: 2.2 + Math.random() * 1.6,
        color: ['#7c5cff', '#2f6fed', '#0f9d8a', '#e07a1f', '#a3369a', '#d4a106'][i % 6],
        size: 6 + Math.random() * 6,
      })),
    [],
  )
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute -top-4 block rounded-sm"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.5,
            background: p.color,
            animation: `confetti-fall ${p.duration}s ${p.delay}s ease-in forwards`,
          }}
        />
      ))}
    </div>
  )
}

export function ExamResult() {
  const { exam } = useExam()
  const { attemptId } = useParams()
  const attempt = useProgress((s) => s.attempts.find((a) => a.id === attemptId))
  const [filter, setFilter] = useState<Filter>('todas')
  const [open, setOpen] = useState<string | null>(null)
  if (!exam || !attempt) return <NotFound />

  const base = `/${exam.code.toLowerCase()}`
  const fresh = Date.now() - attempt.finishedAt < 15_000
  const correctCount = attempt.questionIds.filter((id) => attempt.scores[id] === 1).length
  const items = attempt.questionIds
    .map((id, i) => ({ id, n: i + 1, q: getQuestion(id), score: attempt.scores[id] ?? 0 }))
    .filter((x) => x.q)
    .filter((x) => (filter === 'incorrectas' ? x.score < 1 : filter === 'marcadas' ? attempt.flagged.includes(x.id) : true))
  const weakest = exam.domains
    .map((d) => ({ d, r: attempt.perDomain[d.id] }))
    .filter((x) => x.r?.total)
    .sort((a, b) => a.r.points / a.r.total - b.r.points / b.r.total)[0]

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
      {fresh && attempt.passed && <Confetti />}
      <Card className="overflow-hidden">
        <div className={clsx('p-6 sm:p-8', attempt.passed ? 'bg-ok-soft' : 'bg-bad-soft')}>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
            <span>{exam.code} · {attempt.mode === 'rapido' ? 'Simulacro rápido' : 'Examen completo'}</span>
            <span>· {formatDateTime(attempt.finishedAt)}</span>
          </div>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className={clsx('flex items-center gap-2 text-2xl font-bold', attempt.passed ? 'text-ok' : 'text-bad')}>
                {attempt.passed ? <Trophy /> : <Target />}
                {attempt.passed ? '¡Aprobado!' : 'No aprobado esta vez'}
              </div>
              <div className="mt-1 text-6xl font-extrabold tabular-nums tracking-tight">
                {attempt.scaled}
                <span className="text-2xl font-semibold text-muted">/1000</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
              <span className="text-muted">Correctas</span>
              <span className="font-semibold tabular-nums">{correctCount}/{attempt.questionIds.length}</span>
              <span className="text-muted">Tiempo</span>
              <span className="flex items-center gap-1 font-semibold tabular-nums"><Clock size={13} /> {formatDuration(attempt.durationSec)} / {formatDuration(attempt.timeLimitSec)}</span>
            </div>
          </div>
          {/* Escala 0–1000 con la marca de aprobado */}
          <div className="relative mt-6 h-3 rounded-full bg-surface/70">
            <div
              className={clsx('h-full rounded-full', attempt.passed ? 'bg-ok' : 'bg-bad')}
              style={{ width: `${attempt.scaled / 10}%`, transition: 'width 1s ease' }}
            />
            <div className="absolute -top-1.5 h-6 w-0.5 bg-text" style={{ left: `${exam.passingScore / 10}%` }} />
            <div className="absolute top-5 -translate-x-1/2 text-xs font-semibold" style={{ left: `${exam.passingScore / 10}%` }}>
              {exam.passingScore}
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <h2 className="font-bold">Resultado por dominio</h2>
          <p className="text-sm text-muted">Como en el informe oficial: dónde has estado más fuerte y dónde reforzar.</p>
          <div className="mt-4 space-y-4">
            {exam.domains.map((d) => {
              const r = attempt.perDomain[d.id]
              if (!r?.total) return null
              const pct = r.points / r.total
              return (
                <div key={d.id}>
                  <div className="mb-1.5 flex items-center gap-2 text-sm">
                    <DomainIcon icon={d.icon} color={d.color} size="sm" />
                    <span className="flex-1 font-medium">{d.shortName}</span>
                    <span className="tabular-nums text-muted">{Math.round(r.points * 10) / 10}/{r.total}</span>
                    <span className="w-12 text-right font-bold tabular-nums">{Math.round(pct * 100)}%</span>
                  </div>
                  <ProgressBar value={pct} color={d.color} label={d.shortName} className="h-2.5" />
                </div>
              )
            })}
          </div>
          {weakest && weakest.r.points / weakest.r.total < 0.8 && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-primary-soft p-4">
              <span className="text-sm">
                <strong>Siguiente paso:</strong> refuerza <strong>{weakest.d.shortName}</strong>, tu dominio más flojo.
              </span>
              <ButtonLink to={`${base}/practica?dominio=${weakest.d.id}`} size="sm">
                Practicar {weakest.d.shortName}
              </ButtonLink>
            </div>
          )}
          <div className="mt-6 flex flex-wrap gap-2">
            <ButtonLink to={`${base}/simulacro`} variant="secondary">
              <RotateCcw size={16} /> Otro simulacro
            </ButtonLink>
            <ButtonLink to={`${base}/repaso`} variant="secondary">
              Repasar falladas
            </ButtonLink>
          </div>
        </div>
      </Card>

      <section className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold">Revisión de preguntas</h2>
          <div className="flex gap-1 rounded-xl border border-border bg-surface p-1" role="tablist">
            {(['todas', 'incorrectas', 'marcadas'] as Filter[]).map((f) => (
              <button
                key={f}
                type="button"
                role="tab"
                aria-selected={filter === f}
                onClick={() => setFilter(f)}
                className={clsx(
                  'rounded-lg px-3 py-1 text-sm font-medium capitalize',
                  filter === f ? 'bg-primary-soft text-primary' : 'text-muted hover:text-text',
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          {items.length === 0 && <p className="py-6 text-center text-muted">No hay preguntas en este filtro.</p>}
          {items.map(({ id, n, q, score }) => {
            const isOpen = open === id
            return (
              <Card key={id} className="overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-start gap-3 p-4 text-left hover:bg-surface-2"
                >
                  {score === 1 ? (
                    <CircleCheck className="mt-0.5 shrink-0 text-ok" size={20} />
                  ) : score > 0 ? (
                    <TriangleAlert className="mt-0.5 shrink-0 text-warn" size={20} />
                  ) : (
                    <CircleX className="mt-0.5 shrink-0 text-bad" size={20} />
                  )}
                  <span className="w-6 shrink-0 pt-0.5 text-sm font-semibold tabular-nums text-muted">{n}.</span>
                  <span className="line-clamp-2 flex-1">
                    <RichText text={questionSummary(q!)} />
                  </span>
                  {attempt.flagged.includes(id) && <Badge tone="warn"><Flag size={11} /> Marcada</Badge>}
                  <ChevronDown size={18} className={clsx('mt-0.5 shrink-0 text-muted transition-transform', isOpen && 'rotate-180')} />
                </button>
                {isOpen && (
                  <div className="border-t border-border p-5 sm:p-7">
                    <QuestionView exam={exam} question={q!} answer={attempt.answers[id]} onChange={() => {}} revealed seed={attempt.seed} />
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      </section>
    </div>
  )
}
