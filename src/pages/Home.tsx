import { ArrowRight, BookOpen, Clock, Gauge, Lightbulb, ListChecks, Repeat, ShieldCheck, Sparkles } from 'lucide-react'
import { Link } from 'react-router'
import { exams } from '../content/catalog'
import { getQuestions } from '../content'
import { Badge, ButtonLink, Card } from '../components/ui'
import { Ecosystem } from '../components/Ecosystem'

const features = [
  { Icon: Lightbulb, title: 'Por qué sí y por qué no', text: 'Cada opción tiene su explicación: aprendes también de los errores.' },
  { Icon: Clock, title: 'Simulacros reales', text: '45 minutos, preguntas ponderadas por dominio y nota sobre 1000 como en el examen.' },
  { Icon: ListChecks, title: 'Como el examen real', text: 'Seis tipos de pregunta, casos prácticos y anexos con código DAX y Power Query.' },
  { Icon: Repeat, title: 'Repaso inteligente', text: 'Repetición espaciada: lo que fallas vuelve hasta que lo dominas.' },
  { Icon: Gauge, title: 'Índice de preparación', text: 'Tu progreso por dominio, ponderado con los pesos oficiales.' },
  { Icon: ShieldCheck, title: 'Contenido original', text: 'Basado en Microsoft Learn y el temario vigente. Sin «dumps».' },
]

export function Home() {
  return (
    <>
      <section className="hero-gradient">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:py-20 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <Badge tone="primary" className="mb-4">
              <Sparkles size={13} /> Nuevo: PL-300 · Analista de datos de Power BI
            </Badge>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Aprueba tu certificación de <span className="bg-gradient-to-r from-[#7c5cff] to-[#2f6fed] bg-clip-text text-transparent">Power Platform</span> entendiendo cada respuesta
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted">
              Tests en español, visuales y alineados con el temario oficial de Microsoft. Practica por dominio, haz
              simulacros cronometrados y descubre por qué cada opción es correcta o incorrecta.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink to="/pl-900" size="lg">
                Empezar con PL-900 <ArrowRight size={18} />
              </ButtonLink>
              <ButtonLink to="/pl-300" size="lg" variant="secondary">
                Preparar PL-300 (Power BI)
              </ButtonLink>
            </div>
            <p className="mt-4 text-sm text-muted">Gratis · Sin registro · Funciona sin conexión</p>
          </div>
          <Ecosystem />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-2xl font-bold tracking-tight">Certificaciones</h2>
        <p className="mt-1 text-muted">Empezamos por los fundamentos y crecemos hacia los perfiles de especialista.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {exams.map((e) => {
            const available = e.status === 'disponible'
            const count = available ? getQuestions(e.code).length : 0
            const content = (
              <Card className={`flex h-full flex-col p-5 transition-all ${available ? 'hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md' : 'opacity-70'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-extrabold tracking-tight">{e.code}</span>
                  {available ? <Badge tone="ok">Disponible</Badge> : <Badge>Próximamente</Badge>}
                </div>
                <div className="mt-1 font-semibold">{e.name}</div>
                <div className="text-xs text-muted">{e.nameEn} · {e.level}</div>
                <p className="mt-3 flex-1 text-sm text-muted">{e.description}</p>
                {available && (
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-muted">
                      <BookOpen size={15} /> {count} preguntas
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-primary">
                      Entrar <ArrowRight size={15} />
                    </span>
                  </div>
                )}
              </Card>
            )
            return available ? (
              <Link key={e.code} to={`/${e.code.toLowerCase()}`} className="block">
                {content}
              </Link>
            ) : (
              <div key={e.code}>{content}</div>
            )
          })}
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-2xl font-bold tracking-tight">Pensado para aprender, no para memorizar</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ Icon, title, text }) => (
              <div key={title} className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                  <Icon size={20} />
                </span>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-1 text-sm text-muted">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
