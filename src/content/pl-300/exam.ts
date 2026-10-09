import type { ExamDefinition } from '../schema'

/**
 * Temario oficial de PL-300 vigente desde el 20/04/2026
 * (https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/pl-300).
 * Nombres traducidos de la versión en inglés; las sub-habilidades siguen los
 * apartados oficiales de cada dominio.
 */
export const pl300: ExamDefinition = {
  code: 'PL-300',
  name: 'Analista de datos de Power BI',
  nameEn: 'Microsoft Power BI Data Analyst',
  level: 'Associate',
  status: 'disponible',
  description:
    'Valida que sabes preparar, modelar, visualizar y analizar datos con Power BI, y administrar y proteger sus elementos. Exige soltura con Power Query y DAX.',
  outlineVersion: '2026-04-20',
  outlineNote: 'Temario verificado con la guía de estudio oficial (versión en inglés del 20/04/2026).',
  durationMinutes: 100,
  questionCount: 50,
  passingScore: 700,
  officialUrl: 'https://learn.microsoft.com/es-es/credentials/certifications/data-analyst-associate/',
  studyGuideUrl: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/pl-300',
  domains: [
    {
      id: 'd1',
      name: 'Preparar los datos',
      shortName: 'Preparar datos',
      weight: [25, 30],
      icon: 'Filter',
      color: '#0f9d8a',
      skills: [
        { id: 'd1-conectar', name: 'Obtener datos o conectarse a ellos (orígenes, credenciales, modos de almacenamiento, parámetros)' },
        { id: 'd1-perfilar', name: 'Generar perfiles de datos y limpiarlos' },
        { id: 'd1-transformar', name: 'Transformar y cargar los datos (tipos, columnas, combinaciones, hechos y dimensiones)' },
      ],
    },
    {
      id: 'd2',
      name: 'Modelar los datos',
      shortName: 'Modelar datos',
      weight: [25, 30],
      icon: 'Network',
      color: '#7c5cff',
      skills: [
        { id: 'd2-diseno', name: 'Diseñar e implementar un modelo de datos (relaciones, tabla de fechas, dimensiones)' },
        { id: 'd2-dax', name: 'Crear cálculos del modelo con DAX' },
        { id: 'd2-rendimiento', name: 'Optimizar el rendimiento del modelo' },
      ],
    },
    {
      id: 'd3',
      name: 'Visualizar y analizar los datos',
      shortName: 'Visualizar y analizar',
      weight: [25, 30],
      icon: 'ChartColumn',
      color: '#c27c0e',
      skills: [
        { id: 'd3-informes', name: 'Crear informes (objetos visuales, formato, temas, filtros, Copilot)' },
        { id: 'd3-usabilidad', name: 'Mejorar los informes: usabilidad y narrativa' },
        { id: 'd3-patrones', name: 'Identificar patrones y tendencias' },
      ],
    },
    {
      id: 'd4',
      name: 'Administrar y proteger Power BI',
      shortName: 'Administrar y proteger',
      weight: [15, 20],
      icon: 'ShieldCheck',
      color: '#2f6fed',
      skills: [
        { id: 'd4-areas', name: 'Crear y administrar áreas de trabajo y elementos' },
        { id: 'd4-seguridad', name: 'Proteger y gobernar los elementos de Power BI' },
      ],
    },
  ],
}
