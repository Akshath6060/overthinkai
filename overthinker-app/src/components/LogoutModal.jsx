import React from 'react';
import { css, Sx } from '../lib/sx.jsx';
import { useDialogFocus } from '../lib/useDialogFocus.js';

export default function LogoutModal(v) {
  const dialogRef = useDialogFocus(true, v.cancelLogout);
  return (
    <div style={css('position:fixed;inset:0;z-index:60;background:rgba(43,35,54,.55);display:flex;align-items:center;justify-content:center;padding:18px')}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="logout-title" style={css('width:100%;max-width:460px;background:#FFF;border:4px solid #2B2336;border-radius:22px;box-shadow:9px 9px 0 #2B2336;animation:ot-pop .28s cubic-bezier(.2,.9,.3,1.1) both;overflow:hidden')}>
        <div style={css('padding:16px 20px;border-bottom:3px solid #2B2336;background:#FF4D4D')}>
          <span id="logout-title" style={css('font-family:Bangers,cursive;font-size:26px;letter-spacing:1px;color:#FFF')}>ARE YOU SURE?</span>
        </div>
        <div style={css('padding:18px 20px 20px')}>
          <div style={css('font-size:13.5px;line-height:1.6;color:#1A1720;font-weight:600')}>We worked extremely hard to verify absolutely nothing.</div>
          <div style={css('display:flex;flex-wrap:wrap;gap:9px;margin-top:18px')}>
            <Sx as="button" onClick={v.doLogout}
              style="flex:1;min-width:150px;padding:12px;border-radius:13px;border:3px solid #2B2336;background:#FF4D4D;color:#FFF;font-family:Bangers,cursive;font-size:18px;letter-spacing:.7px;cursor:pointer;box-shadow:4px 4px 0 #2B2336"
              active="transform:translate(2px,2px);box-shadow:0 0 0 #2B2336">LOGOUT ANYWAY</Sx>
            <Sx as="button" onClick={v.cancelLogout}
              style="flex:1;min-width:150px;padding:12px;border-radius:13px;border:3px solid #2B2336;background:#B7F34A;color:#1A1720;font-family:Bangers,cursive;font-size:18px;letter-spacing:.7px;cursor:pointer;box-shadow:4px 4px 0 #2B2336"
              active="transform:translate(2px,2px);box-shadow:0 0 0 #2B2336">STAY AUTHENTICATED SOMEHOW</Sx>
          </div>
        </div>
      </div>
    </div>
  );
}
