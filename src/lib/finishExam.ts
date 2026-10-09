import type { ExamDefinition } from '../content/schema'
import { getQuestion } from '../content'
import { grade, scaledScore } from '../engine/grading'
import type { ActiveExam, ExamAttempt } from '../store/progress'

/** Corrige un simulacro en curso y genera el intento final. */
export function finishExam(exam: ExamDefinition, active: ActiveExam, now = Date.now()): ExamAttempt {
  const scores: Record<string, number> = {}
  const perDomain: ExamAttempt['perDomain'] = {}
  for (const d of exam.domains) perDomain[d.id] = { points: 0, total: 0 }

  let points = 0
  for (const id of active.questionIds) {
    const q = getQuestion(id)
    if (!q) continue
    const s = grade(q, active.answers[id]).score
    scores[id] = s
    points += s
    perDomain[q.domain] ??= { points: 0, total: 0 }
    perDomain[q.domain].points += s
    perDomain[q.domain].total += 1
  }

  const scaled = scaledScore(points, active.questionIds.length)
  const finishedAt = Math.min(now, active.deadline)
  return {
    id: active.id,
    exam: active.exam,
    mode: active.mode,
    startedAt: active.startedAt,
    finishedAt,
    durationSec: Math.round((finishedAt - active.startedAt) / 1000),
    timeLimitSec: active.timeLimitSec,
    questionIds: active.questionIds,
    answers: active.answers,
    scores,
    flagged: active.flagged,
    scaled,
    passed: scaled >= exam.passingScore,
    perDomain,
    seed: active.seed,
  }
}
