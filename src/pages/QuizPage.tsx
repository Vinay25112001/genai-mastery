import React, { useState } from 'react';
import { QuizQuestion } from '../types';

interface QuizProps {
  topicId: string;
  topicTitle: string;
  questions: QuizQuestion[];
  onPass: (score: number) => void;
  onBack: () => void;
  color: string;
  alreadyCompleted?: boolean;
  previousBestScore?: number;
}

const PASS_THRESHOLD = 0.70;

const QuizPage: React.FC<QuizProps> = ({
  topicTitle, questions, onPass, onBack, color, alreadyCompleted, previousBestScore = 0
}) => {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);
  // Explanation always visible after submit — no auto-hide
  const explanationVisible = submitted;

  const q = questions[current];
  const total = questions.length;
  const score = answers.filter(Boolean).length;
  const pct = finished ? Math.round((score / total) * 100) : 0;
  const passed = pct >= PASS_THRESHOLD * 100;
  const isNewBest = pct > previousBestScore;

  const handleSelect = (idx: number) => { if (!submitted) setSelected(idx); };

  const handleSubmit = () => {
    if (selected === null) return;
    setSubmitted(true);
    setAnswers(prev => [...prev, selected === q.correctIndex]);
  };

  const handleNext = () => {
    if (current + 1 >= total) { setFinished(true); }
    else { setCurrent(c => c + 1); setSelected(null); setSubmitted(false); }
  };

  const handleRetry = () => {
    setCurrent(0); setSelected(null); setSubmitted(false);
    setAnswers([]); setFinished(false);
  };

  const isCorrect = submitted && selected === q.correctIndex;

  // ── Results screen ─────────────────────────────────────────────────────────
  if (finished) {
    return (
      <div className="content-wrap fade-in" style={{ padding: '40px 24px', maxWidth: 700 }}>
        <div className="card" style={{ padding: '40px 36px', textAlign: 'center' }}>
          <div style={{ fontSize: 60, marginBottom: 12 }}>{passed ? '🎉' : '📚'}</div>
          <h2 style={{ fontSize: '1.7rem', fontWeight: 800, marginBottom: 8, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            {passed ? 'Excellent Work!' : 'Not Quite Yet'}
          </h2>

          {/* Score display */}
          <div style={{ display: 'inline-flex', gap: 24, padding: '16px 32px', background: passed ? 'var(--success-light)' : 'var(--danger-light)', borderRadius: 'var(--radius)', border: `1px solid ${passed ? '#A7F3D0' : '#FECACA'}`, marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: passed ? 'var(--success)' : 'var(--danger)' }}>{pct}%</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>This attempt</div>
            </div>
            {alreadyCompleted && (
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: isNewBest ? '#F59E0B' : 'var(--text-muted)' }}>{Math.max(pct, previousBestScore)}%</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Best score {isNewBest ? '🆕' : ''}</div>
              </div>
            )}
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: 28, lineHeight: 1.7 }}>
            {passed
              ? `You scored ${score}/${total} — you've unlocked the next topic!${isNewBest && alreadyCompleted ? ' New personal best! 🌟' : ''}`
              : `You scored ${score}/${total}. You need 70% to progress. Review the material and try again — every attempt is learning.`}
          </p>

          {/* Question review */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28, textAlign: 'left' }}>
            {questions.map((q, i) => (
              <div key={q.id} style={{
                padding: '12px 16px', borderRadius: 'var(--radius)',
                background: answers[i] ? 'var(--success-light)' : 'var(--danger-light)',
                border: `1px solid ${answers[i] ? '#A7F3D0' : '#FECACA'}`,
              }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ flexShrink: 0, marginTop: 1 }}>{answers[i] ? '✅' : '❌'}</span>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{q.question}</p>
                    {!answers[i] && (
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        Correct: <strong>{q.options[q.correctIndex]}</strong>
                        <br /><em>{q.explanation}</em>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={onBack} className="btn btn-secondary">← Back to Topic</button>
            {passed
              ? <button onClick={() => onPass(pct)} className="btn btn-success btn-lg">Continue →</button>
              : <button onClick={handleRetry} className="btn btn-primary">🔄 Retry Quiz</button>
            }
          </div>
        </div>
      </div>
    );
  }

  // ── Question screen ────────────────────────────────────────────────────────
  return (
    <div className="content-wrap fade-in" style={{ padding: '40px 24px', maxWidth: 700 }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontWeight: 600, fontSize: '0.875rem', padding: 0, marginBottom: 14 }}>
          ← Back to Lesson
        </button>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Quiz</p>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{topicTitle}</h1>
          </div>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: color, flexShrink: 0 }}>
            {current + 1} / {total}
          </span>
        </div>
        <div className="progress-track">
          <div style={{ height: '100%', background: color, borderRadius: 'var(--radius-full)', width: `${(current / total) * 100}%`, transition: 'width 0.4s' }} />
        </div>
        <p style={{ marginTop: 4, fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'right' }}>Pass mark: 70%</p>
      </div>

      {/* Question card */}
      <div className="card" style={{ padding: '28px 28px' }}>
        <p style={{ fontSize: '1.05rem', fontWeight: 600, lineHeight: 1.65, color: 'var(--text-primary)', marginBottom: 22 }}>
          {q.question}
        </p>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 20 }} role="radiogroup" aria-label="Answer options">
          {q.options.map((opt, idx) => {
            let bg = 'var(--white)', border = '1.5px solid var(--border)', textColor = 'var(--text-primary)';
            if (selected === idx && !submitted) { bg = 'var(--accent-light)'; border = `1.5px solid ${color}`; }
            if (submitted && idx === q.correctIndex) { bg = 'var(--success-light)'; border = '1.5px solid #059669'; textColor = '#065F46'; }
            if (submitted && selected === idx && idx !== q.correctIndex) { bg = 'var(--danger-light)'; border = '1.5px solid var(--danger)'; textColor = 'var(--danger)'; }

            return (
              <button
                key={idx}
                role="radio"
                aria-checked={selected === idx}
                onClick={() => handleSelect(idx)}
                tabIndex={0}
                style={{ padding: '12px 16px', border, borderRadius: 'var(--radius)', background: bg, color: textColor, cursor: submitted ? 'default' : 'pointer', display: 'flex', gap: 12, alignItems: 'flex-start', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: selected === idx ? 600 : 400, transition: 'all 0.15s', width: '100%' }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', border: `1.5px solid currentColor`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 700, flexShrink: 0, marginTop: 1, opacity: 0.7 }}>
                  {submitted && idx === q.correctIndex ? '✓' : submitted && selected === idx && idx !== q.correctIndex ? '✗' : String.fromCharCode(65 + idx)}
                </span>
                <span style={{ lineHeight: 1.55 }}>{opt}</span>
              </button>
            );
          })}
        </div>

        {/* Explanation — always visible after submit, never auto-dismissed */}
        {explanationVisible && (
          <div style={{ padding: '14px 16px', borderRadius: 'var(--radius)', marginBottom: 18, background: isCorrect ? 'var(--success-light)' : 'var(--warning-light)', border: `1px solid ${isCorrect ? '#A7F3D0' : '#FDE68A'}` }} role="region" aria-label="Explanation">
            <p style={{ fontWeight: 700, color: isCorrect ? 'var(--success)' : 'var(--warning)', marginBottom: 6, fontSize: '0.9rem' }}>
              {isCorrect ? '✅ Correct!' : `❌ The correct answer is: "${q.options[q.correctIndex]}"`}
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>
              <strong>Why:</strong> {q.explanation}
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {!submitted ? (
            <button
              onClick={handleSubmit}
              disabled={selected === null}
              className="btn btn-primary"
              style={{ background: selected !== null ? color : 'var(--text-muted)', cursor: selected !== null ? 'pointer' : 'not-allowed' }}>
              Submit Answer
            </button>
          ) : (
            <button onClick={handleNext} className="btn btn-primary" style={{ background: color }}>
              {current + 1 >= total ? 'See Results →' : 'Next Question →'}
            </button>
          )}
          {!submitted && selected !== null && (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Click Submit to confirm your answer</span>
          )}
        </div>
      </div>

      <div style={{ marginTop: 16, padding: '11px 16px', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        💡 Read the explanation carefully before moving on — it contains the key insight for this concept.
      </div>
    </div>
  );
};

export default QuizPage;
