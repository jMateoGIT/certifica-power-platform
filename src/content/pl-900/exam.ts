import type { ExamDefinition } from '../schema'

/**
 * Temario oficial de PL-900 vigente desde el 24/07/2026
 * (https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/pl-900).
 * La guía en español de Microsoft Learn aún muestra el temario anterior, así que los
 * nombres son traducción propia de la versión en inglés. Las sub-habilidades agrupan
 * los puntos oficiales de cada área.
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
    'Temario verificado con la guía de estudio oficial (versión en inglés del 24/07/2026). La versión en español de Microsoft Learn aún no está actualizada.',
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
        { id: 'd1-apps-automate', name: 'Valor de Power Apps y Power Automate' },
        { id: 'd1-datos', name: 'Valor de Dataverse y de los conectores' },
        { id: 'd1-ia', name: 'Valor de Power Pages, la IA generativa y Copilot Studio' },
      ],
    },
    {
      id: 'd2',
      name: 'Administrar el entorno de Microsoft Power Platform',
      shortName: 'Entorno y Dataverse',
      weight: [20, 25],
      icon: 'Database',
      color: '#0f9d8a',
      skills: [
        { id: 'd2-dataverse', name: 'Dataverse frente a bases de datos tradicionales; tablas, columnas y relaciones' },
        { id: 'd2-dataverse-logica', name: 'Formularios, vistas, lógica de negocio (con Power Fx) e IA para crear tablas' },
        { id: 'd2-entornos', name: 'Entornos y ALM con canalizaciones (pipelines)' },
        { id: 'd2-seguridad', name: 'Modelo de seguridad, privacidad de datos y accesibilidad' },
        { id: 'd2-supervision', name: 'Supervisión y análisis' },
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
        { id: 'd3-lienzo', name: 'Aplicaciones de lienzo: casos de uso y capacidades' },
        { id: 'd3-modelos', name: 'Aplicaciones basadas en modelos: casos de uso y capacidades' },
        { id: 'd3-plan-codigo', name: 'Diseñador de planes y aplicaciones de código' },
        { id: 'd3-ia', name: 'Crear aplicaciones con IA (lienzo, basadas en modelos y experiencia vibe)' },
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
        { id: 'd4-casos', name: 'Casos de uso de los flujos de nube y de escritorio' },
        { id: 'd4-escenarios', name: 'Aprobaciones, Teams, Outlook, SharePoint, Forms y automatización de documentos' },
        { id: 'd4-conectores', name: 'Desencadenadores y acciones de conectores en flujos de nube' },
        { id: 'd4-ia', name: 'IA para crear y modificar flujos de nube y de escritorio' },
      ],
    },
    {
      id: 'd5',
      name: 'Describir las características y capacidades de los agentes de Microsoft Copilot Studio',
      shortName: 'Copilot Studio',
      weight: [20, 25],
      icon: 'Bot',
      color: '#e07a1f',
      skills: [
        { id: 'd5-casos', name: 'Casos de uso de los agentes' },
        { id: 'd5-temas', name: 'Rutas de conversación con temas' },
        { id: 'd5-conocimiento', name: 'Fuentes de conocimiento' },
        { id: 'd5-herramientas', name: 'Herramientas: servidores MCP y flujos de agente' },
        { id: 'd5-publicar', name: 'Publicación en canales' },
        { id: 'd5-gestion', name: 'Gestión: Microsoft Agent 365, supervisión del uso y evaluaciones' },
      ],
    },
  ],
}
