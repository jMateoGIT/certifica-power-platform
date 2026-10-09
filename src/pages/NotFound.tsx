import { ButtonLink } from '../components/ui'

export function NotFound() {
  return (
    <div className="mx-auto grid max-w-xl place-items-center px-4 py-24 text-center">
      <div className="text-6xl font-extrabold text-primary">404</div>
      <h1 className="mt-3 text-2xl font-bold">Página no encontrada</h1>
      <p className="mt-2 text-muted">La página que buscas no existe o esta certificación aún no está disponible.</p>
      <ButtonLink to="/" className="mt-6">
        Volver al inicio
      </ButtonLink>
    </div>
  )
}
