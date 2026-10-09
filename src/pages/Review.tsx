import { Bookmark, CalendarCheck, CircleX, Play } from 'lucide-react'
import { useState } from 'react'
import { PracticeRunner } from '../components/PracticeRunner'
import { Button, ButtonLink, Card, PageTitle } from '../components/ui'
import type { Question } from '../content/schema'
import { BOX_INTERVAL_DAYS } from '../engine/leitner'
import { createRng, randomSeed, shuffle } from '../engine/random'
import { reviewQueues } from '../lib/analytics'
import { useExam } from '../lib/useExam'
import { useProgress } from '../store/progress'
import { NotFound } from './NotFound'

const boxLabels = ['Nueva o fallada', 'Aprendiendo', 'Repasando', 'Casi dominada', 'Dominada']

export function Review() {
  const { exam, questions } = useExam()
  const stats = useProgress((s) => s.stats)
  const bookmarks = useProgress((s) => s.bookmarks)
  const [session, setSession] = useState<{ questions: Question[]; seed: number } | null>(null)
  if (!exam || exam.status !== 'disponible') return <NotFound />

  const queues = reviewQueues(questions, stats)
  const saved = questions.filter((q) => bookmarks.includes(q.id))
  const boxes = [1, 2, 3, 4, 5].map((b) => questions.filter((q) => stats[q.id]?.box === b).length)
  const maxBox = Math.max(1, ...boxes)

  const start = (list: Question[]) => {
    const seed = randomSeed()
    setSession({ questions: shuffle(list, createRng(seed)).slice(0, 30), seed })
  }

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
          mode="repaso"
        />
      </div>
    )

  const cards = [
    { Icon: CalendarCheck, title: 'Toca repasar hoy', text: 'Según la repetición espaciada', list: queues.due, color: 'var(--primary)' },
    { Icon: CircleX, title: 'Falladas', text: 'Tu último intento no fue correcto', list: queues.failed, color: 'var(--bad)' },
    { Icon: Bookmark, title: 'Guardadas', text: 'Las que marcaste para repasar', list: saved, color: 'var(--warn)' },
  ]

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
      <PageTitle eyebrow={exam.code} title="Repaso inteligente">
        Usamos el sistema Leitner: cada acierto sube la pregunta de caja y la aleja en el tiempo; cada fallo la devuelve a la
        primera caja para que la veas pronto.
      </PageTitle>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map(({ Icon, title, text, list, color }) => (
          <Card key={title} className="flex flex-col p-5">
            <div className="flex items-center gap-2 font-semibold" style={{ color }}>
              <Icon size={18} /> {title}
            </div>
            <div className="mt-2 text-4xl font-extrabold tabular-nums">{list.length}</div>
            <p className="mt-1 flex-1 text-sm text-muted">{text}</p>
            <Button className="mt-4" variant={list.length ? 'primary' : 'secondary'} disabled={!list.length} onClick={() => start(list)}>
              <Play size={16} /> Repasar
            </Button>
          </Card>
        ))}
      </div>

      <Card className="mt-6 p-5">
        <h2 className="font-semibold">Tus cajas de repaso</h2>
        <p className="mt-1 text-sm text-muted">
          {questions.length - queues.unseen.length} de {questions.length} preguntas vistas. Las de la caja 1 vuelven el mismo día;
          las de la caja 5, a las {BOX_INTERVAL_DAYS[4]} días.
        </p>
        <div className="mt-5 grid grid-cols-5 items-end gap-2 sm:gap-4" style={{ height: 160 }}>
          {boxes.map((n, i) => (
            <div key={i} className="flex h-full flex-col items-center justify-end gap-1">
              <span className="text-sm font-bold tabular-nums">{n}</span>
              <div
                className="w-full rounded-t-lg transition-[height] duration-700"
                style={{
                  height: `${Math.max(4, (n / maxBox) * 100)}%`,
                  background: `color-mix(in oklab, var(--ok) ${i * 25}%, var(--primary))`,
                }}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-5 gap-2 text-center text-[11px] leading-tight text-muted sm:gap-4 sm:text-xs">
          {boxLabels.map((l, i) => (
            <span key={l}>
              <strong className="block text-text">Caja {i + 1}</strong>
              {l}
            </span>
          ))}
        </div>
        {queues.unseen.length === questions.length && (
          <div className="mt-5 text-center">
            <ButtonLink to={`/${exam.code.toLowerCase()}/practica`} variant="secondary">
              Aún no has respondido preguntas: empieza practicando
            </ButtonLink>
          </div>
        )}
      </Card>
    </div>
  )
}
