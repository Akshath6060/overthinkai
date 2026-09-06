import React from 'react';
import { css } from '../lib/sx.jsx';

export default function Header(v) {
  return (
    <header style={css('min-height:58px;flex:none;border-bottom:3px solid #2B2336;background:#FFFDF6;display:flex;align-items:center;flex-wrap:wrap;gap:10px;padding:10px clamp(14px,3vw,32px);position:sticky;top:0;z-index:10')}>
      <span style={css('font-family:Bangers,cursive;font-size:20px;letter-spacing:.6px;color:#2B2336')}>{v.pageTitle}</span>
      <span style={css('font-size:11.5px;font-weight:600;color:#6F687A')}>{v.pageMeta}</span>
      <div style={css('flex:1')}></div>
      <div style={css('display:flex;align-items:center;gap:8px;flex-wrap:wrap')}>
        <span style={css('display:flex;align-items:center;gap:7px;padding:5px 10px;border:2px solid #2B2336;border-radius:999px;background:#B7F34A')}>
          <span style={css('width:7px;height:7px;border-radius:50%;background:#2B2336;animation:ot-blink 1.6s ease-in-out infinite')}></span>
          <span style={css('font:700 10.5px Inter,sans-serif;color:#2B2336')}>{v.enabledCount} EXPERTS AWAKE</span>
        </span>
        <span style={css('font:700 10.5px Inter,sans-serif;color:#2B2336;border:2px solid #2B2336;border-radius:999px;padding:5px 9px;background:#FFF')}>v2.4.1-beta-ish</span>
      </div>
    </header>
  );
}
