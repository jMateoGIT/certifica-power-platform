import type { Domain, Question } from '../content/schema'
import { createRng, shuffle } from './random'

/** Peso medio de un dominio (p. ej. 20–25 % → 22,5). */
export const midWeight = (d: Domain) => (d.weight[0] + d.weight[1]) / 2

/**
 * Reparte `total` preguntas entre dominios en proporción a su peso oficial
 * (método del mayor resto), sin superar las disponibles en cada dominio.
 */
export function allocateByWeight(domains: Domain[], available: Record<string, number>, total: number) {
  const totalWeight = domains.reduce((s, d) => s + midWeight(d), 0)
  const target = Math.min(total, domains.reduce((s, d) => s + (available[d.id] ?? 0), 0))
  const raw = domains.map((d) => ({ id: d.id, exact: (midWeight(d) / totalWeight) * target }))
  const alloc: Record<string, number> = {}
  for (const r of raw) alloc[r.id] = Math.min(Math.floor(r.exact), available[r.id] ?? 0)

  let remaining = target - Object.values(alloc).reduce((a, b) => a + b, 0)
  const byRemainder = [...raw].sort((a, b) => (b.exact % 1) - (a.exact % 1))
  while (remaining > 0) {
    let progressed = false
    for (const r of byRemainder) {
      if (remaining === 0) break
      if (alloc[r.id] < (available[r.id] ?? 0)) {
        alloc[r.id]++
        remaining--
        progressed = true
      }
    }
    if (!progressed) break
  }
  return alloc
}

/**
 * Construye un simulacro: preguntas aleatorias por dominio según los pesos
 * oficiales, ordenadas por dominio como en el examen real. Con `includeCase`,
 * añade al final un caso práctico completo (sus preguntas cuentan en el reparto
 * por dominio). Las preguntas de casos nunca aparecen sueltas en el simulacro.
 */
export function buildExam(
  questions: Question[],
  domains: Domain[],
  count: number,
  seed: number,
  options: { includeCase?: boolean } = {},
): Question[] {
  const rng = createRng(seed)
  const standalone = questions.filter((q) => !q.caseId)

  let caseBlock: Question[] = []
  if (options.includeCase) {
    const caseIds = [...new Set(questions.flatMap((q) => (q.caseId ? [q.caseId] : [])))].sort()
    if (caseIds.length) {
      const picked = caseIds[Math.floor(rng() * caseIds.length)]
      caseBlock = questions.filter((q) => q.caseId === picked)
      if (caseBlock.length >= count) caseBlock = []
    }
  }

  const byDomain = new Map<string, Question[]>()
  for (const q of standalone) byDomain.set(q.domain, [...(byDomain.get(q.domain) ?? []), q])
  const inCase = (d: string) => caseBlock.filter((q) => q.domain === d).length
  const available = Object.fromEntries(domains.map((d) => [d.id, (byDomain.get(d.id)?.length ?? 0) + inCase(d.id)]))
  const alloc = allocateByWeight(domains, available, count)

  const shuffled = new Map(domains.map((d) => [d.id, shuffle(byDomain.get(d.id) ?? [], rng)]))
  const main = domains.flatMap((d) => shuffled.get(d.id)!.splice(0, Math.max(0, (alloc[d.id] ?? 0) - inCase(d.id))))

  // Si el caso ocupa más hueco del previsto en un dominio, se completa con otros.
  const target = Math.min(count, standalone.length + caseBlock.length) - caseBlock.length
  const leftovers = shuffle([...shuffled.values()].flat(), rng)
  while (main.length < target && leftovers.length) main.push(leftovers.pop()!)

  const order = new Map(domains.map((d, i) => [d.id, i]))
  main.sort((a, b) => (order.get(a.domain) ?? 0) - (order.get(b.domain) ?? 0))
  return [...main.slice(0, target), ...caseBlock]
}

export interface PracticeFilter {
  domains?: string[]
  skills?: string[]
  /** Subconjunto de ids permitido (no vistas, falladas, marcadas…). */
  onlyIds?: Set<string>
}

export function filterQuestions(questions: Question[], f: PracticeFilter): Question[] {
  return questions.filter(
    (q) =>
      (!f.domains?.length || f.domains.includes(q.domain)) &&
      (!f.skills?.length || f.skills.includes(q.skill)) &&
      (!f.onlyIds || f.onlyIds.has(q.id)),
  )
}
