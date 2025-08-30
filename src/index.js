// src/index.js
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import Login from './adapters/ui/Login';
import Dashboard from './adapters/ui/Dashboard';

const App = () => {
  const [seedPhrase, setSeedPhrase] = useState('');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {!seedPhrase ? (
        <Login setSeedPhrase={setSeedPhrase} />
      ) : (
        <Dashboard seedPhrase={seedPhrase} />
      )}
    </ThemeProvider>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
