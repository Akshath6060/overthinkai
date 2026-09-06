import React from 'react';
import { css } from './lib/sx.jsx';
import { useOverthinker } from './useOverthinker.js';
import LoginScreen from './components/LoginScreen.jsx';
import Sidebar from './components/Sidebar.jsx';
import LogoutModal from './components/LogoutModal.jsx';
import MobileNav from './components/MobileNav.jsx';
import Header from './components/Header.jsx';
import NewDecision from './components/NewDecision.jsx';
import Analysis from './components/Analysis.jsx';
import History from './components/History.jsx';
import Analytics from './components/Analytics.jsx';
import Lab from './components/Lab.jsx';
import Settings from './components/Settings.jsx';

export default function App(props) {
  const v = useOverthinker(props);

  if (v.needsAuth) return <LoginScreen {...v} />;

  return (
    <div data-shell="1" style={css('display:flex;min-height:100vh;background:#FFF8E7;font-family:Inter,ui-sans-serif,system-ui,sans-serif;color:#1A1720')}>
      <Sidebar {...v} />
      {v.logoutOpen && <LogoutModal {...v} />}
      <MobileNav {...v} />

      <main style={css('flex:1;min-width:0;display:flex;flex-direction:column')}>
        <Header {...v} />
        <div style={css('flex:1;padding:clamp(18px,3.2vw,40px) clamp(14px,3vw,40px) 80px')}>
          {v.isInput && <NewDecision {...v} />}
          {v.inAnalysis && <Analysis {...v} />}
          {v.isHistory && <History {...v} />}
          {v.isAnalytics && <Analytics {...v} />}
          {v.isLab && <Lab {...v} />}
          {v.isSettings && <Settings {...v} />}
        </div>
      </main>
    </div>
  );
}
