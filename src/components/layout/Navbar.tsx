import React from 'react';
import { AuthUser } from '../../hooks/useAuth';

interface NavbarProps {
  user: AuthUser | null;
  onSignOut: () => void;
  onGoHome: () => void;
  totalPct: number;
}

const Navbar: React.FC<NavbarProps> = ({ user, onSignOut, onGoHome, totalPct }) => (
  <nav style={{
    background: 'var(--white)',
    borderBottom: '1px solid var(--border)',
    position: 'sticky', top: 0, zIndex: 100,
    boxShadow: '0 1px 8px rgba(15,23,42,0.06)',
  }}>
    <div className="content-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
      <button onClick={onGoHome} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 22 }}>🧠</span>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
          GenAI Mastery
        </span>
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {user && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} className="hide-mobile">
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>Progress</span>
              <div style={{ width: 120 }}>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${totalPct}%` }} />
                </div>
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)' }}>{totalPct}%</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'var(--accent-light)', border: '2px solid var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent)',
              }}>
                {user.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
              </div>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }} className="hide-mobile">
                {user.full_name || user.email}
              </span>
              <button onClick={onSignOut} className="btn btn-secondary btn-sm">Sign Out</button>
            </div>
          </>
        )}
      </div>
    </div>
  </nav>
);

export default Navbar;
