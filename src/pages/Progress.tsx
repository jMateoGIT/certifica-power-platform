import { Download, Flame, Trash2, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link } from 'react-router'
import {
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { TelemetryToggle } from '../components/TelemetryToggle'
import { Button, Card, DomainIcon, PageTitle, ProgressBar, ProgressRing, Stat } from '../components/ui'
import { domainProgress, readinessIndex, readinessLabel } from '../lib/analytics'
import { useExam } from '../lib/useExam'
import { currentStreak, examPrefix, isProgressData, useProgress } from '../store/progress'
import { NotFound } from './NotFound'

export function Progress() {
  const { exam, questions } = useExam()
  const state = useProgress()
  const fileInput = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<{ tone: 'ok' | 'bad'; text: string } | null>(null)
  if (!exam || exam.status !== 'disponible') return <NotFound />

  const base = `/${exam.code.toLowerCase()}`
  const progress = domainProgress(exam, questions, state.stats)
  const readiness = readinessIndex(exam, progress)
  const level = readinessLabel(readiness)
  const attempts = state.attempts.filter((a) => a.exam === exam.code)
  const seen = progress.reduce((a, p) => a + p.seen, 0)
  const mastered = progress.reduce((a, p) => a + p.mastered, 0)
  const streak = currentStreak(state.activity)

  const radarData = progress.map((p) => ({
    domain: p.name,
    Preparación: Math.round(p.readiness * 100),
    Acierto: Math.round(p.accuracy * 100),
  }))
  const historyData = [...attempts].reverse().map((a, i) => ({ n: i + 1, nota: a.scaled }))

  const exportData = () => {
    const { stats, attempts, activity, bookmarks, activeExam } = useProgress.getState()
    const blob = new Blob([JSON.stringify({ stats, attempts, activity, bookmarks, activeExam, exportedAt: new Date().toISOString() }, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `certifica-pp-progreso-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importData = async (file: File) => {
    try {
      const data = JSON.parse(await file.text())
      if (!isProgressData(data)) throw new Error('formato')
      state.importData({ ...data, activeExam: data.activeExam ?? null })
      setMessage({ tone: 'ok', text: 'Progreso importado correctamente.' })
    } catch {
      setMessage({ tone: 'bad', text: 'El archivo no es una copia de progreso válida.' })
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <PageTitle eyebrow={exam.code} title="Mi progreso">
        Se guarda en este navegador. Exporta una copia para llevarla a otro dispositivo.
      </PageTitle>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card className="flex flex-col items-center p-6 text-center">
          <ProgressRing
            value={readiness / 100}
            size={170}
            stroke={14}
            color={level.tone === 'high' ? 'var(--ok)' : level.tone === 'mid' ? 'var(--primary)' : 'var(--warn)'}
            label={`Índice de preparación ${readiness} de 100`}
          >
            <div>
              <div className="text-5xl font-extrabold tabular-nums">{readiness}</div>
              <div className="text-xs text-muted">de 100</div>
            </div>
          </ProgressRing>
          <div className="mt-3 text-lg font-bold">{level.label}</div>
          <p className="mt-1 text-sm text-muted">
            Ponderado con el peso oficial de cada dominio. Sube al acertar preguntas de forma repetida en el tiempo.
          </p>
          <div className="mt-5 grid w-full grid-cols-2 gap-2 text-left">
            <Stat label="Vistas" value={`${seen}/${questions.length}`} />
            <Stat label="Dominadas" value={mastered} />
            <Stat label="Simulacros" value={attempts.length} hint={attempts.length ? `Mejor: ${Math.max(...attempts.map((a) => a.scaled))}` : undefined} />
            <Stat
              label="Racha"
              value={
                <span className="flex items-center gap-1">
                  <Flame size={18} className={streak ? 'text-warn' : 'text-muted'} /> {streak} {streak === 1 ? 'día' : 'días'}
                </span>
              }
            />
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold">Mapa de dominios</h2>
          <p className="text-sm text-muted">Preparación (repetición espaciada) frente a acierto en tu último intento de cada pregunta.</p>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="72%">
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="domain" tick={{ fill: 'var(--muted)', fontSize: 12 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Acierto" dataKey="Acierto" stroke="#2f6fed" fill="#2f6fed" fillOpacity={0.15} />
                <Radar name="Preparación" dataKey="Preparación" stroke="#7c5cff" fill="#7c5cff" fillOpacity={0.35} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text)' }} formatter={(v) => `${v} %`} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-5 text-xs text-muted">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#7c5cff]" /> Preparación</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#2f6fed]" /> Acierto</span>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 font-semibold">Detalle por dominio</h2>
          <div className="space-y-4">
            {exam.domains.map((d) => {
              const p = progress.find((x) => x.id === d.id)!
              return (
                <Link key={d.id} to={`${base}/practica?dominio=${d.id}`} className="block rounded-lg hover:bg-surface-2">
                  <div className="mb-1.5 flex items-center gap-2 text-sm">
                    <DomainIcon icon={d.icon} color={d.color} size="sm" />
                    <span className="flex-1 font-medium">{d.shortName}</span>
                    <span className="text-xs text-muted">{p.seen}/{p.total} vistas · {p.mastered} dominadas</span>
                  </div>
                  <ProgressBar value={p.readiness} color={d.color} label={d.shortName} />
                </Link>
              )
            })}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold">Evolución en simulacros</h2>
          {historyData.length === 0 ? (
            <div className="grid h-56 place-items-center text-center text-sm text-muted">
              <div>
                Aún no has hecho simulacros.
                <br />
                <Link to={`${base}/simulacro`} className="font-semibold text-primary">Haz el primero</Link>
              </div>
            </div>
          ) : (
            <div className="mt-3 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                  <XAxis dataKey="n" tick={{ fill: 'var(--muted)', fontSize: 12 }} />
                  <YAxis domain={[0, 1000]} ticks={[0, 250, 500, 700, 1000]} tick={{ fill: 'var(--muted)', fontSize: 12 }} />
                  <ReferenceLine y={exam.passingScore} stroke="var(--ok)" strokeDasharray="6 4" label={{ value: 'Aprobado', fill: 'var(--ok)', fontSize: 11, position: 'insideTopLeft' }} />
                  <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text)' }} labelFormatter={(n) => `Simulacro ${n}`} />
                  <Line type="monotone" dataKey="nota" name="Nota" stroke="#7c5cff" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      <Card className="mt-4 p-5">
        <h2 className="font-semibold">Tus datos</h2>
        <p className="mt-1 text-sm text-muted">No hay cuentas ni servidor: todo se queda en tu navegador.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="secondary" onClick={exportData}>
            <Download size={16} /> Exportar progreso
          </Button>
          <Button variant="secondary" onClick={() => fileInput.current?.click()}>
            <Upload size={16} /> Importar progreso
          </Button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) importData(f)
              e.target.value = ''
            }}
          />
          <Button
            variant="danger"
            onClick={() => {
              if (confirm(`¿Borrar todo tu progreso de ${exam.code}? No se puede deshacer.`)) {
                state.resetExam(examPrefix(exam.code))
                setMessage({ tone: 'ok', text: 'Progreso borrado.' })
              }
            }}
          >
            <Trash2 size={16} /> Borrar progreso
          </Button>
        </div>
        <TelemetryToggle />
        {message && (
          <p role="status" className={`mt-3 text-sm ${message.tone === 'ok' ? 'text-ok' : 'text-bad'}`}>
            {message.text}
          </p>
        )}
      </Card>
    </div>
  )
}
