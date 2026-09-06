import React from 'react';
import { css } from '../lib/sx.jsx';

export default function MobileNav(v) {
  return (
    <div data-mobilenav="1" style={css('display:none;position:sticky;top:0;z-index:20;background:#FFD84D;border-bottom:3px solid #2B2336;padding:10px 12px;gap:7px;overflow-x:auto;align-items:center')}>
      {v.nav.map(item => (
        <button key={item.id} onClick={item.go} style={css(`flex:none;padding:7px 12px;border-radius:999px;border:2px solid #2B2336;background:${item.mbg};color:#1A1720;font-family:'Space Grotesk',sans-serif;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;box-shadow:2px 2px 0 #2B2336`)}>{item.emoji} {item.label}</button>
      ))}
      <button onClick={v.askLogout} style={css("flex:none;padding:7px 12px;border-radius:999px;border:2px solid #2B2336;background:#FFF;color:#1A1720;font-family:'Space Grotesk',sans-serif;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;box-shadow:2px 2px 0 #2B2336")}>🚪 Log Out</button>
    </div>
  );
}
