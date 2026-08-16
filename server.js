const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const pool = require('./db');
const path = require('path');

const app = express();
const PORT = 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Terlalu banyak request, coba lagi nanti'
});
app.use('/api/', limiter);

// Stricter rate limit for destructive endpoints
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 requests per hour
  message: 'Terlalu banyak request reset, coba lagi nanti'
});

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname)));

// ========== TRANSACTIONS ==========

app.get('/api/transactions', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, date, type, category, amount, note, plan_id AS planId, evidence FROM transactions ORDER BY date DESC, id DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil transaksi' });
  }
});

app.post('/api/transactions', async (req, res) => {
  try {
    const { id, date, type, category, amount, note, planId, evidence } = req.body;
    await pool.query(
      'INSERT INTO transactions (id, date, type, category, amount, note, plan_id, evidence) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, date, type, category, amount, note || null, planId || null, evidence || null]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menyimpan transaksi' });
  }
});

app.put('/api/transactions/:id', async (req, res) => {
  try {
    const { date, type, category, amount, note, evidence } = req.body;
    await pool.query(
      'UPDATE transactions SET date=?, type=?, category=?, amount=?, note=?, evidence=? WHERE id=?',
      [date, type, category, amount, note || null, evidence || null, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengupdate transaksi' });
  }
});

app.delete('/api/transactions/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM transactions WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menghapus transaksi' });
  }
});

// ========== PLANS ==========

app.get('/api/plans', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, target_amount AS targetAmount, mode, target_date AS targetDate, monthly_fixed AS monthlyFixed, purchase_link AS purchaseLink, evidence, created_at AS createdAt FROM plans ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil rencana' });
  }
});

app.post('/api/plans', async (req, res) => {
  try {
    const { id, name, targetAmount, mode, targetDate, monthlyFixed, createdAt, purchaseLink, evidence } = req.body;
    await pool.query(
      'INSERT INTO plans (id, name, target_amount, mode, target_date, monthly_fixed, purchase_link, evidence, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, targetAmount, mode, targetDate || null, monthlyFixed || 0, purchaseLink || null, evidence || null, createdAt]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menyimpan rencana' });
  }
});

app.delete('/api/plans/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM plans WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menghapus rencana' });
  }
});

app.put('/api/plans/:id', async (req, res) => {
  try {
    const { name, targetAmount, mode, targetDate, monthlyFixed, purchaseLink, evidence } = req.body;
    await pool.query(
      'UPDATE plans SET name=?, target_amount=?, mode=?, target_date=?, monthly_fixed=?, purchase_link=?, evidence=? WHERE id=?',
      [name, targetAmount, mode, targetDate || null, monthlyFixed || 0, purchaseLink || null, evidence || null, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengupdate rencana' });
  }
});

// ========== CONTRIBUTION (setoran ke rencana) ==========

app.post('/api/plans/:id/contrib', async (req, res) => {
  try {
    const { id, date, amount, planName, evidence } = req.body;
    const planId = Number(req.params.id);
    await pool.query(
      'INSERT INTO transactions (id, date, type, category, amount, note, plan_id, evidence) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, date, 'saving', 'Tabungan: ' + planName, amount, '', planId, evidence || null]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menyimpan setoran' });
  }
});

// ========== RESET ==========

// Simple token-based auth for destructive endpoints
const RESET_TOKEN = process.env.RESET_TOKEN || 'kasku-reset-token-change-me';

app.delete('/api/reset', strictLimiter, async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${RESET_TOKEN}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    await pool.query('DELETE FROM transactions');
    await pool.query('DELETE FROM plans');
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mereset data' });
  }
});

// ========== SERVE INDEX.HTML ==========

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server Kas berjalan di http://localhost:${PORT}`);
});
