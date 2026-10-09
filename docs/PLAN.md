# Plan del proyecto

## Objetivo

Una web profesional, visual y en español para preparar las certificaciones de Microsoft Power Platform,
centrada en exámenes y preguntas tipo test que explican por qué cada respuesta es correcta o incorrecta.
Se empieza por **PL-900** con una arquitectura preparada para el resto de certificaciones.

## Contexto (octubre de 2026)

- PL-900 se reescribió el **24/07/2026**: valor de negocio (5–10 %), gestión del entorno con Dataverse (20–25 %),
  Power Apps (20–25 %), Power Automate (20–25 %) y agentes de Copilot Studio (20–25 %, según fuentes secundarias).
  Power BI y Power Pages dejan de ser dominios propios.
- PL-200 se retiró (31/08/2026) → **AB-410**. PL-400 pasa a examen **AB-400** (16/10/2026). PL-500 y PL-600 se retiraron.
- PL-300 y DP-600 siguen vigentes.

## Decisiones

| Tema | Decisión |
|---|---|
| Contenido | Original, basado en Microsoft Learn; nada de «dumps» |
| Datos | JSON por dominio validado con Zod en CI |
| Puntuación | Escala 0–1000, aprobado 700, crédito parcial en preguntas de varias partes (aproximación) |
| Persistencia | Navegador (localStorage) con exportar/importar; sin backend |
| Hosting | GitHub Pages con despliegue automático |

## Fases

- [x] **F0** Base del proyecto, CI y despliegue
- [x] **F1** Esquema, motor de corrección, simulacros y repetición espaciada
- [x] **F2** Banco PL-900 (150 preguntas + glosario) y revisión técnica independiente
- [x] **F3** Modo práctica y por dominio
- [x] **F4** Simulacro cronometrado con informe por dominio
- [x] **F5** Progreso, repaso inteligente, exportar/importar
- [x] **F6** PWA, accesibilidad, tests e2e
- [ ] Verificar sub-habilidades y referencias contra la guía oficial de Microsoft Learn
- [ ] Ampliar PL-900 a 250+ preguntas
- [ ] PL-300 (Power BI), después AB-410, AB-400 y DP-600

## Ideas futuras

- Modo «examen en inglés».
- Casos prácticos con varias preguntas sobre el mismo escenario.
- Mini-laboratorios guiados en un entorno de desarrollador gratuito.
- Sincronización opcional en la nube.
