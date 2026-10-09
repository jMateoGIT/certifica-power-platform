import type { Question } from '../content/schema'
import type { Answer, GradeResult } from './types'

export function emptyAnswer(q: Question): Answer {
  switch (q.type) {
    case 'single':
      return { type: 'single', optionId: null }
    case 'multiple':
      return { type: 'multiple', optionIds: [] }
    case 'yesno':
      return { type: 'yesno', values: {} }
    case 'order':
      return { type: 'order', order: [] }
    case 'match':
      return { type: 'match', values: {} }
    case 'dropdown':
      return { type: 'dropdown', values: {} }
  }
}

/** Número de opciones correctas que hay que elegir en una pregunta de respuesta múltiple. */
export function requiredSelections(q: Question): number {
  return q.type === 'multiple' ? q.options.filter((o) => o.correct).length : 1
}

/** ¿Ha completado el usuario todas las partes de la pregunta? */
export function isComplete(q: Question, a: Answer | undefined): boolean {
  if (!a || a.type !== q.type) return false
  switch (a.type) {
    case 'single':
      return a.optionId !== null
    case 'multiple':
      return a.optionIds.length === requiredSelections(q)
    case 'yesno':
      return q.type === 'yesno' && q.statements.every((s) => a.values[s.id] !== undefined)
    case 'order':
      return q.type === 'order' && a.order.length === q.items.length
    case 'match':
      return q.type === 'match' && q.prompts.every((p) => !!a.values[p.id])
    case 'dropdown':
      return q.type === 'dropdown' && q.blanks.every((b) => !!a.values[b.id])
  }
}

/** ¿Ha empezado a responder? (para el navegador del simulacro). */
export function isStarted(a: Answer | undefined): boolean {
  if (!a) return false
  switch (a.type) {
    case 'single':
      return a.optionId !== null
    case 'multiple':
      return a.optionIds.length > 0
    case 'order':
      return a.order.length > 0
    default:
      return Object.keys(a.values).length > 0
  }
}

const ratio = (parts: Record<string, boolean>) => {
  const values = Object.values(parts)
  return values.length ? values.filter(Boolean).length / values.length : 0
}

/**
 * Corrige una respuesta. Las preguntas de varias partes (multiple, yesno, match,
 * dropdown) reciben crédito parcial, como en el examen real; single y order son
 * todo o nada.
 */
export function grade(q: Question, a: Answer | undefined): GradeResult {
  const parts: Record<string, boolean> = {}
  let score = 0

  switch (q.type) {
    case 'single': {
      const chosen = a?.type === 'single' ? a.optionId : null
      for (const o of q.options) parts[o.id] = o.correct === (o.id === chosen)
      score = q.options.find((o) => o.id === chosen)?.correct ? 1 : 0
      break
    }
    case 'multiple': {
      const chosen = new Set(a?.type === 'multiple' ? a.optionIds : [])
      const correctIds = q.options.filter((o) => o.correct).map((o) => o.id)
      for (const o of q.options) parts[o.id] = o.correct === chosen.has(o.id)
      // Un punto por cada opción correcta elegida (la interfaz limita las selecciones
      // al número de correctas, así que marcarlo todo no es posible).
      const hits = correctIds.filter((id) => chosen.has(id)).length
      const extra = Math.max(0, chosen.size - correctIds.length)
      score = Math.max(0, (hits - extra) / correctIds.length)
      break
    }
    case 'yesno': {
      const values = a?.type === 'yesno' ? a.values : {}
      for (const s of q.statements) parts[s.id] = values[s.id] === s.answer
      score = ratio(parts)
      break
    }
    case 'order': {
      const order = a?.type === 'order' ? a.order : []
      q.items.forEach((item, i) => (parts[item.id] = order[i] === item.id))
      score = Object.values(parts).every(Boolean) ? 1 : 0
      break
    }
    case 'match': {
      const values = a?.type === 'match' ? a.values : {}
      for (const p of q.prompts) parts[p.id] = values[p.id] === p.answerId
      score = ratio(parts)
      break
    }
    case 'dropdown': {
      const values = a?.type === 'dropdown' ? a.values : {}
      for (const b of q.blanks) parts[b.id] = values[b.id] === b.correctId
      score = ratio(parts)
      break
    }
  }

  score = Math.round(score * 1000) / 1000
  return { score, correct: score === 1, parts }
}

/**
 * Nota en escala 0–1000, como el informe oficial. Microsoft no publica una
 * conversión lineal; aquí usamos una aproximación lineal sobre el porcentaje de
 * puntos obtenidos.
 */
export function scaledScore(points: number, total: number): number {
  if (total <= 0) return 0
  return Math.round((points / total) * 1000)
}
