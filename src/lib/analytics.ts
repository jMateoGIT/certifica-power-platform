import type { ExamDefinition, Question } from '../content/schema'
import { midWeight } from '../engine/examBuilder'
import { isDue, isFailed, isMastered, mastery, type QuestionStat } from '../engine/leitner'

export interface DomainProgress {
  id: string
  name: string
  color: string
  total: number
  seen: number
  mastered: number
  /** Acierto en el último intento de las preguntas vistas (0–1). */
  accuracy: number
  /** Preparación estimada del dominio (0–1). */
  readiness: number
}

export function domainProgress(exam: ExamDefinition, questions: Question[], stats: Record<string, QuestionStat>) {
  return exam.domains.map<DomainProgress>((d) => {
    const qs = questions.filter((q) => q.domain === d.id)
    const seenStats = qs.map((q) => stats[q.id]).filter((s): s is QuestionStat => !!s)
    return {
      id: d.id,
      name: d.shortName,
      color: d.color,
      total: qs.length,
      seen: seenStats.length,
      mastered: seenStats.filter(isMastered).length,
      accuracy: seenStats.length ? seenStats.reduce((a, s) => a + s.lastScore, 0) / seenStats.length : 0,
      readiness: qs.length ? qs.reduce((a, q) => a + mastery(stats[q.id]), 0) / qs.length : 0,
    }
  })
}

/** Índice de preparación global (0–100) ponderado por el peso oficial de cada dominio. */
export function readinessIndex(exam: ExamDefinition, progress: DomainProgress[]): number {
  const totalWeight = exam.domains.reduce((s, d) => s + midWeight(d), 0)
  const value = exam.domains.reduce((s, d) => {
    const p = progress.find((x) => x.id === d.id)
    return s + (p ? p.readiness * midWeight(d) : 0)
  }, 0)
  return Math.round((value / totalWeight) * 100)
}

export function readinessLabel(value: number): { label: string; tone: 'low' | 'mid' | 'high' } {
  if (value >= 75) return { label: 'Preparado para el examen', tone: 'high' }
  if (value >= 45) return { label: 'Buen progreso', tone: 'mid' }
  return { label: 'Empezando', tone: 'low' }
}

export function reviewQueues(questions: Question[], stats: Record<string, QuestionStat>, now = Date.now()) {
  return {
    due: questions.filter((q) => isDue(stats[q.id], now)),
    failed: questions.filter((q) => isFailed(stats[q.id])),
    unseen: questions.filter((q) => !stats[q.id]),
  }
}

export const percent = (x: number) => `${Math.round(x * 100)} %`
