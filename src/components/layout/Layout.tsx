import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import clsx from 'clsx'
import { Menu, Monitor, Moon, Sun, X } from 'lucide-react'
import { exams } from '../../content/catalog'
import { trackPageview } from '../../lib/telemetry'
import { useProgress, type Theme } from '../../store/progress'

function useApplyTheme() {
  const theme = useProgress((s) => s.theme)
  useEffect(() => {
    const mq = matchMedia('(prefers-color-scheme: dark)')
    const apply = () =>
      document.documentElement.classList.toggle('dark', theme === 'dark' || (theme === 'system' && mq.matches))
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [theme])
}

const themes: { value: Theme; label: string; Icon: typeof Sun }[] = [
  { value: 'light', label: 'Tema claro', Icon: Sun },
  { value: 'dark', label: 'Tema oscuro', Icon: Moon },
  { value: 'system', label: 'Tema del sistema', Icon: Monitor },
]

function ThemeToggle() {
  const { theme, setTheme } = useProgress()
  return (
    <div className="flex rounded-xl border border-border bg-surface p-0.5" role="radiogroup" aria-label="Tema">
      {themes.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={theme === value}
          aria-label={label}
          title={label}
          onClick={() => setTheme(value)}
          className={clsx(
            'grid h-7 w-7 place-items-center rounded-lg transition-colors',
            theme === value ? 'bg-primary-soft text-primary' : 'text-muted hover:text-text',
          )}
        >
          <Icon size={15} />
        </button>
      ))}
    </div>
  )
}

// Una entrada por certificación disponible; el progreso está dentro de cada una.
const links = [
  { to: '/', label: 'Inicio', end: true },
  ...exams.filter((e) => e.status === 'disponible').map((e) => ({ to: `/${e.code.toLowerCase()}`, label: e.code, end: false })),
  { to: '/acerca', label: 'Acerca de', end: true },
]

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-bold tracking-tight">
      <svg width="28" height="28" viewBox="0 0 64 64" aria-hidden>
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#7c5cff" />
            <stop offset="1" stopColor="#2f6fed" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="14" fill="url(#lg)" />
        <path d="M18 33l9 9 19-20" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="whitespace-nowrap">
        Certifica<span className="text-primary"> <span className="sm:hidden">PP</span><span className="hidden sm:inline">Power Platform</span></span>
      </span>
    </Link>
  )
}

export function Layout() {
  useApplyTheme()
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => {
    setOpen(false)
    window.scrollTo(0, 0)
    trackPageview()
  }, [pathname])

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2">
        Saltar al contenido
      </a>
      <header className="sticky top-0 z-30 border-b border-border bg-bg/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  clsx(
                    'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                    isActive ? 'bg-primary-soft text-primary' : 'text-muted hover:text-text',
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-surface-2 md:hidden"
              aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {open && (
          <nav className="border-t border-border px-4 py-2 md:hidden" aria-label="Principal móvil">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  clsx('block rounded-lg px-3 py-2 font-medium', isActive ? 'bg-primary-soft text-primary' : 'text-text')
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      <main id="main" className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border py-8 text-sm text-muted">
        <div className="mx-auto max-w-6xl px-4">
          <p>
            Proyecto independiente y gratuito, sin relación con Microsoft. Las preguntas son originales, escritas a partir
            de la documentación pública de Microsoft Learn, y <strong>no son preguntas del examen real</strong>. Microsoft,
            Power Platform, Power Apps, Power Automate, Power BI y Copilot Studio son marcas de Microsoft Corporation.
          </p>
        </div>
      </footer>
    </div>
  )
}
