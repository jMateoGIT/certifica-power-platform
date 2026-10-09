/**
 * Analítica anónima y opcional con Umami (sin cookies ni datos personales).
 *
 * Solo se activa si el build define VITE_UMAMI_WEBSITE_ID, el navegador no pide
 * «Do Not Track» y la persona no la ha desactivado en la web. Sirve para medir la
 * calidad de las preguntas: una pregunta que casi todo el mundo falla suele ser
 * ambigua y una que nadie falla, demasiado fácil.
 */
import type { Question } from '../content/schema'
import { useProgress } from '../store/progress'

const WEBSITE_ID = import.meta.env.VITE_UMAMI_WEBSITE_ID as string | undefined
const SCRIPT_URL = (import.meta.env.VITE_UMAMI_SCRIPT_URL as string | undefined) ?? 'https://cloud.umami.is/script.js'

declare global {
  interface Window {
    umami?: { track: (event?: string, data?: Record<string, string | number | boolean>) => void }
  }
}

/** ¿Está la analítica configurada en este despliegue? */
export const telemetryConfigured = Boolean(WEBSITE_ID)

/** ¿Se pueden enviar eventos ahora mismo (configurada, sin «no rastrear» y permitida)? */
export const telemetryActive = () => allowed()

const doNotTrack = () =>
  typeof navigator !== 'undefined' &&
  (navigator.doNotTrack === '1' || (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true)

function allowed() {
  return telemetryConfigured && !doNotTrack() && useProgress.getState().telemetry
}

let loaded = false
function load() {
  if (loaded || !allowed() || typeof document === 'undefined') return
  loaded = true
  const s = document.createElement('script')
  s.defer = true
  s.src = SCRIPT_URL
  s.dataset.websiteId = WEBSITE_ID
  // Las visitas se registran a mano en cada cambio de ruta para poder respetar la desactivación.
  s.dataset.autoTrack = 'false'
  s.dataset.doNotTrack = 'true'
  document.head.appendChild(s)
}

function send(event?: string, data?: Record<string, string | number | boolean>) {
  if (!allowed()) return
  load()
  // El script carga de forma asíncrona: reintentamos unos segundos si aún no está listo.
  let tries = 0
  const attempt = () => {
    if (window.umami) window.umami.track(event, data)
    else if (tries++ < 20) setTimeout(attempt, 250)
  }
  attempt()
}

/** Registra una visita a la ruta actual. */
export function trackPageview() {
  send()
}

export type AnswerMode = 'practica' | 'repaso' | 'caso' | 'simulacro'

/**
 * Registra el resultado de una pregunta. El nombre del evento codifica el
 * resultado (acierto/parcial/fallo) para poder calcular el porcentaje de acierto
 * de cada pregunta desde el panel de Umami agrupando por la propiedad «pregunta».
 */
export function trackAnswer(q: Question, score: number, mode: AnswerMode) {
  const result = score >= 1 ? 'acierto' : score > 0 ? 'parcial' : 'fallo'
  send(`respuesta-${result}`, { pregunta: q.id, dominio: q.domain, tipo: q.type, modo: mode })
}

export function trackExam(exam: string, mode: string, scaled: number, passed: boolean) {
  // La nota se redondea a decenas: suficiente para estadísticas y menos identificable.
  send('simulacro', { examen: exam, modo: mode, nota: Math.round(scaled / 10) * 10, aprobado: passed })
}

/** La persona indica que una pregunta le ha resultado confusa. */
export function trackConfusing(q: Question) {
  send('pregunta-confusa', { pregunta: q.id, dominio: q.domain, tipo: q.type })
}
