import { ExternalLink } from 'lucide-react'
import { TelemetryToggle } from '../components/TelemetryToggle'
import { Card, PageTitle } from '../components/ui'
import { REPO_URL } from '../lib/config'

const officialLinks = [
  { title: 'Guía de estudio oficial de PL-900', url: 'https://learn.microsoft.com/es-es/credentials/certifications/resources/study-guides/pl-900' },
  { title: 'Certificación Power Platform Fundamentals', url: 'https://learn.microsoft.com/es-es/credentials/certifications/power-platform-fundamentals/' },
  { title: 'Ruta de aprendizaje gratuita de PL-900', url: 'https://learn.microsoft.com/es-es/training/paths/describe-business-value-microsoft-power-platform/' },
  { title: 'Entorno de demostración del examen (exam sandbox)', url: 'https://learn.microsoft.com/es-es/credentials/support/exam-duration-exam-experience' },
]

export function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <PageTitle title="Acerca de Certifica Power Platform">
        Una plataforma gratuita y de código abierto para preparar las certificaciones de Microsoft Power Platform en español.
      </PageTitle>
      <div className="space-y-4">
        <Card className="p-5">
          <h2 className="font-semibold">Cómo se crean las preguntas</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-muted">
            <li>Son originales, escritas a partir de la documentación pública de Microsoft Learn y del temario oficial vigente.</li>
            <li>
              <strong className="text-text">No son preguntas del examen real.</strong> Usar «dumps» viola el acuerdo de
              confidencialidad del examen y puede suponer la revocación de la certificación.
            </li>
            <li>Cada opción incluye su explicación y cada pregunta enlaza a la documentación oficial.</li>
            <li>Cada pregunta indica la versión del temario para la que se escribió; se revisan cuando Microsoft lo actualiza.</li>
          </ul>
        </Card>
        <Card className="p-5">
          <h2 className="font-semibold">Sobre la puntuación</h2>
          <p className="mt-2 text-muted">
            Microsoft puntúa sobre 1000 y se aprueba con 700, pero no publica cómo convierte los aciertos en la nota final ni
            el valor de cada pregunta. Aquí usamos una aproximación lineal con crédito parcial en las preguntas de varias
            partes: tómala como orientación, no como predicción exacta.
          </p>
        </Card>
        <Card className="p-5">
          <h2 className="font-semibold">Privacidad</h2>
          <p className="mt-2 text-muted">
            Tu progreso se guarda solo en tu navegador. Si la analítica está activa, se envía de forma anónima, sin cookies ni
            datos personales, qué preguntas se aciertan o fallan y la nota de los simulacros, para detectar preguntas ambiguas
            o demasiado fáciles. Se respeta la señal «no rastrear» del navegador y puedes desactivarla aquí.
          </p>
          <TelemetryToggle />
        </Card>
        <Card className="p-5">
          <h2 className="font-semibold">Recursos oficiales</h2>
          <ul className="mt-2 space-y-1.5">
            {officialLinks.map((l) => (
              <li key={l.url}>
                <a href={l.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-primary hover:underline">
                  {l.title} <ExternalLink size={13} />
                </a>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-5">
          <h2 className="font-semibold">Colabora</h2>
          <p className="mt-2 text-muted">
            ¿Has encontrado un error o quieres proponer preguntas? Cada pregunta tiene un enlace para reportarla, y el código
            y el contenido están en{' '}
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="text-primary hover:underline">
              GitHub
            </a>
            .
          </p>
        </Card>
      </div>
    </div>
  )
}
