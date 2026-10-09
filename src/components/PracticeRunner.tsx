import clsx from 'clsx'
import { ArrowRight, CircleCheck, CircleX, RotateCcw, TriangleAlert, Trophy } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ExamDefinition, Question } from '../content/schema'
import { grade, isComplete } from '../engine/grading'
import type { Answer } from '../engine/types'
import { trackAnswer, type AnswerMode } from '../lib/telemetry'
import { useProgress } from '../store/progress'
import { QuestionView } from './question/QuestionView'
import { questionSummary, RichText } from './question/shared'
import { Button, Card, ProgressBar, ProgressRing } from './ui'

interface Props {
  exam: ExamDefinition
  questions: Question[]
  seed: number
  onExit: () => void
  onRestart: (questions: Question[]) => void
  /** Para la analítica: desde qué modo se responde. */
  mode?: AnswerMode
}

/**
 * Modo práctica: una pregunta cada vez, corrección inmediata con la explicación
 * de cada opción y resumen final.
 */
export function PracticeRunner({ exam, questions, seed, onExit, onRestart, mode = 'practica' }: Props) {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})
  const [finished, setFinished] = useState(false)
  const recordAnswer = useProgress((s) => s.recordAnswer)

  const q = questions[index]
  const answer = q ? answers[q.id] : undefined
  const isRevealed = q ? !!revealed[q.id] : false
  const canCheck = q ? isComplete(q, answer) : false

  const check = useCallback(() => {
    if (!q || isRevealed || !canCheck) return
    setRevealed((r) => ({ ...r, [q.id]: true }))
    const score = grade(q, answer).score
    recordAnswer(q.id, score)
    trackAnswer(q, score, mode)
  }, [q, isRevealed, canCheck, answer, recordAnswer, mode])

  const next = useCallback(() => {
    if (index + 1 >= questions.length) setFinished(true)
    else setIndex((i) => i + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [index, questions.length])

  // Atajos de teclado: Enter para comprobar / continuar.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (e.key !== 'Enter' || target.tagName === 'SELECT' || target.tagName === 'BUTTON' || target.tagName === 'A') return
      if (isRevealed) next()
      else check()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [check, next, isRevealed])

  const results = useMemo(
    () => questions.filter((x) => revealed[x.id]).map((x) => ({ q: x, ...grade(x, answers[x.id]) })),
    [questions, revealed, answers],
  )

  if (finished) {
    const points = results.reduce((a, r) => a + r.score, 0)
    const ratio = results.length ? points / results.length : 0
    const failed = results.filter((r) => !r.correct).map((r) => r.q)
    return (
      <Card className="mx-auto max-w-3xl p-6 sm:p-8 animate-pop">
        <div className="flex flex-col items-center text-center">
          <ProgressRing value={ratio} size={140} color={ratio >= 0.7 ? 'var(--ok)' : ratio >= 0.5 ? 'var(--warn)' : 'var(--bad)'} label="Acierto">
            <div>
              <div className="text-3xl font-bold tabular-nums">{Math.round(ratio * 100)}%</div>
              <div className="text-xs text-muted">acierto</div>
            </div>
          </ProgressRing>
          <h2 className="mt-4 flex items-center gap-2 text-2xl font-bold">
            {ratio >= 0.7 && <Trophy className="text-warn" />} Sesión completada
          </h2>
          <p className="mt-1 text-muted">
            {results.filter((r) => r.correct).length} de {results.length} preguntas totalmente correctas
          </p>
        </div>
        <ul className="mt-6 divide-y divide-border rounded-xl border border-border">
          {results.map((r) => (
            <li key={r.q.id} className="flex items-start gap-3 p-3 text-sm">
              {r.correct ? (
                <CircleCheck size={18} className="mt-0.5 shrink-0 text-ok" />
              ) : r.score > 0 ? (
                <TriangleAlert size={18} className="mt-0.5 shrink-0 text-warn" />
              ) : (
                <CircleX size={18} className="mt-0.5 shrink-0 text-bad" />
              )}
              <span className="line-clamp-2">
                <RichText text={questionSummary(r.q)} />
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {failed.length > 0 && (
            <Button onClick={() => onRestart(failed)}>
              <RotateCcw size={16} /> Repetir las {failed.length} falladas
            </Button>
          )}
          <Button variant="secondary" onClick={onExit}>
            Volver
          </Button>
        </div>
      </Card>
    )
  }

  if (!q) return null

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center gap-3">
        <ProgressBar value={(index + (isRevealed ? 1 : 0)) / questions.length} label="Progreso de la sesión" />
        <span className="shrink-0 text-sm font-semibold tabular-nums text-muted">
          {index + 1}/{questions.length}
        </span>
      </div>
      <Card className="p-5 sm:p-7">
        <QuestionView
          key={q.id}
          exam={exam}
          question={q}
          answer={answer}
          onChange={(a) => setAnswers((s) => ({ ...s, [q.id]: a }))}
          revealed={isRevealed}
          seed={seed}
        />
      </Card>
      <div className="sticky bottom-0 z-10 -mx-4 mt-4 border-t border-border bg-bg/90 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        <div className="flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={() => (results.length ? setFinished(true) : onExit())}>
            Terminar
          </Button>
          {!isRevealed ? (
            <Button size="lg" onClick={check} disabled={!canCheck} className={clsx(!canCheck && 'opacity-50')}>
              Comprobar
            </Button>
          ) : (
            <Button size="lg" onClick={next}>
              {index + 1 >= questions.length ? 'Ver resultados' : 'Siguiente'} <ArrowRight size={18} />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
