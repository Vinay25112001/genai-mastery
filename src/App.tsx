import React, { useState, Component, lazy, Suspense } from 'react';
import './styles/global.css';
import { useAuth } from './hooks/useAuth';
import { useProgress } from './hooks/useProgress';
import { useToast } from './hooks/useToast';
import { curriculum, getTopicById } from './data/curriculum';
import AuthPage from './pages/AuthPage';
import Navbar from './components/layout/Navbar';
import ToastContainer from './components/ui/ToastContainer';
import SyncIndicator from './components/ui/SyncIndicator';

// Lazy-loaded pages — each loads only when first navigated to
const DashboardPage  = lazy(() => import('./pages/DashboardPage'));
const ModulePage     = lazy(() => import('./pages/ModulePage'));
const TopicPage      = lazy(() => import('./pages/TopicPage'));
const QuizPage       = lazy(() => import('./pages/QuizPage'));
const ExercisePage   = lazy(() => import('./pages/ExercisePage'));
const ProfilePage    = lazy(() => import('./pages/ProfilePage'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));

// ── Error Boundary ──────────────────────────────────────────────────────────
class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean; error: string }> {
  constructor(props: any) { super(props); this.state = { hasError: false, error: '' }; }
  static getDerivedStateFromError(e: Error) { return { hasError: true, error: e.message }; }
  render() {
    if (this.state.hasError) return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F1F5F9', padding: 24 }}>
        <div style={{ maxWidth: 520, background: 'white', borderRadius: 16, padding: '48px 40px', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 12 }}>Something went wrong</h1>
          <p style={{ color: '#6B7280', marginBottom: 24, lineHeight: 1.7 }}>Check that your Supabase secrets are configured in GitHub and the workflow deployed successfully.</p>
          <div style={{ background: '#FEF2F2', borderRadius: 8, padding: '12px 16px', marginBottom: 24, fontSize: '0.8rem', color: '#DC2626', fontFamily: 'monospace', wordBreak: 'break-all', textAlign: 'left' }}>{this.state.error}</div>
          <button onClick={() => window.location.reload()} style={{ padding: '12px 32px', background: '#3B82F6', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}>Reload Page</button>
        </div>
      </div>
    );
    return this.props.children;
  }
}

// ── Page loading fallback ───────────────────────────────────────────────────
const PageLoader = () => (
  <div style={{ padding: '60px 24px', maxWidth: 800, margin: '0 auto' }}>
    {[200, 400, 300, 350, 250].map((w, i) => (
      <div key={i} className="skeleton" style={{ height: i === 0 ? 48 : 20, width: `${w}px`, maxWidth: '100%', marginBottom: i === 0 ? 24 : 12 }} />
    ))}
  </div>
);

type View =
  | { type: 'dashboard' }
  | { type: 'module';   moduleId: string }
  | { type: 'topic';    topicId: string }
  | { type: 'quiz';     topicId: string }
  | { type: 'exercise'; topicId: string }
  | { type: 'profile' }
  | { type: 'leaderboard' };

// ── Main App ────────────────────────────────────────────────────────────────
const AppInner: React.FC = () => {
  const { user, loading: authLoading, signOut, deleteAccount, updateProfile } = useAuth();
  const [view, setView] = useState<View>({ type: 'dashboard' });
  const [localUserName, setLocalUserName] = useState('');
  const { toasts, success, error: toastError, warning } = useToast();

  const displayName = localUserName || user?.full_name || user?.email || '';

  const { progress, syncStatus, markTopicComplete, isTopicUnlocked, canRevisit, getModuleProgress, getTotalProgress, earnedBadges, totalScore } =
    useProgress(user?.id || null, displayName, () => warning('Progress saved locally — will sync when reconnected'));

  if (authLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🧠</div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading GenAI Mastery...</div>
      </div>
    </div>
  );

  if (!user) return <AuthPage />;

  const totalProgress = getTotalProgress();
  const isTopicAccessible = (topicId: string) => isTopicUnlocked(topicId) || canRevisit(topicId);

  const handleDeleteAccount = async () => {
    const result = await deleteAccount();
    if (result.error) toastError('Failed to delete: ' + result.error.message);
  };

  const handleUpdateProfile = async (updates: { full_name?: string; leaderboard_consent?: boolean }) => {
    const result = await updateProfile(updates);
    if (!result.error) {
      if (updates.full_name) setLocalUserName(updates.full_name);
      success('Profile updated');
    }
    return result;
  };

  const renderContent = () => {
    if (view.type === 'profile') return (
      <ProfilePage
        user={{ ...user, full_name: displayName }}
        earnedBadgeIds={earnedBadges}
        totalScore={totalScore}
        completedCount={progress.completedTopics.size}
        onBack={() => setView({ type: 'dashboard' })}
        onDeleteAccount={handleDeleteAccount}
        onUsernameUpdate={name => setLocalUserName(name)}
        onUpdateProfile={handleUpdateProfile}
      />
    );

    if (view.type === 'leaderboard') return (
      <LeaderboardPage
        currentUserName={displayName}
        currentUserScore={totalScore}
        onBack={() => setView({ type: 'dashboard' })}
      />
    );

    if (view.type === 'dashboard') return (
      <DashboardPage
        user={{ ...user, full_name: displayName }}
        onSelectModule={moduleId => setView({ type: 'module', moduleId })}
        getModuleProgress={getModuleProgress}
        getTotalProgress={getTotalProgress}
        isTopicUnlocked={isTopicAccessible}
      />
    );

    if (view.type === 'module') {
      const module = curriculum.find(m => m.id === view.moduleId);
      if (!module) return null;
      return (
        <ModulePage
          module={module}
          onSelectTopic={topicId => setView({ type: 'topic', topicId })}
          onBack={() => setView({ type: 'dashboard' })}
          isTopicUnlocked={isTopicAccessible}
          completedTopics={progress.completedTopics}
          getModuleProgress={getModuleProgress}
        />
      );
    }

    if (view.type === 'topic') {
      const result = getTopicById(view.topicId);
      if (!result) return null;
      const { topic, module } = result;
      return (
        <TopicPage
          topic={topic} module={module}
          isCompleted={progress.completedTopics.has(topic.id)}
          onStartQuiz={() => setView({ type: 'quiz', topicId: view.topicId })}
          onBack={() => setView({ type: 'module', moduleId: module.id })}
          onGoHome={() => setView({ type: 'dashboard' })}
        />
      );
    }

    if (view.type === 'quiz') {
      const result = getTopicById(view.topicId);
      if (!result) return null;
      const { topic, module } = result;
      return (
        <QuizPage
          topicId={topic.id}
          topicTitle={topic.title}
          questions={topic.quiz}
          color={module.color}
          alreadyCompleted={progress.completedTopics.has(topic.id)}
          previousBestScore={progress.quizScores[topic.id] || 0}
          onPass={async (score) => {
            await markTopicComplete(topic.id, score);
            success(`✅ Topic complete! Score: ${score}%`);
            setView({ type: 'exercise', topicId: topic.id });
          }}
          onBack={() => setView({ type: 'topic', topicId: view.topicId })}
        />
      );
    }

    if (view.type === 'exercise') {
      const result = getTopicById(view.topicId);
      if (!result) return null;
      const { topic, module } = result;
      const modTopics = module.topics;
      const currentIdx = modTopics.findIndex(t => t.id === topic.id);
      const nextTopic = modTopics[currentIdx + 1];
      const modIdx = curriculum.findIndex(m => m.id === module.id);
      const nextModule = curriculum[modIdx + 1];
      return (
        <ExercisePage
          exercise={topic.exercise}
          topicTitle={topic.title}
          color={module.color}
          onComplete={() => {
            if (nextTopic) setView({ type: 'topic', topicId: nextTopic.id });
            else if (nextModule) setView({ type: 'module', moduleId: nextModule.id });
            else setView({ type: 'dashboard' });
          }}
          onBack={() => setView({ type: 'topic', topicId: view.topicId })}
        />
      );
    }
    return null;
  };

  return (
    <div className="page-container">
      <Navbar
        user={{ ...user, full_name: displayName }}
        onSignOut={signOut}
        onGoHome={() => setView({ type: 'dashboard' })}
        onGoProfile={() => setView({ type: 'profile' })}
        onGoLeaderboard={() => setView({ type: 'leaderboard' })}
        onDeleteAccount={handleDeleteAccount}
        totalPct={totalProgress.pct}
        earnedBadges={earnedBadges}
        totalScore={totalScore}
      />

      <main style={{ flex: 1 }}>
        <Suspense fallback={<PageLoader />}>
          {renderContent()}
        </Suspense>
      </main>

      <footer style={{ background: 'var(--white)', borderTop: '1px solid var(--border)', padding: '18px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
          GenAI Mastery · Progress saved to cloud · {new Date().getFullYear()}
        </p>
      </footer>

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} />

      {/* Sync status indicator — only show when not synced */}
      {syncStatus !== 'synced' && <SyncIndicator status={syncStatus} />}
    </div>
  );
};

const App: React.FC = () => <ErrorBoundary><AppInner /></ErrorBoundary>;
export default App;
