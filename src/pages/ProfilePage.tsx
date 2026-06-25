import React, { useState } from 'react';
import { AuthUser } from '../hooks/useAuth';
import { supabase, supabaseConfigured } from '../lib/supabase';
import { ALL_BADGES } from '../lib/badges';

interface ProfileProps {
  user: AuthUser;
  earnedBadgeIds: string[];
  totalScore: number;
  completedCount: number;
  onBack: () => void;
  onDeleteAccount: () => void;
  onUsernameUpdate: (name: string) => void;
  onUpdateProfile: (updates: { full_name?: string; leaderboard_consent?: boolean }) => Promise<{ error: { message: string } | null }>;
}

const ProfilePage: React.FC<ProfileProps> = ({
  user, earnedBadgeIds, totalScore, completedCount,
  onBack, onDeleteAccount, onUsernameUpdate, onUpdateProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'danger'>('profile');
  const [displayName, setDisplayName] = useState(user.full_name || '');
  const [leaderboardConsent, setLeaderboardConsent] = useState(user.leaderboard_consent ?? false);
  const [nameLoading, setNameLoading] = useState(false);
  const [nameMsg, setNameMsg] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState('');
  const [pwError, setPwError] = useState('');
  const [deleteInput, setDeleteInput] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const handleUpdateProfile = async () => {
    if (!displayName.trim()) return;
    setNameLoading(true); setNameMsg('');
    const result = await onUpdateProfile({ full_name: displayName.trim(), leaderboard_consent: leaderboardConsent });
    if (result.error) {
      setNameMsg('❌ ' + result.error.message);
    } else {
      // Also update display_name in user_progress for leaderboard
      if (supabaseConfigured) {
        await supabase.from('user_progress').update({
          display_name: leaderboardConsent ? displayName.trim() : '',
        }).eq('user_id', user.id);
      }
      onUsernameUpdate(displayName.trim());
      setNameMsg('✅ Profile updated successfully');
    }
    setNameLoading(false);
  };

  const handleUpdatePassword = async () => {
    setPwError(''); setPwMsg('');
    if (newPassword.length < 6) { setPwError('Password must be at least 6 characters.'); return; }
    if (newPassword !== confirmPassword) { setPwError('Passwords do not match.'); return; }
    setPwLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) setPwError(error.message);
      else { setPwMsg('✅ Password updated successfully'); setNewPassword(''); setConfirmPassword(''); }
    } catch { setPwError('Update failed. Try again.'); }
    setPwLoading(false);
  };

  const handleDeleteConfirm = () => {
    const expected = user.full_name || user.email || '';
    if (deleteInput.trim().toLowerCase() !== expected.trim().toLowerCase()) {
      setDeleteError(`Please type exactly: "${expected}"`);
      return;
    }
    onDeleteAccount();
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px', fontSize: '0.92rem',
    border: '1.5px solid var(--border)', borderRadius: 'var(--radius)',
    background: 'var(--white)', color: 'var(--text-primary)',
    fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box',
  };

  const TABS = [
    { id: 'profile' as const, label: '👤 Profile' },
    { id: 'password' as const, label: '🔑 Password' },
    { id: 'danger' as const, label: '⚠️ Account' },
  ];

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px' }}>

      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontWeight: 600, fontSize: '0.9rem', padding: 0, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 6 }}>
        ← Back to Dashboard
      </button>

      {/* Profile header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24, padding: '24px 28px', background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', flexWrap: 'wrap' }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.3rem', fontWeight: 800, flexShrink: 0 }}>
          {(user.full_name || user.email || 'G')[0].toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>{user.full_name || 'Learner'}</h1>
          <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>{user.email}</p>
        </div>
        <div style={{ display: 'flex', gap: 20, textAlign: 'center', flexShrink: 0 }}>
          {[{ value: totalScore, label: 'Score', color: 'var(--accent)' }, { value: completedCount, label: 'Topics', color: '#10B981' }, { value: earnedBadgeIds.length, label: 'Badges', color: '#F59E0B' }].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Badges */}
      <div style={{ marginBottom: 24, padding: '20px 24px', background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
        <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
          Badges — {earnedBadgeIds.length} / {ALL_BADGES.length} earned
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {ALL_BADGES.map(badge => {
            const earned = earnedBadgeIds.includes(badge.id);
            return (
              <div key={badge.id} title={badge.description}
                className={`badge-pill ${earned ? '' : 'locked'}`}
                style={{ color: earned ? badge.color : '#9CA3AF', borderColor: earned ? badge.color + '50' : '#E5E7EB', background: earned ? badge.color + '15' : '#F9FAFB' }}>
                {badge.emoji} {badge.name}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs" style={{ display: 'flex', gap: 4, marginBottom: 16, background: 'var(--surface-2)', borderRadius: 'var(--radius)', padding: 4 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            flex: 1, padding: '9px 4px', border: 'none', borderRadius: 'calc(var(--radius) - 2px)',
            background: activeTab === t.id ? 'var(--white)' : 'transparent',
            color: activeTab === t.id ? 'var(--text-primary)' : 'var(--text-muted)',
            fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'var(--font-body)',
            boxShadow: activeTab === t.id ? 'var(--shadow-sm)' : 'none', transition: 'all 0.15s',
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: '28px', border: '1px solid var(--border)' }}>

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>Profile Settings</h2>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Display Name</label>
              <input style={inputStyle} value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name" />
            </div>

            {/* Leaderboard consent toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', marginBottom: 20 }}>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.88rem', margin: 0 }}>🏆 Show on Leaderboard</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  Allow your name and score to appear publicly on the Top 10 leaderboard
                </p>
              </div>
              <button
                role="switch"
                aria-checked={leaderboardConsent}
                onClick={() => setLeaderboardConsent(v => !v)}
                style={{
                  width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: leaderboardConsent ? 'var(--accent)' : '#D1D5DB',
                  position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                }}>
                <span style={{
                  position: 'absolute', top: 2, left: leaderboardConsent ? 22 : 2,
                  width: 20, height: 20, borderRadius: '50%', background: 'white',
                  transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }} />
              </button>
            </div>

            {nameMsg && (
              <div style={{ padding: '8px 12px', background: nameMsg.startsWith('✅') ? '#F0FDF4' : '#FEF2F2', borderRadius: 'var(--radius)', marginBottom: 14, fontSize: '0.85rem', color: nameMsg.startsWith('✅') ? '#065F46' : '#DC2626' }}>
                {nameMsg}
              </div>
            )}
            <button onClick={handleUpdateProfile} disabled={nameLoading} style={{ padding: '11px 24px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 'var(--radius)', cursor: nameLoading ? 'not-allowed' : 'pointer', fontWeight: 700, fontFamily: 'var(--font-body)', opacity: nameLoading ? 0.7 : 1 }}>
              {nameLoading ? 'Saving...' : 'Save Changes'}
            </button>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '24px 0' }} />
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 2 }}>
              <div><strong>Email:</strong> {user.email}</div>
              <div><strong>Account ID:</strong> <span style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{user.id?.slice(0, 8)}...</span></div>
            </div>
          </div>
        )}

        {/* PASSWORD TAB */}
        {activeTab === 'password' && (
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8 }}>Change Password</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>
              Your new password must be at least 6 characters.
            </p>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>New Password</label>
              <input style={inputStyle} type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 6 characters" />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>Confirm New Password</label>
              <input style={inputStyle} type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter new password" />
            </div>
            {pwError && <div style={{ padding: '8px 12px', background: '#FEF2F2', borderRadius: 'var(--radius)', marginBottom: 12, fontSize: '0.85rem', color: '#DC2626' }}>{pwError}</div>}
            {pwMsg  && <div style={{ padding: '8px 12px', background: '#F0FDF4', borderRadius: 'var(--radius)', marginBottom: 12, fontSize: '0.85rem', color: '#065F46' }}>{pwMsg}</div>}
            <button onClick={handleUpdatePassword} disabled={pwLoading} style={{ padding: '11px 24px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 'var(--radius)', cursor: pwLoading ? 'not-allowed' : 'pointer', fontWeight: 700, fontFamily: 'var(--font-body)' }}>
              {pwLoading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        )}

        {/* DANGER TAB */}
        {activeTab === 'danger' && (
          <div>
            <div style={{ padding: '16px 18px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius)', marginBottom: 24 }}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#DC2626', margin: '0 0 6px' }}>⚠️ Delete Account</h2>
              <p style={{ fontSize: '0.85rem', color: '#7F1D1D', lineHeight: 1.7, margin: 0 }}>
                This permanently deletes your account and all progress. Cannot be undone. You can re-register with the same email afterwards.
              </p>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>
                Type <strong>"{user.full_name || user.email}"</strong> to confirm:
              </label>
              <input
                style={{ ...inputStyle, borderColor: deleteError ? '#EF4444' : 'var(--border)' }}
                value={deleteInput}
                onChange={e => { setDeleteInput(e.target.value); setDeleteError(''); }}
                placeholder={user.full_name || user.email}
              />
            </div>
            {deleteError && <div style={{ padding: '8px 12px', background: '#FEF2F2', borderRadius: 'var(--radius)', marginBottom: 12, fontSize: '0.85rem', color: '#DC2626' }}>{deleteError}</div>}
            <button
              onClick={handleDeleteConfirm}
              disabled={!deleteInput.trim()}
              style={{ padding: '11px 24px', background: '#DC2626', color: 'white', border: 'none', borderRadius: 'var(--radius)', cursor: deleteInput.trim() ? 'pointer' : 'not-allowed', fontWeight: 700, fontFamily: 'var(--font-body)', opacity: deleteInput.trim() ? 1 : 0.5 }}>
              🗑️ Delete My Account Permanently
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
