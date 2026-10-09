/**
 * Valida todo el contenido del banco de preguntas y del glosario.
 * Uso: npm run validate            (todo)
 *      npx vite-node scripts/validate-content.ts -- ruta/archivo.json   (un archivo)
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, relative } from 'node:path'
import { caseStudyFileSchema, glossarySchema, questionFileSchema, type ExamDefinition, type Question } from '../src/content/schema'
import { exams } from '../src/content/catalog'

const root = join(import.meta.dirname, '..')
const contentDir = join(root, 'src/content')
const errors: string[] = []
const warnings: string[] = []

function readJson(file: string): unknown {
  try {
    return JSON.parse(readFileSync(file, 'utf8'))
  } catch (e) {
    errors.push(`${relative(root, file)}: JSON inválido (${(e as Error).message})`)
    return null
  }
}

function checkSemantics(q: Question, exam: ExamDefinition, where: string) {
  const domain = exam.domains.find((d) => d.id === q.domain)
  if (q.exam !== exam.code) errors.push(`${where} ${q.id}: exam "${q.exam}" no coincide con ${exam.code}`)
  if (!domain) errors.push(`${where} ${q.id}: dominio desconocido "${q.domain}"`)
  else if (!domain.skills.some((s) => s.id === q.skill))
    errors.push(`${where} ${q.id}: sub-habilidad "${q.skill}" no existe en ${q.domain}`)
  if (q.outlineVersion !== exam.outlineVersion)
    warnings.push(`${where} ${q.id}: escrita para el temario ${q.outlineVersion} (vigente: ${exam.outlineVersion})`)

  const ids = (arr: { id: string }[]) => {
    const seen = new Set<string>()
    for (const { id } of arr) {
      if (seen.has(id)) errors.push(`${where} ${q.id}: id interno repetido "${id}"`)
      seen.add(id)
    }
  }
  switch (q.type) {
    case 'single':
    case 'multiple':
      ids(q.options)
      break
    case 'yesno':
      ids(q.statements)
      if (q.statements.every((s) => s.answer) || q.statements.every((s) => !s.answer))
        warnings.push(`${where} ${q.id}: todas las afirmaciones tienen la misma respuesta`)
      break
    case 'order':
      ids(q.items)
      break
    case 'match':
      ids(q.prompts)
      ids(q.choices)
      break
    case 'dropdown':
      ids(q.blanks)
      q.blanks.forEach((b) => ids(b.options))
      break
  }
}

const onlyFile = process.argv.slice(2).find((a) => a.endsWith('.json'))
const allIds = new Map<string, string>()
const allQuestions = new Map<string, Question>()
let total = 0

for (const exam of exams.filter((e) => e.status === 'disponible')) {
  const dir = join(contentDir, exam.code.toLowerCase(), 'questions')
  if (!existsSync(dir)) continue
  const files = readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => join(dir, f))
  const perDomain = new Map<string, number>()

  for (const file of files) {
    if (onlyFile && !file.endsWith(onlyFile.replace(/^.*\//, ''))) continue
    const where = relative(root, file)
    const data = readJson(file)
    if (data === null) continue
    const parsed = questionFileSchema.safeParse(data)
    if (!parsed.success) {
      for (const issue of parsed.error.issues.slice(0, 30)) {
        const idx = typeof issue.path[0] === 'number' ? issue.path[0] : undefined
        const qid = idx !== undefined ? (data as { id?: string }[])[idx]?.id : ''
        errors.push(`${where} [${idx}] ${qid ?? ''} ${issue.path.slice(1).join('.')}: ${issue.message}`)
      }
      continue
    }
    for (const q of parsed.data) {
      total++
      if (allIds.has(q.id)) errors.push(`${where}: id duplicado "${q.id}" (también en ${allIds.get(q.id)})`)
      allIds.set(q.id, where)
      allQuestions.set(q.id, q)
      checkSemantics(q, exam, where)
      perDomain.set(q.domain, (perDomain.get(q.domain) ?? 0) + 1)
    }
  }

  // Casos prácticos: cada caso debe existir y tener entre 3 y 6 preguntas.
  const casesFile = join(contentDir, exam.code.toLowerCase(), 'cases.json')
  if (!onlyFile && existsSync(casesFile)) {
    const parsed = caseStudyFileSchema.safeParse(readJson(casesFile))
    if (!parsed.success) parsed.error.issues.slice(0, 20).forEach((i) => errors.push(`cases ${i.path.join('.')}: ${i.message}`))
    else {
      const caseIds = new Set(parsed.data.map((c) => c.id))
      const perCase = new Map<string, number>()
      for (const [qid, where] of allIds) {
        const q = allQuestions.get(qid)
        if (!q?.caseId || q.exam !== exam.code) continue
        if (!caseIds.has(q.caseId)) errors.push(`${where} ${qid}: caso desconocido "${q.caseId}"`)
        perCase.set(q.caseId, (perCase.get(q.caseId) ?? 0) + 1)
      }
      for (const c of parsed.data) {
        const n = perCase.get(c.id) ?? 0
        if (n < 3 || n > 6) errors.push(`cases ${c.id}: tiene ${n} preguntas (deben ser 3–6)`)
      }
      console.log(`  casos prácticos: ${parsed.data.length} (${[...perCase.values()].reduce((a, b) => a + b, 0)} preguntas)`)
    }
  }

  if (!onlyFile) {
    const sum = [...perDomain.values()].reduce((a, b) => a + b, 0)
    console.log(`\n${exam.code}: ${sum} preguntas`)
    for (const d of exam.domains) {
      const n = perDomain.get(d.id) ?? 0
      const pct = sum ? Math.round((n / sum) * 100) : 0
      console.log(`  ${d.id} ${d.shortName.padEnd(22)} ${String(n).padStart(4)}  (${pct}% · oficial ${d.weight[0]}–${d.weight[1]}%)`)
      if (n < 5) warnings.push(`${exam.code} ${d.id}: solo ${n} preguntas`)
    }
  }

  const glossaryFile = join(contentDir, exam.code.toLowerCase(), 'glossary.json')
  if (!onlyFile && existsSync(glossaryFile)) {
    const g = glossarySchema.safeParse(readJson(glossaryFile))
    if (!g.success) g.error.issues.slice(0, 20).forEach((i) => errors.push(`glossary ${i.path.join('.')}: ${i.message}`))
    else {
      const terms = new Set<string>()
      for (const t of g.data) {
        if (terms.has(t.id)) errors.push(`glossary: id duplicado ${t.id}`)
        terms.add(t.id)
        if (!exam.domains.some((d) => d.id === t.domain)) errors.push(`glossary ${t.id}: dominio desconocido`)
      }
      console.log(`  glosario: ${g.data.length} términos`)
      const preview = [...allQuestions.values()].filter((q) => q.exam === exam.code && q.tags?.includes('preview')).length
      if (preview) console.log(`  marcadas como versión preliminar: ${preview}`)
    }
  }
}

warnings.forEach((w) => console.warn(`⚠  ${w}`))
if (errors.length) {
  errors.forEach((e) => console.error(`✖  ${e}`))
  console.error(`\n${errors.length} error(es) de contenido`)
  process.exit(1)
}
console.log(`\n✔ Contenido válido (${total} preguntas)`)
