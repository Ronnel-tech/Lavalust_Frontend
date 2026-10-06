import { useState } from 'react';
import { login, register, errorMessage } from '../api.js';

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setNotice(''); setBusy(true);
    try {
      if (mode === 'register') {
        await register(form);
        setNotice('Account created. You Can now Log in.');
        setMode('login');
      } else {
        onLogin(await login(form.username, form.password));
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-visual">
        <div className="brand"><div className="brand-mark">P</div><div><div className="brand-name">Pallet &amp; Pine</div><div className="brand-caption">Stockroom</div></div></div>
        <div className="auth-message">
          <div className="auth-kicker">Product management system</div>
          <h1>Good stock.<br />Good business.</h1>
          <p>Your product catalog, quantities, and stock value together in one calm workspace.</p>
        </div>
        <div className="auth-footer">INVENTORY CONTROL · BUILT FOR YOUR TEAM</div>
      </section>
      <section className="auth-panel">
        <div className="auth-form-wrap">
          <div className="eyebrow">Stockroom access</div>
          <h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
          <p className="auth-intro">{mode === 'login' ? 'Sign in to view and manage your product catalog.' : 'Register for a viewer account to access the catalog.'}</p>
          <div className="auth-switch" role="tablist" aria-label="Account access">
            <button type="button" className={mode === 'login' ? 'active' : ''} role="tab" aria-selected={mode === 'login'} onClick={() => { setError(''); setNotice(''); setMode('login'); }}>Sign in</button>
            <button type="button" className={mode === 'register' ? 'active' : ''} role="tab" aria-selected={mode === 'register'} onClick={() => { setError(''); setNotice(''); setMode('register'); }}>Register</button>
          </div>
          {error && <div className="alert error" role="alert">{error}</div>}
          {notice && <div className="alert success" role="status">{notice}</div>}
          <form className="auth-form" onSubmit={submit}>
            <label>Username<input value={form.username} onChange={set('username')} required autoFocus /></label>
            {mode === 'register' && <label>Email address<input type="email" value={form.email} onChange={set('email')} required /></label>}
            <label>Password<input type="password" value={form.password} onChange={set('password')} required minLength={6} /></label>
            <button className="auth-submit" disabled={busy}>{busy ? 'Please wait...' : mode === 'login' ? 'Sign in to stockroom' : 'Create viewer account'}</button>
          </form>
          <p className="auth-footnote">{mode === 'register' ? 'New accounts have view-only access.' : 'Need an account? '} {mode === 'login' && <a href="#register" onClick={(event) => { event.preventDefault(); setError(''); setMode('register'); }}>Register here</a>}</p>
        </div>
      </section>
    </main>
  );
}
