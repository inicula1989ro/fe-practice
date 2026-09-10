import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../api';

export default function ActivatePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { login } = useAuth();
  const navigate = useNavigate();

  const [status, setStatus] = useState('activating'); // 'activating' | 'error'
  const [error, setError] = useState('');
  // StrictMode double-invokes effects in dev, which would otherwise fire
  // this one-time, non-idempotent request (the token gets consumed on
  // first use) twice and turn the second call into a false "invalid token".
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;

    if (!token) {
      setStatus('error');
      setError('This activation link is missing its token.');
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/activate?token=${encodeURIComponent(token)}`);
        const body = await res.json();
        if (!res.ok) throw new Error(body.error?.message || 'Activation failed');

        login(body.data.token, body.data.user);
        navigate('/', { replace: true });
      } catch (err) {
        setStatus('error');
        setError(err.message);
      }
    })();
  }, [token, login, navigate]);

  return (
    <div className="auth-layout">
      <div className="auth-card">
        {status === 'activating' && <p>Activating your account…</p>}
        {status === 'error' && (
          <>
            <div className="banner error">{error}</div>
            <p className="hint">
              The link may have expired (activation links are valid for 24 hours) or already been
              used. <Link to="/auth">Head back to log in or register</Link>.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
