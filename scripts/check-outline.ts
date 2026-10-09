/**
 * Detecta si Microsoft ha cambiado el temario de algún examen disponible
 * comparando la fecha «Skills measured as of …» de la guía oficial en inglés
 * con `outlineVersion`. Escribe un resumen en markdown si hay cambios.
 * Uso: npm run check-outline [-- --out cambios.md]
 */
import { writeFileSync } from 'node:fs'
import { exams } from '../src/content/catalog'
import { parseOutlineDate } from './outline-date'

const outArg = process.argv.indexOf('--out')
const outFile = outArg > -1 ? process.argv[outArg + 1] : undefined
const changes: string[] = []
let failed = false

for (const exam of exams.filter((e) => e.status === 'disponible' && e.studyGuideUrl)) {
  try {
    const res = await fetch(exam.studyGuideUrl!, { signal: AbortSignal.timeout(30_000) })
    const official = parseOutlineDate(await res.text())
    if (!official) {
      failed = true
      console.error(`✖ ${exam.code}: no encuentro la fecha del temario en ${exam.studyGuideUrl}`)
    } else if (official !== exam.outlineVersion) {
      console.warn(`⚠ ${exam.code}: temario oficial ${official}, la web usa ${exam.outlineVersion}`)
      changes.push(
        `- **${exam.code}**: la guía oficial indica *Skills measured as of* **${official}** y la web usa **${exam.outlineVersion}**. Revisa ${exam.studyGuideUrl}`,
      )
    } else {
      console.log(`✔ ${exam.code}: temario al día (${official})`)
    }
  } catch (e) {
    failed = true
    console.error(`✖ ${exam.code}: ${(e as Error).message}`)
  }
}

if (outFile && changes.length) {
  writeFileSync(
    outFile,
    `Microsoft ha publicado un temario nuevo:\n\n${changes.join('\n')}\n\nPasos: comparar las sub-habilidades con \`exam.ts\`, ` +
      `actualizar \`outlineVersion\`, revisar las preguntas afectadas y ejecutar \`npm run validate\`.\n`,
  )
}
process.exit(failed ? 1 : 0)
