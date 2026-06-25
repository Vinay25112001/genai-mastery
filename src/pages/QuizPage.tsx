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
}

const PASS_THRESHOLD = 0.70;

const QuizPage: React.FC<QuizProps> = ({ topicTitle, questions, onPass, onBack, color }) => {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [finished, setFinished] = useState(false);

  const q = questions[current];
  const total = questions.length;
  const score = answers.filter(Boolean).length;
  const pct = finished ? Math.round((score / total) * 100) : 0;
  const passed = pct >= PASS_THRESHOLD * 100;

  const handleSelect = (idx: number) => {
    if (submitted) return;
    setSelected(idx);
  };

  const handleSubmit = () => {
    if (selected === null) return;
    const correct = selected === q.correctIndex;
    setSubmitted(true);
    setShowExplanation(true);
    setAnswers(prev => [...prev, correct]);
  };

  const handleNext = () => {
    if (current + 1 >= total) {
      setFinished(true);
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setSubmitted(false);
      setShowExplanation(false);
    }
  };

  const handleRetry = () => {
    setCurrent(0);
    setSelected(null);
    setSubmitted(false);
    setShowExplanation(false);
    setAnswers([]);
    setFinished(false);
  };

  // Results screen
  if (finished) {
    return (
      <div className="content-wrap fade-in" style={{ padding: '40px 24px', maxWidth: 700 }}>
        <div className="card" style={{ padding: '40px 36px', textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>
            {passed ? '🎉' : '📚'}
          </div>
          <h2 className="display-title" style={{ fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: 8 }}>
            {passed ? 'Excellent Work!' : 'Not Quite Yet'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: 28 }}>
            {passed
              ? `You scored ${score}/${total} (${pct}%). You've unlocked the next topic!`
              : `You scored ${score}/${total} (${pct}%). You need 70% to progress. Review the material and try again — every attempt is learning.`
            }
          </p>

          {/* Score breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28, textAlign: 'left' }}>
            {questions.map((q, i) => (
              <div key={q.id} style={{
                padding: '12px 16px', borderRadius: 'var(--radius)',
                background: answers[i] ? 'var(--success-light)' : 'var(--danger-light)',
                border: `1px solid ${answers[i] ? '#A7F3D0' : '#FECACA'}`,
                display: 'flex', gap: 12, alignItems: 'flex-start',
              }}>
                <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{answers[i] ? '✅' : '❌'}</span>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{q.question}</p>
                  {!answers[i] && (
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      Correct: <strong>{q.options[q.correctIndex]}</strong>
                      <br /><span style={{ fontStyle: 'italic' }}>{q.explanation}</span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button onClick={onBack} className="btn btn-secondary">← Back to Topic</button>
            {passed
              ? <button onClick={() => onPass(pct)} className="btn btn-success btn-lg">Unlock Next Topic →</button>
              : <button onClick={handleRetry} className="btn btn-primary">🔄 Retry Quiz</button>
            }
          </div>
        </div>
      </div>
    );
  }

  // Question screen
  const isCorrect = submitted && selected === q.correctIndex;
  const isWrong = submitted && selected !== q.correctIndex;

  return (
    <div className="content-wrap fade-in" style={{ padding: '40px 24px', maxWidth: 700 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontWeight: 600, fontSize: '0.875rem', padding: 0, marginBottom: 16 }}>
          ← Back to Lesson
        </button>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <div className="section-label" style={{ marginBottom: 2 }}>Quiz</div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{topicTitle}</h1>
          </div>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: color }}>
            Question {current + 1} / {total}
          </span>
        </div>
        {/* Progress */}
        <div className="progress-track">
          <div style={{ height: '100%', background: color, borderRadius: 'var(--radius-full)', width: `${((current) / total) * 100}%`, transition: 'width 0.4s' }} />
        </div>
        <div style={{ marginTop: 4, fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>
          Passing score: 70%
        </div>
      </div>

      {/* Question card */}
      <div className="card" style={{ padding: '28px 32px' }}>
        <p style={{ fontSize: '1.05rem', fontWeight: 600, lineHeight: 1.6, color: 'var(--text-primary)', marginBottom: 24 }}>
          {q.question}
        </p>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {q.options.map((opt, idx) => {
            let bg = 'var(--white)', border = '1.5px solid var(--border)', textColor = 'var(--text-primary)';
            if (selected === idx && !submitted) { bg = 'var(--accent-light)'; border = `1.5px solid ${color}`; }
            if (submitted && idx === q.correctIndex) { bg = 'var(--success-light)'; border = '1.5px solid #059669'; textColor = '#065F46'; }
            if (submitted && selected === idx && idx !== q.correctIndex) { bg = 'var(--danger-light)'; border = '1.5px solid var(--danger)'; textColor = 'var(--danger)'; }

            return (
              <button key={idx} onClick={() => handleSelect(idx)}
                style={{
                  padding: '13px 18px', border, borderRadius: 'var(--radius)',
                  background: bg, color: textColor, cursor: submitted ? 'default' : 'pointer',
                  display: 'flex', gap: 12, alignItems: 'center', textAlign: 'left',
                  fontFamily: 'var(--font-body)', fontSize: '0.92rem', fontWeight: selected === idx ? 600 : 400,
                  transition: 'all 0.15s',
                }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', border: `1.5px solid ${border.replace('1.5px solid ', '')}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>
                  {submitted && idx === q.correctIndex ? '✓' : submitted && selected === idx && idx !== q.correctIndex ? '✗' : String.fromCharCode(65 + idx)}
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {/* Explanation after answer */}
        {showExplanation && (
          <div style={{
            padding: '14px 18px', borderRadius: 'var(--radius)', marginBottom: 16,
            background: isCorrect ? 'var(--success-light)' : 'var(--warning-light)',
            border: `1px solid ${isCorrect ? '#A7F3D0' : '#FDE68A'}`,
          }}>
            <p style={{ fontWeight: 700, color: isCorrect ? 'var(--success)' : 'var(--warning)', marginBottom: 6, fontSize: '0.9rem' }}>
              {isCorrect ? '✅ Correct!' : `❌ Not quite. The correct answer is: "${q.options[q.correctIndex]}"`}
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <strong>Explanation:</strong> {q.explanation}
            </p>
          </div>
        )}

        {/* Submit / Next */}
        <div style={{ display: 'flex', gap: 12 }}>
          {!submitted ? (
            <button onClick={handleSubmit} disabled={selected === null} className="btn btn-primary" style={{ background: color }}>
              Submit Answer
            </button>
          ) : (
            <button onClick={handleNext} className="btn btn-primary" style={{ background: color }}>
              {current + 1 >= total ? 'See Results →' : 'Next Question →'}
            </button>
          )}
        </div>
      </div>

      {/* Encouragement */}
      <div style={{ marginTop: 20, padding: '12px 16px', background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
        💡 <strong>Remember:</strong> You can retry the quiz as many times as you need. Go back to the lesson any time to review the material. The goal is genuine understanding, not just passing.
      </div>
    </div>
  );
};

export default QuizPage;
