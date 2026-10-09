import { createBrowserRouter, RouterProvider } from 'react-router'
import { Layout } from './components/layout/Layout'
import { ExamHome } from './pages/ExamHome'
import { Home } from './pages/Home'
import { NotFound } from './pages/NotFound'
import { Practice } from './pages/Practice'

// Las páginas menos frecuentes (y las que usan gráficos) se cargan bajo demanda.
const lazyPage = <K extends string>(load: () => Promise<Record<K, React.ComponentType>>, name: K) => ({
  lazy: async () => ({ Component: (await load())[name] }),
})

const router = createBrowserRouter(
  [
    {
      element: <Layout />,
      children: [
        { index: true, element: <Home /> },
        { path: 'acerca', ...lazyPage(() => import('./pages/About'), 'About') },
        { path: ':code', element: <ExamHome /> },
        { path: ':code/practica', element: <Practice /> },
        { path: ':code/casos', ...lazyPage(() => import('./pages/Cases'), 'Cases') },
        { path: ':code/repaso', ...lazyPage(() => import('./pages/Review'), 'Review') },
        { path: ':code/simulacro', ...lazyPage(() => import('./pages/ExamSetup'), 'ExamSetup') },
        { path: ':code/simulacro/en-curso', ...lazyPage(() => import('./pages/ExamRun'), 'ExamRun') },
        { path: ':code/resultados/:attemptId', ...lazyPage(() => import('./pages/ExamResult'), 'ExamResult') },
        { path: ':code/glosario', ...lazyPage(() => import('./pages/Glossary'), 'Glossary') },
        { path: ':code/progreso', ...lazyPage(() => import('./pages/Progress'), 'Progress') },
        { path: '*', element: <NotFound /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' },
)

export function App() {
  return <RouterProvider router={router} />
}
