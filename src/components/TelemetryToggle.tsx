import { BarChart3 } from 'lucide-react'
import { telemetryConfigured } from '../lib/telemetry'
import { useProgress } from '../store/progress'

/** Interruptor para permitir o no la analítica anónima. */
export function TelemetryToggle() {
  const { telemetry, setTelemetry } = useProgress()
  if (!telemetryConfigured) return null
  return (
    <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl bg-surface-2 p-3">
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 accent-[var(--primary)]"
        checked={telemetry}
        onChange={(e) => setTelemetry(e.target.checked)}
      />
      <span className="text-sm">
        <span className="flex items-center gap-1.5 font-semibold">
          <BarChart3 size={15} /> Ayudar a mejorar las preguntas
        </span>
        <span className="text-muted">
          Envía de forma anónima qué preguntas aciertas o fallas (sin cookies ni datos personales). Si tu navegador pide «no
          rastrear», no se envía nada.
        </span>
      </span>
    </label>
  )
}
