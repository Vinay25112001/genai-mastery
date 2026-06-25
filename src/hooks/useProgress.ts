import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase';
import { curriculum } from '../data/curriculum';
import { computeBadges, computeTotalScore } from '../lib/badges';
import { SyncStatus } from '../components/ui/SyncIndicator';

interface ProgressState {
  completedTopics: Set<string>;
  quizScores: Record<string, number>;
}

const STORAGE_KEY = 'genai-mastery-progress';

const loadLocal = (): ProgressState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const p = JSON.parse(saved);
      return { completedTopics: new Set(p.completedTopics || []), quizScores: p.quizScores || {} };
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
  } catch { return null; }
};

const saveToCloud = async (userId: string, displayName: string, p: ProgressState): Promise<boolean> => {
  if (!supabaseConfigured) return false;
  try {
    const badges = computeBadges(p.completedTopics, p.quizScores, curriculum);
    const totalScore = computeTotalScore(p.quizScores);
    const { error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        display_name: displayName,
        completed_topics: [...p.completedTopics],
        quiz_scores: p.quizScores,
        badges,
        total_score: totalScore,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
    return !error;
  } catch { return false; }
};

export const useProgress = (
  userId: string | null,
  displayName: string = '',
  onSyncError?: () => void
) => {
  const [progress, setProgress] = useState<ProgressState>(loadLocal);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('local');
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  // Merge cloud progress on login
  useEffect(() => {
    if (!userId || !supabaseConfigured) return;
    const merge = async () => {
      setSyncStatus('syncing');
      const cloud = await fetchFromCloud(userId);
      if (cloud) {
        setProgress(prev => {
          const merged: ProgressState = {
            completedTopics: new Set([...prev.completedTopics, ...cloud.completedTopics]),
            quizScores: { ...cloud.quizScores },
          };
          // Always keep highest score per topic
          Object.entries(prev.quizScores).forEach(([t, s]) => {
            merged.quizScores[t] = Math.max(s, merged.quizScores[t] || 0);
          });
          saveLocal(merged);
          return merged;
        });
        setSyncStatus('synced');
      } else {
        // First login — push local progress to cloud
        const local = loadLocal();
        if (local.completedTopics.size > 0) {
          const ok = await saveToCloud(userId, displayName, local);
          setSyncStatus(ok ? 'synced' : 'error');
        } else {
          setSyncStatus('synced');
        }
      }
    };
    merge();
  }, [userId]);

  // Debounced save to cloud on every progress change
  useEffect(() => {
    saveLocal(progress);
    if (!userId || !supabaseConfigured) {
      setSyncStatus('local');
      return;
    }
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    setSyncStatus('syncing');
    saveTimeout.current = setTimeout(async () => {
      const online = navigator.onLine;
      if (!online) { setSyncStatus('offline'); if (onSyncError) onSyncError(); return; }
      const ok = await saveToCloud(userId, displayName, progress);
      setSyncStatus(ok ? 'synced' : 'error');
      if (!ok && onSyncError) onSyncError();
    }, 1200);
    return () => { if (saveTimeout.current) clearTimeout(saveTimeout.current); };
  }, [progress, userId, displayName]);

  // Online / offline listeners
  useEffect(() => {
    const goOnline = () => {
      if (userId && supabaseConfigured) {
        setSyncStatus('syncing');
        saveToCloud(userId, displayName, progress).then(ok => setSyncStatus(ok ? 'synced' : 'error'));
      }
    };
    const goOffline = () => setSyncStatus('offline');
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => { window.removeEventListener('online', goOnline); window.removeEventListener('offline', goOffline); };
  }, [userId, displayName, progress]);

  const markTopicComplete = useCallback(async (topicId: string, score: number) => {
    setProgress(prev => {
      // Always keep the HIGHEST score, never overwrite with lower
      const existing = prev.quizScores[topicId] || 0;
      return {
        completedTopics: new Set([...prev.completedTopics, topicId]),
        quizScores: { ...prev.quizScores, [topicId]: Math.max(score, existing) },
      };
    });
  }, []);

  const isTopicUnlocked = useCallback((topicId: string): boolean => {
    for (let mIdx = 0; mIdx < curriculum.length; mIdx++) {
      const mod = curriculum[mIdx];
      const tIdx = mod.topics.findIndex(t => t.id === topicId);
      if (tIdx === -1) continue;
      if (tIdx === 0 && mIdx === 0) return true;
      if (tIdx === 0 && mIdx > 0) return curriculum[mIdx - 1].topics.some(t => progress.completedTopics.has(t.id));
      return progress.completedTopics.has(mod.topics[tIdx - 1].id);
    }
    return false;
  }, [progress.completedTopics]);

  const canRevisit = useCallback((topicId: string) =>
    progress.completedTopics.has(topicId), [progress.completedTopics]);

  const getModuleProgress = useCallback((moduleId: string) => {
    const mod = curriculum.find(m => m.id === moduleId);
    if (!mod) return { completed: 0, total: 0, pct: 0 };
    const total = mod.topics.length;
    const completed = mod.topics.filter(t => progress.completedTopics.has(t.id)).length;
    return { completed, total, pct: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [progress.completedTopics]);

  const getTotalProgress = useCallback(() => {
    const total = curriculum.reduce((s, m) => s + m.topics.length, 0);
    const completed = progress.completedTopics.size;
    return { completed, total, pct: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [progress.completedTopics]);

  const earnedBadges = computeBadges(progress.completedTopics, progress.quizScores, curriculum);
  const totalScore = computeTotalScore(progress.quizScores);

  return {
    progress, syncStatus, markTopicComplete,
    isTopicUnlocked, canRevisit,
    getModuleProgress, getTotalProgress,
    earnedBadges, totalScore,
  };
};
