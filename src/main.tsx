import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import {
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'

import { routeTree } from './routeTree.gen'
import {
  AuthProvider,
  useAuth,
} from './auth/auth-context'
import { ToastProvider } from './components/providers/ToastProvider'
import { LoadingProvider } from './components/providers/LoadingProvider'
import { ModalProvider } from './components/providers/ModalProvider'
import { ConfirmProvider } from './components/providers/ConfirmProvider'

export const router = createRouter({
  routeTree,

  context: {
    auth: undefined!,
  },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function InnerApp() {
  const auth = useAuth()

  return (
    <ToastProvider>
      <LoadingProvider>
        <ModalProvider>
          <ConfirmProvider>
            <RouterProvider
              router={router}
              context={{ auth }}
            />
          </ConfirmProvider>
        </ModalProvider>
      </LoadingProvider>
    </ToastProvider>
  )
}

function App() {
  return (
    <AuthProvider>
      <InnerApp />
    </AuthProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)