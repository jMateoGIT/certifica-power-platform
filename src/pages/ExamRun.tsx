import clsx from 'clsx'
import { ChevronLeft, ChevronRight, Flag, LayoutGrid, Send, Timer } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { QuestionView } from '../components/question/QuestionView'
import { Button, Card } from '../components/ui'
import { getQuestion } from '../content'
import { isComplete, isStarted } from '../engine/grading'
import { finishExam } from '../lib/finishExam'
import { trackAnswer, trackExam } from '../lib/telemetry'
import { formatDuration } from '../lib/format'
import { useExam } from '../lib/useExam'
import { useProgress } from '../store/progress'
import { NotFound } from './NotFound'

function useNow(interval = 1000) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), interval)
    return () => clearInterval(t)
  }, [interval])
  return now
}

export function ExamRun() {
  const { exam } = useExam()
  const navigate = useNavigate()
  const active = useProgress((s) => s.activeExam)
  const update = useProgress((s) => s.updateActiveExam)
  const saveAttempt = useProgress((s) => s.saveAttempt)
  const now = useNow()
  const [showGrid, setShowGrid] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const submitted = useRef(false)

  const submit = useCallback(() => {
    if (!exam || !active || submitted.current) return
    submitted.current = true
    const attempt = finishExam(exam, active)
    saveAttempt(attempt)
    trackExam(exam.code, attempt.mode, attempt.scaled, attempt.passed)
    for (const id of attempt.questionIds) {
      const q = getQuestion(id)
      if (q) trackAnswer(q, attempt.scores[id] ?? 0, 'simulacro')
    }
    navigate(`/${exam.code.toLowerCase()}/resultados/${attempt.id}`, { replace: true })
  }, [exam, active, saveAttempt, navigate])

  const remaining = active ? Math.max(0, Math.round((active.deadline - now) / 1000)) : 0
  useEffect(() => {
    if (active && remaining === 0) submit()
  }, [active, remaining, submit])

  // Aviso al cerrar la pestaña con un simulacro en curso.
  useEffect(() => {
    const onUnload = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', onUnload)
    return () => window.removeEventListener('beforeunload', onUnload)
  }, [])

  if (!exam) return <NotFound />
  if (!active || active.exam !== exam.code) {
    if (submitted.current) return null
    return <Navigate to={`/${exam.code.toLowerCase()}/simulacro`} replace />
  }

  const total = active.questionIds.length
  const idx = Math.min(active.current, total - 1)
  const q = getQuestion(active.questionIds[idx])
  const flagged = active.flagged.includes(active.questionIds[idx])
  const answeredCount = active.questionIds.filter((id) => {
    const qq = getQuestion(id)
    return qq && isComplete(qq, active.answers[id])
  }).length
  const lowTime = remaining <= 5 * 60
  const go = (i: number) => {
    update({ current: Math.max(0, Math.min(total - 1, i)) })
    setShowGrid(false)
    window.scrollTo({ top: 0 })
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-4 sm:py-6">
      <div className="sticky top-14 z-20 -mx-4 mb-4 border-b border-border bg-bg/90 px-4 py-2.5 backdrop-blur">
        <div className="flex items-center gap-3">
          <div
            className={clsx(
              'flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-mono text-sm font-bold tabular-nums',
              lowTime ? 'bg-bad-soft text-bad' : 'bg-surface-2',
            )}
            role="timer"
            aria-label={`Tiempo restante ${formatDuration(remaining)}`}
          >
            <Timer size={15} /> {formatDuration(remaining)}
          </div>
          <div className="hidden text-sm text-muted sm:block">
            {answeredCount}/{total} respondidas
          </div>
          <div className="ml-auto flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setShowGrid((s) => !s)} aria-expanded={showGrid}>
              <LayoutGrid size={15} /> <span className="hidden sm:inline">Revisar</span> {idx + 1}/{total}
            </Button>
            <Button size="sm" onClick={() => setConfirming(true)}>
              <Send size={15} /> Entregar
            </Button>
          </div>
        </div>
        {showGrid && (
          <div className="mt-3 animate-pop">
            <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-12 md:grid-cols-15">
              {active.questionIds.map((id, i) => {
                const qq = getQuestion(id)
                const done = qq ? isComplete(qq, active.answers[id]) : false
                const partial = !done && isStarted(active.answers[id])
                const isFlag = active.flagged.includes(id)
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => go(i)}
                    aria-label={`Pregunta ${i + 1}${done ? ', respondida' : ''}${isFlag ? ', marcada' : ''}`}
                    className={clsx(
                      'relative h-9 rounded-lg border-2 text-xs font-bold tabular-nums',
                      i === idx && 'ring-2 ring-primary ring-offset-1 ring-offset-bg',
                      done ? 'border-primary bg-primary-soft text-primary' : partial ? 'border-warn/60 text-warn' : 'border-border text-muted',
                    )}
                  >
                    {i + 1}
                    {isFlag && <Flag size={10} className="absolute -right-1 -top-1 fill-warn text-warn" />}
                  </button>
                )
              })}
            </div>
            <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted">
              <span className="flex items-center gap-1"><span className="h-3 w-3 rounded border-2 border-primary bg-primary-soft" /> Respondida</span>
              <span className="flex items-center gap-1"><span className="h-3 w-3 rounded border-2 border-warn/60" /> Incompleta</span>
              <span className="flex items-center gap-1"><span className="h-3 w-3 rounded border-2 border-border" /> Sin responder</span>
              <span className="flex items-center gap-1"><Flag size={11} className="fill-warn text-warn" /> Marcada</span>
            </div>
          </div>
        )}
      </div>

      {q && (
        <Card className="p-5 sm:p-7">
          <QuestionView
            key={q.id}
            exam={exam}
            question={q}
            answer={active.answers[q.id]}
            onChange={(a) => update({ answers: { ...useProgress.getState().activeExam!.answers, [q.id]: a } })}
            revealed={false}
            seed={active.seed}
            position={`Pregunta ${idx + 1} de ${total}`}
          />
        </Card>
      )}

      <div className="mt-4 flex items-center justify-between gap-2">
        <Button variant="secondary" onClick={() => go(idx - 1)} disabled={idx === 0}>
          <ChevronLeft size={18} /> Anterior
        </Button>
        <Button
          variant={flagged ? 'primary' : 'ghost'}
          onClick={() =>
            update({
              flagged: flagged ? active.flagged.filter((f) => f !== q?.id) : [...active.flagged, q!.id],
            })
          }
          aria-pressed={flagged}
        >
          <Flag size={16} /> <span className="hidden sm:inline">{flagged ? 'Marcada' : 'Marcar para revisar'}</span>
        </Button>
        {idx < total - 1 ? (
          <Button onClick={() => go(idx + 1)}>
            Siguiente <ChevronRight size={18} />
          </Button>
        ) : (
          <Button onClick={() => setConfirming(true)}>
            <Send size={16} /> Entregar
          </Button>
        )}
      </div>

      {confirming && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
          <Card className="w-full max-w-md p-6 animate-pop">
            <h2 id="confirm-title" className="text-lg font-bold">¿Entregar el simulacro?</h2>
            <p className="mt-2 text-muted">
              Has respondido {answeredCount} de {total} preguntas
              {active.flagged.length > 0 && ` y tienes ${active.flagged.length} marcadas para revisar`}. Te quedan{' '}
              {formatDuration(remaining)}.
            </p>
            {answeredCount < total && (
              <p className="mt-2 rounded-lg bg-warn-soft p-3 text-sm text-warn">
                Las preguntas sin responder cuentan como incorrectas.
              </p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setConfirming(false)} autoFocus>
                Seguir revisando
              </Button>
              <Button onClick={submit}>Entregar</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
