import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CacheProvider } from '@emotion/react'
import createCache from '@emotion/cache'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { SnackbarProvider } from 'notistack'
import { BrowserRouter } from 'react-router-dom'
import { prefixer } from 'stylis'
import rtlPlugin from 'stylis-plugin-rtl'
import App from './App.tsx'
import { AuthProvider } from './features/auth/AuthProvider'
import { theme } from './theme'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
})
const cacheRtl = createCache({ key: 'mui-rtl', stylisPlugins: [prefixer, rtlPlugin] })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
              <AuthProvider><App /></AuthProvider>
            </SnackbarProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </ThemeProvider>
    </CacheProvider>
  </StrictMode>,
)
