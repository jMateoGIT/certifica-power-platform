import { describe, expect, it } from 'vitest'

import { parseOutlineDate } from '../../scripts/outline-date'

describe('parseOutlineDate', () => {
  it('convierte la fecha de la guía oficial a ISO', () => {
    expect(parseOutlineDate('<h2>Skills measured as of July 24, 2026</h2>')).toBe('2026-07-24')
    expect(parseOutlineDate('Skills measured as of March 3, 2027')).toBe('2027-03-03')
  })
  it('devuelve null si no encuentra la fecha', () => {
    expect(parseOutlineDate('<p>nada</p>')).toBeNull()
  })
})
