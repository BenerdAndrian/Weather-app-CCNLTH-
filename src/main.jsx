import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { routes } from './routes.jsx'
import { createQueryClient } from './queries/queryClient.js'
import { SettingsProvider } from './settings/SettingsProvider.jsx'
import './styles/styles.css'

const router = createBrowserRouter(routes)
// One cache for the whole app. It holds all server state (weather, saved cities).
const queryClient = createQueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <RouterProvider router={router} />
      </SettingsProvider>
      {/* Devtools show the cache; they are left out of production builds automatically. */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
)
