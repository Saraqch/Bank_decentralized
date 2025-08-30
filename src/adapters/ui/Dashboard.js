import React, { useState } from 'react';

const Dashboard = ({ seedPhrase }) => {
  const [balance, setBalance] = useState(1000);  // Simulación de saldo
  const [btc, setBtc] = useState(0.5);           // Simulación de saldo en Bitcoin
  const [eth, setEth] = useState(2);             // Simulación de saldo en Ethereum

  return (
    <div>
      <h2>Bienvenido a tu Billetera</h2>
      <p>Frase semilla: {seedPhrase}</p>
      <p>Saldo disponible: {balance} USD</p>
      <div>
        <h3>Criptomonedas</h3>
        <p>Bitcoin (BTC): {btc} BTC</p>
        <p>Ethereum (ETH): {eth} ETH</p>
      </div>
    </div>
  );
};

export default Dashboard;
