import React from 'react';
import { Module } from '../types';

interface ModulePageProps {
  module: Module;
  onSelectTopic: (topicId: string) => void;
  onBack: () => void;
  isTopicUnlocked: (topicId: string) => boolean;
  completedTopics: Set<string>;
  getModuleProgress: (moduleId: string) => { completed: number; total: number; pct: number };
}

const ModulePage: React.FC<ModulePageProps> = ({ module, onSelectTopic, onBack, isTopicUnlocked, completedTopics, getModuleProgress }) => {
  const { completed, total, pct } = getModuleProgress(module.id);

  return (
    <div className="content-wrap fade-in" style={{ padding: '32px 24px', maxWidth: 900 }}>
      {/* Breadcrumb */}
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontWeight: 600, fontSize: '0.875rem', padding: 0, marginBottom: 24 }}>
        ← Back to Dashboard
      </button>

      {/* Module header */}
      <div className="card" style={{ padding: '32px', marginBottom: 28, background: `linear-gradient(135deg, ${module.color}0D 0%, white 100%)`, borderTop: `4px solid ${module.color}` }}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 52 }}>{module.emoji}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: module.color, marginBottom: 6 }}>
              {module.level.toUpperCase()} MODULE
            </div>
            <h1 className="display-title" style={{ fontSize: 'clamp(1.3rem,3vw,2rem)', color: 'var(--text-primary)', marginBottom: 10 }}>
              {module.title}
            </h1>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
              {module.description}
            </p>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6, color: 'var(--text-secondary)' }}>
                <span>{completed}/{total} topics completed</span>
                <span style={{ color: module.color }}>{pct}%</span>
              </div>
              <div className="progress-track" style={{ height: 8 }}>
                <div style={{ height: '100%', background: module.color, borderRadius: 'var(--radius-full)', width: `${pct}%`, transition: 'width 0.4s' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What you'll learn */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 12, marginBottom: 28 }}>
        {[
          { icon: '📖', text: `${total} in-depth topics` },
          { icon: '✏️', text: `${total} hands-on exercises` },
          { icon: '📝', text: `${total * 3}+ quiz questions` },
          { icon: '🏆', text: 'Certificate-worthy mastery' },
        ].map(item => (
          <div key={item.text} style={{ padding: '12px 16px', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', display: 'flex', gap: 10, alignItems: 'center', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            {item.text}
          </div>
        ))}
      </div>

      {/* Topic cards */}
      <h2 style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: 16 }}>
        Topics in This Module
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {module.topics.map((topic, idx) => {
          const unlocked = isTopicUnlocked(topic.id);
          const done = completedTopics.has(topic.id);

          return (
            <div
              key={topic.id}
              className="card"
              onClick={() => unlocked && onSelectTopic(topic.id)}
              style={{
                padding: '20px 24px', cursor: unlocked ? 'pointer' : 'not-allowed',
                opacity: !unlocked ? 0.55 : 1,
                borderLeft: `4px solid ${done ? '#059669' : unlocked ? module.color : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', gap: 16,
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => { if (unlocked) { (e.currentTarget as HTMLElement).style.transform = 'translateX(4px)'; }}}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; }}
            >
              {/* Step number */}
              <div style={{
                width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                background: done ? '#059669' : unlocked ? module.color : 'var(--surface-2)',
                color: done || unlocked ? 'white' : 'var(--text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '0.9rem',
              }}>
                {done ? '✓' : !unlocked ? '🔒' : idx + 1}
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 20 }}>{topic.emoji}</span>
                  <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{topic.title}</h3>
                  {done && <span className="badge badge-green">Completed</span>}
                  {!unlocked && <span className="badge" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>Locked</span>}
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>⏱ {topic.estimatedTime}</span>
                  <span>📝 {topic.quiz.length} quiz questions</span>
                  <span>✏️ 1 exercise</span>
                </div>
              </div>

              {/* Arrow */}
              {unlocked && (
                <span style={{ fontSize: 20, color: module.color }}>→</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Lock explanation */}
      <div style={{ marginTop: 20, padding: '14px 18px', background: 'var(--accent-light)', border: '1px solid #BFDBFE', borderRadius: 'var(--radius)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        <strong style={{ color: 'var(--accent)' }}>🔒 Why are topics locked?</strong> Each topic requires you to pass the previous topic's quiz with 70%+ before it unlocks. This ensures genuine understanding before moving forward — the foundation of real mastery.
      </div>
    </div>
  );
};

export default ModulePage;
