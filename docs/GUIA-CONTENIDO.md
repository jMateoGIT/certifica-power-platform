# Guía de redacción de preguntas

Esta guía define cómo se escriben las preguntas del banco. Todo el contenido se
valida automáticamente con `npm run validate` (esquema en `src/content/schema.ts`).

## Principios

1. **Original, nunca "dumps".** Las preguntas se escriben a partir de la documentación
   pública de Microsoft Learn. Nunca se copian preguntas del examen real: está
   prohibido por el acuerdo de confidencialidad del examen y suele contener errores.
2. **Alineada con el temario.** Cada pregunta pertenece a un dominio (`domain`) y a una
   sub-habilidad (`skill`) de `src/content/<examen>/exam.ts`, y declara la versión del
   temario (`outlineVersion`).
3. **Explicar cada opción.** No basta con decir cuál es la correcta: cada opción,
   afirmación, hueco o emparejamiento lleva su propia explicación de **por qué es
   correcta o incorrecta**. Un buen distractor enseña algo.
4. **Hechos estables.** Evitar cifras volátiles (precios, límites de licencias, número
   exacto de conectores) y funciones en versión preliminar. Si una función ha cambiado
   de nombre, usar el nombre actual y mencionar el antiguo entre paréntesis
   (p. ej. «Copilot Studio (antes Power Virtual Agents)»).
5. **Una sola respuesta defendible.** Si un experto podría argumentar dos respuestas,
   la pregunta está mal planteada.

## Estilo

- Español neutro, tuteo («¿Qué debes usar…?»).
- Términos de producto en español como aparecen en la interfaz en español, con el
  término en inglés entre paréntesis la primera vez: «aplicación de lienzo (*canvas app*)»,
  «flujo de nube (*cloud flow*)», «tema (*topic*)».
- Nombres de producto sin traducir: Power Apps, Power Automate, Dataverse, Copilot Studio.
- Enunciado claro y breve. Los escenarios de negocio van en `scenario`, el enunciado
  en `prompt`.
- Evitar «todas las anteriores», «ninguna de las anteriores» y negaciones dobles.
- Distractores plausibles, de longitud parecida a la respuesta correcta.
- `keyPoint`: una frase que resume lo que hay que recordar.
- Al menos un 30 % de preguntas con escenario de negocio.
- Dificultad: `1` = definición/reconocimiento, `2` = aplicación a un caso, `3` = comparar
  o elegir entre opciones parecidas.

## Referencias

Cada pregunta incluye al menos una referencia a **Microsoft Learn**
(`https://learn.microsoft.com/...`). Preferir páginas estables de documentación
(`/es-es/power-apps/...`, `/es-es/power-automate/...`, `/es-es/power-platform/...`,
`/es-es/microsoft-copilot-studio/...`) o módulos de formación (`/es-es/training/...`).

## Tipos de pregunta

| `type` | Uso | Puntuación |
|---|---|---|
| `single` | Una respuesta correcta entre 3–6 | todo o nada |
| `multiple` | 2 o más correctas entre 4–7 (se indica cuántas) | parcial |
| `yesno` | 3–4 afirmaciones, cada una Sí/No | parcial |
| `order` | Ordenar 3–6 pasos | todo o nada |
| `match` | Emparejar 3–6 elementos con opciones | parcial |
| `dropdown` | Completar una frase con 1–3 desplegables | parcial |

### Ejemplos

```json
{
  "id": "pl900-d2-dataverse-001",
  "type": "single",
  "exam": "PL-900",
  "outlineVersion": "2026-07-24",
  "domain": "d2",
  "skill": "d2-dataverse",
  "difficulty": 1,
  "prompt": "¿Qué elemento de Dataverse almacena los datos de un tipo de registro, como Clientes o Pedidos?",
  "options": [
    { "id": "a", "text": "Una tabla", "correct": true, "explanation": "En Dataverse los datos se guardan en tablas (antes «entidades»); cada fila es un registro." },
    { "id": "b", "text": "Una vista", "correct": false, "explanation": "Una vista solo define qué filas y columnas se muestran en una lista; no almacena datos." },
    { "id": "c", "text": "Un formulario", "correct": false, "explanation": "Un formulario es la interfaz para ver y editar una fila; los datos siguen en la tabla." }
  ],
  "keyPoint": "Tabla = almacenamiento; vista y formulario = formas de presentar esos datos.",
  "references": [{ "title": "Tablas en Dataverse", "url": "https://learn.microsoft.com/es-es/power-apps/maker/data-platform/entity-overview" }]
}
```

```json
{ "type": "yesno", "statements": [
  { "id": "s1", "text": "Un flujo programado se ejecuta a una hora definida.", "answer": true, "explanation": "..." }
] }
```

```json
{ "type": "order", "items": [
  { "id": "p1", "text": "Primer paso (orden correcto)", "explanation": "Por qué va primero..." }
] }
```

```json
{ "type": "match",
  "prompts": [{ "id": "m1", "text": "Necesidad", "answerId": "c1", "explanation": "..." }],
  "choices": [{ "id": "c1", "text": "Herramienta" }] }
```

```json
{ "type": "dropdown",
  "template": "Para automatizar una aplicación de escritorio heredada usas {{b1}}.",
  "blanks": [{ "id": "b1", "correctId": "o1", "explanation": "...",
    "options": [{ "id": "o1", "text": "un flujo de escritorio" }, { "id": "o2", "text": "un flujo programado" }] }] }
```

## Convención de IDs

`<examen>-<dominio>-<tema>-<nnn>`, p. ej. `pl900-d4-escritorio-003`. Deben ser únicos
en todo el banco.
