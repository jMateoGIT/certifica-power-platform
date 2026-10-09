/**
 * Repetición espaciada con el sistema Leitner de 5 cajas.
 * Acertar sube una caja (se repasa más tarde); fallar devuelve a la caja 1.
 */
export const BOX_INTERVAL_DAYS = [0, 1, 3, 7, 14] as const
export const MAX_BOX = BOX_INTERVAL_DAYS.length
const DAY = 24 * 60 * 60 * 1000

export interface QuestionStat {
  attempts: number
  correct: number
  /** Caja Leitner 1–5. */
  box: number
  /** Marca de tiempo a partir de la cual toca repasarla. */
  due: number
  last: number
  lastScore: number
}

export function nextStat(prev: QuestionStat | undefined, score: number, now = Date.now()): QuestionStat {
  const fullyCorrect = score >= 1
  const box = fullyCorrect ? Math.min(MAX_BOX, (prev?.box ?? 0) + 1) : 1
  return {
    attempts: (prev?.attempts ?? 0) + 1,
    correct: (prev?.correct ?? 0) + (fullyCorrect ? 1 : 0),
    box,
    due: now + BOX_INTERVAL_DAYS[box - 1] * DAY,
    last: now,
    lastScore: score,
  }
}

export const isDue = (s: QuestionStat | undefined, now = Date.now()) => !!s && s.due <= now
export const isMastered = (s: QuestionStat | undefined) => !!s && s.box >= 4
export const isFailed = (s: QuestionStat | undefined) => !!s && s.lastScore < 1

/** Dominio de una pregunta de 0 a 1 según su caja (no vista = 0). */
export function mastery(s: QuestionStat | undefined): number {
  if (!s) return 0
  return [0.15, 0.45, 0.7, 0.9, 1][s.box - 1] ?? 0
}
