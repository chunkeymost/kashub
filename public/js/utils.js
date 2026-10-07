export const fmt = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

export const fmtNum = n => fmt.format(Math.round(n || 0));

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const escapeHtml = s =>
  (s || '').replace(/[&<>"']/g, c => ({
    '&': '&',
    '<': '<',
    '>': '>',
    '"': '"',
    "'": '''
  }[c]));

export const monthNames = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember'
];

export function showToast(msg, duration = 3000) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 300);
  }, duration);
}

export function getPreferredTheme() {
  const saved = localStorage.getItem('theme');
  if (saved) return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const icon = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  const toggles = document.querySelectorAll('#themeToggle, #themeToggleAuth');
  toggles.forEach(el => el.innerHTML = icon);
  localStorage.setItem('theme', theme);
}

export function initTheme() {
  setTheme(getPreferredTheme());
  document.addEventListener('click', e => {
    if (e.target.closest('#themeToggle') || e.target.closest('#themeToggleAuth')) {
      const current = document.documentElement.getAttribute('data-theme');
      setTheme(current === 'dark' ? 'light' : 'dark');
    }
  });
}

export function populateFilterDropdowns(transactions, filterMonth, filterYear, onChange) {
  const monthEl = document.getElementById('filterMonth');
  const yearEl = document.getElementById('filterYear');
  if (!monthEl || !yearEl) return;

  monthEl.innerHTML = monthNames.map((m, i) =>
    `<option value="${i+1}"${(i+1)===filterMonth?' selected':''}>${m}</option>`
  ).join('');

  const years = new Set([new Date().getFullYear()]);
  transactions.forEach(t => { if (t.date) years.add(Number(t.date.slice(0, 4))); });
  const sortedYears = [...years].sort((a, b) => b - a);
  yearEl.innerHTML = sortedYears.map(y =>
    `<option value="${y}"${y===filterYear?' selected':''}>${y}</option>`
  ).join('');

  monthEl.onchange = () => { filterMonth = Number(monthEl.value); onChange(); };
  yearEl.onchange = () => { filterYear = Number(yearEl.value); onChange(); };
}

export function formatDate(iso) {
  if (!iso) return '-';
  return new Date(iso + 'T00:00:00').toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

export function typeLabel(t) {
  return t === 'income' ? 'Pemasukan' : t === 'expense' ? 'Pengeluaran' : 'Tabungan';
}

export function rowHtml(withDelete) {
  return t => {
    const catNote = t.note
      ? `${escapeHtml(t.category)} — <span style="color:var(--ink-faint)">${escapeHtml(t.note)}</span>`
      : escapeHtml(t.category);
    const evThumb = t.evidence
      ? `<img class="tx-evidence-thumb" src="${t.evidence}" data-showevidence="${t.id}" title="Lihat bukti">`
      : '';
    const sign = t.type === 'income' ? '+' : '-';
    return `<tr>
      <td data-label="Tanggal">${formatDate(t.date)}</td>
      <td data-label="Jenis"><span class="type-tag ${t.type}">${typeLabel(t.type)}</span></td>
      <td data-label="Kategori">${catNote}${evThumb}</td>
      <td data-label="Jumlah" class="amt-col">${sign} ${fmtNum(t.amount)}</td>
      ${withDelete ? `<td class="action-col"><button class="edit-btn" data-edit="${t.id}" title="Edit">✎</button><button class="del-btn" data-del="${t.id}" title="Hapus">✕</button></td>` : ''}
    </tr>`;
  };
}

export function monthsBetween(fromISO, toISO) {
  if (!toISO) return 1;
  const from = new Date(fromISO + 'T00:00:00');
  const to = new Date(toISO + 'T00:00:00');
  let months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  if (to.getDate() > from.getDate()) months += 1;
  return Math.max(months, 1);
}

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function compressImage(base64, maxWidth) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      if (width > maxWidth) {
        height = height * (maxWidth / width);
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.src = base64;
  });
}