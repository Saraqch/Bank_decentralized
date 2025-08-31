import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Stack, Button, Chip,
  IconButton, Tooltip, Alert, Divider, Checkbox, FormControlLabel
} from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LanIcon from '@mui/icons-material/Lan';

import { createMnemonic } from '../../domain/seedPhrase';
import { getLatestBlock } from '../api/blockchain';
import { useNavigate } from 'react-router-dom';

export default function SeedReveal({ seedPhrase, setSeedPhrase }) {
  const [show, setShow] = useState(false);
  const [ack, setAck] = useState(false);
  const [copyOk, setCopyOk] = useState(false);
  const [netInfo, setNetInfo] = useState(null);
  const [netErr, setNetErr] = useState('');

  const navigate = useNavigate();

  // Si no hay phrase, se genera aquí (una sola vez).
  useEffect(() => {
    if (!seedPhrase) {
      const phrase = createMnemonic();
      setSeedPhrase(phrase);
    }
  }, [seedPhrase, setSeedPhrase]);

  const words = useMemo(() => (seedPhrase ? seedPhrase.split(' ') : []), [seedPhrase]);

  const copyToClipboard = async () => {
    if (!seedPhrase) return;
    try {
      await navigator.clipboard.writeText(seedPhrase);
      setCopyOk(true);
      setTimeout(() => setCopyOk(false), 2000);
    } catch {
      // Silencioso: algunos navegadores bloquean sin HTTPS
    }
  };

  const testNetwork = async () => {
    setNetErr('');
    try {
      const b = await getLatestBlock();
      setNetInfo({ number: b?.number, hash: b?.hash?.slice(0, 16) + '…' });
    } catch (e) {
      setNetErr('No se pudo conectar a la red. Revisa tu REACT_APP_ALCHEMY_URL.');
    }
  };

  const continueToDashboard = () => {
    navigate('/seed/confirm'); // ← ahora vamos a la confirmación
    };

  return (
    <Box
      sx={{
        minHeight: '100vh',
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
          maxWidth: 720,
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Stack alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <Box
              sx={{
                width: 64, height: 64, borderRadius: '18px',
                display: 'grid', placeItems: 'center',
                background: 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)',
                boxShadow: '0 8px 30px rgba(124,58,237,0.45)',
              }}
            >
              <ShieldIcon sx={{ color: '#fff', fontSize: 32 }} />
            </Box>
            <Typography variant="h4" sx={{ color: 'white' }}>
              Tu frase semilla
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
              Escríbela en papel y guárdala fuera de línea. Nunca la compartas.
            </Typography>
          </Stack>

          {!seedPhrase && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Generando frase semilla…
            </Alert>
          )}

          {/* Grid de palabras */}
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1.2, mb: 2, justifyContent: 'center' }}>
            {words.map((w, i) => (
              <Chip
                key={i}
                label={show ? `${i + 1}. ${w}` : `${i + 1}. •••••`}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.12)',
                  background: 'rgba(255,255,255,0.06)',
                }}
                variant="outlined"
              />
            ))}
          </Stack>

          <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 2 }}>
            <Tooltip title={show ? 'Ocultar' : 'Mostrar'}>
              <IconButton onClick={() => setShow((s) => !s)} sx={{ color: 'white' }}>
                {show ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Copiar (temporal, no recomendado en prod)">
              <IconButton onClick={copyToClipboard} sx={{ color: 'white' }}>
                <ContentCopyIcon />
              </IconButton>
            </Tooltip>
            {copyOk && (
              <Chip
                icon={<CheckCircleIcon />}
                label="Copiado"
                color="success"
                variant="filled"
                size="small"
              />
            )}
          </Stack>

          <Alert severity="warning" sx={{ mb: 2 }}>
            No tomes capturas de pantalla. No la pegues en apps o correos. Escríbela a mano.
          </Alert>

          <FormControlLabel
            control={<Checkbox checked={ack} onChange={(e) => setAck(e.target.checked)} />}
            label="Confirmo que he guardado mi frase semilla en un lugar seguro"
            sx={{ color: 'text.secondary', mb: 2 }}
          />

          <Button
            variant="contained"
            disabled={!ack || !seedPhrase}
            onClick={continueToDashboard}
            fullWidth
            sx={{
              py: 1.2,
              background: 'linear-gradient(90deg, #7C3AED 0%, #06B6D4 100%)',
              boxShadow: '0 10px 30px rgba(14,165,233,0.35)',
            }}
          >
            Continuar
          </Button>

          <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />

          {/* Bloque opcional para probar provider */}
          <Stack spacing={1} alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.secondary' }}>
              <LanIcon />
              <Typography variant="body2">Probar conexión a Sepolia</Typography>
            </Stack>
            <Button variant="outlined" onClick={testNetwork} sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}>
              Obtener último bloque
            </Button>
            {netInfo && (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Bloque: {netInfo.number} — {netInfo.hash}
              </Typography>
            )}
            {netErr && <Alert severity="error">{netErr}</Alert>}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
