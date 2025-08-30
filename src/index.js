// src/index.js
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './adapters/ui/Login';
import Dashboard from './adapters/ui/Dashboard';
import SeedReveal from './adapters/ui/SeedReveal';

const App = () => {
  const [seedPhrase, setSeedPhrase] = useState('');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/seed"
            element={<SeedReveal seedPhrase={seedPhrase} setSeedPhrase={setSeedPhrase} />}
          />
          <Route
            path="/dashboard"
            element={<Dashboard seedPhrase={seedPhrase} />}
          />
          {/* (opcional) 404 */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

createRoot(document.getElementById('root')).render(<App />);
