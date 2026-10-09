/**
 * Informe de calidad de las preguntas a partir de la analítica de Umami.
 * Calcula el % de acierto de cada pregunta y señala las sospechosas:
 *   - acierto < 25 %: posible ambigüedad o respuesta incorrecta
 *   - acierto > 95 %: demasiado fácil
 *   - marcadas como «confusa» por al menos 3 personas
 *
 * Uso:
 *   UMAMI_API_KEY=... UMAMI_WEBSITE_ID=... npm run question-quality [-- --days 30 --min 20 --out informe.md]
 * Por defecto usa Umami Cloud (UMAMI_API_URL=https://api.umami.is/v1).
 * Escribe el informe en markdown en --out solo si hay preguntas que revisar.
 */
import { writeFileSync } from 'node:fs'
import { getQuestions } from '../src/content'
import { exams } from '../src/content/catalog'

const API = process.env.UMAMI_API_URL ?? 'https://api.umami.is/v1'
const KEY = process.env.UMAMI_API_KEY
const SITE = process.env.UMAMI_WEBSITE_ID
const arg = (name: string) => {
  const i = process.argv.indexOf(`--${name}`)
  return i > -1 ? process.argv[i + 1] : undefined
}
const days = Number(arg('days') ?? 30)
const minAnswers = Number(arg('min') ?? 20)
const outFile = arg('out')

if (!KEY || !SITE) {
  console.log('Analítica no configurada (faltan UMAMI_API_KEY y UMAMI_WEBSITE_ID): no hay informe.')
  process.exit(0)
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
  if (!res.ok) throw new Error(`${event}: ${res.status} ${await res.text()}`)
  const rows = (await res.json()) as { value: string; total: number }[]
  return new Map(rows.map((r) => [r.value, r.total]))
}

const [ok, partial, ko, confusing] = await Promise.all(
  ['respuesta-acierto', 'respuesta-parcial', 'respuesta-fallo', 'pregunta-confusa'].map(countsFor),
)

const pct = (x: number) => `${Math.round(x * 100)} %`
const sections: string[] = []

for (const exam of exams.filter((e) => e.status === 'disponible')) {
  const rows = getQuestions(exam.code).map((q) => {
    const a = ok.get(q.id) ?? 0
    const p = partial.get(q.id) ?? 0
    const f = ko.get(q.id) ?? 0
    const n = a + p + f
    return { id: q.id, n, rate: n ? (a + p * 0.5) / n : 0, confusing: confusing.get(q.id) ?? 0 }
  })
  const measured = rows.filter((r) => r.n >= minAnswers)
  const hard = measured.filter((r) => r.rate < 0.25).sort((a, b) => a.rate - b.rate)
  const easy = measured.filter((r) => r.rate > 0.95).sort((a, b) => b.rate - a.rate)
  const flagged = rows.filter((r) => r.confusing >= 3).sort((a, b) => b.confusing - a.confusing)

  console.log(`\n${exam.code}: ${measured.length} preguntas con al menos ${minAnswers} respuestas en ${days} días`)
  const list = (title: string, items: typeof rows, fmt: (r: (typeof rows)[number]) => string) => {
    console.log(`  ${title}: ${items.length}`)
    items.forEach((r) => console.log(`    ${fmt(r)}`))
    return items.length ? `**${title}**\n\n${items.map((r) => `- \`${r.id}\` — ${fmt(r)}`).join('\n')}\n` : ''
  }
  const parts = [
    list('Marcadas como confusas', flagged, (r) => `${r.confusing} marcas · acierto ${pct(r.rate)} (${r.n})`),
    list('Posiblemente ambiguas (acierto < 25 %)', hard, (r) => `acierto ${pct(r.rate)} (${r.n} respuestas)`),
    list('Demasiado fáciles (acierto > 95 %)', easy, (r) => `acierto ${pct(r.rate)} (${r.n} respuestas)`),
  ].filter(Boolean)
  if (parts.length) sections.push(`### ${exam.code}\n\n${parts.join('\n')}`)
}

if (outFile && sections.length) {
  writeFileSync(
    outFile,
    `Informe de calidad de los últimos ${days} días (preguntas con al menos ${minAnswers} respuestas).\n\n` +
      `${sections.join('\n')}\nRevisa cada pregunta: enunciado, distractores y explicaciones, y contrástala con Microsoft Learn.\n`,
  )
}
