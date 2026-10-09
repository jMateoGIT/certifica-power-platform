import { Building2, CircleCheck, Play } from 'lucide-react'
import { useState } from 'react'
import { PracticeRunner } from '../components/PracticeRunner'
import { Badge, Button, Card, DomainIcon, PageTitle, ProgressBar } from '../components/ui'
import { getCaseQuestions, getCases } from '../content'
import type { Question } from '../content/schema'
import { randomSeed } from '../engine/random'
import { useExam } from '../lib/useExam'
import { useProgress } from '../store/progress'
import { NotFound } from './NotFound'

export function Cases() {
  const { exam } = useExam()
  const stats = useProgress((s) => s.stats)
  const [session, setSession] = useState<{ questions: Question[]; seed: number } | null>(null)
  if (!exam || exam.status !== 'disponible') return <NotFound />

  const cases = getCases(exam.code)

  if (session)
    return (
      <div className="px-4 py-6 sm:py-10">
        <PracticeRunner
          key={session.seed}
          exam={exam}
          questions={session.questions}
          seed={session.seed}
          onExit={() => setSession(null)}
          onRestart={(qs) => setSession({ questions: qs, seed: randomSeed() })}
          mode="caso"
        />
      </div>
    )

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
      <PageTitle eyebrow={exam.code} title="Casos prácticos">
        Escenarios de empresa con varias preguntas encadenadas que combinan dominios, como en los exámenes de Microsoft.
        Lee el caso con calma: el contexto se mantiene visible junto a cada pregunta.
      </PageTitle>

      {cases.length === 0 && <p className="py-10 text-center text-muted">Todavía no hay casos prácticos para este examen.</p>}

      <div className="grid gap-4 md:grid-cols-2">
        {cases.map((c, i) => {
          const questions = getCaseQuestions(exam.code, c.id)
          const seen = questions.filter((q) => stats[q.id]).length
          const correct = questions.filter((q) => stats[q.id]?.lastScore === 1).length
          const domains = exam.domains.filter((d) => questions.some((q) => q.domain === d.id))
          const done = seen === questions.length && questions.length > 0
          return (
            <Card key={c.id} className="flex flex-col p-5">
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                  <Building2 size={21} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-muted">Caso {i + 1} · {c.company}</div>
                  <h2 className="font-bold leading-snug">{c.title}</h2>
                </div>
                {done && (
                  <Badge tone={correct === questions.length ? 'ok' : 'primary'}>
                    <CircleCheck size={12} /> {correct}/{questions.length}
                  </Badge>
                )}
              </div>
              <p className="mt-3 flex-1 text-sm text-muted">{c.summary}</p>
              <div className="mt-4 flex flex-wrap items-center gap-1.5">
                {domains.map((d) => (
                  <span key={d.id} title={d.name}>
                    <DomainIcon icon={d.icon} color={d.color} size="sm" />
                  </span>
                ))}
                <span className="ml-1 text-xs text-muted">{questions.length} preguntas</span>
              </div>
              <ProgressBar value={questions.length ? seen / questions.length : 0} className="mt-3" label={`Progreso del caso ${i + 1}`} />
              <Button
                className="mt-4"
                variant={done ? 'secondary' : 'primary'}
                disabled={!questions.length}
                onClick={() => setSession({ questions, seed: randomSeed() })}
              >
                <Play size={16} /> {done ? 'Repetir caso' : 'Empezar caso'}
              </Button>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
