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
