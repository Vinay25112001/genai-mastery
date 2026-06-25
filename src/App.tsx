import React, { useState, Component } from 'react';
import './styles/global.css';
import { useAuth } from './hooks/useAuth';
import { useProgress } from './hooks/useProgress';
import { curriculum, getTopicById } from './data/curriculum';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ModulePage from './pages/ModulePage';
import TopicPage from './pages/TopicPage';
import QuizPage from './pages/QuizPage';
import ExercisePage from './pages/ExercisePage';
import Navbar from './components/layout/Navbar';

// ── Error Boundary — catches any crash and shows a message instead of blank page ──
class ErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: '' };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F1F5F9', padding: 24 }}>
          <div style={{ maxWidth: 520, width: '100%', background: 'white', borderRadius: 16, padding: '48px 40px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 12, color: '#111827' }}>
              Something went wrong
            </h1>
            <p style={{ color: '#6B7280', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: 24 }}>
              The app encountered an error. This is usually caused by missing environment variables.
              Make sure your Supabase secrets are added to GitHub and the site has been redeployed via GitHub Actions.
            </p>
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '12px 16px', marginBottom: 24, fontSize: '0.82rem', color: '#DC2626', textAlign: 'left', fontFamily: 'monospace', wordBreak: 'break-all' }}>
              {this.state.error}
            </div>
            <button
              onClick={() => window.location.reload()}
              style={{ padding: '12px 32px', background: '#3B82F6', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}>
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Main App ─────────────────────────────────────────────────────────────────
type View =
  | { type: 'dashboard' }
  | { type: 'module'; moduleId: string }
  | { type: 'topic'; topicId: string }
  | { type: 'quiz'; topicId: string }
  | { type: 'exercise'; topicId: string };

const AppInner: React.FC = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const {
    progress,
    syncing,
    markTopicComplete,
    isTopicUnlocked,
    canRevisit,
    getModuleProgress,
    getTotalProgress,
  } = useProgress(user?.id || null);
  const [view, setView] = useState<View>({ type: 'dashboard' });

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🧠</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading GenAI Mastery...</div>
        </div>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  const totalProgress = getTotalProgress();

  // Topics are accessible if unlocked (new) OR already completed (revision)
  const isTopicAccessible = (topicId: string): boolean =>
    isTopicUnlocked(topicId) || canRevisit(topicId);

  const renderContent = () => {
    if (view.type === 'dashboard') {
      return (
        <DashboardPage
          user={user}
          onSelectModule={moduleId => setView({ type: 'module', moduleId })}
          getModuleProgress={getModuleProgress}
          getTotalProgress={getTotalProgress}
          isTopicUnlocked={isTopicAccessible}
        />
      );
    }

    if (view.type === 'module') {
      const module = curriculum.find(m => m.id === view.moduleId);
      if (!module) return <div style={{ padding: 40 }}>Module not found</div>;
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
      if (!result) return <div style={{ padding: 40 }}>Topic not found</div>;
      const { topic, module } = result;
      return (
        <TopicPage
          topic={topic}
          module={module}
          isCompleted={progress.completedTopics.has(topic.id)}
          onStartQuiz={() => setView({ type: 'quiz', topicId: view.topicId })}
          onBack={() => setView({ type: 'module', moduleId: module.id })}
          onGoHome={() => setView({ type: 'dashboard' })}
        />
      );
    }

    if (view.type === 'quiz') {
      const result = getTopicById(view.topicId);
      if (!result) return <div style={{ padding: 40 }}>Topic not found</div>;
      const { topic, module } = result;
      return (
        <QuizPage
          topicId={topic.id}
          topicTitle={topic.title}
          questions={topic.quiz}
          color={module.color}
          alreadyCompleted={progress.completedTopics.has(topic.id)}
          onPass={async (score) => {
            await markTopicComplete(topic.id, score);
            setView({ type: 'exercise', topicId: topic.id });
          }}
          onBack={() => setView({ type: 'topic', topicId: view.topicId })}
        />
      );
    }

    if (view.type === 'exercise') {
      const result = getTopicById(view.topicId);
      if (!result) return <div style={{ padding: 40 }}>Topic not found</div>;
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
        user={user}
        onSignOut={signOut}
        onGoHome={() => setView({ type: 'dashboard' })}
        totalPct={totalProgress.pct}
      />

      {syncing && (
        <div style={{
          position: 'fixed', top: 64, right: 16, zIndex: 1000,
          background: 'white', border: '1px solid #E5E7EB',
          borderRadius: 8, padding: '8px 14px',
          fontSize: '0.82rem', color: '#6B7280',
          boxShadow: '0 1px 6px rgba(0,0,0,0.08)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          ⏳ Syncing to cloud...
        </div>
      )}

      <main style={{ flex: 1 }}>{renderContent()}</main>

      <footer style={{ background: 'var(--white)', borderTop: '1px solid var(--border)', padding: '24px', textAlign: 'center', marginTop: 'auto' }}>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          GenAI Mastery · Progress saved to cloud · {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
};

const App: React.FC = () => (
  <ErrorBoundary>
    <AppInner />
  </ErrorBoundary>
);

export default App;
