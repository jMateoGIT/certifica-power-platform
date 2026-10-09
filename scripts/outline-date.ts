const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']

/** Extrae la fecha «Skills measured as of July 24, 2026» de una guía de estudio y la devuelve en ISO. */
export function parseOutlineDate(html: string): string | null {
  const m = html.match(/Skills measured as of ([A-Za-z]+) (\d{1,2}), (\d{4})/)
  if (!m) return null
  const month = MONTHS.indexOf(m[1].toLowerCase()) + 1
  if (!month) return null
  return `${m[3]}-${String(month).padStart(2, '0')}-${m[2].padStart(2, '0')}`
}
