/**
 * Informe de calidad de las preguntas a partir de la analítica de Umami.
 * Calcula el % de acierto de cada pregunta y señala las sospechosas:
 *   - acierto < 25 %: posible ambigüedad o respuesta incorrecta
 *   - acierto > 95 %: demasiado fácil
 *
 * Uso:
 *   UMAMI_API_KEY=... UMAMI_WEBSITE_ID=... npm run question-quality [-- --days 90 --min 20]
 * Por defecto usa Umami Cloud (UMAMI_API_URL=https://api.umami.is/v1).
 */
import { getQuestions } from '../src/content'

const API = process.env.UMAMI_API_URL ?? 'https://api.umami.is/v1'
const KEY = process.env.UMAMI_API_KEY
const SITE = process.env.UMAMI_WEBSITE_ID
const arg = (name: string, def: number) => {
  const i = process.argv.indexOf(`--${name}`)
  return i > -1 ? Number(process.argv[i + 1]) : def
}
const days = arg('days', 90)
const minAnswers = arg('min', 20)

if (!KEY || !SITE) {
  console.error('Define UMAMI_API_KEY y UMAMI_WEBSITE_ID.')
  process.exit(1)
}

const endAt = Date.now()
const startAt = endAt - days * 86_400_000

async function countsFor(event: string): Promise<Map<string, number>> {
  const url = new URL(`${API}/websites/${SITE}/event-data/values`)
  url.search = new URLSearchParams({
    startAt: String(startAt),
    endAt: String(endAt),
    event,
    eventName: event,
    propertyName: 'pregunta',
  }).toString()
  const res = await fetch(url, { headers: { 'x-umami-api-key': KEY!, Accept: 'application/json' } })
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`)
  const rows = (await res.json()) as { value: string; total: number }[]
  return new Map(rows.map((r) => [r.value, r.total]))
}

const [ok, partial, ko] = await Promise.all(['respuesta-acierto', 'respuesta-parcial', 'respuesta-fallo'].map(countsFor))
const rows = getQuestions('PL-900')
  .map((q) => {
    const a = ok.get(q.id) ?? 0
    const p = partial.get(q.id) ?? 0
    const f = ko.get(q.id) ?? 0
    const n = a + p + f
    return { id: q.id, n, rate: n ? (a + p * 0.5) / n : 0 }
  })
  .filter((r) => r.n >= minAnswers)
  .sort((a, b) => a.rate - b.rate)

const pct = (x: number) => `${Math.round(x * 100)} %`.padStart(5)
console.log(`Preguntas con al menos ${minAnswers} respuestas en ${days} días: ${rows.length}\n`)
console.log('Posiblemente ambiguas (acierto < 25 %):')
rows.filter((r) => r.rate < 0.25).forEach((r) => console.log(`  ${pct(r.rate)}  ${r.id}  (${r.n})`))
console.log('\nDemasiado fáciles (acierto > 95 %):')
rows.filter((r) => r.rate > 0.95).forEach((r) => console.log(`  ${pct(r.rate)}  ${r.id}  (${r.n})`))
