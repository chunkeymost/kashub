const express = require('express');
const cors = require('cors');
const pool = require('./db');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ========== TRANSACTIONS ==========

app.get('/api/transactions', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, date, type, category, amount, note, plan_id AS planId FROM transactions ORDER BY date DESC, id DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil transaksi' });
  }
});

app.post('/api/transactions', async (req, res) => {
  try {
    const { id, date, type, category, amount, note, planId } = req.body;
    await pool.query(
      'INSERT INTO transactions (id, date, type, category, amount, note, plan_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, date, type, category, amount, note || null, planId || null]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menyimpan transaksi' });
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
      'SELECT id, name, target_amount AS targetAmount, mode, target_date AS targetDate, monthly_fixed AS monthlyFixed, created_at AS createdAt FROM plans ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal mengambil rencana' });
  }
});

app.post('/api/plans', async (req, res) => {
  try {
    const { id, name, targetAmount, mode, targetDate, monthlyFixed, createdAt } = req.body;
    await pool.query(
      'INSERT INTO plans (id, name, target_amount, mode, target_date, monthly_fixed, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, name, targetAmount, mode, targetDate || null, monthlyFixed || 0, createdAt]
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

// ========== CONTRIBUTION (setoran ke rencana) ==========

app.post('/api/plans/:id/contrib', async (req, res) => {
  try {
    const { id, date, amount, planName } = req.body;
    const planId = Number(req.params.id);
    await pool.query(
      'INSERT INTO transactions (id, date, type, category, amount, note, plan_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, date, 'saving', 'Tabungan: ' + planName, amount, '', planId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal menyimpan setoran' });
  }
});

// ========== RESET ==========

app.delete('/api/reset', async (req, res) => {
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
