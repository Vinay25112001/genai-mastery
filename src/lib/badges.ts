// ─── Badge definitions ────────────────────────────────────────────────────────
export interface Badge {
  id: string;
  emoji: string;
  name: string;
  description: string;
  color: string;
}

export const ALL_BADGES: Badge[] = [
  { id: 'first_step',    emoji: '🚀', name: 'First Step',      description: 'Completed your first topic',              color: '#3B82F6' },
  { id: 'quiz_ace',      emoji: '💯', name: 'Quiz Ace',        description: 'Scored 100% on any quiz',                  color: '#10B981' },
  { id: 'mod1_complete', emoji: '🧠', name: 'AI Foundations',  description: 'Completed Module 1 — What Is AI?',         color: '#4F86F7' },
  { id: 'mod2_complete', emoji: '⚙️', name: 'ML Engineer',     description: 'Completed Module 2 — How Machines Learn',  color: '#10B981' },
  { id: 'mod3_complete', emoji: '✨', name: 'GenAI Pioneer',   description: 'Completed Module 3 — What Is Generative AI?', color: '#8B5CF6' },
  { id: 'mod4_complete', emoji: '🔮', name: 'LLM Expert',      description: 'Completed Module 4 — Large Language Models', color: '#EC4899' },
  { id: 'mod5_complete', emoji: '🎯', name: 'Prompt Master',   description: 'Completed Module 5 — Prompt Engineering',  color: '#F59E0B' },
  { id: 'mod6_complete', emoji: '🔍', name: 'RAG Builder',     description: 'Completed Module 6 — RAG Pipelines',       color: '#F59E0B' },
  { id: 'mod7_complete', emoji: '🌫️', name: 'Diffusion Pro',  description: 'Completed Module 7 — Diffusion Models',    color: '#6366F1' },
  { id: 'mod8_complete', emoji: '🔧', name: 'Fine-Tuner',      description: 'Completed Module 8 — Fine-Tuning',         color: '#EF4444' },
  { id: 'mod9_complete', emoji: '🧭', name: 'Agent Architect', description: 'Completed Module 9 — AI Agents',           color: '#06B6D4' },
  { id: 'mod10_complete',emoji: '🔭', name: 'Visionary',       description: 'Completed Module 10 — Ethics & Future',    color: '#8B5CF6' },
  { id: 'halfway',       emoji: '🏅', name: 'Halfway There',   description: 'Completed 14 of 28 topics',                color: '#F59E0B' },
  { id: 'graduate',      emoji: '🎓', name: 'GenAI Graduate',  description: 'Completed all 28 topics',                  color: '#10B981' },
  { id: 'high_scorer',   emoji: '⭐', name: 'High Scorer',     description: 'Accumulated 1000+ total score points',     color: '#F59E0B' },
  { id: 'streak_5',      emoji: '🔥', name: 'On Fire',         description: 'Completed 5 topics in a row',              color: '#EF4444' },
];

const BADGE_MAP = Object.fromEntries(ALL_BADGES.map(b => [b.id, b]));

// ─── Compute which badges a user has earned ───────────────────────────────────
export const computeBadges = (
  completedTopics: Set<string>,
  quizScores: Record<string, number>,
  modules: { id: string; topics: { id: string }[] }[]
): string[] => {
  const earned: string[] = [];
  const completed = completedTopics.size;
  const totalScore = Object.values(quizScores).reduce((s, v) => s + v, 0);

  if (completed >= 1)  earned.push('first_step');
  if (completed >= 14) earned.push('halfway');
  if (completed >= 28) earned.push('graduate');
  if (totalScore >= 1000) earned.push('high_scorer');
  if (Object.values(quizScores).some(s => s >= 100)) earned.push('quiz_ace');

  // Module completion badges
  modules.forEach((mod, idx) => {
    const badgeId = `mod${idx + 1}_complete`;
    if (mod.topics.every(t => completedTopics.has(t.id))) {
      earned.push(badgeId);
    }
  });

  return [...new Set(earned)];
};

export const getBadge = (id: string): Badge | undefined => BADGE_MAP[id];

// Score = sum of all quiz percentages (0-100 per quiz)
export const computeTotalScore = (quizScores: Record<string, number>): number =>
  Object.values(quizScores).reduce((sum, v) => sum + v, 0);
