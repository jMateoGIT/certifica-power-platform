import { describe, expect, it } from 'vitest'
import type { Question } from '../../src/content/schema'
import { grade, isComplete, scaledScore } from '../../src/engine/grading'

const base = {
  exam: 'PL-900',
  outlineVersion: '2026-07-24',
  domain: 'd1',
  skill: 'd1-servicios',
  difficulty: 1 as const,
  prompt: 'p',
  keyPoint: 'k',
  references: [{ title: 't', url: 'https://learn.microsoft.com/es-es/power-platform/' }],
}
const opt = (id: string, correct: boolean) => ({ id, text: id, correct, explanation: 'explicación suficientemente larga' })

const single = { ...base, id: 's', type: 'single', options: [opt('a', false), opt('b', true), opt('c', false)] } as Question
const multiple = {
  ...base,
  id: 'm',
  type: 'multiple',
  options: [opt('a', true), opt('b', true), opt('c', false), opt('d', false)],
} as Question
const yesno = {
  ...base,
  id: 'y',
  type: 'yesno',
  statements: [
    { id: 's1', text: '1', answer: true, explanation: 'x'.repeat(20) },
    { id: 's2', text: '2', answer: false, explanation: 'x'.repeat(20) },
    { id: 's3', text: '3', answer: true, explanation: 'x'.repeat(20) },
    { id: 's4', text: '4', answer: false, explanation: 'x'.repeat(20) },
  ],
} as Question
const order = {
  ...base,
  id: 'o',
  type: 'order',
  items: ['p1', 'p2', 'p3'].map((id) => ({ id, text: id, explanation: 'x'.repeat(20) })),
} as Question
const dropdown = {
  ...base,
  id: 'dd',
  type: 'dropdown',
  template: 'A {{b1}} y {{b2}}',
  blanks: [
    { id: 'b1', correctId: 'o1', explanation: 'x'.repeat(20), options: [{ id: 'o1', text: '1' }, { id: 'o2', text: '2' }] },
    { id: 'b2', correctId: 'o2', explanation: 'x'.repeat(20), options: [{ id: 'o1', text: '1' }, { id: 'o2', text: '2' }] },
  ],
} as Question

describe('grade', () => {
  it('single: todo o nada', () => {
    expect(grade(single, { type: 'single', optionId: 'b' })).toMatchObject({ score: 1, correct: true })
    expect(grade(single, { type: 'single', optionId: 'a' })).toMatchObject({ score: 0, correct: false })
    expect(grade(single, undefined).score).toBe(0)
  })

  it('multiple: un punto por acierto y penaliza seleccionar de más', () => {
    expect(grade(multiple, { type: 'multiple', optionIds: ['a', 'b'] }).score).toBe(1)
    expect(grade(multiple, { type: 'multiple', optionIds: ['a', 'c'] }).score).toBe(0.5)
    expect(grade(multiple, { type: 'multiple', optionIds: ['c', 'd'] }).score).toBe(0)
    expect(grade(multiple, { type: 'multiple', optionIds: ['a', 'b', 'c', 'd'] }).score).toBe(0)
  })

  it('yesno: una parte por afirmación', () => {
    const r = grade(yesno, { type: 'yesno', values: { s1: true, s2: false, s3: false, s4: true } })
    expect(r.score).toBe(0.5)
    expect(r.parts).toEqual({ s1: true, s2: true, s3: false, s4: false })
  })

  it('order: todo o nada', () => {
    expect(grade(order, { type: 'order', order: ['p1', 'p2', 'p3'] }).score).toBe(1)
    expect(grade(order, { type: 'order', order: ['p2', 'p1', 'p3'] }).score).toBe(0)
  })

  it('dropdown: parcial por hueco', () => {
    expect(grade(dropdown, { type: 'dropdown', values: { b1: 'o1', b2: 'o1' } }).score).toBe(0.5)
  })

  it('ignora respuestas de otro tipo', () => {
    expect(grade(single, { type: 'multiple', optionIds: ['b'] }).score).toBe(0)
  })
})

describe('isComplete', () => {
  it('exige el número exacto de selecciones en multiple', () => {
    expect(isComplete(multiple, { type: 'multiple', optionIds: ['a'] })).toBe(false)
    expect(isComplete(multiple, { type: 'multiple', optionIds: ['a', 'c'] })).toBe(true)
  })
  it('exige todas las afirmaciones en yesno', () => {
    expect(isComplete(yesno, { type: 'yesno', values: { s1: true } })).toBe(false)
  })
})

describe('scaledScore', () => {
  it('escala a 1000', () => {
    expect(scaledScore(7, 10)).toBe(700)
    expect(scaledScore(0, 0)).toBe(0)
  })
})
