import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import emailjs from '@emailjs/browser';

type AuthMode = 'signin' | 'signup' | 'forgot' | 'verify';

const AuthPage: React.FC = () => {
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const sendWelcomeEmail = async (toEmail: string, toName: string) => {
    // Only attempt if EmailJS env vars are configured
    const serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID;
    const templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;
    if (!serviceId || !templateId || !publicKey) return;

    try {
      await emailjs.send(serviceId, templateId, {
        to_name: toName,
        to_email: toEmail,
        course_name: 'GenAI Mastery',
        login_url: `${window.location.origin}/genai-mastery/`,
      }, publicKey);
    } catch (err) {
      // Welcome email failure is non-blocking
      console.warn('Welcome email failed (non-critical):', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        setLoading(false);
        return;
      }
      if (!fullName.trim()) {
        setError('Please enter your full name.');
        setLoading(false);
        return;
      }
      const { error: signUpError } = await signUp(email, password, fullName.trim());
      if (signUpError) {
        setError(signUpError.message);
      } else {
        await sendWelcomeEmail(email, fullName.trim());
        setMode('verify');
      }
    } else if (mode === 'signin') {
      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        setError(
          signInError.message.includes('Email not confirmed')
            ? 'Please confirm your email address first. Check your inbox.'
            : signInError.message.includes('Invalid login')
            ? 'Incorrect email or password.'
            : signInError.message
        );
      }
    } else if (mode === 'forgot') {
      const { error: resetError } = await resetPassword(email);
      if (resetError) {
        setError(resetError.message);
      } else {
        setResetSent(true);
      }
    }

    setLoading(false);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', fontSize: '0.95rem',
    border: '1.5px solid var(--border)', borderRadius: 'var(--radius)',
    background: 'var(--white)', color: 'var(--text-primary)',
    fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  };

  const btnStyle: React.CSSProperties = {
    width: '100%', padding: '13px', fontSize: '1rem', fontWeight: 700,
    background: loading ? 'var(--text-muted)' : 'var(--accent)',
    color: 'white', border: 'none', borderRadius: 'var(--radius)',
    cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)',
    transition: 'background 0.15s',
  };

  const linkStyle: React.CSSProperties = {
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--accent)', fontWeight: 600, fontSize: '0.9rem',
    padding: 0, fontFamily: 'var(--font-body)',
  };

  // Email verification sent screen
  if (mode === 'verify') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', padding: 24 }}>
        <div style={{ maxWidth: 440, width: '100%', background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: '48px 40px', boxShadow: 'var(--shadow-lg)', textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📧</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 12, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            Check your inbox
          </h1>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24, fontSize: '0.95rem' }}>
            We sent a confirmation link to <strong>{email}</strong>. Click the link in that email to activate your account and start learning.
          </p>
          <div style={{ padding: '14px 20px', background: 'var(--accent-light)', borderRadius: 'var(--radius)', border: '1px solid #BFDBFE', marginBottom: 24, fontSize: '0.88rem', color: 'var(--accent)', lineHeight: 1.6 }}>
            💡 Don't see it? Check your spam folder. The link expires in 24 hours.
          </div>
          <button onClick={() => setMode('signin')} style={linkStyle}>
            ← Back to sign in
          </button>
        </div>
      </div>
    );
  }

  // Password reset sent screen
  if (mode === 'forgot' && resetSent) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', padding: 24 }}>
        <div style={{ maxWidth: 440, width: '100%', background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: '48px 40px', boxShadow: 'var(--shadow-lg)', textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🔑</div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 12, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            Reset link sent
          </h1>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24, fontSize: '0.95rem' }}>
            Check <strong>{email}</strong> for a password reset link.
          </p>
          <button onClick={() => { setMode('signin'); setResetSent(false); }} style={linkStyle}>
            ← Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', padding: 24 }}>
      <div style={{ maxWidth: 460, width: '100%' }}>

        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 10 }}>🧠</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', marginBottom: 4 }}>
            GenAI Mastery
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
            From zero to advanced — your progress saved in the cloud
          </p>
        </div>

        {/* Card */}
        <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: '36px 36px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }}>

          {/* Tab switcher */}
          <div style={{ display: 'flex', background: 'var(--surface-2)', borderRadius: 'var(--radius)', padding: 4, marginBottom: 28, gap: 2 }}>
            {(['signin', 'signup'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); }}
                style={{
                  flex: 1, padding: '9px', border: 'none', borderRadius: 'calc(var(--radius) - 2px)',
                  background: mode === m ? 'var(--white)' : 'transparent',
                  color: mode === m ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
                  boxShadow: mode === m ? 'var(--shadow-sm)' : 'none',
                  fontFamily: 'var(--font-body)', transition: 'all 0.15s',
                }}>
                {m === 'signin' ? '🔐 Sign In' : '✨ Create Account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>
                  Full Name
                </label>
                <input style={inputStyle} type="text" placeholder="Your full name"
                  value={fullName} onChange={e => setFullName(e.target.value)} required />
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>
                Email Address
              </label>
              <input style={inputStyle} type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>

            {mode !== 'forgot' && (
              <div style={{ marginBottom: mode === 'signup' ? 16 : 24 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>
                  Password
                </label>
                <input style={inputStyle} type="password" placeholder={mode === 'signup' ? 'Min 6 characters' : 'Your password'}
                  value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
            )}

            {mode === 'signup' && (
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>
                  Confirm Password
                </label>
                <input style={inputStyle} type="password" placeholder="Re-enter your password"
                  value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
              </div>
            )}

            {mode === 'forgot' && <div style={{ marginBottom: 24 }} />}

            {error && (
              <div style={{ padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius)', marginBottom: 16, fontSize: '0.88rem', color: '#DC2626' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={btnStyle}>
              {loading ? '⏳ Please wait...' :
                mode === 'signin' ? '🔐 Sign In' :
                mode === 'signup' ? '🚀 Create My Account' :
                '📧 Send Reset Link'}
            </button>
          </form>

          {/* Footer links */}
          <div style={{ marginTop: 20, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {mode === 'signin' && (
              <button onClick={() => { setMode('forgot'); setError(''); }} style={linkStyle}>
                Forgot your password?
              </button>
            )}
            {mode === 'forgot' && (
              <button onClick={() => { setMode('signin'); setError(''); }} style={linkStyle}>
                ← Back to sign in
              </button>
            )}
          </div>
        </div>

        {/* Feature bullets */}
        <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { icon: '☁️', text: 'Progress saved to cloud' },
            { icon: '📱', text: 'Continue on any device' },
            { icon: '🔒', text: 'Revisit any completed topic' },
            { icon: '🏆', text: '28 topics · 10 modules' },
          ].map(f => (
            <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'var(--white)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              <span>{f.icon}</span><span>{f.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
