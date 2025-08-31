import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  shape: { borderRadius: 14 },
  palette: {
    mode: 'light',
    primary: { main: '#7C3AED' },    // morado vibrante
    secondary: { main: '#06B6D4' },  // cian
    success: { main: '#22C55E' },
    error: { main: '#EF4444' },
    background: {
      default: '#0B1020',            // fondo oscuro para el gradiente
      paper: '#0F172A'
    },
    text: {
      primary: '#E5E7EB',
      secondary: '#94A3B8'
    }
  },
  typography: {
    fontFamily: 'Roboto, Inter, system-ui, -apple-system, Segoe UI, Arial, sans-serif',
    h4: { fontWeight: 700, letterSpacing: 0.2 },
    button: { textTransform: 'none', fontWeight: 600 }
  },
});

export default theme;
