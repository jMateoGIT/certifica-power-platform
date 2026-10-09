import type { ExamDefinition } from '../schema'

/**
 * Temario de PL-900 vigente desde el 24/07/2026.
 *
 * Los pesos de los dominios 1–4 están confirmados en la guía de estudio oficial.
 * El dominio 5 (agentes en Copilot Studio) y el desglose de sub-habilidades se
 * han reconstruido a partir de fuentes secundarias y del temario anterior:
 * revisar contra https://learn.microsoft.com/credentials/certifications/resources/study-guides/pl-900
 */
export const pl900: ExamDefinition = {
  code: 'PL-900',
  name: 'Fundamentos de Microsoft Power Platform',
  nameEn: 'Microsoft Power Platform Fundamentals',
  level: 'Fundamentals',
  status: 'disponible',
  description:
    'Valida los conocimientos básicos de Power Platform: valor de negocio, administración del entorno y Dataverse, Power Apps, Power Automate y agentes de Copilot Studio.',
  outlineVersion: '2026-07-24',
  outlineNote:
    'Las sub-habilidades se han reconstruido a partir de la guía oficial y fuentes secundarias. Consulta siempre la guía de estudio oficial antes del examen.',
  durationMinutes: 45,
  questionCount: 45,
  passingScore: 700,
  officialUrl: 'https://learn.microsoft.com/es-es/credentials/certifications/power-platform-fundamentals/',
  domains: [
    {
      id: 'd1',
      name: 'Describir el valor de negocio de Microsoft Power Platform',
      shortName: 'Valor de negocio',
      weight: [5, 10],
      icon: 'Briefcase',
      color: '#7c5cff',
      skills: [
        { id: 'd1-servicios', name: 'Valor de negocio de los servicios de Power Platform' },
        { id: 'd1-integracion', name: 'Integración con Microsoft 365, Teams, Dynamics 365 y Azure' },
        { id: 'd1-ia', name: 'Capacidades de IA y Copilot en Power Platform' },
      ],
    },
    {
      id: 'd2',
      name: 'Gestionar el entorno de Microsoft Power Platform',
      shortName: 'Entorno y Dataverse',
      weight: [20, 25],
      icon: 'Database',
      color: '#0f9d8a',
      skills: [
        { id: 'd2-entornos', name: 'Entornos, soluciones y centro de administración' },
        { id: 'd2-gobierno', name: 'Seguridad, gobierno y directivas de datos (DLP)' },
        { id: 'd2-dataverse', name: 'Microsoft Dataverse: tablas, columnas, relaciones y lógica' },
        { id: 'd2-conectores', name: 'Conectores: estándar, premium y personalizados' },
      ],
    },
    {
      id: 'd3',
      name: 'Demostrar las capacidades de Power Apps',
      shortName: 'Power Apps',
      weight: [20, 25],
      icon: 'AppWindow',
      color: '#a3369a',
      skills: [
        { id: 'd3-lienzo', name: 'Capacidades de las aplicaciones de lienzo' },
        { id: 'd3-lienzo-crear', name: 'Crear y compartir aplicaciones de lienzo (Power Fx, controles, Copilot)' },
        { id: 'd3-modelos', name: 'Capacidades de las aplicaciones basadas en modelos' },
        { id: 'd3-modelos-crear', name: 'Crear aplicaciones basadas en modelos (formularios, vistas, paneles)' },
      ],
    },
    {
      id: 'd4',
      name: 'Demostrar las capacidades de Power Automate',
      shortName: 'Power Automate',
      weight: [20, 25],
      icon: 'Workflow',
      color: '#2f6fed',
      skills: [
        { id: 'd4-tipos', name: 'Tipos de flujos, desencadenadores y acciones' },
        { id: 'd4-nube', name: 'Crear flujos de nube (plantillas, Copilot, aprobaciones, expresiones)' },
        { id: 'd4-escritorio', name: 'Flujos de escritorio y RPA (atendido y desatendido)' },
        { id: 'd4-procesos', name: 'Minería de procesos y otras capacidades' },
      ],
    },
    {
      id: 'd5',
      name: 'Demostrar las capacidades de los agentes de Microsoft Copilot Studio',
      shortName: 'Copilot Studio',
      weight: [20, 25],
      icon: 'Bot',
      color: '#e07a1f',
      skills: [
        { id: 'd5-capacidades', name: 'Capacidades y casos de uso de los agentes' },
        { id: 'd5-temas', name: 'Temas, frases desencadenantes, nodos y variables' },
        { id: 'd5-conocimiento', name: 'Conocimiento, IA generativa y orquestación' },
        { id: 'd5-publicar', name: 'Herramientas, publicación en canales y análisis' },
      ],
    },
  ],
}
