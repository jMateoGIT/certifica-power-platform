/**
 * Comprueba que todas las referencias a Microsoft Learn siguen vivas.
 * Uso: npm run check-links
 * Falla si alguna URL devuelve error; avisa si redirige a otra página.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const contentDir = join(import.meta.dirname, '..', 'src', 'content')
const urls = new Map<string, Set<string>>()
const add = (url: string, where: string) => urls.set(url, (urls.get(url) ?? new Set()).add(where))

for (const exam of readdirSync(contentDir, { withFileTypes: true }).filter((d) => d.isDirectory())) {
  const qdir = join(contentDir, exam.name, 'questions')
  for (const f of readdirSync(qdir, { withFileTypes: true }).filter((d) => d.name.endsWith('.json'))) {
    for (const q of JSON.parse(readFileSync(join(qdir, f.name), 'utf8')))
      for (const r of q.references) add(r.url, q.id)
  }
  try {
    for (const t of JSON.parse(readFileSync(join(contentDir, exam.name, 'glossary.json'), 'utf8')))
      if (t.reference) add(t.reference.url, `glosario:${t.id}`)
  } catch {
    /* sin glosario */
  }
}

const normalize = (u: string) => u.replace(/\/$/, '').toLowerCase()
let broken = 0
let redirected = 0
const list = [...urls.keys()]
for (let i = 0; i < list.length; i += 8) {
  await Promise.all(
    list.slice(i, i + 8).map(async (url) => {
      try {
        const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(30_000) })
        if (!res.ok) {
          broken++
          console.error(`✖ ${res.status} ${url}  (${[...urls.get(url)!].join(', ')})`)
        } else if (normalize(res.url) !== normalize(url)) {
          redirected++
          console.warn(`↪ ${url}\n    → ${res.url}  (${[...urls.get(url)!].join(', ')})`)
        }
      } catch (e) {
        broken++
        console.error(`✖ ${(e as Error).message} ${url}`)
      }
    }),
  )
}
console.log(`\n${list.length} enlaces · ${broken} rotos · ${redirected} redirigidos`)
process.exit(broken ? 1 : 0)
