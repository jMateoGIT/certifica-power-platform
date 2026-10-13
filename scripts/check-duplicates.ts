/**
 * Detecta preguntas duplicadas o casi duplicadas dentro de cada examen.
 * Compara el escenario, el enunciado y las respuestas correctas de cada pareja de
 * preguntas (similitud de Jaccard sobre palabras con contenido).
 *
 * Uso:
 *   npm run check-duplicates                       (todo el banco)
 *   npm run check-duplicates -- --file d3-power-apps-2.json   (solo ese archivo contra el resto)
 *   npm run check-duplicates -- --threshold 0.45
 * Sale con error si hay parejas por encima del umbral.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import type { Question } from '../src/content/schema'
import { exams } from '../src/content/catalog'

const arg = (name: string) => {
  const i = process.argv.indexOf(`--${name}`)
  return i > -1 ? process.argv[i + 1] : undefined
}
const threshold = Number(arg('threshold') ?? 0.5)
const onlyFile = arg('file')

const STOP = new Set(
  'para como cual cuál cuales cuáles debes deberías quieres puedes donde dónde entre esta este estas estos esto sobre desde hasta cada todas todos tiene tienen debe deben usar utilizar quiere necesita necesitas pregunta siguiente siguientes opción opciones respuesta empresa organización equipo usuario usuarios mediante también solo sólo cuando porque además otra otro otras otros puede pueden hacer está están sería será según tipo tipos forma manera'
    .split(' '),
)

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9ñ\s]/g, ' ')

const tokens = (s: string) => new Set(normalize(s).split(/\s+/).filter((w) => w.length >= 4 && !STOP.has(w)))

/** Texto que identifica de qué trata una pregunta: contexto, enunciado y lo que se da por correcto. */
function fingerprint(q: Question): string {
  const parts = [q.scenario ?? '', q.prompt, q.code?.content ?? '']
  switch (q.type) {
    case 'single':
    case 'multiple':
      parts.push(...q.options.filter((o) => o.correct).map((o) => o.text))
      break
    case 'yesno':
      parts.push(...q.statements.map((s) => s.text))
      break
    case 'order':
      parts.push(...q.items.map((i) => i.text))
      break
    case 'match':
      parts.push(...q.prompts.map((p) => `${p.text} ${q.choices.find((c) => c.id === p.answerId)?.text ?? ''}`))
      break
    case 'dropdown':
      parts.push(q.template, ...q.blanks.map((b) => b.options.find((o) => o.id === b.correctId)?.text ?? ''))
      break
  }
  return parts.join(' ')
}

const jaccard = (a: Set<string>, b: Set<string>) => {
  let inter = 0
  for (const w of a) if (b.has(w)) inter++
  return inter / (a.size + b.size - inter || 1)
}

let found = 0
for (const exam of exams.filter((e) => e.status === 'disponible')) {
  const dir = join(import.meta.dirname, '../src/content', exam.code.toLowerCase(), 'questions')
  if (!existsSync(dir)) continue
  const items: { q: Question; file: string; t: Set<string> }[] = []
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
    for (const q of JSON.parse(readFileSync(join(dir, file), 'utf8')) as Question[]) {
      items.push({ q, file, t: tokens(fingerprint(q)) })
    }
  }
  const pairs: [number, string, string][] = []
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i]
      const b = items[j]
      if (onlyFile && a.file !== onlyFile && b.file !== onlyFile) continue
      // Las preguntas de un mismo caso práctico comparten contexto a propósito.
      if (a.q.caseId && a.q.caseId === b.q.caseId) continue
      const sim = jaccard(a.t, b.t)
      if (sim >= threshold) pairs.push([sim, `${a.q.id} (${a.file})`, `${b.q.id} (${b.file})`])
    }
  }
  pairs.sort((x, y) => y[0] - x[0])
  console.log(`\n${exam.code}: ${items.length} preguntas, ${pairs.length} pareja(s) con similitud ≥ ${threshold}`)
  for (const [sim, a, b] of pairs) console.log(`  ${sim.toFixed(2)}  ${a}  ↔  ${b}`)
  found += pairs.length
}

if (found) process.exit(1)
console.log('\n✔ Sin duplicados por encima del umbral')
