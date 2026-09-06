import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import OfflineBanner from './components/OfflineBanner.jsx';

// Design props from the mockup: accent, defaultLevel, humorLevel.
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <OfflineBanner />
      <App accent="#8B5CF6" defaultLevel="SEVERE" humorLevel="Dry" />
    </ErrorBoundary>
  </React.StrictMode>
);
