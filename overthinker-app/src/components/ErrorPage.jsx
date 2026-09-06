import React from 'react';
import { css, Sx } from '../lib/sx.jsx';
import SEO from './SEO.jsx';

const copy = {
  403: ['PERMISSION DENIED', 'Even our council agrees: this particular door is not yours.'],
  404: ['PAGE NOT FOUND', "We overthought this URL and still couldn't find it."],
  500: ['SOMETHING WENT WRONG', 'The council has entered an unexpected internal debate.'],
  503: ['ENGINE ON A THINKING BREAK', 'Our overthinking engine is temporarily unavailable. Your decisions are still safe.'],
};

export default function ErrorPage({ status = 500, onRetry, onHome, showBack = false }) {
  const [heading, message] = copy[status] || copy[500];
  return (
    <main style={css('min-height:100vh;background:#FFF8E7;color:#1A1720;display:grid;place-items:center;padding:24px;font-family:Inter,ui-sans-serif,system-ui,sans-serif')}>
      <SEO title={`${status} — ${heading} | Overthinker AI`} description={message} path={window.location.pathname} noindex />
      <section aria-labelledby="error-title" style={css('width:100%;max-width:720px;text-align:center;background:#FFF;border:4px solid #2B2336;border-radius:24px;box-shadow:9px 9px 0 #2B2336;padding:clamp(26px,6vw,54px)')}>
        <div aria-hidden="true" style={css('font-size:54px;margin-bottom:8px')}>{status === 404 ? '🗺️' : status === 403 ? '🔒' : '🌀'}</div>
        <div style={css('font-family:Bangers,cursive;font-size:clamp(62px,14vw,112px);line-height:.8;color:#8B5CF6')}>{status}</div>
        <h1 id="error-title" style={css('font-family:Bangers,cursive;font-size:clamp(30px,6vw,52px);letter-spacing:1px;margin:22px 0 8px')}>{heading}</h1>
        <p style={css('font-size:15px;line-height:1.6;color:#6F687A;font-weight:600;margin:0 auto;max-width:480px')}>{message}</p>
        <div style={css('display:flex;flex-wrap:wrap;justify-content:center;gap:12px;margin-top:26px')}>
          {onRetry && <Sx as="button" onClick={onRetry} style="padding:12px 20px;border-radius:13px;border:3px solid #2B2336;background:#FFD84D;color:#1A1720;font-family:Bangers,cursive;font-size:19px;letter-spacing:.7px;cursor:pointer;box-shadow:4px 4px 0 #2B2336" active="transform:translate(2px,2px);box-shadow:none">TRY AGAIN</Sx>}
          <Sx as="button" onClick={onHome} style="padding:12px 20px;border-radius:13px;border:3px solid #2B2336;background:#8B5CF6;color:#FFF;font-family:Bangers,cursive;font-size:19px;letter-spacing:.7px;cursor:pointer;box-shadow:4px 4px 0 #2B2336" active="transform:translate(2px,2px);box-shadow:none">RETURN HOME</Sx>
          {showBack && <Sx as="button" onClick={() => window.history.back()} style="padding:12px 20px;border-radius:13px;border:3px solid #2B2336;background:#FFF;color:#1A1720;font-family:Bangers,cursive;font-size:19px;letter-spacing:.7px;cursor:pointer;box-shadow:4px 4px 0 #2B2336" active="transform:translate(2px,2px);box-shadow:none">GO BACK</Sx>}
        </div>
      </section>
    </main>
  );
}
