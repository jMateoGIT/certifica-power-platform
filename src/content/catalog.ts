import type { ExamDefinition } from './schema'
import { pl300 } from './pl-300/exam'
import { pl900 } from './pl-900/exam'

/** Certificaciones planificadas. Solo las marcadas como «disponible» tienen banco de preguntas. */
const upcoming: ExamDefinition[] = [
  {
    code: 'AB-410',
    name: 'Creador de aplicaciones inteligentes',
    nameEn: 'Intelligent Applications Builder Associate',
    level: 'Associate',
    status: 'proximamente',
    description: 'Sustituye a PL-200: soluciones con Power Apps, Power Automate, Copilot y agentes en Power Platform.',
    outlineVersion: '',
    durationMinutes: 100,
    questionCount: 50,
    passingScore: 700,
    officialUrl: 'https://learn.microsoft.com/es-es/credentials/',
    domains: [],
  },
  {
    code: 'AB-400',
    name: 'Desarrollador de Power Platform',
    nameEn: 'Power Platform Developer Associate',
    level: 'Associate',
    status: 'proximamente',
    description: 'Sustituye al examen PL-400: extender Power Platform con código, conectores, Foundry y agentes.',
    outlineVersion: '',
    durationMinutes: 100,
    questionCount: 50,
    passingScore: 700,
    officialUrl: 'https://learn.microsoft.com/es-es/credentials/certifications/resources/study-guides/ab-400',
    domains: [],
  },
  {
    code: 'DP-600',
    name: 'Ingeniero de análisis de Fabric',
    nameEn: 'Microsoft Fabric Analytics Engineer Associate',
    level: 'Associate',
    status: 'proximamente',
    description: 'Diseñar, crear y desplegar soluciones de análisis a escala empresarial con Microsoft Fabric.',
    outlineVersion: '',
    durationMinutes: 100,
    questionCount: 50,
    passingScore: 700,
    officialUrl: 'https://learn.microsoft.com/es-es/credentials/certifications/fabric-analytics-engineer-associate/',
    domains: [],
  },
]

export const exams: ExamDefinition[] = [pl900, pl300, ...upcoming]

export function getExam(code: string | undefined): ExamDefinition | undefined {
  if (!code) return undefined
  return exams.find((e) => e.code.toLowerCase() === code.toLowerCase())
}
