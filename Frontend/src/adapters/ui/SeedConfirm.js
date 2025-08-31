// src/adapters/ui/SeedConfirm.js
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Stack, Button, Alert, Divider, Chip
} from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import { useNavigate } from 'react-router-dom';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickDistinctIndices(total, count) {
  const set = new Set();
  while (set.size < count) {
    set.add(Math.floor(Math.random() * total));
  }
  return Array.from(set).sort((a, b) => a - b);
}

function buildQuiz(words, howMany = 3, optionsPerQuestion = 4) {
  // Selecciona 'howMany' posiciones únicas a preguntar
  const indices = pickDistinctIndices(words.length, howMany);

  // Para cada índice, arma opciones (1 correcta + distractores) tomadas del resto de palabras
  const questions = indices.map((idx) => {
    const correct = words[idx];

    // Distractores: muestrea del resto de palabras de la misma seed (suficiente para demo)
    const pool = words.filter((_, i) => i !== idx);
    const distractors = shuffle(pool).slice(0, Math.max(0, optionsPerQuestion - 1));

    const options = shuffle([correct, ...distractors]);
    return { position: idx + 1, correct, options, idx };
  });

  return questions;
}

export default function SeedConfirm({ seedPhrase }) {
  const navigate = useNavigate();
  const words = useMemo(() => (seedPhrase ? seedPhrase.split(' ') : []), [seedPhrase]);

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // idx -> selected word
  const [error, setError] = useState('');

  // Si no hay seed, vuelve a /seed
  useEffect(() => {
    if (!seedPhrase) navigate('/seed', { replace: true });
  }, [seedPhrase, navigate]);

  const regenerate = useCallback(() => {
    if (!words.length) return;
    setQuestions(buildQuiz(words, 3, 4));
    setAnswers({});
    setError('');
  }, [words]);

  // Genera las preguntas al montar
  useEffect(() => {
    regenerate();
  }, [regenerate]);

  const allAnswered = useMemo(() => {
    if (!questions.length) return false;
    return questions.every(q => answers[q.idx]);
  }, [questions, answers]);

  const handleChoose = (qIdx, value) => {
    setAnswers(prev => ({ ...prev, [qIdx]: value }));
  };

  const handleConfirm = () => {
    setError('');
    const allCorrect = questions.every(q => answers[q.idx] === q.correct);
    if (allCorrect) {
      // En un flujo real, aquí marcarías al usuario como "seed confirmada"
      navigate('/dashboard');
    } else {
      setError('Alguna respuesta es incorrecta. Revisa y vuelve a intentar.');
    }
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
          maxWidth: 800,
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
              Confirmar frase semilla
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
              Selecciona la palabra correcta para cada posición. Así confirmamos que la guardaste.
            </Typography>
          </Stack>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Stack spacing={3} sx={{ mb: 3 }}>
            {questions.map((q, i) => (
              <Box key={q.idx} sx={{ p: 2, borderRadius: 2, background: 'rgba(255,255,255,0.04)' }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <Chip
                    label={`Palabra #${q.position}`}
                    sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.12)' }}
                    variant="outlined"
                  />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Elige la opción correcta:
                  </Typography>
                </Stack>

                <ToggleButtonGroup
                  exclusive
                  value={answers[q.idx] || null}
                  onChange={(_, val) => val && handleChoose(q.idx, val)}
                  sx={{ flexWrap: 'wrap', gap: 1 }}
                >
                  {q.options.map((opt) => (
                    <ToggleButton
                      key={opt + q.idx}
                      value={opt}
                      sx={{
                        color: 'white',
                        borderColor: 'rgba(255,255,255,0.18)',
                        background: 'rgba(255,255,255,0.06)',
                        '&.Mui-selected': {
                          background: 'linear-gradient(90deg, #7C3AED 0%, #06B6D4 100%)',
                          color: '#fff',
                          borderColor: 'transparent',
                        },
                      }}
                    >
                      {opt}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Box>
            ))}
          </Stack>

          <Stack direction="row" spacing={2} justifyContent="space-between">
            <Button
              variant="outlined"
              onClick={regenerate}
              sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
            >
              Otra combinación
            </Button>

            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                onClick={() => navigate('/seed')}
                sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
              >
                Volver
              </Button>
              <Button
                variant="contained"
                disabled={!allAnswered}
                onClick={handleConfirm}
                sx={{
                  background: 'linear-gradient(90deg, #7C3AED 0%, #06B6D4 100%)',
                  boxShadow: '0 10px 30px rgba(14,165,233,0.35)',
                }}
              >
                Confirmar
              </Button>
            </Stack>
          </Stack>

          <Divider sx={{ mt: 3, borderColor: 'rgba(255,255,255,0.1)' }} />
        </CardContent>
      </Card>
    </Box>
  );
}
