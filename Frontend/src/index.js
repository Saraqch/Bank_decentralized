// src/index.js
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './adapters/ui/Login';
import SeedReveal from './adapters/ui/SeedReveal';
import SeedConfirm from './adapters/ui/SeedConfirm';  // ← NUEVO
import Dashboard from './adapters/ui/Dashboard';

const App = () => {
  const [seedPhrase, setSeedPhrase] = useState('');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/seed" element={<SeedReveal seedPhrase={seedPhrase} setSeedPhrase={setSeedPhrase} />} />
          <Route path="/seed/confirm" element={<SeedConfirm seedPhrase={seedPhrase} />} /> {/* ← NUEVA */}
          <Route path="/dashboard" element={<Dashboard seedPhrase={seedPhrase} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

createRoot(document.getElementById('root')).render(<App />);
