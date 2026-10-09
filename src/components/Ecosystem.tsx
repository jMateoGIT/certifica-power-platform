import { AppWindow, BarChart3, Bot, Database, Globe, Plug, Sparkles, Workflow, type LucideIcon } from 'lucide-react'

const products: { name: string; role: string; color: string; Icon: LucideIcon }[] = [
  { name: 'Power Apps', role: 'Crear aplicaciones', color: '#a3369a', Icon: AppWindow },
  { name: 'Power Automate', role: 'Automatizar procesos', color: '#2f6fed', Icon: Workflow },
  { name: 'Copilot Studio', role: 'Crear agentes', color: '#e07a1f', Icon: Bot },
  { name: 'Power BI', role: 'Analizar datos', color: '#d4a106', Icon: BarChart3 },
  { name: 'Power Pages', role: 'Sitios web externos', color: '#0f9d8a', Icon: Globe },
]

const foundation: { name: string; Icon: LucideIcon }[] = [
  { name: 'Dataverse', Icon: Database },
  { name: 'Conectores', Icon: Plug },
  { name: 'IA y Copilot', Icon: Sparkles },
]

/** Mapa visual de Power Platform: productos sobre una base común. */
export function Ecosystem() {
  return (
    <figure className="rounded-3xl border border-border bg-surface/80 p-5 shadow-xl backdrop-blur sm:p-6" aria-labelledby="eco-cap">
      <figcaption id="eco-cap" className="mb-4 text-sm font-semibold text-muted">
        El ecosistema de Power Platform
      </figcaption>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {products.map(({ name, role, color, Icon }, i) => (
          <div
            key={name}
            className="animate-pop rounded-2xl border p-3"
            style={{
              animationDelay: `${i * 70}ms`,
              borderColor: `color-mix(in oklab, ${color} 35%, transparent)`,
              background: `color-mix(in oklab, ${color} 9%, transparent)`,
            }}
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl text-white" style={{ background: color }}>
              <Icon size={18} />
            </span>
            <div className="mt-2 text-sm font-bold">{name}</div>
            <div className="text-xs text-muted">{role}</div>
          </div>
        ))}
        <div className="col-span-2 hidden place-items-center rounded-2xl border border-dashed border-border p-3 text-center text-xs text-muted sm:col-span-1 sm:grid">
          + Microsoft 365, Teams, Dynamics 365 y Azure
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 rounded-2xl bg-surface-2 p-2">
        {foundation.map(({ name, Icon }) => (
          <div key={name} className="flex flex-col items-center gap-1 rounded-xl bg-surface p-2 text-center sm:flex-row sm:justify-center">
            <Icon size={16} className="text-primary" />
            <span className="text-xs font-semibold">{name}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-xs text-muted">Gobierno y seguridad: entornos, directivas DLP y Microsoft Entra ID</p>
    </figure>
  )
}
