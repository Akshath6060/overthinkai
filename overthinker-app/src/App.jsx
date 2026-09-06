import React, { Suspense, lazy, useEffect, useState } from 'react';
import { css } from './lib/sx.jsx';
import { useOverthinker } from './useOverthinker.js';
import LoginScreen from './components/LoginScreen.jsx';
import Sidebar from './components/Sidebar.jsx';
import LogoutModal from './components/LogoutModal.jsx';
import MobileNav from './components/MobileNav.jsx';
import Header from './components/Header.jsx';
import ErrorPage from './components/ErrorPage.jsx';
import SEO from './components/SEO.jsx';

const NewDecision = lazy(() => import('./components/NewDecision.jsx'));
const Analysis = lazy(() => import('./components/Analysis.jsx'));
const History = lazy(() => import('./components/History.jsx'));
const Analytics = lazy(() => import('./components/Analytics.jsx'));
const Lab = lazy(() => import('./components/Lab.jsx'));
const Settings = lazy(() => import('./components/Settings.jsx'));

const ROUTES = {
  '/': 'new',
  '/dashboard': 'new',
  '/decisions': 'new',
  '/history': 'history',
  '/analytics': 'analytics',
  '/settings': 'settings',
  '/account': 'settings',
  '/agents': 'lab',
};

const PATHS = { new: '/dashboard', history: '/history', analytics: '/analytics', lab: '/agents', settings: '/settings' };

function normalizePath(path) {
  return path.length > 1 ? path.replace(/\/+$/, '') : path;
}

function LoadingScreen({ message = 'Consulting the council…' }) {
  return <div className="app-loading" role="status" aria-live="polite"><span aria-hidden="true">🌀</span><strong>{message}</strong></div>;
}

export default function App(props) {
  const [path, setPath] = useState(() => normalizePath(window.location.pathname));
  const decisionMatch = path.match(/^\/decision\/([^/]+)$/);
  const routePage = ROUTES[path] || (decisionMatch ? 'decision' : undefined);
  useEffect(() => {
    const onPopState = () => setPath(normalizePath(window.location.pathname));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);
  const navigate = nextPage => {
    const nextPath = PATHS[nextPage] || '/dashboard';
    window.history.pushState({}, '', nextPath);
    setPath(nextPath);
  };
  const navigateDecision = decisionId => {
    const nextPath = `/decision/${encodeURIComponent(decisionId)}`;
    window.history.pushState({}, '', nextPath);
    setPath(nextPath);
  };
  const v = useOverthinker({ ...props, initialPage: routePage || 'new', routePage, decisionId: decisionMatch?.[1], navigate, navigateDecision });

  if (!routePage) return <ErrorPage status={404} onHome={() => navigate('new')} showBack />;

  if (!v.authReady) return <LoadingScreen message="Waking up the council… This can take up to one minute." />;

  if (v.serviceUnavailable) return <ErrorPage status={503} onRetry={v.restoreSession} onHome={() => navigate('new')} />;

  if (v.needsAuth) return <LoginScreen {...v} />;

  if (v.decisionLoading) return <LoadingScreen />;
  if (v.decisionErrorStatus) return <ErrorPage status={v.decisionErrorStatus} onRetry={v.retryDecision} onHome={() => navigate('new')} showBack />;

  return (
    <div data-shell="1" style={css('display:flex;min-height:100vh;background:#FFF8E7;font-family:Inter,ui-sans-serif,system-ui,sans-serif;color:#1A1720')}>
      <Sidebar {...v} />
      {v.logoutOpen && <LogoutModal {...v} />}
      <MobileNav {...v} />

      <main style={css('flex:1;min-width:0;display:flex;flex-direction:column')}>
        <SEO title={`${v.pageTitle} | Overthinker AI`} path={path} noindex />
        <Header {...v} />
        <div style={css('flex:1;padding:clamp(18px,3.2vw,40px) clamp(14px,3vw,40px) 80px')}>
          <Suspense fallback={<LoadingScreen />}>
            {v.isInput && <NewDecision {...v} />}
            {v.inAnalysis && <Analysis {...v} />}
            {v.isHistory && <History {...v} />}
            {v.isAnalytics && <Analytics {...v} />}
            {v.isLab && <Lab {...v} />}
            {v.isSettings && <Settings {...v} />}
          </Suspense>
        </div>
      </main>
    </div>
  );
}
