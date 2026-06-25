import React from 'react';
import { curriculum } from '../data/curriculum';
import { AuthUser } from '../hooks/useAuth';

interface DashboardProps {
  user: AuthUser;
  onSelectModule: (moduleId: string) => void;
  getModuleProgress: (moduleId: string) => { completed: number; total: number; pct: number };
  getTotalProgress: () => { completed: number; total: number; pct: number };
  isTopicUnlocked: (topicId: string) => boolean;
}

const levelColors: Record<string, string> = {
  beginner: '#059669',
  intermediate: '#D97706',
  advanced: '#7C3AED',
};
const levelLabels: Record<string, string> = {
  beginner: '🟢 Beginner',
  intermediate: '🟡 Intermediate',
  advanced: '🔴 Advanced',
};

const DashboardPage: React.FC<DashboardProps> = ({ user, onSelectModule, getModuleProgress, getTotalProgress, isTopicUnlocked }) => {
  const { completed, total, pct } = getTotalProgress();
  const firstName = user.full_name?.split(' ')[0] || 'Learner';

  return (
    <div className="content-wrap" style={{ padding: '40px 24px', maxWidth: 1200 }}>
      {/* Hero banner */}
      <div className="card fade-in" style={{
        padding: '36px 40px',
        marginBottom: 40,
        background: 'linear-gradient(135deg, #EFF6FF 0%, #F0FDF4 50%, #FEFCE8 100%)',
        border: '1px solid #DBEAFE',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: 40, top: '50%', transform: 'translateY(-50%)', fontSize: 80, opacity: 0.12 }}>🧠</div>
        <div className="section-label" style={{ marginBottom: 10 }}>Welcome back</div>
        <h1 className="display-title" style={{ fontSize: 'clamp(1.6rem,4vw,2.4rem)', color: 'var(--text-primary)', marginBottom: 10 }}>
          Hello, {firstName}! 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: 560, marginBottom: 24 }}>
          You have completed <strong style={{ color: 'var(--accent)' }}>{completed} of {total} topics</strong>. Keep going — mastery is built one topic at a time.
        </p>
        <div style={{ maxWidth: 400 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            <span>Overall Progress</span>
            <span style={{ color: 'var(--accent)' }}>{pct}%</span>
          </div>
          <div className="progress-track" style={{ height: 10 }}>
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: 16, marginBottom: 40 }}>
        {[
          { label: 'Topics Done', value: completed, emoji: '✅', color: '#059669' },
          { label: 'Topics Remaining', value: total - completed, emoji: '📚', color: '#D97706' },
          { label: 'Total Modules', value: curriculum.length, emoji: '🗂️', color: '#2563EB' },
          { label: 'Completion %', value: `${pct}%`, emoji: '🎯', color: '#7C3AED' },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ padding: '20px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{stat.emoji}</div>
            <div style={{ fontSize: '1.7rem', fontWeight: 800, color: stat.color, fontFamily: 'var(--font-display)', lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Course modules grid */}
      <div style={{ marginBottom: 16 }}>
        <h2 className="display-title" style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: 4 }}>
          Course Curriculum
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Complete topics in order. Each topic requires a passing quiz score to unlock the next.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px,1fr))', gap: 20 }}>
        {curriculum.map((module, modIdx) => {
          const { completed: mDone, total: mTotal, pct: mPct } = getModuleProgress(module.id);
          const firstTopicUnlocked = isTopicUnlocked(module.topics[0]?.id || '');
          const isLocked = !firstTopicUnlocked && modIdx > 0;
          const isComplete = mDone === mTotal;

          return (
            <div
              key={module.id}
              className="card"
              onClick={() => !isLocked && onSelectModule(module.id)}
              style={{
                padding: 0, overflow: 'hidden',
                cursor: isLocked ? 'not-allowed' : 'pointer',
                opacity: isLocked ? 0.6 : 1,
                transition: 'transform 0.15s, box-shadow 0.15s',
                position: 'relative',
              }}
              onMouseEnter={e => { if (!isLocked) { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-lg)'; }}}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}
            >
              {/* Color header */}
              <div style={{
                height: 6,
                background: isComplete
                  ? 'linear-gradient(90deg, #059669, #34D399)'
                  : `linear-gradient(90deg, ${module.color}, ${module.color}88)`,
              }} />

              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 32 }}>{module.emoji}</span>
                    <div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: levelColors[module.level], marginBottom: 2 }}>
                        MODULE {modIdx + 1} · {levelLabels[module.level]}
                      </div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                        {module.title}
                      </h3>
                    </div>
                  </div>
                  {isComplete && <span style={{ fontSize: 20 }}>🏆</span>}
                  {isLocked && <span style={{ fontSize: 20 }}>🔒</span>}
                </div>

                <p style={{ fontSize: '0.845rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 16, minHeight: 42 }}>
                  {module.description}
                </p>

                {/* Topic list */}
                <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {module.topics.map(topic => {
                    const done = isTopicUnlocked(topic.id) || false;
                    const unlocked = isTopicUnlocked(topic.id);
                    // A topic is "done" if the NEXT topic is unlocked (or it's the last and module is complete)
                    const topicIdx = module.topics.indexOf(topic);
                    const isDone = mDone > topicIdx;
                    return (
                      <div key={topic.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem' }}>
                        <span style={{ width: 18, height: 18, borderRadius: '50%', background: isDone ? 'var(--success)' : unlocked ? 'var(--accent-light)' : 'var(--surface-2)', border: `1.5px solid ${isDone ? 'var(--success)' : unlocked ? 'var(--accent)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, flexShrink: 0 }}>
                          {isDone ? '✓' : unlocked ? '→' : ''}
                        </span>
                        <span style={{ color: isDone ? 'var(--text-secondary)' : unlocked ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: unlocked && !isDone ? 600 : 400, textDecoration: isDone ? 'line-through' : 'none' }}>
                          {topic.emoji} {topic.title}
                        </span>
                        <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.75rem' }}>{topic.estimatedTime}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Progress */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 5 }}>
                    <span>{mDone}/{mTotal} topics</span>
                    <span style={{ color: module.color }}>{mPct}%</span>
                  </div>
                  <div className="progress-track">
                    <div style={{ height: '100%', background: isComplete ? '#059669' : module.color, borderRadius: 'var(--radius-full)', width: `${mPct}%`, transition: 'width 0.4s ease' }} />
                  </div>
                </div>

                <button
                  className="btn btn-primary"
                  disabled={isLocked}
                  style={{ width: '100%', justifyContent: 'center', background: isComplete ? 'var(--success)' : module.color }}
                >
                  {isComplete ? '✅ Review Module' : isLocked ? '🔒 Complete previous modules first' : mDone > 0 ? '→ Continue Learning' : '▶ Start Module'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardPage;
