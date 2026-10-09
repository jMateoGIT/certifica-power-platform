export const REPO_URL = 'https://github.com/jMateoGIT/certifica-power-platform'

/** Enlace para reportar un error en una pregunta (formulario de issue prerrellenado). */
export function reportQuestionUrl(questionId: string, prompt: string) {
  const params = new URLSearchParams({
    template: 'reportar-pregunta.yml',
    title: `[Pregunta] ${questionId}`,
    'question-id': questionId,
    prompt: prompt.slice(0, 300),
  })
  return `${REPO_URL}/issues/new?${params}`
}
