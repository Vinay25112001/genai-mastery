import React, { useState } from 'react';
import { Exercise } from '../types';

interface ExercisePageProps {
  exercise: Exercise;
  topicTitle: string;
  color: string;
  onComplete: () => void;
  onBack: () => void;
}

const ExercisePage: React.FC<ExercisePageProps> = ({ exercise, topicTitle, color, onComplete, onBack }) => {
  const [unlockedHints, setUnlockedHints] = useState<Set<number>>(new Set());
  const [stepWork, setStepWork] = useState<Record<number, string>>({});
  const [showSolution, setShowSolution] = useState(false);
  const [solutionConfirm, setSolutionConfirm] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const allDone = completedSteps.size >= exercise.steps.length;

  const revealHint = (stepIdx: number) => {
    setUnlockedHints(prev => new Set(Array.from(prev).concat(stepIdx)));
  };

  const markStep = (stepIdx: number) => {
    setCompletedSteps(prev => new Set(Array.from(prev).concat(stepIdx)));
  };

  const requestSolution = () => {
    if (!solutionConfirm) {
      setSolutionConfirm(true);
    } else {
      setShowSolution(true);
      setSolutionConfirm(false);
    }
  };

  return (
    <div className="content-wrap fade-in" style={{ padding: '32px 24px', maxWidth: 860 }}>
      {/* Back */}
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontWeight: 600, fontSize: '0.875rem', padding: 0, marginBottom: 24 }}>
        ← Back to Topic
      </button>

      {/* Header */}
      <div className="card" style={{ padding: '24px 28px', marginBottom: 24, borderLeft: `4px solid ${color}` }}>
        <div className="section-label" style={{ marginBottom: 4 }}>Hands-On Exercise</div>
        <h1 className="display-title" style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginBottom: 8 }}>
          {exercise.title}
        </h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
          {exercise.description}
        </p>
        <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span className="badge badge-blue">{exercise.steps.length} Steps</span>
          <span className="badge" style={{ background: '#FEF3C7', color: '#92400E' }}>💡 Hints Available</span>
          <span className="badge" style={{ background: '#FCE7F3', color: '#9D174D' }}>🔑 Solution Available</span>
        </div>
      </div>

      {/* Progress */}
      <div style={{ marginBottom: 20, display: 'flex', gap: 8, alignItems: 'center' }}>
        {exercise.steps.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 8, borderRadius: 'var(--radius-full)', background: completedSteps.has(i) ? color : 'var(--surface-2)', transition: 'background 0.3s' }} />
        ))}
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color, whiteSpace: 'nowrap', marginLeft: 4 }}>{completedSteps.size}/{exercise.steps.length} done</span>
      </div>

      {/* Steps */}
      {exercise.steps.map((step, i) => {
        const isDone = completedSteps.has(i);
        const isActive = !isDone && (i === 0 || completedSteps.has(i - 1));

        return (
          <div key={i} className="card" style={{
            padding: '22px 26px', marginBottom: 16,
            borderLeft: `4px solid ${isDone ? '#059669' : isActive ? color : 'var(--border)'}`,
            opacity: !isActive && !isDone ? 0.55 : 1,
            transition: 'all 0.2s',
          }}>
            {/* Step header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                background: isDone ? '#059669' : isActive ? color : 'var(--surface-2)',
                color: isDone || isActive ? 'white' : 'var(--text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '0.9rem',
              }}>
                {isDone ? '✓' : step.step}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.97rem', fontWeight: 600, lineHeight: 1.6, color: isDone ? 'var(--text-secondary)' : 'var(--text-primary)', textDecoration: isDone ? 'line-through' : 'none' }}>
                  {step.instruction}
                </p>
              </div>
            </div>

            {/* Code snippet */}
            {step.codeSnippet && (
              <div className="code-block" style={{ marginBottom: 14, fontSize: '0.82rem' }}>
                {step.codeSnippet}
              </div>
            )}

            {/* Work area */}
            {isActive && !isDone && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>
                  ✏️ Your Answer / Working:
                </label>
                <textarea
                  value={stepWork[i] || ''}
                  onChange={e => setStepWork(prev => ({ ...prev, [i]: e.target.value }))}
                  placeholder="Write your answer, notes, or working here..."
                  rows={4}
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)', fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--text-primary)', background: 'var(--white)', resize: 'vertical', outline: 'none', lineHeight: 1.6 }}
                  onFocus={e => { e.target.style.borderColor = color; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
                />
              </div>
            )}

            {/* Hint */}
            {isActive && (
              <div style={{ marginBottom: 14 }}>
                {!unlockedHints.has(i) ? (
                  <button onClick={() => revealHint(i)}
                    className="btn btn-secondary btn-sm" style={{ gap: 6 }}>
                    💡 I'm Stuck — Show Hint
                  </button>
                ) : (
                  <div style={{ padding: '12px 16px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 'var(--radius)' }}>
                    <p style={{ fontSize: '0.875rem', color: '#92400E', fontWeight: 600, marginBottom: 4 }}>💡 Hint:</p>
                    <p style={{ fontSize: '0.875rem', color: '#78350F', lineHeight: 1.6 }}>{step.hint}</p>
                  </div>
                )}
              </div>
            )}

            {/* Mark done */}
            {isActive && !isDone && (
              <button onClick={() => markStep(i)} className="btn btn-success btn-sm">
                ✓ Mark Step Complete
              </button>
            )}
          </div>
        );
      })}

      {/* Global hint */}
      <div className="card" style={{ padding: '20px 24px', marginBottom: 16, background: '#FFFBEB', border: '1px solid #FDE68A' }}>
        <h4 style={{ fontWeight: 700, color: '#92400E', fontSize: '0.9rem', marginBottom: 6 }}>🎯 Overall Exercise Hint</h4>
        <p style={{ fontSize: '0.875rem', color: '#78350F', lineHeight: 1.65 }}>{exercise.hint}</p>
      </div>

      {/* Solution section */}
      <div className="card" style={{ padding: '20px 24px', marginBottom: 24, border: '1px solid #FECACA', background: '#FFF5F5' }}>
        <h4 style={{ fontWeight: 700, color: 'var(--danger)', fontSize: '0.9rem', marginBottom: 6 }}>🔑 Full Solution</h4>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.55 }}>
          Only reveal after a genuine attempt. Real learning happens in the struggle — the solution is here to verify your work, not replace it.
        </p>
        {!showSolution ? (
          solutionConfirm ? (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Are you sure? Try once more first!</span>
              <button onClick={requestSolution} className="btn btn-sm" style={{ background: 'var(--danger)', color: 'white', border: 'none' }}>
                Yes, show solution
              </button>
              <button onClick={() => setSolutionConfirm(false)} className="btn btn-secondary btn-sm">Cancel</button>
            </div>
          ) : (
            <button onClick={requestSolution} className="btn btn-secondary btn-sm">Show Full Solution</button>
          )
        ) : (
          <div className="code-block" style={{ whiteSpace: 'pre-wrap', fontSize: '0.82rem', lineHeight: 1.7 }}>
            {exercise.solution}
          </div>
        )}
      </div>

      {/* Complete CTA */}
      {allDone && (
        <div className="card fade-in" style={{ padding: '28px', textAlign: 'center', background: 'var(--success-light)', border: '1px solid #A7F3D0' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🏆</div>
          <h3 className="display-title" style={{ fontSize: '1.2rem', color: '#065F46', marginBottom: 8 }}>
            Exercise Complete!
          </h3>
          <p style={{ color: '#047857', fontSize: '0.9rem', marginBottom: 16 }}>
            You have worked through all the steps. Your hands-on practice is a critical part of mastering Generative AI.
          </p>
          <button onClick={onComplete} className="btn btn-success btn-lg" style={{ margin: '0 auto' }}>
            ✅ Mark Exercise Done & Continue
          </button>
        </div>
      )}
    </div>
  );
};

export default ExercisePage;
