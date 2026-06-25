import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { curriculum } from '../data/curriculum';

interface ProgressState {
  completedTopics: Set<string>;
  quizScores: Record<string, number>;
}

const STORAGE_KEY = 'genai-mastery-progress';

// ── Local storage helpers ─────────────────────────────────────────────────────
const loadLocal = (): ProgressState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        completedTopics: new Set(parsed.completedTopics || []),
        quizScores: parsed.quizScores || {},
      };
    }
  } catch {}
  return { completedTopics: new Set(), quizScores: {} };
};

const saveLocal = (p: ProgressState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      completedTopics: [...p.completedTopics],
      quizScores: p.quizScores,
    }));
  } catch {}
};

// ── Supabase helpers ──────────────────────────────────────────────────────────
const fetchFromCloud = async (userId: string): Promise<ProgressState | null> => {
  const { data, error } = await supabase
    .from('user_progress')
    .select('completed_topics, quiz_scores')
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;
  return {
    completedTopics: new Set(data.completed_topics || []),
    quizScores: data.quiz_scores || {},
  };
};

const saveToCloud = async (userId: string, p: ProgressState) => {
  const { error } = await supabase
    .from('user_progress')
    .upsert(
      {
        user_id: userId,
        completed_topics: [...p.completedTopics],
        quiz_scores: p.quizScores,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );
  if (error) console.error('Failed to save progress to cloud:', error.message);
};

// ── Hook ──────────────────────────────────────────────────────────────────────
export const useProgress = (userId: string | null) => {
  const [progress, setProgress] = useState<ProgressState>(loadLocal);
  const [syncing, setSyncing] = useState(false);

  // When user logs in, merge cloud progress with local progress
  useEffect(() => {
    if (!userId) return;

    const mergeWithCloud = async () => {
      setSyncing(true);
      const cloud = await fetchFromCloud(userId);
      if (cloud) {
        // Merge: union of completed topics, take highest quiz score
        setProgress(prev => {
          const merged: ProgressState = {
            completedTopics: new Set([...prev.completedTopics, ...cloud.completedTopics]),
            quizScores: { ...cloud.quizScores },
          };
          // Keep highest score for each topic
          Object.entries(prev.quizScores).forEach(([topic, score]) => {
            merged.quizScores[topic] = Math.max(score, merged.quizScores[topic] || 0);
          });
          saveLocal(merged);
          return merged;
        });
      } else {
        // No cloud data yet — push local progress to cloud
        const local = loadLocal();
        if (local.completedTopics.size > 0) {
          await saveToCloud(userId, local);
        }
      }
      setSyncing(false);
    };

    mergeWithCloud();
  }, [userId]);

  // Save to localStorage and cloud whenever progress changes
  useEffect(() => {
    saveLocal(progress);
    if (userId) {
      saveToCloud(userId, progress);
    }
  }, [progress, userId]);

  const markTopicComplete = useCallback(async (topicId: string, score: number) => {
    setProgress(prev => ({
      completedTopics: new Set([...prev.completedTopics, topicId]),
      quizScores: { ...prev.quizScores, [topicId]: score },
    }));
  }, []);

  // ── Navigation helpers ────────────────────────────────────────────────────
  // Topics unlock when the previous topic in the same module is completed
  // OR when the topic is the first in its module AND the previous module is complete
  const isTopicUnlocked = useCallback((topicId: string): boolean => {
    for (let mIdx = 0; mIdx < curriculum.length; mIdx++) {
      const module = curriculum[mIdx];
      const tIdx = module.topics.findIndex(t => t.id === topicId);
      if (tIdx === -1) continue;

      // First topic of first module: always unlocked
      if (tIdx === 0 && mIdx === 0) return true;

      // First topic of a later module: unlocked when prev module has ≥1 topic done
      if (tIdx === 0 && mIdx > 0) {
        const prevModule = curriculum[mIdx - 1];
        return prevModule.topics.some(t => progress.completedTopics.has(t.id));
      }

      // Any other topic: unlocked when the previous topic in this module is completed
      const prevTopic = module.topics[tIdx - 1];
      return progress.completedTopics.has(prevTopic.id);
    }
    return false;
  }, [progress.completedTopics]);

  // Already-completed topics are always revisitable — never lock completed content
  const canRevisit = useCallback((topicId: string): boolean => {
    return progress.completedTopics.has(topicId);
  }, [progress.completedTopics]);

  const getModuleProgress = useCallback((moduleId: string) => {
    const module = curriculum.find(m => m.id === moduleId);
    if (!module) return { completed: 0, total: 0, pct: 0 };
    const total = module.topics.length;
    const completed = module.topics.filter(t => progress.completedTopics.has(t.id)).length;
    return { completed, total, pct: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [progress.completedTopics]);

  const getTotalProgress = useCallback(() => {
    const total = curriculum.reduce((sum, m) => sum + m.topics.length, 0);
    const completed = progress.completedTopics.size;
    return { completed, total, pct: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [progress.completedTopics]);

  return {
    progress,
    syncing,
    markTopicComplete,
    isTopicUnlocked,
    canRevisit,
    getModuleProgress,
    getTotalProgress,
  };
};
