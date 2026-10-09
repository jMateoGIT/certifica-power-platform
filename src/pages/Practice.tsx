import clsx from 'clsx'
import { Play, Shuffle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { PracticeRunner } from '../components/PracticeRunner'
import { Button, Card, DomainIcon, PageTitle } from '../components/ui'
import type { Question } from '../content/schema'
import { filterQuestions } from '../engine/examBuilder'
import { createRng, randomSeed, shuffle } from '../engine/random'
import { isFailed } from '../engine/leitner'
import { useExam } from '../lib/useExam'
import { useProgress } from '../store/progress'
import { NotFound } from './NotFound'

type Source = 'todas' | 'nuevas' | 'falladas' | 'guardadas'
const sources: { value: Source; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'nuevas', label: 'No vistas' },
  { value: 'falladas', label: 'Falladas' },
  { value: 'guardadas', label: 'Guardadas' },
]
const counts = [10, 20, 40, 0] as const

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={clsx(
        'rounded-xl border-2 px-3 py-1.5 text-sm font-medium transition-colors',
        active ? 'border-primary bg-primary-soft text-primary' : 'border-border bg-surface text-muted hover:text-text',
      )}
    >
      {children}
    </button>
  )
}

export function Practice() {
  const { exam, questions } = useExam()
  const [params] = useSearchParams()
  const stats = useProgress((s) => s.stats)
  const bookmarks = useProgress((s) => s.bookmarks)
  const [domains, setDomains] = useState<string[]>(() => (params.get('dominio') ? [params.get('dominio')!] : []))
  const [skills, setSkills] = useState<string[]>([])
  const [source, setSource] = useState<Source>('todas')
  const [count, setCount] = useState<number>(10)
  const [session, setSession] = useState<{ questions: Question[]; seed: number } | null>(null)

  const pool = useMemo(() => {
    const onlyIds =
      source === 'nuevas'
        ? new Set(questions.filter((q) => !stats[q.id]).map((q) => q.id))
        : source === 'falladas'
          ? new Set(questions.filter((q) => isFailed(stats[q.id])).map((q) => q.id))
          : source === 'guardadas'
            ? new Set(bookmarks)
            : undefined
    return filterQuestions(questions, { domains, skills, onlyIds })
  }, [questions, domains, skills, source, stats, bookmarks])

  if (!exam || exam.status !== 'disponible') return <NotFound />

  const start = (list: Question[]) => {
    const seed = randomSeed()
    const picked = shuffle(list, createRng(seed))
    setSession({ questions: count ? picked.slice(0, count) : picked, seed })
  }

  if (session) {
    return (
      <div className="px-4 py-6 sm:py-10">
        <PracticeRunner
          key={session.seed}
          exam={exam}
          questions={session.questions}
          seed={session.seed}
          onExit={() => setSession(null)}
          onRestart={(qs) => setSession({ questions: qs, seed: randomSeed() })}
        />
      </div>
    )
  }

  const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id])
  const selectedDomains = exam.domains.filter((d) => domains.includes(d.id))

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
      <PageTitle eyebrow={exam.code} title="Modo práctica">
        Responde a tu ritmo: tras cada pregunta verás si has acertado y por qué cada opción es correcta o incorrecta.
      </PageTitle>

      <Card className="space-y-7 p-5 sm:p-6">
        <section>
          <h2 className="mb-3 font-semibold">1. Dominios</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {exam.domains.map((d) => {
              const active = domains.includes(d.id)
              const n = questions.filter((q) => q.domain === d.id).length
              return (
                <button
                  key={d.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setDomains(toggle(domains, d.id))
                    setSkills((s) => s.filter((id) => !d.skills.some((k) => k.id === id)))
                  }}
                  className={clsx(
                    'flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-colors',
                    active ? 'border-primary bg-primary-soft' : 'border-border hover:border-primary/40',
                  )}
                >
                  <DomainIcon icon={d.icon} color={d.color} size="sm" />
                  <span className="flex-1 text-sm font-medium">{d.shortName}</span>
                  <span className="text-xs text-muted">{n}</span>
                </button>
              )
            })}
          </div>
          <p className="mt-2 text-xs text-muted">{domains.length ? `${domains.length} seleccionados` : 'Sin selección = todos los dominios'}</p>

          {selectedDomains.length > 0 && (
            <div className="mt-4">
              <h3 className="mb-2 text-sm font-medium text-muted">Afinar por sub-habilidad (opcional)</h3>
              <div className="flex flex-wrap gap-2">
                {selectedDomains.flatMap((d) =>
                  d.skills.map((s) => (
                    <Chip key={s.id} active={skills.includes(s.id)} onClick={() => setSkills(toggle(skills, s.id))}>
                      {s.name}
                    </Chip>
                  )),
                )}
              </div>
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 font-semibold">2. Qué preguntas</h2>
          <div className="flex flex-wrap gap-2">
            {sources.map((s) => (
              <Chip key={s.value} active={source === s.value} onClick={() => setSource(s.value)}>
                {s.label}
              </Chip>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-semibold">3. Cuántas</h2>
          <div className="flex flex-wrap gap-2">
            {counts.map((c) => (
              <Chip key={c} active={count === c} onClick={() => setCount(c)}>
                {c === 0 ? 'Todas' : c}
              </Chip>
            ))}
          </div>
        </section>

        <div className="flex flex-col items-start justify-between gap-3 border-t border-border pt-5 sm:flex-row sm:items-center">
          <p className="flex items-center gap-2 text-sm text-muted">
            <Shuffle size={15} />
            {pool.length} preguntas disponibles · orden aleatorio
          </p>
          <Button size="lg" onClick={() => start(pool)} disabled={pool.length === 0}>
            <Play size={18} /> Empezar ({count && pool.length > count ? count : pool.length})
          </Button>
        </div>
      </Card>
    </div>
  )
}
