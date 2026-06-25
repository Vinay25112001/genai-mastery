import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import './styles/global.css';
import './index.css';

const App = React.lazy(() => import('./App'));

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F9FC' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🧠</div>
          <div style={{ color: '#94A3B8', fontSize: '0.9rem', fontFamily: 'system-ui, sans-serif' }}>Loading GenAI Mastery...</div>
        </div>
      </div>
    }>
      <App />
    </Suspense>
  </React.StrictMode>
);
