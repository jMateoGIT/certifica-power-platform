import { describe, expect, it } from 'vitest'
import { parseMarkup, plainText } from '../../src/components/question/shared'

describe('parseMarkup', () => {
  it('interpreta cursiva y negrita', () => {
    expect(parseMarkup('una tabla (*table*) y **clave**')).toEqual([
      { kind: 'text', text: 'una tabla (' },
      { kind: 'em', text: 'table' },
      { kind: 'text', text: ') y ' },
      { kind: 'strong', text: 'clave' },
    ])
  })

  it('deja tal cual los asteriscos literales', () => {
    for (const s of ['varios a varios (*:*)', 'TOTAL* y CLOSINGBALANCE*', 'a * b * c', '2 * 3']) {
      expect(plainText(s)).toBe(s)
      expect(parseMarkup(s).every((p) => p.kind === 'text')).toBe(true)
    }
  })

  it('plainText quita el marcado', () => {
    expect(plainText('flujo de nube (*cloud flow*)')).toBe('flujo de nube (cloud flow)')
  })
})
