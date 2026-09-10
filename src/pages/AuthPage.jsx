import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBanner } from '../hooks/useBanner';
import Banner from '../components/Banner';
import { API_BASE_URL } from '../api';

export default function AuthPage() {
  const { token, user, login } = useAuth();
  const navigate = useNavigate();
  const { banner, showBanner } = useBanner();

  const [tab, setTab] = useState('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  // Already have a session? Skip the form entirely, same as the old
  // vanilla auth.js's top-of-file check.
  if (token && user) {
    return <Navigate to="/" replace />;
  }

  async function handleRegister(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registerEmail.trim(), password: registerPassword }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error?.message || 'Registration failed');

      showBanner(
        `Account created for ${body.data.email}. Check your email for an activation link before logging in.`,
        'success',
      );
      setLoginEmail(registerEmail.trim());
      setRegisterEmail('');
      setRegisterPassword('');
      setTab('login');
    } catch (err) {
      showBanner(err.message, 'error');
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error?.message || 'Login failed');

      login(body.data.token, body.data.user);
      navigate('/', { replace: true });
    } catch (err) {
      showBanner(err.message, 'error');
    }
  }

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div className="tabs">
          <button
            type="button"
            className={`tab-btn ${tab === 'login' ? 'active' : ''}`}
            onClick={() => setTab('login')}
          >
            Log in
          </button>
          <button
            type="button"
            className={`tab-btn ${tab === 'register' ? 'active' : ''}`}
            onClick={() => setTab('register')}
          >
            Register
          </button>
        </div>

        <Banner banner={banner} />

        {tab === 'login' ? (
          <form className="auth-form" onSubmit={handleLogin}>
            <label>
              Email
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </label>
            <label>
              Password
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
            </label>
            <button type="submit" className="primary-btn">
              Log in
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleRegister}>
            <label>
              Email
              <input
                type="email"
                required
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
              />
            </label>
            <label>
              Password
              <input
                type="password"
                required
                minLength={8}
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
              />
              <span className="hint">At least 8 characters.</span>
            </label>
            <button type="submit" className="primary-btn">
              Create account
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
