import { useParams } from 'react-router'
import { getExam } from '../content/catalog'
import { getQuestions } from '../content'

/** Examen de la ruta actual (/:code/...) y sus preguntas. */
export function useExam() {
  const { code } = useParams()
  const exam = getExam(code)
  const questions = exam ? getQuestions(exam.code) : []
  return { exam, questions }
}
