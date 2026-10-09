import { ArrowRight, BookOpen, Building2, Clock, ExternalLink, Gauge, Info, Layers, Repeat, Target, Timer } from 'lucide-react'
import { Link } from 'react-router'
import { getCases } from '../content'
import { Badge, ButtonLink, Card, DomainIcon, ProgressBar, ProgressRing } from '../components/ui'
import { domainProgress, readinessIndex, readinessLabel, reviewQueues } from '../lib/analytics'
import { formatIsoDate } from '../lib/format'
import { useExam } from '../lib/useExam'
import { useProgress } from '../store/progress'
import { NotFound } from './NotFound'

export function ExamHome() {
  const { exam, questions } = useExam()
  const stats = useProgress((s) => s.stats)
  const attempts = useProgress((s) => s.attempts)
  const active = useProgress((s) => s.activeExam)
  if (!exam || exam.status !== 'disponible') return <NotFound />

  const base = `/${exam.code.toLowerCase()}`
  const progress = domainProgress(exam, questions, stats)
  const readiness = readinessIndex(exam, progress)
  const level = readinessLabel(readiness)
  const queues = reviewQueues(questions, stats)
  const cases = getCases(exam.code)
  const examAttempts = attempts.filter((a) => a.exam === exam.code)
  const best = examAttempts.reduce((m, a) => Math.max(m, a.scaled), 0)

  const modes = [
    { to: `${base}/practica`, Icon: Target, title: 'Práctica', text: 'Corrección inmediata y explicación de cada opción.', cta: 'Practicar' },
    { to: `${base}/simulacro`, Icon: Timer, title: 'Simulacro', text: `${exam.questionCount} preguntas en ${exam.durationMinutes} minutos con nota sobre 1000.`, cta: 'Empezar' },
    ...(cases.length
      ? [{ to: `${base}/casos`, Icon: Building2, title: 'Casos prácticos', text: `${cases.length} escenarios de empresa con preguntas encadenadas.`, cta: 'Ver casos' }]
      : []),
    {
      to: `${base}/repaso`,
      Icon: Repeat,
      title: 'Repaso inteligente',
      text: queues.due.length ? `${queues.due.length} preguntas pendientes de repaso.` : 'Repetición espaciada de lo que fallas.',
      cta: 'Repasar',
    },
    { to: `${base}/glosario`, Icon: BookOpen, title: 'Glosario', text: 'Conceptos clave en español e inglés, con tarjetas.', cta: 'Abrir glosario' },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="primary">{exam.level}</Badge>
            <Badge>Temario del {formatIsoDate(exam.outlineVersion)}</Badge>
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            {exam.code}: {exam.name}
          </h1>
          <p className="mt-3 max-w-2xl text-muted">{exam.description}</p>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
            <span className="flex items-center gap-1.5"><Clock size={15} /> {exam.durationMinutes} min</span>
            <span className="flex items-center gap-1.5"><Layers size={15} /> {questions.length} preguntas en el banco</span>
            <span className="flex items-center gap-1.5"><Gauge size={15} /> Aprobado: {exam.passingScore}/1000</span>
            <a href={exam.officialUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-primary hover:underline">
              Página oficial <ExternalLink size={13} />
            </a>
          </div>
          {active && active.exam === exam.code && (
            <Card className="mt-5 flex flex-wrap items-center justify-between gap-3 border-warn/50 bg-warn-soft p-4">
              <span className="font-medium">Tienes un simulacro sin terminar.</span>
              <ButtonLink to={`${base}/simulacro/en-curso`} size="sm">
                Continuar <ArrowRight size={15} />
              </ButtonLink>
            </Card>
          )}
        </div>

        <Card className="flex items-center gap-5 p-5">
          <ProgressRing
            value={readiness / 100}
            size={108}
            color={level.tone === 'high' ? 'var(--ok)' : level.tone === 'mid' ? 'var(--primary)' : 'var(--warn)'}
            label={`Índice de preparación ${readiness}`}
          >
            <div>
              <div className="text-2xl font-bold tabular-nums">{readiness}</div>
              <div className="text-[10px] text-muted">de 100</div>
            </div>
          </ProgressRing>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">Preparación</div>
            <div className="font-bold">{level.label}</div>
            <div className="mt-1 text-sm text-muted">
              {examAttempts.length ? `Mejor simulacro: ${best}/1000` : 'Aún no has hecho simulacros'}
            </div>
            <Link to={`${base}/progreso`} className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-primary">
              Ver progreso <ArrowRight size={14} />
            </Link>
          </div>
        </Card>
      </div>

      <section className={`mt-8 grid gap-4 sm:grid-cols-2 ${modes.length > 4 ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>
        {modes.map(({ to, Icon, title, text, cta }) => (
          <Link key={to} to={to} className="group">
            <Card className="flex h-full flex-col p-5 transition-all group-hover:-translate-y-0.5 group-hover:border-primary/60 group-hover:shadow-md">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary">
                <Icon size={21} />
              </span>
              <h2 className="mt-3 font-bold">{title}</h2>
              <p className="mt-1 flex-1 text-sm text-muted">{text}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                {cta} <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
              </span>
            </Card>
          </Link>
        ))}
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold tracking-tight">Dominios del examen</h2>
        <p className="mt-1 text-sm text-muted">Peso oficial de cada área y tu nivel actual. Pulsa un dominio para practicarlo.</p>
        <div className="mt-4 grid gap-3">
          {exam.domains.map((d) => {
            const p = progress.find((x) => x.id === d.id)!
            return (
              <Link key={d.id} to={`${base}/practica?dominio=${d.id}`} className="group">
                <Card className="grid gap-3 p-4 transition-colors group-hover:border-primary/50 sm:grid-cols-[minmax(0,1fr)_220px] sm:items-center">
                  <div className="flex items-start gap-3">
                    <DomainIcon icon={d.icon} color={d.color} />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{d.name}</h3>
                        <Badge>{d.weight[0]}–{d.weight[1]} %</Badge>
                      </div>
                      <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted">
                        {d.skills.map((s) => (
                          <li key={s.id}>• {s.name}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-xs text-muted">
                      <span>{p.seen}/{p.total} vistas</span>
                      <span className="font-semibold" style={{ color: d.color }}>{Math.round(p.readiness * 100)} % dominado</span>
                    </div>
                    <ProgressBar value={p.readiness} color={d.color} label={`Dominio ${d.shortName}`} />
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
        {exam.outlineNote && (
          <p className="mt-4 flex gap-2 text-xs text-muted">
            <Info size={14} className="mt-0.5 shrink-0" /> {exam.outlineNote}
          </p>
        )}
      </section>
    </div>
  )
}
