import React, { useState } from 'react';
import { AuthUser } from '../../hooks/useAuth';
import { getBadge } from '../../lib/badges';

interface NavbarProps {
  user: AuthUser;
  onSignOut: () => void;
  onGoHome: () => void;
  onGoProfile: () => void;
  onGoLeaderboard: () => void;
  onDeleteAccount?: () => void;
  totalPct: number;
  earnedBadges: string[];
  totalScore: number;
}

const Navbar: React.FC<NavbarProps> = ({ user, onSignOut, onGoHome, onGoProfile, onGoLeaderboard, onDeleteAccount, totalPct, earnedBadges, totalScore }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = (user.full_name || user.email || 'G')
    .split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);

  const close = () => setMenuOpen(false);

  return (
    <nav style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>

      {/* Logo */}
      <button onClick={() => { onGoHome(); close(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: 0 }}>
        <span style={{ fontSize: 22 }}>🧠</span>
        <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>GenAI Mastery</span>
      </button>

      {/* Nav items — center */}
      <div style={{ display: 'flex', gap: 4 }}>
        {[
          { label: '🏠 Dashboard', action: () => { onGoHome(); close(); } },
          { label: '🏆 Leaderboard', action: () => { onGoLeaderboard(); close(); } },
        ].map(item => (
          <button key={item.label} onClick={item.action} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px 12px', borderRadius: 'var(--radius)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', transition: 'all 0.15s' }}>
            {item.label}
          </button>
        ))}
      </div>

      {/* Progress + user menu */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

        {/* Score pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'var(--accent-light)', borderRadius: 20, border: '1px solid #BFDBFE' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)' }}>⭐ {totalScore} pts</span>
        </div>

        {/* Badge count */}
        {earnedBadges.length > 0 && (
          <div style={{ padding: '4px 10px', background: '#FFF8E1', borderRadius: 20, border: '1px solid #FDE68A', fontSize: '0.75rem', fontWeight: 700, color: '#D97706' }}>
            🏅 {earnedBadges.length} badge{earnedBadges.length > 1 ? 's' : ''}
          </div>
        )}

        {/* Progress bar */}
        <div style={{ width: 80 }}>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'right', marginBottom: 3, fontWeight: 700 }}>{totalPct}%</div>
          <div style={{ height: 4, background: 'var(--surface-2)', borderRadius: 99 }}>
            <div style={{ height: '100%', width: `${totalPct}%`, background: 'var(--accent)', borderRadius: 99, transition: 'width 0.4s' }} />
          </div>
        </div>

        {/* User avatar + menu */}
        <div style={{ position: 'relative' }}>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '4px 10px 4px 5px', cursor: 'pointer' }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800 }}>
              {initials}
            </div>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.full_name || user.email}
            </span>
            <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>▼</span>
          </button>

          {menuOpen && (
            <>
              {/* Backdrop */}
              <div onClick={close} style={{ position: 'fixed', inset: 0, zIndex: 199 }} />
              <div style={{ position: 'absolute', right: 0, top: 38, width: 210, background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-lg)', zIndex: 200, overflow: 'hidden' }}>

                {/* User info */}
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>{user.full_name || 'Learner'}</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
                </div>

                {[
                  { icon: '🏠', label: 'Dashboard', action: () => { onGoHome(); close(); } },
                  { icon: '👤', label: 'My Profile', action: () => { onGoProfile(); close(); } },
                  { icon: '🏆', label: 'Leaderboard', action: () => { onGoLeaderboard(); close(); } },
                  { icon: '🚪', label: 'Sign Out', action: () => { onSignOut(); close(); } },
                ].map(item => (
                  <button key={item.label} onClick={item.action} style={{ width: '100%', padding: '9px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '0.875rem', color: 'var(--text-primary)', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>{item.icon}</span><span>{item.label}</span>
                  </button>
                ))}

                <div style={{ borderTop: '1px solid var(--border)' }}>
                  <button onClick={() => { if (onDeleteAccount) onDeleteAccount(); close(); }} style={{ width: '100%', padding: '9px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '0.875rem', color: '#DC2626', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>🗑️</span><span>Delete Account</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
