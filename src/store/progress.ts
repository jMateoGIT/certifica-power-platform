import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'
import { nextStat, type QuestionStat } from '../engine/leitner'
import type { Answer } from '../engine/types'

export interface ExamAttempt {
  id: string
  exam: string
  mode: 'completo' | 'rapido' | 'personalizado'
  startedAt: number
  finishedAt: number
  durationSec: number
  timeLimitSec: number
  questionIds: string[]
  answers: Record<string, Answer>
  scores: Record<string, number>
  flagged: string[]
  scaled: number
  passed: boolean
  perDomain: Record<string, { points: number; total: number }>
  /** Semilla con la que se barajaron las opciones (para revisar en el mismo orden). */
  seed: number
}

/** Simulacro en curso (se puede retomar si se cierra la pestaña). */
export interface ActiveExam {
  id: string
  exam: string
  mode: ExamAttempt['mode']
  startedAt: number
  deadline: number
  timeLimitSec: number
  questionIds: string[]
  answers: Record<string, Answer>
  flagged: string[]
  current: number
  seed: number
}

export type Theme = 'system' | 'light' | 'dark'

export interface ProgressData {
  stats: Record<string, QuestionStat>
  attempts: ExamAttempt[]
  /** Días con actividad (AAAA-MM-DD, hora local). */
  activity: string[]
  bookmarks: string[]
  activeExam: ActiveExam | null
}

interface ProgressState extends ProgressData {
  theme: Theme
  /** Permite la analítica anónima (si está configurada en el despliegue). */
  telemetry: boolean
  setTelemetry: (on: boolean) => void
  recordAnswer: (questionId: string, score: number) => void
  saveAttempt: (attempt: ExamAttempt) => void
  setActiveExam: (exam: ActiveExam | null) => void
  updateActiveExam: (patch: Partial<ActiveExam>) => void
  toggleBookmark: (questionId: string) => void
  setTheme: (theme: Theme) => void
  importData: (data: ProgressData) => void
  resetExam: (examPrefix: string) => void
}

export const todayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const withActivity = (activity: string[]) => {
  const today = todayKey()
  return activity.includes(today) ? activity : [...activity, today].slice(-400)
}

/** localStorage puede no estar disponible (modo privado, iframes…): degradamos a memoria. */
const memory = new Map<string, string>()
const safeStorage: StateStorage = {
  getItem: (k) => {
    try {
      return localStorage.getItem(k)
    } catch {
      return memory.get(k) ?? null
    }
  },
  setItem: (k, v) => {
    try {
      localStorage.setItem(k, v)
    } catch {
      memory.set(k, v)
    }
  },
  removeItem: (k) => {
    try {
      localStorage.removeItem(k)
    } catch {
      memory.delete(k)
    }
  },
}

export const initialData: ProgressData = { stats: {}, attempts: [], activity: [], bookmarks: [], activeExam: null }

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      ...initialData,
      theme: 'system',
      telemetry: true,
      recordAnswer: (questionId, score) =>
        set((s) => ({
          stats: { ...s.stats, [questionId]: nextStat(s.stats[questionId], score) },
          activity: withActivity(s.activity),
        })),
      saveAttempt: (attempt) =>
        set((s) => {
          const stats = { ...s.stats }
          for (const id of attempt.questionIds) stats[id] = nextStat(stats[id], attempt.scores[id] ?? 0, attempt.finishedAt)
          return {
            stats,
            attempts: [attempt, ...s.attempts].slice(0, 50),
            activity: withActivity(s.activity),
            activeExam: null,
          }
        }),
      setActiveExam: (activeExam) => set({ activeExam }),
      updateActiveExam: (patch) => set((s) => (s.activeExam ? { activeExam: { ...s.activeExam, ...patch } } : {})),
      toggleBookmark: (id) =>
        set((s) => ({
          bookmarks: s.bookmarks.includes(id) ? s.bookmarks.filter((b) => b !== id) : [...s.bookmarks, id],
        })),
      setTheme: (theme) => set({ theme }),
      setTelemetry: (telemetry) => set({ telemetry }),
      importData: (data) => set({ ...initialData, ...data }),
      resetExam: (prefix) =>
        set((s) => ({
          stats: Object.fromEntries(Object.entries(s.stats).filter(([id]) => !id.startsWith(prefix))),
          attempts: s.attempts.filter((a) => !a.questionIds.some((id) => id.startsWith(prefix))),
          bookmarks: s.bookmarks.filter((id) => !id.startsWith(prefix)),
          activeExam: s.activeExam?.questionIds.some((id) => id.startsWith(prefix)) ? null : s.activeExam,
        })),
    }),
    {
      name: 'certifica-pp:v1',
      version: 1,
      storage: createJSONStorage(() => safeStorage),
    },
  ),
)

/** Prefijo de ids de un examen: «PL-900» → «pl900-». */
export const examPrefix = (code: string) => `${code.toLowerCase().replace(/-/g, '')}-`

export function isProgressData(x: unknown): x is ProgressData {
  if (!x || typeof x !== 'object') return false
  const o = x as Record<string, unknown>
  return (
    typeof o.stats === 'object' &&
    o.stats !== null &&
    Array.isArray(o.attempts) &&
    Array.isArray(o.activity) &&
    Array.isArray(o.bookmarks)
  )
}

/** Racha de días consecutivos con actividad, contando hasta hoy (o ayer). */
export function currentStreak(activity: string[], now = new Date()): number {
  const days = new Set(activity)
  const d = new Date(now)
  if (!days.has(todayKey(d))) d.setDate(d.getDate() - 1)
  let streak = 0
  while (days.has(todayKey(d))) {
    streak++
    d.setDate(d.getDate() - 1)
  }
  return streak
}
