import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

async function prepare() {
  // MSW runs in dev only — imports are tree-shaken in production builds
  if (import.meta.env.DEV) {
    const { worker } = await import('@myorg/mocks/browser')
    await worker.start({ onUnhandledRequest: 'bypass' })
  }
}

prepare().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
})
