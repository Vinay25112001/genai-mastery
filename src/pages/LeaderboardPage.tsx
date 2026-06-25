import React, { useEffect, useState } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase';
import { getBadge } from '../lib/badges';

interface LeaderEntry {
  display_name: string;
  total_score: number;
  badges: string[];
  topics_completed: number;
  updated_at: string;
}

interface LeaderboardProps {
  currentUserName: string;
  currentUserScore: number;
  onBack: () => void;
}

const RANK_STYLES: Record<number, { bg: string; color: string; label: string }> = {
  1: { bg: '#FFF8E1', color: '#F59E0B', label: '🥇' },
  2: { bg: '#F3F4F6', color: '#6B7280', label: '🥈' },
  3: { bg: '#FFF3E0', color: '#CD7F32', label: '🥉' },
};

const LeaderboardPage: React.FC<LeaderboardProps> = ({ currentUserName, currentUserScore, onBack }) => {
  const [leaders, setLeaders] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!supabaseConfigured) {
        setError('Supabase not configured.');
        setLoading(false);
        return;
      }
      try {
        const { data, error: dbError } = await supabase
          .from('leaderboard')
          .select('display_name, total_score, badges, topics_completed, updated_at')
          .order('total_score', { ascending: false })
          .limit(10);

        if (dbError) throw dbError;
        setLeaders(data || []);
      } catch (e: any) {
        setError('Could not load leaderboard. ' + (e.message || ''));
      }
      setLoading(false);
    };

    fetchLeaderboard();
    // Refresh every 60 seconds
    const interval = setInterval(fetchLeaderboard, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>

      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontWeight: 600, fontSize: '0.9rem', padding: 0, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 6 }}>
        ← Back to Dashboard
      </button>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🏆</div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
          Top Learners
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 6 }}>
          Top 10 learners ranked by total quiz score · Updates every minute
        </p>
      </div>

      {/* Your score banner */}
      {currentUserName && (
        <div style={{ padding: '14px 20px', background: 'var(--accent-light)', border: '1px solid #BFDBFE', borderRadius: 'var(--radius)', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.88rem', color: 'var(--accent)', fontWeight: 600 }}>
            👤 Your Score
          </span>
          <span style={{ fontSize: '0.88rem', color: 'var(--accent)', fontWeight: 800 }}>
            {currentUserName} — {currentUserScore} pts
          </span>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          Loading leaderboard...
        </div>
      )}

      {error && (
        <div style={{ padding: '16px 20px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius)', color: '#DC2626', fontSize: '0.88rem' }}>
          {error}
        </div>
      )}

      {!loading && !error && leaders.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🌱</div>
          <p style={{ fontWeight: 600 }}>No rankings yet</p>
          <p style={{ fontSize: '0.85rem' }}>Be the first to complete a topic and appear here!</p>
        </div>
      )}

      {/* Leaderboard list */}
      {!loading && leaders.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {leaders.map((entry, idx) => {
            const rank = idx + 1;
            const rankStyle = RANK_STYLES[rank] || { bg: 'var(--white)', color: 'var(--text-muted)', label: `#${rank}` };
            const isCurrentUser = entry.display_name?.toLowerCase() === currentUserName?.toLowerCase();

            return (
              <div key={idx} style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '16px 20px',
                background: isCurrentUser ? 'var(--accent-light)' : rankStyle.bg,
                border: `1.5px solid ${isCurrentUser ? '#BFDBFE' : '#E5E7EB'}`,
                borderRadius: 'var(--radius-lg)',
              }}>
                {/* Rank */}
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: rankStyle.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: rank <= 3 ? '1.2rem' : '0.85rem', fontWeight: 800, color: rankStyle.color, flexShrink: 0 }}>
                  {rankStyle.label}
                </div>

                {/* Name + badges */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      {entry.display_name || 'Anonymous'}
                    </span>
                    {isCurrentUser && (
                      <span style={{ padding: '2px 8px', background: 'var(--accent)', color: 'white', borderRadius: 10, fontSize: '0.7rem', fontWeight: 700 }}>YOU</span>
                    )}
                  </div>
                  {/* Top 3 badges */}
                  <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                    {(entry.badges || []).slice(0, 4).map(badgeId => {
                      const badge = getBadge(badgeId);
                      return badge ? (
                        <span key={badgeId} title={badge.description} style={{ fontSize: '0.75rem', padding: '2px 7px', background: badge.color + '18', color: badge.color, borderRadius: 10, fontWeight: 600, border: `1px solid ${badge.color}30` }}>
                          {badge.emoji} {badge.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: 20, textAlign: 'center', flexShrink: 0 }}>
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent)' }}>{entry.total_score}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Score</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10B981' }}>{entry.topics_completed || 0}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Topics</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F59E0B' }}>{(entry.badges || []).length}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Badges</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* How scoring works */}
      <div style={{ marginTop: 32, padding: '20px 24px', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px' }}>How Scoring Works</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { label: 'Each quiz', value: '0–100 pts', icon: '📝' },
            { label: '28 topics total', value: 'Max 2,800 pts', icon: '🏆' },
            { label: 'Perfect quiz', value: 'Earns Quiz Ace badge', icon: '💯' },
            { label: 'All topics done', value: 'GenAI Graduate badge', icon: '🎓' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.label}</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
