import clsx from 'clsx'
import { Building2, Clock, Flag, Gauge, ListChecks, Play, Shuffle, Timer, Zap } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Button, ButtonLink, Card, PageTitle } from '../components/ui'
import { buildExam } from '../engine/examBuilder'
import { randomSeed } from '../engine/random'
import { formatDateTime } from '../lib/format'
import { useExam } from '../lib/useExam'
import { useProgress, type ActiveExam } from '../store/progress'
import { NotFound } from './NotFound'

export function ExamSetup() {
  const { exam, questions } = useExam()
  const navigate = useNavigate()
  const { activeExam, setActiveExam, attempts } = useProgress()
  const [mode, setMode] = useState<'completo' | 'rapido'>('completo')
  if (!exam || exam.status !== 'disponible') return <NotFound />

  const base = `/${exam.code.toLowerCase()}`
  const modes = {
    completo: { count: exam.questionCount, minutes: exam.durationMinutes, title: 'Examen completo', Icon: Timer, text: 'Las mismas condiciones que el examen real, con un caso práctico al final.' },
    rapido: { count: 20, minutes: 20, title: 'Simulacro rápido', Icon: Zap, text: 'Una versión corta para cuando tienes poco tiempo.' },
  }
  const pending = activeExam?.exam === exam.code ? activeExam : null
  const hasCases = questions.some((q) => q.caseId)
  const history = attempts.filter((a) => a.exam === exam.code).slice(0, 5)

  const start = () => {
    const cfg = modes[mode]
    const seed = randomSeed()
    // El examen completo incluye un caso práctico al final, como el real.
    const picked = buildExam(questions, exam.domains, cfg.count, seed, { includeCase: mode === 'completo' && hasCases })
    const now = Date.now()
    const active: ActiveExam = {
      id: `${exam.code}-${now}`,
      exam: exam.code,
      mode,
      startedAt: now,
      deadline: now + cfg.minutes * 60_000,
      timeLimitSec: cfg.minutes * 60,
      questionIds: picked.map((q) => q.id),
      answers: {},
      flagged: [],
      current: 0,
      seed,
    }
    setActiveExam(active)
    navigate(`${base}/simulacro/en-curso`)
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
      <PageTitle eyebrow={exam.code} title="Simulacro de examen">
        Sin ayudas ni explicaciones hasta el final, con cronómetro y nota sobre 1000. Al terminar podrás revisar cada pregunta
        con su explicación.
      </PageTitle>

      {pending && (
        <Card className="mb-6 flex flex-wrap items-center justify-between gap-3 border-warn/50 bg-warn-soft p-4">
          <div>
            <div className="font-semibold">Tienes un simulacro sin terminar</div>
            <div className="text-sm text-muted">Empezado el {formatDateTime(pending.startedAt)}</div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setActiveExam(null)}>
              Descartar
            </Button>
            <ButtonLink to={`${base}/simulacro/en-curso`} size="sm">
              Continuar
            </ButtonLink>
          </div>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2" role="radiogroup" aria-label="Tipo de simulacro">
        {(Object.keys(modes) as (keyof typeof modes)[]).map((k) => {
          const m = modes[k]
          const active = mode === k
          return (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setMode(k)}
              className={clsx(
                'rounded-2xl border-2 bg-surface p-5 text-left transition-all',
                active ? 'border-primary shadow-md' : 'border-border hover:border-primary/40',
              )}
            >
              <span className={clsx('grid h-11 w-11 place-items-center rounded-xl', active ? 'bg-primary text-white dark:text-[#120d2b]' : 'bg-primary-soft text-primary')}>
                <m.Icon size={21} />
              </span>
              <div className="mt-3 text-lg font-bold">{m.title}</div>
              <div className="text-sm text-muted">{m.text}</div>
              <div className="mt-3 flex gap-4 text-sm font-medium">
                <span className="flex items-center gap-1.5"><ListChecks size={15} /> {m.count} preguntas</span>
                <span className="flex items-center gap-1.5"><Clock size={15} /> {m.minutes} min</span>
              </div>
            </button>
          )
        })}
      </div>

      <Card className="mt-6 p-5">
        <h2 className="font-semibold">Cómo funciona</h2>
        <ul className="mt-3 grid gap-3 text-sm text-muted sm:grid-cols-2">
          <li className="flex gap-2"><Shuffle size={16} className="mt-0.5 shrink-0 text-primary" /> Preguntas aleatorias repartidas según el peso oficial de cada dominio.</li>
          <li className="flex gap-2"><Flag size={16} className="mt-0.5 shrink-0 text-primary" /> Puedes marcar preguntas para revisarlas y moverte libremente entre ellas.</li>
          <li className="flex gap-2"><Building2 size={16} className="mt-0.5 shrink-0 text-primary" /> El examen completo termina con un caso práctico: varias preguntas sobre la misma empresa.</li>
          <li className="flex gap-2"><Timer size={16} className="mt-0.5 shrink-0 text-primary" /> Al acabarse el tiempo, el simulacro se entrega automáticamente.</li>
          <li className="flex gap-2"><Gauge size={16} className="mt-0.5 shrink-0 text-primary" /> Aprobado con {exam.passingScore}/1000. Las preguntas de varias partes puntúan de forma parcial.</li>
        </ul>
        <div className="mt-5 flex justify-end">
          <Button size="lg" onClick={start} disabled={!questions.length}>
            <Play size={18} /> {pending ? 'Empezar uno nuevo' : 'Empezar simulacro'}
          </Button>
        </div>
      </Card>

      {history.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 font-semibold">Últimos simulacros</h2>
          <div className="grid gap-2">
            {history.map((a) => (
              <ButtonLink key={a.id} to={`${base}/resultados/${a.id}`} variant="secondary" className="justify-between">
                <span className="text-muted">{formatDateTime(a.finishedAt)} · {a.questionIds.length} preguntas</span>
                <span className={a.passed ? 'text-ok' : 'text-bad'}>
                  {a.scaled}/1000 · {a.passed ? 'Aprobado' : 'Suspenso'}
                </span>
              </ButtonLink>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
