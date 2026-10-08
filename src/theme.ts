import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  direction: 'rtl',
  palette: {
    mode: 'light',
    primary: { main: '#008f88', dark: '#087b79', contrastText: '#ffffff' },
    secondary: { main: '#102c42' },
    background: { default: '#f3f8f7', paper: '#ffffff' },
    text: { primary: '#102c42', secondary: '#607782' },
    divider: '#dce9e7',
  },
  typography: {
    fontFamily: 'Tahoma, "Segoe UI", sans-serif',
    button: { fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
})