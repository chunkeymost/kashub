import { supabase } from '../supabase.js';
import { showToast, initTheme } from './utils.js';

let currentUser = null;
let isLoginMode = true;

export async function checkUser(onAuth, onUnauth) {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) console.error('getSession error:', error);
    if (session && session.user) {
      currentUser = session.user;
      onAuth(currentUser);
    } else {
      onUnauth();
    }
  } catch (e) {
    console.error('checkUser failed:', e);
    onUnauth();
  }
}

export function showAuth() {
  document.getElementById('authScreen').style.display = '';
  document.getElementById('loadingScreen').style.display = 'none';
  document.getElementById('appScreen').style.display = 'none';
  setAuthMode(true);
}

export function showApp(user) {
  currentUser = user;
  document.getElementById('authScreen').style.display = 'none';
  document.getElementById('loadingScreen').style.display = 'none';
  document.getElementById('appScreen').style.display = '';
  document.getElementById('userEmail').textContent = user.email;
}

export function showLoading() {
  document.getElementById('authScreen').style.display = 'none';
  document.getElementById('loadingScreen').style.display = '';
  document.getElementById('appScreen').style.display = 'none';
}

export function setAuthMode(login) {
  isLoginMode = login;
  document.getElementById('authTitle').textContent = login ? 'Masuk' : 'Daftar';
  document.getElementById('authSubtitle').textContent = login ? 'Selamat datang kembali.' : 'Buat akun baru untuk mulai.';
  document.getElementById('authSubmitBtn').textContent = login ? 'Masuk' : 'Daftar';
  document.getElementById('authToggleText').textContent = login ? 'Belum punya akun? ' : 'Sudah punya akun? ';
  document.getElementById('authToggleLink').textContent = login ? 'Daftar' : 'Masuk';
  document.getElementById('nameField').style.display = login ? 'none' : 'block';
  document.getElementById('authError').style.display = 'none';
  document.getElementById('authForm').reset();
}

export function initAuth(onLoginSuccess) {
  initTheme();

  document.getElementById('authToggleLink').addEventListener('click', () => {
    setAuthMode(!isLoginMode);
  });

  document.getElementById('authForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('authEmail').value.trim();
    const password = document.getElementById('authPassword').value;
    const errEl = document.getElementById('authError');

    errEl.style.background = '';
    errEl.style.color = '';

    if (isLoginMode) {
      console.log('Attempting login with:', email);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      console.log('Login result:', { data, error });
      if (error) {
        errEl.textContent = error.message === 'Invalid login credentials' ? 'Email atau password salah.' : error.message;
        errEl.style.display = '';
        return;
      }
      currentUser = data.user;
      onLoginSuccess(data.user);
    } else {
      const name = document.getElementById('authName').value.trim();
      console.log('Attempting signup with:', email, name);
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
      console.log('Signup result:', { data, error });
      if (error) {
        console.log('SIGNUP ERROR:', error.message);
        errEl.textContent = 'Gagal daftar: ' + error.message;
        errEl.style.display = '';
        return;
      }
      if (data.user && !data.session) {
        console.log('SIGNUP OK - no session, show alert');
        alert('Akun berhasil dibuat! Silakan cek email untuk verifikasi, lalu masuk.');
        setAuthMode(true);
      } else if (data.session) {
        console.log('SIGNUP OK - session exists, auto login');
        currentUser = data.user;
        showAuth();
        showToast('Akun berhasil dibuat! Selamat datang, ' + (data.user.user_metadata && data.user.user_metadata.name ? data.user.user_metadata.name : '') + '!');
        setTimeout(() => onLoginSuccess(data.user), 2000);
      } else {
        console.log('SIGNUP - unexpected state:', data);
        errEl.textContent = 'Terjadi kesalahan tidak terduga.';
        errEl.style.display = '';
      }
    }
  });

  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await supabase.auth.signOut();
    currentUser = null;
    window.location.href = 'auth.html';
  });

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
      currentUser = session.user;
    } else if (event === 'SIGNED_OUT') {
      currentUser = null;
    }
  });
}

export function getCurrentUser() {
  return currentUser;
}