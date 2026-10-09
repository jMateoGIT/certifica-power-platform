/** Respuesta del usuario a una pregunta, según su tipo. */
export type Answer =
  | { type: 'single'; optionId: string | null }
  | { type: 'multiple'; optionIds: string[] }
  | { type: 'yesno'; values: Record<string, boolean> }
  | { type: 'order'; order: string[] }
  | { type: 'match'; values: Record<string, string> }
  | { type: 'dropdown'; values: Record<string, string> }

export interface GradeResult {
  /** Puntuación de 0 a 1 (con crédito parcial en preguntas de varias partes). */
  score: number
  /** true solo si la respuesta es completamente correcta. */
  correct: boolean
  /** Corrección de cada parte (opción, afirmación, hueco, emparejamiento o posición). */
  parts: Record<string, boolean>
}
