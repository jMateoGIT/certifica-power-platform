import { describe, expect, it } from 'vitest'
import { getGlossary, getQuestions } from '../../src/content'
import { pl900 } from '../../src/content/pl-900/exam'
import { questionSchema } from '../../src/content/schema'

describe('contenido PL-900', () => {
  const qs = getQuestions('PL-900')
  it('tiene preguntas en todos los dominios', () => {
    for (const d of pl900.domains) expect(qs.filter((q) => q.domain === d.id).length).toBeGreaterThan(5)
  })
  it('todas las preguntas cumplen el esquema', () => {
    for (const q of qs) expect(questionSchema.safeParse(q).success, q.id).toBe(true)
  })
  it('tiene glosario', () => {
    expect(getGlossary('PL-900').length).toBeGreaterThan(30)
  })
})
