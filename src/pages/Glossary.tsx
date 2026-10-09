import clsx from 'clsx'
import { ChevronLeft, ChevronRight, ExternalLink, Layers, List, RotateCcw, Search, Shuffle } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button, Card, DomainIcon, PageTitle } from '../components/ui'
import { getGlossary } from '../content'
import { createRng, randomSeed, shuffle } from '../engine/random'
import { useExam } from '../lib/useExam'
import { NotFound } from './NotFound'

const normalize = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

export function Glossary() {
  const { exam } = useExam()
  const all = useMemo(() => (exam ? getGlossary(exam.code) : []), [exam])
  const [view, setView] = useState<'lista' | 'tarjetas'>('lista')
  const [query, setQuery] = useState('')
  const [domain, setDomain] = useState<string | null>(null)
  const [deckSeed, setDeckSeed] = useState(0)
  const [card, setCard] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const filtered = useMemo(() => {
    const q = normalize(query.trim())
    return all.filter(
      (t) => (!domain || t.domain === domain) && (!q || normalize(`${t.term} ${t.en} ${t.definition}`).includes(q)),
    )
  }, [all, query, domain])
  const deck = useMemo(() => (deckSeed ? shuffle(filtered, createRng(deckSeed)) : filtered), [filtered, deckSeed])

  if (!exam || exam.status !== 'disponible') return <NotFound />
  const domainOf = (id: string) => exam.domains.find((d) => d.id === id)
  const current = deck[Math.min(card, deck.length - 1)]
  const goCard = (i: number) => {
    setCard((i + deck.length) % deck.length)
    setFlipped(false)
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
      <PageTitle eyebrow={exam.code} title="Glosario">
        {all.length} conceptos clave con su nombre en inglés, tal y como aparecen en la interfaz y en la documentación.
      </PageTitle>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Buscar término</span>
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setCard(0)
            }}
            placeholder="Buscar: Dataverse, flujo, tema…"
            className="w-full rounded-xl border-2 border-border bg-surface py-2 pl-9 pr-3 outline-none focus:border-primary"
          />
        </label>
        <div className="flex rounded-xl border border-border bg-surface p-1" role="tablist" aria-label="Vista">
          {(
            [
              ['lista', 'Lista', List],
              ['tarjetas', 'Tarjetas', Layers],
            ] as const
          ).map(([v, label, Icon]) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={view === v}
              onClick={() => setView(v)}
              className={clsx(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium',
                view === v ? 'bg-primary-soft text-primary' : 'text-muted hover:text-text',
              )}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setDomain(null)}
          className={clsx('rounded-full border px-3 py-1 text-sm', !domain ? 'border-primary bg-primary-soft text-primary' : 'border-border text-muted')}
        >
          Todos
        </button>
        {exam.domains.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => {
              setDomain(domain === d.id ? null : d.id)
              setCard(0)
            }}
            className={clsx(
              'rounded-full border px-3 py-1 text-sm',
              domain === d.id ? 'border-primary bg-primary-soft text-primary' : 'border-border text-muted hover:text-text',
            )}
          >
            {d.shortName}
          </button>
        ))}
      </div>

      {filtered.length === 0 && <p className="py-10 text-center text-muted">No hay términos que coincidan con la búsqueda.</p>}

      {view === 'lista' && filtered.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((t) => {
            const d = domainOf(t.domain)
            return (
              <Card key={t.id} className="p-4">
                <div className="flex items-start gap-3">
                  {d && <DomainIcon icon={d.icon} color={d.color} size="sm" />}
                  <div className="min-w-0">
                    <h2 className="font-bold">
                      {t.term} <span className="font-normal italic text-muted">({t.en})</span>
                    </h2>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{t.definition}</p>
                    {t.reference && (
                      <a href={t.reference.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                        {t.reference.title} <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {view === 'tarjetas' && current && (
        <div className="mx-auto max-w-xl">
          <button
            type="button"
            onClick={() => setFlipped((f) => !f)}
            className="block w-full [perspective:1200px]"
            aria-label={flipped ? 'Ver término' : 'Ver definición'}
          >
            <div
              className="relative h-72 w-full transition-transform duration-500 [transform-style:preserve-3d]"
              style={{ transform: flipped ? 'rotateY(180deg)' : 'none' }}
            >
              <Card className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center [backface-visibility:hidden]">
                {domainOf(current.domain) && (
                  <span className="mb-4 text-xs font-semibold uppercase tracking-wide" style={{ color: domainOf(current.domain)!.color }}>
                    {domainOf(current.domain)!.shortName}
                  </span>
                )}
                <div className="text-3xl font-extrabold tracking-tight">{current.term}</div>
                <div className="mt-2 italic text-muted">{current.en}</div>
                <div className="mt-6 text-xs text-muted">Pulsa para ver la definición</div>
              </Card>
              <Card className="absolute inset-0 flex items-center justify-center bg-primary-soft p-8 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <p className="text-lg leading-relaxed">{current.definition}</p>
              </Card>
            </div>
          </button>
          <div className="mt-5 flex items-center justify-between">
            <Button variant="secondary" onClick={() => goCard(card - 1)} aria-label="Anterior">
              <ChevronLeft size={18} />
            </Button>
            <span className="text-sm font-medium tabular-nums text-muted">
              {Math.min(card, deck.length - 1) + 1} / {deck.length}
            </span>
            <Button variant="secondary" onClick={() => goCard(card + 1)} aria-label="Siguiente">
              <ChevronRight size={18} />
            </Button>
          </div>
          <div className="mt-3 flex justify-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => { setDeckSeed(randomSeed()); setCard(0); setFlipped(false) }}>
              <Shuffle size={15} /> Barajar
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { setDeckSeed(0); setCard(0); setFlipped(false) }}>
              <RotateCcw size={15} /> Orden alfabético
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
