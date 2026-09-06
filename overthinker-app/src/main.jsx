import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// Design props from the mockup: accent, defaultLevel, humorLevel.
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App accent="#8B5CF6" defaultLevel="SEVERE" humorLevel="Dry" />
  </React.StrictMode>
);
