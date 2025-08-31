import React, { useMemo, useRef, useState } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, InputAdornment,
  IconButton, Button, Stack, Alert, Divider, Tooltip
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ShieldIcon from '@mui/icons-material/Shield';
import { authenticateUser } from '../../application/services/authService';
import { useNavigate } from 'react-router-dom';
  

// --- Componente de PIN de 6 dígitos ---
function PinInput({ value, onChange, error }) {
  const length = 6;
  const refs = useRef(Array.from({ length }, () => React.createRef()));

  const handleChange = (idx, char) => {
    // solo dígitos
    const digit = char.replace(/\D/g, '').slice(0, 1);
    const next = value.split('');
    next[idx] = digit || '';
    const joined = next.join('');
    onChange(joined);

    // avanzar si hay dígito
    if (digit && idx < length - 1) {
      refs.current[idx + 1]?.current?.focus();
    }
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !value[idx] && idx > 0) {
      // retroceder si vacío
      refs.current[idx - 1]?.current?.focus();
    }
  };

  return (
    <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 1, mb: 1 }}>
      {Array.from({ length }).map((_, i) => (
        <TextField
          key={i}
          inputRef={refs.current[i]}
          value={value[i] ?? ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          inputProps={{
            inputMode: 'numeric',
            maxLength: 1,
            style: { textAlign: 'center', fontSize: 20, width: 40 },
          }}
          error={Boolean(error)}
          variant="outlined"
          size="small"
        />
      ))}
    </Stack>
  );
}

export default function Login() {
  // quita setSeedPhrase aquí; ahora navegamos a /seed
  const [pin, setPin] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  const pinError = useMemo(() => (pin.length !== 6 ? 'El PIN debe tener 6 dígitos' : ''), [pin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');

    if (pin.length !== 6) return setErr('El PIN debe tener 6 dígitos.');
    if (!password) return setErr('Ingresa tu contraseña.');

    try {
      setSubmitting(true);
      // credenciales de demo: 123456 / password123
      //authenticateUser(pin, password, '123456', 'password123');
      navigate('/seed'); // ← aquí vamos a la pantalla de frase semilla
    } catch (error) {
      setErr(error?.message || 'Credenciales inválidas.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        // Gradiente llamativo
        background:
          'radial-gradient(1200px 600px at 10% 10%, #1F2937 0%, transparent 50%), linear-gradient(135deg, #0B1020 0%, #1E1B4B 40%, #0EA5E9 100%)',
        display: 'grid',
        placeItems: 'center',
        p: 2,
      }}
    >
      <Card
        elevation={10}
        sx={{
          width: '100%',
          maxWidth: 430,
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Encabezado */}
          <Stack alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '18px',
                display: 'grid',
                placeItems: 'center',
                background:
                  'linear-gradient(135deg, rgba(124,58,237,1) 0%, rgba(6,182,212,1) 100%)',
                boxShadow: '0 8px 30px rgba(124,58,237,0.45)',
              }}
            >
              <ShieldIcon sx={{ color: '#fff', fontSize: 32 }} />
            </Box>
            <Typography variant="h4" sx={{ color: 'white' }}>
              Acceso seguro
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
              Ingresa tu PIN de 6 dígitos y tu contraseña para continuar.
            </Typography>
          </Stack>

          {err && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {err}
            </Alert>
          )}

          {/* Formulario */}
          <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5 }}>
              PIN (6 dígitos)
            </Typography>
            <PinInput value={pin} onChange={setPin} error={pinError} />

            <Typography variant="subtitle2" sx={{ color: 'text.secondary', mt: 2, mb: 0.5 }}>
              Contraseña
            </Typography>
            <TextField
              fullWidth
              placeholder="Tu contraseña"
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPw((s) => !s)}
                      edge="end"
                      aria-label="mostrar u ocultar contraseña"
                    >
                      {showPw ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              size="large"
              variant="contained"
              disabled={submitting}
              sx={{
                mt: 3,
                py: 1.2,
                background:
                  'linear-gradient(90deg, rgba(124,58,237,1) 0%, rgba(6,182,212,1) 100%)',
                boxShadow: '0 10px 30px rgba(14,165,233,0.35)',
                ':hover': {
                  boxShadow: '0 12px 34px rgba(14,165,233,0.45)',
                },
              }}
            >
              {submitting ? 'Verificando...' : 'Acceder'}
            </Button>
          </Box>

          <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />

          <Stack direction="row" justifyContent="space-between" sx={{ color: 'text.secondary' }}>
            <Tooltip title="(Demo) Usuario nuevo se configurará luego">
              <Typography variant="body2" sx={{ cursor: 'default' }}>
                ¿No tienes cuenta?
              </Typography>
            </Tooltip>
            <Typography
              variant="body2"
              sx={{ color: 'secondary.main', cursor: 'pointer' }}
              onClick={() => alert('Recuperación pendiente (demo).')}
            >
              ¿Olvidaste tu contraseña?
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
