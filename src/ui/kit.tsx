import type { ReactNode } from 'react'

export function Button({
  children,
  onClick,
  disabled,
  tone = 'primary',
}: {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  tone?: 'primary' | 'ghost' | 'danger' | 'success'
}) {
  const tones = {
    primary: 'bg-indigo-500 hover:bg-indigo-400 text-white',
    ghost: 'bg-slate-700 hover:bg-slate-600 text-slate-100',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white',
    success: 'bg-emerald-600 hover:bg-emerald-500 text-white',
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-xl px-4 py-3 text-base font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${tones[tone]}`}
    >
      {children}
    </button>
  )
}

export function Card({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <section className="rounded-2xl bg-slate-800/70 p-4 shadow-lg ring-1 ring-white/5">
      {title && <h2 className="mb-3 text-sm font-semibold tracking-wide text-slate-400">{title}</h2>}
      {children}
    </section>
  )
}

export function Screen({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-4 bg-slate-900 p-4 text-slate-100">
      {children}
    </main>
  )
}

export function Hint({ children }: { children: ReactNode }) {
  return <p className="text-sm leading-relaxed text-slate-400">{children}</p>
}

export function Chip({
  children,
  selected,
  onClick,
  disabled,
}: {
  children: ReactNode
  selected?: boolean
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full px-3 py-1.5 text-sm transition disabled:opacity-40 ${
        selected ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-200'
      }`}
    >
      {children}
    </button>
  )
}
