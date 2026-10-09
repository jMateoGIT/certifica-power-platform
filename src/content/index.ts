import type { GlossaryTerm, Question } from './schema'

// El contenido se valida en CI (`npm run validate`), así que aquí solo se tipa.
const questionFiles = import.meta.glob<Question[]>('./*/questions/*.json', { eager: true, import: 'default' })
const glossaryFiles = import.meta.glob<GlossaryTerm[]>('./*/glossary.json', { eager: true, import: 'default' })

const folderOf = (path: string) => path.split('/')[1]

const questionsByExam = new Map<string, Question[]>()
for (const [path, list] of Object.entries(questionFiles)) {
  const key = folderOf(path)
  questionsByExam.set(key, [...(questionsByExam.get(key) ?? []), ...list])
}

const questionIndex = new Map<string, Question>()
for (const list of questionsByExam.values()) for (const q of list) questionIndex.set(q.id, q)

/** Preguntas de un examen (código como «PL-900»). */
export function getQuestions(examCode: string): Question[] {
  return questionsByExam.get(examCode.toLowerCase()) ?? []
}

export function getQuestion(id: string): Question | undefined {
  return questionIndex.get(id)
}

export function getGlossary(examCode: string): GlossaryTerm[] {
  const entry = Object.entries(glossaryFiles).find(([p]) => folderOf(p) === examCode.toLowerCase())
  return entry ? [...entry[1]].sort((a, b) => a.term.localeCompare(b.term, 'es')) : []
}
