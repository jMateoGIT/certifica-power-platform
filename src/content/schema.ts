import { z } from 'zod'

/**
 * Esquema del contenido. Todo el banco de preguntas se valida contra estos
 * tipos en CI (`npm run validate`), así que una pregunta mal formada nunca
 * llega a producción.
 */

const id = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'id en kebab-case')
const text = z.string().trim().min(1)
/** Explicación pedagógica: por qué algo es correcto o incorrecto. */
const explanation = z.string().trim().min(20, 'la explicación debe tener al menos 20 caracteres')

export const referenceSchema = z.object({
  title: text,
  url: z.url().refine((u) => u.startsWith('https://learn.microsoft.com/'), {
    message: 'las referencias deben apuntar a Microsoft Learn',
  }),
})

const optionSchema = z.object({
  id,
  text,
  correct: z.boolean(),
  explanation,
})

const baseQuestion = z.object({
  id,
  exam: z.string(),
  /** Fecha del temario oficial (skills outline) contra el que se escribió. */
  outlineVersion: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  domain: z.string(),
  skill: z.string(),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  /** Escenario de negocio opcional que contextualiza la pregunta. */
  scenario: text.optional(),
  prompt: text,
  /** Idea clave para recordar tras responder. */
  keyPoint: text,
  references: z.array(referenceSchema).min(1),
  /**
   * Etiquetas libres. `preview` marca preguntas sobre funciones en versión
   * preliminar, que hay que revisar cuando cambien de estado.
   */
  tags: z.array(z.string()).optional(),
  /** Caso práctico al que pertenece (sus preguntas se muestran con el contexto del caso). */
  caseId: id.optional(),
})

export const singleQuestionSchema = baseQuestion.extend({
  type: z.literal('single'),
  options: z
    .array(optionSchema)
    .min(3)
    .max(6)
    .refine((o) => o.filter((x) => x.correct).length === 1, {
      message: 'una pregunta "single" debe tener exactamente 1 opción correcta',
    }),
})

export const multipleQuestionSchema = baseQuestion.extend({
  type: z.literal('multiple'),
  options: z
    .array(optionSchema)
    .min(4)
    .max(7)
    .refine((o) => o.filter((x) => x.correct).length >= 2, {
      message: 'una pregunta "multiple" debe tener al menos 2 opciones correctas',
    })
    .refine((o) => o.some((x) => !x.correct), { message: 'debe haber al menos un distractor' }),
})

export const yesNoQuestionSchema = baseQuestion.extend({
  type: z.literal('yesno'),
  statements: z
    .array(z.object({ id, text, answer: z.boolean(), explanation }))
    .min(3)
    .max(4),
})

export const orderQuestionSchema = baseQuestion.extend({
  type: z.literal('order'),
  /** Los pasos en el ORDEN CORRECTO; la app los baraja al mostrarlos. */
  items: z.array(z.object({ id, text, explanation })).min(3).max(6),
})

export const matchQuestionSchema = baseQuestion
  .extend({
    type: z.literal('match'),
    /** Elementos a emparejar (columna izquierda). */
    prompts: z.array(z.object({ id, text, answerId: id, explanation })).min(3).max(6),
    /** Opciones disponibles (columna derecha). Puede haber más que prompts y repetirse. */
    choices: z.array(z.object({ id, text })).min(3).max(8),
  })
  .refine((q) => q.prompts.every((p) => q.choices.some((c) => c.id === p.answerId)), {
    message: 'cada answerId debe existir en choices',
  })

export const dropdownQuestionSchema = baseQuestion
  .extend({
    type: z.literal('dropdown'),
    /** Frase con huecos marcados como {{idDelHueco}}. */
    template: text,
    blanks: z
      .array(
        z.object({
          id,
          options: z.array(z.object({ id, text })).min(2).max(5),
          correctId: id,
          explanation,
        }),
      )
      .min(1)
      .max(3),
  })
  .refine((q) => q.blanks.every((b) => b.options.some((o) => o.id === b.correctId)), {
    message: 'cada correctId debe existir en las opciones del hueco',
  })
  .refine((q) => q.blanks.every((b) => q.template.includes(`{{${b.id}}}`)), {
    message: 'cada hueco debe aparecer en template como {{id}}',
  })

export const questionSchema = z.union([
  singleQuestionSchema,
  multipleQuestionSchema,
  yesNoQuestionSchema,
  orderQuestionSchema,
  matchQuestionSchema,
  dropdownQuestionSchema,
])

export const questionFileSchema = z.array(questionSchema)

/**
 * Caso práctico: un escenario de empresa largo con varias preguntas encadenadas.
 * Las preguntas viven en `questions/casos.json` y apuntan al caso con `caseId`.
 */
export const caseStudySchema = z.object({
  id,
  exam: z.string(),
  outlineVersion: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title: text,
  /** Organización ficticia del caso. */
  company: text,
  /** Resumen de una o dos frases para el listado. */
  summary: text,
  /** Secciones del caso: contexto, situación actual, requisitos, problemas… */
  sections: z.array(z.object({ title: text, body: text })).min(2).max(6),
})

export const caseStudyFileSchema = z.array(caseStudySchema)

export const glossaryTermSchema = z.object({
  id,
  term: text,
  /** Término en inglés tal y como aparece en la interfaz. */
  en: text,
  definition: z.string().trim().min(30),
  domain: z.string(),
  reference: referenceSchema.optional(),
})

export const glossarySchema = z.array(glossaryTermSchema)

export type Reference = z.infer<typeof referenceSchema>
export type Question = z.infer<typeof questionSchema>
export type QuestionType = Question['type']
export type SingleQuestion = z.infer<typeof singleQuestionSchema>
export type MultipleQuestion = z.infer<typeof multipleQuestionSchema>
export type YesNoQuestion = z.infer<typeof yesNoQuestionSchema>
export type OrderQuestion = z.infer<typeof orderQuestionSchema>
export type MatchQuestion = z.infer<typeof matchQuestionSchema>
export type DropdownQuestion = z.infer<typeof dropdownQuestionSchema>
export type GlossaryTerm = z.infer<typeof glossaryTermSchema>
export type CaseStudy = z.infer<typeof caseStudySchema>

export interface Skill {
  id: string
  name: string
}

export interface Domain {
  id: string
  name: string
  shortName: string
  /** Peso oficial en el examen, en porcentaje [min, max]. */
  weight: [number, number]
  skills: Skill[]
  /** Nombre del icono de lucide-react. */
  icon: string
  color: string
}

export interface ExamDefinition {
  code: string
  name: string
  nameEn: string
  level: 'Fundamentals' | 'Associate' | 'Expert'
  status: 'disponible' | 'proximamente'
  description: string
  outlineVersion: string
  outlineNote?: string
  durationMinutes: number
  questionCount: number
  passingScore: number
  officialUrl: string
  /** Guía de estudio oficial en inglés (la que Microsoft actualiza primero); se vigila para detectar cambios de temario. */
  studyGuideUrl?: string
  domains: Domain[]
}
