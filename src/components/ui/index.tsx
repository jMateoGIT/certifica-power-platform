import clsx from 'clsx'
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router'
import { AppWindow, Bot, Briefcase, ChartColumn, Database, Filter, Network, ShieldCheck, Workflow, type LucideIcon } from 'lucide-react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const buttonClass = (variant: Variant = 'primary', size: Size = 'md', className?: string) =>
  clsx(
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors select-none',
    'disabled:cursor-not-allowed disabled:opacity-50',
    size === 'sm' && 'px-3 py-1.5 text-sm',
    size === 'md' && 'px-4 py-2.5 text-sm',
    size === 'lg' && 'px-6 py-3 text-base',
    variant === 'primary' && 'bg-primary text-white hover:bg-primary-strong dark:text-[#120d2b]',
    variant === 'secondary' && 'border border-border bg-surface text-text hover:bg-surface-2',
    variant === 'ghost' && 'text-muted hover:bg-surface-2 hover:text-text',
    variant === 'danger' && 'border border-bad/40 bg-bad-soft text-bad hover:border-bad',
    className,
  )

export function Button({
  variant,
  size,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button type="button" className={buttonClass(variant, size, className)} {...props} />
}

export function ButtonLink({ variant, size, className, ...props }: LinkProps & { variant?: Variant; size?: Size }) {
  return <Link className={buttonClass(variant, size, className)} {...props} />
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx('rounded-2xl border border-border bg-surface shadow-sm', className)} {...props} />
}

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode
  tone?: 'neutral' | 'primary' | 'ok' | 'bad' | 'warn'
  className?: string
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
        tone === 'neutral' && 'bg-surface-2 text-muted',
        tone === 'primary' && 'bg-primary-soft text-primary',
        tone === 'ok' && 'bg-ok-soft text-ok',
        tone === 'bad' && 'bg-bad-soft text-bad',
        tone === 'warn' && 'bg-warn-soft text-warn',
        className,
      )}
    >
      {children}
    </span>
  )
}

export function ProgressBar({ value, color, label, className }: { value: number; color?: string; label?: string; className?: string }) {
  const pct = Math.max(0, Math.min(100, value * 100))
  return (
    <div
      className={clsx('h-2 w-full overflow-hidden rounded-full bg-surface-2', className)}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${pct}%`, background: color ?? 'var(--primary)' }} />
    </div>
  )
}

/** Anillo de progreso con el valor en el centro. */
export function ProgressRing({
  value,
  size = 120,
  stroke = 10,
  color = 'var(--primary)',
  children,
  label,
}: {
  value: number
  size?: number
  stroke?: number
  color?: string
  children?: ReactNode
  label?: string
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const v = Math.max(0, Math.min(1, value))
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }} role="img" aria-label={label}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-2)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - v)}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  )
}

const domainIcons: Record<string, LucideIcon> = { Briefcase, Database, AppWindow, Workflow, Bot, Filter, Network, ChartColumn, ShieldCheck }

export function DomainIcon({ icon, color, size = 'md' }: { icon: string; color: string; size?: 'sm' | 'md' | 'lg' }) {
  const Icon = domainIcons[icon] ?? Briefcase
  const box = size === 'sm' ? 'h-7 w-7 rounded-lg' : size === 'lg' ? 'h-12 w-12 rounded-2xl' : 'h-9 w-9 rounded-xl'
  const iconSize = size === 'sm' ? 15 : size === 'lg' ? 24 : 18
  return (
    <span
      className={clsx('inline-grid shrink-0 place-items-center', box)}
      style={{ background: `color-mix(in oklab, ${color} 16%, transparent)`, color }}
      aria-hidden
    >
      <Icon size={iconSize} strokeWidth={2.2} />
    </span>
  )
}

export function PageTitle({ eyebrow, title, children }: { eyebrow?: ReactNode; title: ReactNode; children?: ReactNode }) {
  return (
    <header className="mb-6">
      {eyebrow && <div className="mb-2 text-sm font-semibold text-primary">{eyebrow}</div>}
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
      {children && <div className="mt-2 max-w-3xl text-muted">{children}</div>}
    </header>
  )
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: ReactNode }) {
  return (
    <div className="rounded-xl bg-surface-2 p-3">
      <div className="text-xs font-medium text-muted">{label}</div>
      <div className="mt-1 text-xl font-bold tabular-nums">{value}</div>
      {hint && <div className="mt-0.5 text-xs text-muted">{hint}</div>}
    </div>
  )
}
