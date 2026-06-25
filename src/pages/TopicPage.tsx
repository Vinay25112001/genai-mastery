import React, { useState } from 'react';
import { Topic, Module } from '../types';

interface TopicPageProps {
  topic: Topic;
  module: Module;
  onStartQuiz: () => void;
  onBack: () => void;
  onGoHome: () => void;
  isCompleted: boolean;
}

const TopicPage: React.FC<TopicPageProps> = ({ topic, module, onStartQuiz, onBack, onGoHome, isCompleted }) => {
  const [explainMode, setExplainMode] = useState<'kid' | 'pro'>('kid');
  const [activeSection, setActiveSection] = useState<string>('explanation');

  const sections = [
    { id: 'explanation', label: '📖 Core Concepts', emoji: '📖' },
    { id: 'analogy', label: '🧩 Mental Models', emoji: '🧩' },
    { id: 'examples', label: '🌍 Real-World Applications', emoji: '🌍' },
    { id: 'deepdive', label: '🔬 Academic Deep Dive', emoji: '🔬' },
  ];

  const sectionStyle = (id: string) => ({
    padding: '10px 18px',
    borderRadius: 'var(--radius)',
    background: activeSection === id ? module.color : 'var(--white)',
    color: activeSection === id ? 'white' : 'var(--text-secondary)',
    fontWeight: 600,
    fontSize: '0.9rem',
    cursor: 'pointer',
    border: activeSection === id ? 'none' : '1.5px solid var(--border)',
    transition: 'all 0.15s',
    whiteSpace: 'nowrap' as const,
    fontFamily: 'var(--font-body)',
  });

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 32px' }}>

      {/* ── Navigation Bar ─────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: 28, padding: '12px 20px',
        background: 'var(--white)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', fontSize: '0.9rem',
        flexWrap: 'wrap' as const,
      }}>
        <button onClick={onGoHome} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--accent)', fontWeight: 600, fontSize: '0.9rem', padding: '4px 8px',
          borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4,
        }}>
          🏠 Dashboard
        </button>
        <span style={{ color: 'var(--border-dark)' }}>›</span>
        <button onClick={onBack} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--accent)', fontWeight: 600, fontSize: '0.9rem', padding: '4px 8px',
          borderRadius: 6,
        }}>
          {module.emoji} {module.title}
        </button>
        <span style={{ color: 'var(--border-dark)' }}>›</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{topic.title}</span>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button onClick={onBack} style={{
            padding: '6px 14px', background: 'var(--surface)',
            border: '1.5px solid var(--border)', borderRadius: 'var(--radius)',
            cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)',
            fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            ← Back to Module
          </button>
          <button onClick={onGoHome} style={{
            padding: '6px 14px', background: 'var(--surface)',
            border: '1.5px solid var(--border)', borderRadius: 'var(--radius)',
            cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)',
            fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            🏠 Home
          </button>
        </div>
      </div>

      {/* ── Topic Header ───────────────────────────────────────── */}
      <div style={{
        padding: '32px 36px', marginBottom: 28,
        background: `linear-gradient(135deg, ${module.color}12 0%, white 60%)`,
        border: `1px solid ${module.color}40`,
        borderLeft: `5px solid ${module.color}`,
        borderRadius: 'var(--radius-lg)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' as const }}>
          <span style={{ fontSize: 56 }}>{topic.emoji}</span>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: module.color, marginBottom: 6 }}>
              {module.emoji} {module.title} · {module.level.toUpperCase()}
            </div>
            <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10, fontFamily: 'var(--font-display)', lineHeight: 1.25 }}>
              {topic.title}
            </h1>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' as const }}>
              <span style={{ padding: '4px 12px', background: 'white', border: `1px solid ${module.color}40`, borderRadius: 20, fontSize: '0.82rem', fontWeight: 600, color: module.color }}>
                ⏱ {topic.estimatedTime}
              </span>
              <span style={{ padding: '4px 12px', background: 'white', border: '1px solid var(--border)', borderRadius: 20, fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                📝 {topic.quiz.length} Quiz Questions
              </span>
              <span style={{ padding: '4px 12px', background: 'white', border: '1px solid var(--border)', borderRadius: 20, fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                🔬 1 Exercise
              </span>
              {isCompleted && (
                <span style={{ padding: '4px 12px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 20, fontSize: '0.82rem', fontWeight: 700, color: '#065F46' }}>
                  ✅ Completed
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Section Tabs ───────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
        {sections.map(sec => (
          <button key={sec.id} onClick={() => setActiveSection(sec.id)} style={sectionStyle(sec.id)}>
            {sec.label}
          </button>
        ))}
      </div>

      {/* ── EXPLANATION ────────────────────────────────────────── */}
      {activeSection === 'explanation' && (
        <div>
          {/* Toggle */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 20, flexWrap: 'wrap' as const, gap: 12,
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Understanding {topic.title}
            </h2>
            <div style={{ display: 'flex', background: 'var(--surface-2)', borderRadius: 'var(--radius)', padding: 4, gap: 2 }}>
              {(['kid', 'pro'] as const).map(m => (
                <button key={m} onClick={() => setExplainMode(m)} style={{
                  padding: '8px 20px', border: 'none',
                  borderRadius: 'calc(var(--radius) - 2px)',
                  background: explainMode === m ? 'var(--white)' : 'transparent',
                  color: explainMode === m ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
                  boxShadow: explainMode === m ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.15s', fontFamily: 'var(--font-body)',
                }}>
                  {m === 'kid' ? '👶 Simple English' : '🎓 Professional / Academic'}
                </button>
              ))}
            </div>
          </div>

          {/* Mode label */}
          <div style={{ marginBottom: 16 }}>
            {explainMode === 'kid'
              ? <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 20, fontSize: '0.83rem', fontWeight: 600, color: '#92400E' }}>
                  👶 Simple English — No jargon, vivid analogies, pure intuition building
                </div>
              : <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: '#EDE9FE', border: '1px solid #DDD6FE', borderRadius: 20, fontSize: '0.83rem', fontWeight: 600, color: '#5B21B6' }}>
                  🎓 Academic / Professional — Research-grounded, mathematical where appropriate
                </div>
            }
          </div>

          {/* Explanation text */}
          <div style={{
            fontSize: '1.05rem', lineHeight: 1.85, color: 'var(--text-primary)',
            background: explainMode === 'kid' ? '#FFFBEB' : '#F5F3FF',
            border: `1px solid ${explainMode === 'kid' ? '#FDE68A' : '#DDD6FE'}`,
            borderRadius: 'var(--radius-lg)', padding: '28px 32px',
            marginBottom: 28, whiteSpace: 'pre-line' as const,
          }}>
            {explainMode === 'kid' ? topic.content.kidExplanation : topic.content.professionalExplanation}
          </div>

          {/* Key Points */}
          <div style={{ marginBottom: 28 }}>
            <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 16, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              🎯 Core Concepts — What You Must Know
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {topic.content.keyPoints.map((pt, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 14, alignItems: 'flex-start',
                  padding: '14px 18px', background: 'var(--accent-light)',
                  borderRadius: 'var(--radius)', border: '1px solid #BFDBFE',
                }}>
                  <span style={{
                    width: 26, height: 26, borderRadius: '50%', background: 'var(--accent)',
                    color: 'white', fontWeight: 800, fontSize: '0.8rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>{i + 1}</span>
                  <span style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>{pt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pro Example */}
          {topic.content.proExample && (
            <div style={{ marginBottom: 28 }}>
              <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 14, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                ⚡ Quantitative Research Example
              </h3>
              <div style={{
                background: '#0F172A', color: '#E2E8F0', borderRadius: 'var(--radius-lg)',
                padding: '24px 28px', fontSize: '0.92rem', lineHeight: 1.8,
                fontFamily: 'var(--font-mono)', whiteSpace: 'pre-wrap' as const,
                overflowX: 'auto', border: '1px solid #1E293B',
              }}>
                {topic.content.proExample}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── ANALOGY / MENTAL MODELS ────────────────────────────── */}
      {activeSection === 'analogy' && (
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 20, color: 'var(--text-primary)' }}>
            🧩 Mental Models & Intuition Building
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24 }}>
            Strong mental models are what separate people who merely use AI tools from those who deeply understand them.
            The analogy below is designed to build lasting intuition — something you can call on when reading research papers or debugging systems.
          </p>

          <div style={{
            background: 'linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%)',
            border: '1px solid #A7F3D0', borderRadius: 'var(--radius-lg)',
            padding: '32px 36px', marginBottom: 24,
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#065F46', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
              🧩 {topic.content.analogyTitle}
            </h3>
            <div style={{ fontSize: '1.05rem', lineHeight: 1.85, color: '#064E3B', whiteSpace: 'pre-line' as const }}>
              {topic.content.analogy}
            </div>
          </div>

          <div style={{
            padding: '24px 28px', background: '#FFF7ED',
            border: '1px solid #FED7AA', borderRadius: 'var(--radius-lg)',
          }}>
            <h4 style={{ fontWeight: 700, fontSize: '1rem', color: '#9A3412', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              💡 Why Analogies Matter in AI Research
            </h4>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.75, color: '#7C2D12' }}>
              The researchers who built these systems — Hinton, LeCun, Bengio, Vaswani, Ho — all developed deep intuitions
              before formalizing the mathematics. The analogy above captures the same essence they had in mind.
              When you encounter a new paper or architecture, try to build the mental model first, then read the equations.
              You will find the math follows naturally from the intuition.
            </p>
          </div>
        </div>
      )}

      {/* ── REAL WORLD EXAMPLES ────────────────────────────────── */}
      {activeSection === 'examples' && (
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
            🌍 Real-World Applications & Industry Deployments
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24 }}>
            These are not hypothetical — each example below is a production system or published research result that
            directly applies the concept you just learned. Understanding where each concept is deployed helps you
            assess its maturity, limitations, and the problems it solves.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {topic.content.realWorldExamples.map((ex, i) => (
              <div key={i} style={{
                display: 'flex', gap: 18, alignItems: 'flex-start',
                padding: '20px 24px', background: 'var(--white)',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
                borderLeft: `5px solid ${module.color}`,
              }}>
                <span style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: `${module.color}20`, border: `2px solid ${module.color}40`,
                  color: module.color, fontWeight: 800, fontSize: '0.9rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>{i + 1}</span>
                <p style={{ fontSize: '0.97rem', lineHeight: 1.7, color: 'var(--text-primary)' }}>{ex}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── DEEP DIVE ──────────────────────────────────────────── */}
      {activeSection === 'deepdive' && (
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
            🔬 Academic Deep Dive — Research-Grade Understanding
          </h2>
          <div style={{
            padding: '6px 14px', background: '#EDE9FE', border: '1px solid #DDD6FE',
            borderRadius: 20, fontSize: '0.83rem', fontWeight: 600, color: '#5B21B6',
            display: 'inline-block', marginBottom: 20,
          }}>
            Graduate-level detail · Cites foundational papers · For serious learners
          </div>
          {topic.content.deepDive ? (
            <div style={{
              fontSize: '1.0rem', lineHeight: 1.9, color: 'var(--text-primary)',
              padding: '28px 32px', background: '#F8F5FF',
              border: '1px solid #DDD6FE', borderRadius: 'var(--radius-lg)',
              marginBottom: 24, whiteSpace: 'pre-line' as const,
            }}>
              {topic.content.deepDive}
            </div>
          ) : null}
          <div style={{ padding: '20px 24px', background: 'var(--accent-light)', borderRadius: 'var(--radius)', border: '1px solid #BFDBFE' }}>
            <strong style={{ color: 'var(--accent)', fontSize: '0.95rem' }}>📚 How to Read Further</strong>
            <p style={{ marginTop: 8, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              The papers and concepts referenced above are available on <strong>arxiv.org</strong> and <strong>semanticscholar.org</strong>.
              The recommended reading order: start with the original paper (linked by author and year), then read the
              "Distill.pub" visual explanations if available, then read follow-up survey papers for the broader context.
              Do not try to understand every equation in a first read — focus on the problem being solved, the proposed solution,
              and the experimental results. The mathematical details become clear on a second read.
            </p>
          </div>
        </div>
      )}

      {/* ── Quiz CTA ───────────────────────────────────────────── */}
      <div style={{
        marginTop: 32, padding: '32px 36px',
        background: 'linear-gradient(135deg, var(--accent-light) 0%, #EDE9FE 100%)',
        border: '1px solid #BFDBFE', borderRadius: 'var(--radius-lg)', textAlign: 'center',
      }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 10, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
          Test Your Understanding
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.97rem', marginBottom: 8, lineHeight: 1.7, maxWidth: 560, margin: '0 auto 20px' }}>
          You must score <strong>70% or higher</strong> to unlock the next topic. The quiz tests genuine comprehension,
          not memorization. Read each question carefully — some have subtle distinctions. You can retake it as many
          times as needed.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' as const }}>
          <button onClick={onBack} style={{
            padding: '12px 24px', background: 'var(--white)',
            border: '1.5px solid var(--border-dark)', borderRadius: 'var(--radius)',
            cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)',
            fontFamily: 'var(--font-body)',
          }}>
            ← Back to Module
          </button>
          <button onClick={onStartQuiz} style={{
            padding: '12px 32px', background: 'var(--accent)',
            border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer',
            fontSize: '1rem', fontWeight: 700, color: 'white', fontFamily: 'var(--font-body)',
          }}>
            {isCompleted ? '📝 Retake Quiz' : '📝 Take the Quiz →'}
          </button>
        </div>
      </div>

    </div>
  );
};

export default TopicPage;
