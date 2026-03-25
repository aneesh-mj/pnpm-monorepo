/// <reference types="vite/client" />
import React from 'react'
import type { Preview, Decorator } from '@storybook/react'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import { AdminContext } from 'react-admin'
import { dataProvider } from './dataProvider.mock'
import { initialize, mswLoader } from 'msw-storybook-addon';


initialize({
  serviceWorker: {
    url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
  },
})

const theme = createTheme({
  palette: { mode: 'light' },
})

// ── MUI theme wrapper ──────────────────────────────────────────────────────
const withMuiTheme: Decorator = (Story) => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <Story />
  </ThemeProvider>
)

// ── React-Admin context wrapper ────────────────────────────────────────────
// Wraps stories that render react-admin components (List, Datagrid, etc.)
// using a lightweight no-op data provider so they render without a real API.
// Stories that don't need it use the withMuiTheme decorator only.
const withAdminContext: Decorator = (Story, context) => {
  if (!context.parameters?.needsAdminContext) {
    return <Story />
  }
  return (
    <AdminContext dataProvider={dataProvider}>
      <Story />
    </AdminContext>
  )
}

const preview: Preview = {

  loaders: [mswLoader], 

  decorators: [withAdminContext, withMuiTheme],

  parameters: {
    // Default backgrounds matching MUI light/dark
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'grey',  value: '#f5f5f5' },
        { name: 'dark',  value: '#121212' },
      ],
    },

    // Expand controls panel by default
    controls: {
      expanded: true,
      matchers: {
        color: /(background|color)$/i,
        date:  /Date$/i,
      },
    },

    // Default viewport
    viewport: {
      defaultViewport: 'responsive',
    },

    actions: { argTypesRegex: '^on[A-Z].*' },
  },
}

export default preview
