import React, { useState } from 'react';
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

type View =
  | { type: 'dashboard' }
  | { type: 'module'; moduleId: string }
  | { type: 'topic'; topicId: string }
  | { type: 'quiz'; topicId: string }
  | { type: 'exercise'; topicId: string };

const App: React.FC = () => {
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

  // Topics are accessible if they are unlocked (sequential progress)
  // OR if they are already completed (free backward navigation)
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
      if (!module) return <div>Module not found</div>;
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
      if (!result) return <div>Topic not found</div>;
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
      if (!result) return <div>Topic not found</div>;
      const { topic, module } = result;
      const alreadyCompleted = progress.completedTopics.has(topic.id);
      return (
        <QuizPage
          topicId={topic.id}
          topicTitle={topic.title}
          questions={topic.quiz}
          color={module.color}
          alreadyCompleted={alreadyCompleted}
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
      if (!result) return <div>Topic not found</div>;
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

      {/* Cloud sync indicator */}
      {syncing && (
        <div style={{
          position: 'fixed', top: 64, right: 16, zIndex: 1000,
          background: 'var(--white)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', padding: '8px 14px',
          fontSize: '0.82rem', color: 'var(--text-secondary)',
          boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span>
          Syncing progress...
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

export default App;
