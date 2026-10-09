import { expect, test } from '@playwright/test'

test('la portada muestra el catálogo y lleva a PL-900', async ({ page }) => {
  await page.goto('./')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Power Platform')
  await page.getByRole('link', { name: /Empezar con PL-900/ }).click()
  await expect(page).toHaveURL(/\/pl-900$/)
  await expect(page.getByRole('heading', { name: /Dominios del examen/ })).toBeVisible()
})

test('modo práctica: responder, comprobar y ver la explicación', async ({ page }) => {
  await page.goto('./pl-900/practica')
  await page.getByRole('button', { name: /^Empezar/ }).click()
  const article = page.locator('article')
  await expect(article).toBeVisible()

  // Responde lo que haga falta según el tipo de pregunta hasta poder comprobar.
  const check = page.getByRole('button', { name: 'Comprobar', exact: true })
  for (let i = 0; i < 8 && (await check.isDisabled()); i++) {
    const radios = article.getByRole('radio', { checked: false })
    const checkboxes = article.getByRole('checkbox', { checked: false })
    const selects = article.locator('select')
    if (await selects.count()) {
      for (const s of await selects.all()) await s.selectOption({ index: 1 })
    } else if (await checkboxes.count()) {
      await checkboxes.first().click()
    } else if (await article.getByRole('radiogroup').count()) {
      for (const g of await article.getByRole('radiogroup').all()) await g.getByRole('radio').first().click()
    } else if (await radios.count()) {
      await radios.first().click()
    }
  }
  await check.click()
  await expect(page.getByText(/¡Correcto!|Incorrecto|Parcialmente correcto/)).toBeVisible()
  await expect(page.getByText('Idea clave')).toBeVisible()
  await expect(page.getByText(/Por qué sí|Por qué no|Es verdadera|Es falsa|Correcto:|Hueco 1|Posición correcta|Va en la posición/).first()).toBeVisible()
})

test('simulacro: empezar, entregar y ver el informe por dominio', async ({ page }) => {
  await page.goto('./pl-900/simulacro')
  await page.getByRole('radio', { name: /Simulacro rápido/ }).click()
  await page.getByRole('button', { name: /Empezar simulacro/ }).click()
  await expect(page.getByRole('timer')).toBeVisible()
  await expect(page.getByText('Pregunta 1 de 20')).toBeVisible()
  await page.getByRole('button', { name: /Entregar/ }).first().click()
  await page.getByRole('dialog').getByRole('button', { name: 'Entregar' }).click()
  await expect(page).toHaveURL(/resultados/)
  await expect(page.getByText(/\/1000/).first()).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Resultado por dominio' })).toBeVisible()
})

test('glosario: búsqueda y tarjetas', async ({ page }) => {
  await page.goto('./pl-900/glosario')
  await page.getByRole('searchbox').fill('dataverse')
  await expect(page.getByRole('heading', { name: /Dataverse/ }).first()).toBeVisible()
  await page.getByRole('tab', { name: 'Tarjetas' }).click()
  await expect(page.getByText('Pulsa para ver la definición')).toBeVisible()
})

test('progreso y rutas profundas cargan', async ({ page }) => {
  await page.goto('./pl-900/progreso')
  await expect(page.getByRole('heading', { name: 'Mi progreso' })).toBeVisible()
  await page.goto('./no-existe')
  await expect(page.getByText('Página no encontrada')).toBeVisible()
})
