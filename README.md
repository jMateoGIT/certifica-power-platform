# Certifica Power Platform

Plataforma **gratuita y en español** para preparar las certificaciones de Microsoft Power Platform:
**PL-900** (temario del 24/07/2026) y **PL-300** (temario del 20/04/2026), con AB-410, AB-400 y DP-600 en el horizonte.

**Web:** https://jmateogit.github.io/certifica-power-platform/

## Qué ofrece

- **301 preguntas originales de PL-900**, incluidos 6 casos prácticos, alineadas con el [temario oficial del 24/07/2026](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/pl-900): repartidas según el peso oficial de cada dominio y verificadas con la documentación de Microsoft Learn.
- **Explicación de cada opción**: por qué es correcta o incorrecta, una idea clave y enlaces a Microsoft Learn.
- **6 tipos de pregunta** como en el examen: respuesta única, múltiple, Sí/No, ordenar, emparejar y completar frases.
- **Modo práctica** con filtros por dominio, sub-habilidad, preguntas no vistas, falladas o guardadas.
- **Simulacro cronometrado** (45 preguntas / 45 min o rápido de 20), navegador de preguntas, marcar para revisar, nota sobre 1000 e informe por dominio.
- **Casos prácticos**: escenarios de empresa con varias preguntas encadenadas; el simulacro completo termina con uno.
- **Repaso inteligente** con repetición espaciada (sistema Leitner de 5 cajas).
- **Panel de progreso**: índice de preparación ponderado, radar por dominio, evolución de simulacros y racha.
- **Glosario** de 81 términos en español e inglés, con modo de tarjetas.
- Modo claro y oscuro, diseño para móvil, accesible por teclado e instalable como **PWA** (funciona sin conexión).
- Sin cuentas ni servidor: el progreso se guarda en el navegador y se puede exportar o importar.

> Proyecto independiente, sin relación con Microsoft. Las preguntas son originales y **no son preguntas del examen real**.

## Desarrollo

Requiere Node.js 22.

```bash
npm install
npm run dev          # servidor de desarrollo
npm run validate     # valida el banco de preguntas y el glosario
npm run typecheck    # TypeScript
npm test             # tests unitarios (Vitest)
npm run build        # build de producción en dist/
npm run test:e2e     # tests de extremo a extremo (Playwright, tras el build)
npm run check-links  # comprueba los enlaces a Microsoft Learn (también cada lunes en CI)
npm run check-outline  # avisa si Microsoft ha cambiado el temario
```

Stack: Vite, React 19, TypeScript, Tailwind CSS 4, React Router 7, Zustand, Zod, Recharts y vite-plugin-pwa.

## Estructura

```
src/
  content/            # contenido como datos (validado con Zod)
    schema.ts         # esquema de preguntas, glosario y exámenes
    catalog.ts        # certificaciones disponibles y próximas
    pl-900/
      exam.ts         # dominios, pesos y sub-habilidades del temario
      glossary.json
      questions/      # un JSON por dominio
  engine/             # corrección, construcción de simulacros, Leitner
  store/              # progreso persistente (Zustand + localStorage)
  components/         # interfaz (tipos de pregunta, gráficos, UI)
  pages/              # rutas
scripts/validate-content.ts
docs/                 # plan del proyecto y guía de redacción
```

## Añadir contenido

1. Lee la [guía de redacción](docs/GUIA-CONTENIDO.md).
2. Añade preguntas al JSON del dominio correspondiente en `src/content/<examen>/questions/`.
3. Ejecuta `npm run validate`: comprueba el esquema, los ids, los dominios y que cada opción tenga explicación.

Para una **nueva certificación**, crea `src/content/<codigo>/exam.ts` con sus dominios, márcala como `disponible` en `catalog.ts` y añade sus preguntas: la interfaz se genera sola.

¿Has visto un error? Cada pregunta tiene un enlace «Repórtalo» que abre una *issue* ya rellenada.

## Calidad y mantenimiento del contenido

| Qué | Cómo |
|---|---|
| Esquema, ids, dominios y explicaciones | `npm run validate` (en cada build) |
| Enlaces a Microsoft Learn | `npm run check-links` · cada lunes en GitHub Actions |
| Cambios de temario de Microsoft | `npm run check-outline` · cada lunes; abre una incidencia si cambia la fecha |
| Funciones en versión preliminar | Preguntas con `"tags": ["preview"]`; el validador las cuenta y la web las señala |
| Preguntas ambiguas o demasiado fáciles | `npm run question-quality` con la analítica de Umami (abajo) |

### Analítica anónima (opcional)

La web puede enviar a [Umami](https://umami.is) (sin cookies ni datos personales) qué preguntas se aciertan o fallan
y la nota de los simulacros. Está **desactivada** mientras no se configure, respeta «Do Not Track» y cada persona puede
desactivarla desde *Acerca de* o *Mi progreso*.

1. Crea una cuenta en Umami Cloud (plan gratuito) y añade el sitio `jmateogit.github.io`.
2. En GitHub: *Settings → Secrets and variables → Actions → Variables*, crea `UMAMI_WEBSITE_ID` con el id del sitio.
3. El siguiente despliegue la activa.
4. Para el **informe mensual automático**, crea una clave de API en Umami y guárdala como secreto
   `UMAMI_API_KEY` (*Secrets and variables → Actions → Secrets*). El día 1 de cada mes se abre una incidencia con
   las preguntas a revisar (también a mano: `npm run question-quality`).

Eventos: `respuesta-acierto`, `respuesta-parcial` y `respuesta-fallo` (propiedades `pregunta`, `dominio`, `tipo`, `modo`),
`pregunta-confusa` (botón «¿Te ha resultado confusa?» tras corregir) y `simulacro` (`examen`, `modo`, `nota`
redondeada a decenas, `aprobado`).

## Despliegue

Cada push a `main` despliega en GitHub Pages mediante `.github/workflows/deploy.yml`
(en *Settings → Pages* el origen debe ser **GitHub Actions**).

## Licencia

Código bajo licencia [MIT](LICENSE).
