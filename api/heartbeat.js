const SUPABASE_URL = 'https://nyafwgihwhjzbdgoozwa.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55YWZ3Z2lod2hqemJkZ29vendhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4MDUwOTIsImV4cCI6MjEwMjM4MTA5Mn0.YJvvCcG5c0hkPvsSLl6-W5WhHIDHxmozD7L0EslWQgA';

export default async function handler(req, res) {
  try {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/transactions?select=id&limit=1`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    if (!resp.ok) throw new Error(`Supabase responded ${resp.status}`);
    res.status(200).json({ ok: true, ts: new Date().toISOString() });
  } catch (err) {
    res.status(200).json({ ok: false, error: err.message });
  }
}
