import { Code2, Table2 } from 'lucide-react'
import type { Question } from '../../content/schema'

const languageNames = { dax: 'DAX', m: 'Power Query M', powerfx: 'Power Fx', sql: 'SQL', json: 'JSON' } as const

/**
 * Resaltado ligero para DAX y M: comentarios, cadenas, números, funciones
 * (palabra seguida de «(») y referencias a columnas [Columna].
 */
const TOKEN = /(\/\/[^\n]*|--[^\n]*|\/\*[\s\S]*?\*\/)|("(?:[^"]|"")*")|('(?:[^']|'')*')|(\[[^\]\n]+\])|(\b\d+(?:[.,]\d+)?\b)|(\b[A-Za-z_][\w.]*(?=\s*\())|(\b(?:VAR|RETURN|let|in|each|if|then|else|true|false|null|TRUE|FALSE|and|or|not|EVALUATE|DEFINE|MEASURE|ORDER BY)\b)/g

function highlight(code: string) {
  const out: React.ReactNode[] = []
  let last = 0
  let i = 0
  for (const m of code.matchAll(TOKEN)) {
    if (m.index! > last) out.push(code.slice(last, m.index))
    const [text, comment, str, quoted, column, num, fn, kw] = m
    const cls = comment
      ? 'text-muted italic'
      : str
        ? 'text-[#b5651d] dark:text-[#f4b46a]'
        : quoted || column
          ? 'text-[#0f7d6e] dark:text-[#4fd1bd]'
          : num
            ? 'text-[#a3369a] dark:text-[#f08fe5]'
            : fn
              ? 'font-semibold text-[#2f6fed] dark:text-[#8fb4ff]'
              : kw
                ? 'font-semibold text-primary'
                : ''
    out.push(
      <span key={i++} className={cls}>
        {text}
      </span>,
    )
    last = m.index! + text.length
  }
  if (last < code.length) out.push(code.slice(last))
  return out
}

export function Exhibits({ question: q }: { question: Question }) {
  if (!q.code && !q.table) return null
  return (
    <div className="mb-5 space-y-4">
      {q.code && (
        <figure className="overflow-hidden rounded-xl border border-border bg-surface-2">
          <figcaption className="flex items-center gap-1.5 border-b border-border px-3 py-1.5 text-xs font-semibold text-muted">
            <Code2 size={14} /> {languageNames[q.code.language]}
          </figcaption>
          <pre className="overflow-x-auto p-4 text-[0.85rem] leading-relaxed">
            <code className="font-mono">{highlight(q.code.content)}</code>
          </pre>
        </figure>
      )}
      {q.table && (
        <figure className="overflow-hidden rounded-xl border border-border">
          {q.table.caption && (
            <figcaption className="flex items-center gap-1.5 border-b border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold text-muted">
              <Table2 size={14} /> {q.table.caption}
            </figcaption>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-2 text-left">
                <tr>
                  {q.table.headers.map((h) => (
                    <th key={h} scope="col" className="whitespace-nowrap px-3 py-2 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {q.table.rows.map((row, r) => (
                  <tr key={r} className="border-t border-border">
                    {row.map((cell, c) => (
                      <td key={c} className="whitespace-nowrap px-3 py-1.5 tabular-nums">
                        {cell === '' ? <span className="italic text-muted">(vacío)</span> : cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </figure>
      )}
    </div>
  )
}
