import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Con «autoUpdate», la página se recarga sola cuando se activa una versión nueva
// del service worker. Además se busca una actualización cada hora, por si la
// web se queda abierta mucho tiempo (o instalada como aplicación).
registerSW({
  immediate: true,
  onRegisteredSW(_url, registration) {
    if (registration) setInterval(() => registration.update().catch(() => {}), 60 * 60 * 1000)
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
