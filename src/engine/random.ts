/** Generador pseudoaleatorio con semilla (mulberry32): mismo orden para la misma semilla. */
export function createRng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Convierte un texto en una semilla numérica estable (FNV-1a). */
export function hashSeed(...parts: (string | number)[]): number {
  let h = 0x811c9dc5
  for (const ch of parts.join('|')) {
    h ^= ch.charCodeAt(0)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

export function shuffle<T>(items: readonly T[], rng: () => number): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function randomSeed(): number {
  return Math.floor(Math.random() * 2 ** 32)
}
