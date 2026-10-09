import { describe, expect, it } from 'vitest'
import { isDue, mastery, nextStat } from '../../src/engine/leitner'
import { currentStreak } from '../../src/store/progress'

const DAY = 86_400_000

describe('Leitner', () => {
  it('sube de caja al acertar y vuelve a la 1 al fallar', () => {
    let s = nextStat(undefined, 1, 0)
    expect(s.box).toBe(1)
    s = nextStat(s, 1, 0)
    expect(s.box).toBe(2)
    expect(s.due).toBe(1 * DAY)
    s = nextStat(s, 0.5, 0)
    expect(s.box).toBe(1)
    expect(s.attempts).toBe(3)
    expect(s.correct).toBe(2)
  })

  it('no pasa de la caja 5', () => {
    let s = nextStat(undefined, 1, 0)
    for (let i = 0; i < 10; i++) s = nextStat(s, 1, 0)
    expect(s.box).toBe(5)
    expect(mastery(s)).toBe(1)
  })

  it('isDue respeta la fecha', () => {
    const s = nextStat(nextStat(undefined, 1, 0), 1, 0)
    expect(isDue(s, DAY - 1)).toBe(false)
    expect(isDue(s, DAY)).toBe(true)
  })
})

describe('currentStreak', () => {
  it('cuenta días consecutivos hasta hoy o ayer', () => {
    const now = new Date(2026, 9, 9, 12)
    expect(currentStreak(['2026-10-07', '2026-10-08', '2026-10-09'], now)).toBe(3)
    expect(currentStreak(['2026-10-07', '2026-10-08'], now)).toBe(2)
    expect(currentStreak(['2026-10-05'], now)).toBe(0)
  })
})
