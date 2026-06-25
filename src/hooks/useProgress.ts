import { useState, useEffect, useCallback } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase';
import { curriculum } from '../data/curriculum';

interface ProgressState {
  completedTopics: Set<string>;
  quizScores: Record<string, number>;
}

const STORAGE_KEY = 'genai-mastery-progress';

// ── localStorage helpers ──────────────────────────────────────────────────────
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
  if (!supabaseConfigured) return null;
  try {
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
  } catch {
    return null;
  }
};

const saveToCloud = async (userId: string, p: ProgressState) => {
  if (!supabaseConfigured) return;
  try {
    await supabase
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
  } catch {}
};

// ── Hook ──────────────────────────────────────────────────────────────────────
export const useProgress = (userId: string | null) => {
  const [progress, setProgress] = useState<ProgressState>(loadLocal);
  const [syncing, setSyncing] = useState(false);

  // When user logs in, load their cloud progress
  useEffect(() => {
    if (!userId || !supabaseConfigured) return;

    const mergeWithCloud = async () => {
      setSyncing(true);
      const cloud = await fetchFromCloud(userId);
      if (cloud) {
        setProgress(prev => {
          const merged: ProgressState = {
            completedTopics: new Set([...prev.completedTopics, ...cloud.completedTopics]),
            quizScores: { ...cloud.quizScores },
          };
          Object.entries(prev.quizScores).forEach(([topic, score]) => {
            merged.quizScores[topic] = Math.max(score, merged.quizScores[topic] || 0);
          });
          saveLocal(merged);
          return merged;
        });
      } else {
        // First login on this device — push local progress to cloud
        const local = loadLocal();
        if (local.completedTopics.size > 0) {
          await saveToCloud(userId, local);
        }
      }
      setSyncing(false);
    };

    mergeWithCloud();
  }, [userId]);

  // Save whenever progress changes
  useEffect(() => {
    saveLocal(progress);
    if (userId && supabaseConfigured) {
      saveToCloud(userId, progress);
    }
  }, [progress, userId]);

  const markTopicComplete = useCallback(async (topicId: string, score: number) => {
    setProgress(prev => ({
      completedTopics: new Set([...prev.completedTopics, topicId]),
      quizScores: { ...prev.quizScores, [topicId]: score },
    }));
  }, []);

  const isTopicUnlocked = useCallback((topicId: string): boolean => {
    for (let mIdx = 0; mIdx < curriculum.length; mIdx++) {
      const module = curriculum[mIdx];
      const tIdx = module.topics.findIndex(t => t.id === topicId);
      if (tIdx === -1) continue;
      if (tIdx === 0 && mIdx === 0) return true;
      if (tIdx === 0 && mIdx > 0) {
        const prevModule = curriculum[mIdx - 1];
        return prevModule.topics.some(t => progress.completedTopics.has(t.id));
      }
      const prevTopic = module.topics[tIdx - 1];
      return progress.completedTopics.has(prevTopic.id);
    }
    return false;
  }, [progress.completedTopics]);

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
