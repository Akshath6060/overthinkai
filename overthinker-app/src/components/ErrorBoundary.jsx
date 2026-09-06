import React from 'react';
import ErrorPage from './ErrorPage.jsx';

export default class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) { return { error }; }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) console.error('React render failure', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <>
        <ErrorPage status={500} onRetry={() => this.setState({ error: null })} onHome={() => { window.location.href = '/'; }} />
        {import.meta.env.DEV && <details style={{ position: 'fixed', bottom: 8, left: 8, right: 8, maxHeight: 180, overflow: 'auto', background: '#fff', padding: 8 }}><summary>Development error details</summary><pre>{String(this.state.error.stack || this.state.error)}</pre></details>}
      </>
    );
  }
}
