import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Stack, Button, TextField, Select,
  MenuItem, FormControl, InputLabel, Alert, Divider, Chip, IconButton, Tooltip,
  LinearProgress
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShareIcon from '@mui/icons-material/Share';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PercentIcon from '@mui/icons-material/Percent';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PaidIcon from '@mui/icons-material/Paid';
import useP2PLendingContract from '../../hooks/useP2PLendingContract';
import { useNavigate } from 'react-router-dom';
import { Wallet } from 'ethers';
import { getBalance } from '../api/blockchain';

const RATE_ETH_USD = 3500;  
const formatAddressShort = (addr = '') => (addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '—');
const formatUSD = (n) => `$ ${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const daysUntil = (iso) => Math.ceil((new Date(iso) - new Date()) / (1000 * 60 * 60 * 24));
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const pct = (paid, principal) => clamp(Math.round(((paid || 0) / Math.max(principal || 1, 1)) * 100), 0, 100);

function randomAddr() {
  const chars = 'abcdef0123456789';
  const r = (n) => [...Array(n)].map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `0x${r(8)}...${r(8)}`;
}

export default function Dashboard({ seedPhrase }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!seedPhrase) navigate('/login', { replace: true });
  }, [seedPhrase, navigate]);

  const address = useMemo(() => {
    if (!seedPhrase) return '';
    try {
      return Wallet.fromPhrase(seedPhrase).address;
    } catch {
      return '';
    }
  }, [seedPhrase]);

 const [ethBalance, setEthBalance] = useState('2');
  const [loadingBal, setLoadingBal] = useState(false);
  const usdBalance = useMemo(
    () => (parseFloat(ethBalance || '0') * RATE_ETH_USD).toFixed(2),
    [ethBalance]
  );
  useEffect(() => {
    let timeoutId;
    const run = async () => {
      if (!address) return;
      try {
        setLoadingBal(true);
        const eth = await getBalance(address);
        setEthBalance(eth);
        console.log(eth);
      } catch {
        setEthBalance('0.0');
      } finally {
        setLoadingBal(false);
        // -----------------------------------------------
        timeoutId = setTimeout(run, 10000);
      }
    };
    run();
    return () => clearTimeout(timeoutId);
  }, [address]);

   const [marketOffers] = useState([
    { id: 1, lender: randomAddr(), amountUsd: 300, apr: 10, termDays: 30 },
    { id: 2, lender: randomAddr(), amountUsd: 500, apr: 14, termDays: 60 },
    { id: 3, lender: randomAddr(), amountUsd: 1200, apr: 9, termDays: 90 },
    { id: 4, lender: randomAddr(), amountUsd: 100, apr: 18, termDays: 15 },
  ]);

  // ===== Publicar préstamo (col 2) =====
  const [form, setForm] = useState({ amountUsd: '', apr: '', termDays: 30, note: '' });
  const [publishMsg, setPublishMsg] = useState('');
  const onChangeForm = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const publishLoan = async (e) => {
    e.preventDefault();
    const amount = parseFloat(form.amountUsd);
    const apr = parseFloat(form.apr);
    const p2pLendingContract = useP2PLendingContract();
    if (!(amount > 0)) return setPublishMsg('Ingrese un monto válido.');
    if (!(apr > 0)) return setPublishMsg('Ingrese un interés válido.');
    if (!(form.termDays > 0)) return setPublishMsg('Seleccione un plazo.');

    // Aquí, en la integración real, llamarás a tu contrato para publicar.
    await p2pLendingContract.methods
      .createOffer(amount, apr)
      .send({
        from: address
      })
      .on('transactionHash', (txHash) => {
        setPublishMsg(txHash);
      })
      .on('receipt', () => {
        setPublishMsg('Transaccion exitosa');
      })
      .on('error', (error) => {
        setPublishMsg(`Transaccion erronea ${error.message}`);
      })

    setPublishMsg('Oferta publicada (demo local).');
    setForm({ amountUsd: '', apr: '', termDays: 30, note: '' });
    setTimeout(() => setPublishMsg(''), 2500);
  };

  // ===== Mis Deudores (col 3) — gente que ME debe (yo les presté) =====
  const [debtors] = useState([
    {
      id: 'd1',
      borrower: randomAddr(),
      principalUsd: 400,
      apr: 12,
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 25).toISOString(), // +25 días
      paidUsd: 150,
      note: 'Préstamo para capital de trabajo',
    },
    {
      id: 'd2',
      borrower: randomAddr(),
      principalUsd: 200,
      apr: 15,
      dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // vencido hace 3 días
      paidUsd: 50,
      note: 'Emergencia médica',
    },
  ]);

  // ===== Mis Deudas (col 4) — lo que YO debo a otros =====
  const [myDebts] = useState([
    {
      id: 'm1',
      lender: randomAddr(),
      principalUsd: 350,
      apr: 10,
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12).toISOString(), // +12 días
      repaidUsd: 100,
      note: 'Compra de equipo',
    },
    {
      id: 'm2',
      lender: randomAddr(),
      principalUsd: 150,
      apr: 20,
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(), // +2 días
      repaidUsd: 0,
      note: 'Gastos de viaje',
    },
  ]);

  // ===== acciones generales =====
  const copyAddress = async () => {
    if (!address) return;
    try { await navigator.clipboard.writeText(address); } catch {}
  };
  const shareAddress = async () => {
    if (!address) return;
    if (navigator.share) {
      try { await navigator.share({ title: 'Mi address', text: address }); } catch {}
    } else {
      await copyAddress();
      alert('Address copiada al portapapeles.');
    }
  };

  // ===== tarjetas item reusables =====
  const InfoRow = ({ icon, label, value, muted }) => (
    <Stack direction="row" spacing={1} alignItems="center">
      {icon}
      <Typography sx={{ color: muted ? 'text.secondary' : 'white' }}>{label}{value ? ': ' : ''}</Typography>
      {value && <Typography sx={{ color: 'text.secondary' }}>{value}</Typography>}
    </Stack>
  );

  const StatusChip = ({ daysLeft }) => {
    if (daysLeft < 0) {
      return (
        <Chip
          size="small"
          icon={<WarningAmberIcon />}
          label={`Vencido ${Math.abs(daysLeft)}d`}
          color="error"
          variant="filled"
          sx={{ fontWeight: 600 }}
        />
      );
    }
    if (daysLeft <= 3) {
      return (
        <Chip
          size="small"
          label={`Vence en ${daysLeft}d`}
          color="warning"
          variant="filled"
          sx={{ fontWeight: 600 }}
        />
      );
    }
    return (
      <Chip
        size="small"
        label={`A tiempo (${daysLeft}d)`}
        color="success"
        variant="outlined"
        sx={{ fontWeight: 600 }}
      />
    );
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background:
          'radial-gradient(1200px 600px at 10% 10%, #1F2937 0%, transparent 50%), linear-gradient(135deg, #0B1020 0%, #1E1B4B 40%, #0EA5E9 100%)',
        p: 2,
      }}
    >
      {/* Encabezado: balance + address */}
      <Card
        elevation={10}
        sx={{
          mb: 2,
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <Stack spacing={0.5}>
                <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                  Balance estimado (Sepolia • demo)
                </Typography>
                <Stack direction="row" spacing={1} alignItems="baseline">
                  <Typography variant="h4" sx={{ color: 'white' }}>
                    {loadingBal ? '$ 0.00' : `$ ${usdBalance}`}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    (~ {parseFloat(ethBalance).toFixed(4)} ETH)
                  </Typography>
                </Stack>
              </Stack>
            </Grid>

            <Grid item xs={12} md={5}>
              <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                Tu dirección pública
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  icon={<AccountBalanceWalletIcon />}
                  label={address ? formatAddressShort(address) : '—'}
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.12)',
                    background: 'rgba(255,255,255,0.06)',
                  }}
                  variant="outlined"
                />
                <Tooltip title="Copiar">
                  <IconButton onClick={copyAddress} sx={{ color: 'white' }}>
                    <ContentCopyIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Compartir">
                  <IconButton onClick={shareAddress} sx={{ color: 'white' }}>
                    <ShareIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Grid>

            <Grid item xs={12} md={3}>
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button variant="outlined" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}>
                  Depositar (demo)
                </Button>
                <Button variant="outlined" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}>
                  Retirar (demo)
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* GRID principal: 4 columnas en desktop */}
      <Grid container spacing={2}>
        {/* Col 1: Marketplace */}
        <Grid item xs={12} md={3}>
          <Card
            elevation={10}
            sx={{
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <PaidIcon />
                <Typography variant="h6" sx={{ color: 'white' }}>
                  Marketplace de Préstamos
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Explora ofertas activas de la comunidad. Solicita según tu necesidad.
              </Typography>

              <Stack spacing={1.5}>
                {marketOffers.map((o) => (
                  <Box
                    key={o.id}
                    sx={{
                      p: 1.5, borderRadius: 2,
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack spacing={0.75}>
                        <InfoRow icon={<AttachMoneyIcon fontSize="small" />} label={formatUSD(o.amountUsd)} />
                        <InfoRow icon={<PercentIcon fontSize="small" />} label={`${o.apr}% APR`} muted />
                        <InfoRow icon={<ScheduleIcon fontSize="small" />} label={`${o.termDays} días`} muted />
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Prestamista: {o.lender}
                        </Typography>
                      </Stack>
                      <Button
                        size="small"
                        variant="contained"
                        sx={{ background: 'linear-gradient(90deg, #7C3AED 0%, #06B6D4 100%)' }}
                        onClick={() => alert('Flujo “Solicitar” pendiente (demo).')}
                      >
                        Solicitar
                      </Button>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Col 2: Publicar préstamo */}
        <Grid item xs={12} md={3}>
          <Card
            elevation={10}
            sx={{
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <PeopleAltIcon />
                <Typography variant="h6" sx={{ color: 'white' }}>
                  Publicar préstamo
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Crea tu oferta: define monto, interés y plazo. Los usuarios podrán solicitarla.
              </Typography>

              {publishMsg && (
                <Alert severity={publishMsg.includes('publicada') ? 'success' : 'warning'} sx={{ mb: 2 }}>
                  {publishMsg}
                </Alert>
              )}

              <Box component="form" onSubmit={publishLoan}>
                <Stack spacing={2}>
                  <TextField
                    label="Monto (USD)"
                    name="amountUsd"
                    value={form.amountUsd}
                    onChange={onChangeForm}
                    inputProps={{ inputMode: 'numeric' }}
                    fullWidth
                  />
                  <TextField
                    label="Interés (APR %)"
                    name="apr"
                    value={form.apr}
                    onChange={onChangeForm}
                    inputProps={{ inputMode: 'numeric' }}
                    fullWidth
                  />
                  <FormControl fullWidth>
                    <InputLabel id="term-label">Plazo</InputLabel>
                    <Select
                      labelId="term-label"
                      label="Plazo"
                      name="termDays"
                      value={form.termDays}
                      onChange={onChangeForm}
                    >
                      <MenuItem value={15}>15 días</MenuItem>
                      <MenuItem value={30}>30 días</MenuItem>
                      <MenuItem value={60}>60 días</MenuItem>
                      <MenuItem value={90}>90 días</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label="Nota (opcional)"
                    name="note"
                    value={form.note}
                    onChange={onChangeForm}
                    fullWidth
                    multiline
                    minRows={2}
                  />

                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                      type="submit"
                      variant="contained"
                      sx={{
                        background: 'linear-gradient(90deg, #7C3AED 0%, #06B6D4 100%)',
                        boxShadow: '0 10px 30px rgba(14,165,233,0.35)',
                      }}
                    >
                      Publicar
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Col 3: Mis Deudores (yo presté; me deben) */}
        <Grid item xs={12} md={3}>
          <Card
            elevation={10}
            sx={{
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <PaidIcon />
                <Typography variant="h6" sx={{ color: 'white' }}>
                  Mis Deudores
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Usuarios a quienes prestaste. Controla progreso de pago y vencimientos.
              </Typography>

              {!debtors.length && <Alert severity="info">No tienes deudores registrados.</Alert>}

              <Stack spacing={1.5}>
                {debtors.map((d) => {
                  const left = daysUntil(d.dueDate);
                  const progress = pct(d.paidUsd, d.principalUsd);
                  return (
                    <Box
                      key={d.id}
                      sx={{
                        p: 1.5, borderRadius: 2,
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Stack spacing={0.75}>
                          <InfoRow icon={<AttachMoneyIcon fontSize="small" />} label={formatUSD(d.principalUsd)} />
                          <InfoRow icon={<PercentIcon fontSize="small" />} label={`${d.apr}% APR`} muted />
                          <InfoRow icon={<ScheduleIcon fontSize="small" />} label="Vencimiento" value={new Date(d.dueDate).toLocaleDateString()} />
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Deudor: {formatAddressShort(d.borrower)}
                          </Typography>
                          {d.note && (
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              Nota: {d.note}
                            </Typography>
                          )}
                        </Stack>
                        <StatusChip daysLeft={left} />
                      </Stack>

                      <Stack spacing={0.5} sx={{ mt: 1 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Pagado: {formatUSD(d.paidUsd)} / {formatUSD(d.principalUsd)} ({progress}%)
                        </Typography>
                        <LinearProgress variant="determinate" value={progress} />
                      </Stack>

                      <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
                          onClick={() => alert('Recordatorio enviado (demo).')}
                        >
                          Recordar pago
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
                          onClick={() => alert('Ver contrato (demo).')}
                        >
                          Ver contrato
                        </Button>
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Col 4: Mis Deudas (yo debo a otros) */}
        <Grid item xs={12} md={3}>
          <Card
            elevation={10}
            sx={{
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <WarningAmberIcon />
                <Typography variant="h6" sx={{ color: 'white' }}>
                  Mis Deudas
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Préstamos que asumiste. Organiza tus pagos y evita atrasos.
              </Typography>

              {!myDebts.length && <Alert severity="info">No registras deudas activas.</Alert>}

              <Stack spacing={1.5}>
                {myDebts.map((m) => {
                  const left = daysUntil(m.dueDate);
                  const progress = pct(m.repaidUsd, m.principalUsd);
                  return (
                    <Box
                      key={m.id}
                      sx={{
                        p: 1.5, borderRadius: 2,
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Stack spacing={0.75}>
                          <InfoRow icon={<AttachMoneyIcon fontSize="small" />} label={formatUSD(m.principalUsd)} />
                          <InfoRow icon={<PercentIcon fontSize="small" />} label={`${m.apr}% APR`} muted />
                          <InfoRow icon={<ScheduleIcon fontSize="small" />} label="Vencimiento" value={new Date(m.dueDate).toLocaleDateString()} />
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Acreedor: {formatAddressShort(m.lender)}
                          </Typography>
                          {m.note && (
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              Nota: {m.note}
                            </Typography>
                          )}
                        </Stack>
                        <StatusChip daysLeft={left} />
                      </Stack>

                      <Stack spacing={0.5} sx={{ mt: 1 }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Pagado: {formatUSD(m.repaidUsd)} / {formatUSD(m.principalUsd)} ({progress}%)
                        </Typography>
                        <LinearProgress variant="determinate" value={progress} />
                      </Stack>

                      <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
                          onClick={() => alert('Pagar ahora (demo).')}
                        >
                          Pagar ahora
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
                          onClick={() => alert('Ver detalles (demo).')}
                        >
                          Ver detalles
                        </Button>
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        * Interfaz de demostración (sin contrato). Balance en Sepolia y conversión a USD estimada.
      </Typography>
    </Box>
  );
}
