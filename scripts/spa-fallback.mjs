// GitHub Pages no soporta rutas de SPA: copiamos index.html a 404.html
// para que cualquier ruta profunda cargue la aplicación.
import { copyFileSync } from 'node:fs'
copyFileSync('dist/index.html', 'dist/404.html')
console.log('✔ dist/404.html creado')
