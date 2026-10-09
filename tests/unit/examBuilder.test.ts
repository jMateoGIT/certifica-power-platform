import { describe, expect, it } from 'vitest'
import { pl900 } from '../../src/content/pl-900/exam'
import { allocateByWeight, buildExam } from '../../src/engine/examBuilder'
import type { Question } from '../../src/content/schema'

describe('allocateByWeight', () => {
  it('reparte según los pesos oficiales y suma el total', () => {
    const available = { d1: 50, d2: 50, d3: 50, d4: 50, d5: 50 }
    const alloc = allocateByWeight(pl900.domains, available, 45)
    expect(Object.values(alloc).reduce((a, b) => a + b, 0)).toBe(45)
    expect(alloc.d1).toBeLessThan(alloc.d2)
    expect(alloc.d2).toBeGreaterThanOrEqual(9)
  })

  it('no supera las preguntas disponibles y compensa con otros dominios', () => {
    const alloc = allocateByWeight(pl900.domains, { d1: 1, d2: 50, d3: 50, d4: 50, d5: 50 }, 45)
    expect(alloc.d1).toBe(1)
    expect(Object.values(alloc).reduce((a, b) => a + b, 0)).toBe(45)
  })

  it('devuelve como mucho las disponibles', () => {
    const alloc = allocateByWeight(pl900.domains, { d1: 2, d2: 2, d3: 2, d4: 2, d5: 2 }, 45)
    expect(Object.values(alloc).reduce((a, b) => a + b, 0)).toBe(10)
  })
})

describe('buildExam', () => {
  const qs = pl900.domains.flatMap((d) =>
    Array.from({ length: 20 }, (_, i) => ({ id: `${d.id}-${i}`, domain: d.id }) as unknown as Question),
  )
  it('es determinista con la misma semilla y sin duplicados', () => {
    const a = buildExam(qs, pl900.domains, 45, 42).map((q) => q.id)
    const b = buildExam(qs, pl900.domains, 45, 42).map((q) => q.id)
    expect(a).toEqual(b)
    expect(new Set(a).size).toBe(45)
  })
})

describe('buildExam con casos prácticos', () => {
  const standalone = pl900.domains.flatMap((d) =>
    Array.from({ length: 20 }, (_, i) => ({ id: `${d.id}-${i}`, domain: d.id }) as unknown as Question),
  )
  const cases = ['caso-1', 'caso-2'].flatMap((c) =>
    ['d2', 'd3', 'd4', 'd5', 'd1'].map((d, i) => ({ id: `${c}-${i}`, domain: d, caseId: c }) as unknown as Question),
  )
  const all = [...standalone, ...cases]

  it('sin includeCase no incluye preguntas de casos', () => {
    const exam = buildExam(all, pl900.domains, 45, 7)
    expect(exam).toHaveLength(45)
    expect(exam.some((q) => q.caseId)).toBe(false)
  })

  it('con includeCase añade un caso completo al final y mantiene el total', () => {
    const exam = buildExam(all, pl900.domains, 45, 7, { includeCase: true })
    expect(exam).toHaveLength(45)
    const tail = exam.slice(-5)
    expect(new Set(tail.map((q) => q.caseId)).size).toBe(1)
    expect(tail[0].caseId).toBeTruthy()
    expect(exam.slice(0, -5).some((q) => q.caseId)).toBe(false)
    expect(new Set(exam.map((q) => q.id)).size).toBe(45)
  })
})

