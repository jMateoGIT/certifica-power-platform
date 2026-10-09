/** «2026-07-24» → «24/07/2026» sin pasar por zonas horarias. */
export const formatIsoDate = (iso: string) => iso.split('-').reverse().join('/')

export const formatDateTime = (ts: number) =>
  new Date(ts).toLocaleString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

export function formatDuration(sec: number) {
  const s = Math.max(0, Math.round(sec))
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, '0')}`
}
