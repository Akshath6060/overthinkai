import React from 'react';
import { css, Sx } from '../lib/sx.jsx';
import Logo from './Logo.jsx';

export default function Sidebar(v) {
  return (
    <aside data-sidebar="1" style={css('width:264px;flex:none;background:#FFFDF6;border-right:3px solid #2B2336;display:flex;flex-direction:column;position:sticky;top:0;height:100vh')}>
      <div style={css('padding:18px 16px 16px;border-bottom:3px solid #2B2336;background:#FFD84D')}>
        <div style={css('display:flex;align-items:center;gap:10px')}>
          <span style={css('width:36px;height:36px;flex:none;border:3px solid #2B2336;border-radius:11px;background:#8B5CF6;box-shadow:3px 3px 0 #2B2336;display:grid;place-items:center')}>
            <Logo size={20} />
          </span>
          <span style={css('min-width:0')}>
            <span style={css('display:block;font-family:Bangers,cursive;font-size:22px;letter-spacing:.5px;line-height:1;color:#2B2336')}>OVERTHINKER AI</span>
            <span style={css('display:block;font-size:10.5px;color:#5A5064;margin-top:3px;font-weight:600;line-height:1.3')}>Turning tiny decisions into infrastructure problems.</span>
          </span>
        </div>
        <span style={css('display:inline-block;margin-top:11px;transform:rotate(-1.5deg);font-family:Bangers,cursive;font-size:12px;letter-spacing:.7px;color:#FFF8E7;background:#2B2336;border-radius:999px;padding:3px 10px')}>100% UNNECESSARY</span>
      </div>

      <nav style={css('padding:12px 10px;display:flex;flex-direction:column;gap:5px')}>
        <div style={css('font:700 9.5px Inter,sans-serif;letter-spacing:.16em;color:#A79FB2;padding:8px 10px 6px')}>THE WORKSPACE</div>
        {v.nav.map(item => (
          <Sx key={item.id} as="button" type="button" onClick={item.go} aria-current={item.bg !== '#FFF' ? 'page' : undefined}
            style={`display:flex;align-items:center;gap:10px;width:100%;text-align:left;padding:9px 11px;border-radius:10px;border:2px solid ${item.bd};background:${item.bg};color:#1A1720;font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:600;cursor:pointer;box-shadow:${item.sh};transition:transform .12s,box-shadow .12s`}
            hover="transform:translate(-1px,-1px);box-shadow:3px 3px 0 #2B2336;border:2px solid #2B2336"
            active="transform:translate(1px,1px);box-shadow:0 0 0 #2B2336">
            <span style={css(`width:22px;height:22px;flex:none;border:2px solid #2B2336;border-radius:7px;background:${item.chip};display:grid;place-items:center;font-size:11px`)}>{item.emoji}</span>
            <span style={css('flex:1;min-width:0;line-height:1.25')}>{item.label}</span>
            {item.badge && (
              <span style={css('font:700 10px Inter,sans-serif;color:#2B2336;background:#FFF;border:2px solid #2B2336;padding:1px 6px;border-radius:999px')}>{item.badge}</span>
            )}
          </Sx>
        ))}
      </nav>

      <div style={css('margin-top:auto;padding:14px;display:flex;flex-direction:column;gap:12px')}>
        <div style={css('border:3px solid #2B2336;border-radius:14px;background:#FFF;box-shadow:4px 4px 0 #2B2336;padding:13px 14px')}>
          <div style={css('display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px')}>
            <span style={css('font-family:Bangers,cursive;font-size:14px;letter-spacing:.6px;color:#2B2336')}>OVERTHINKING CREDITS</span>
          </div>
          <div style={css('display:flex;align-items:baseline;gap:5px;margin-bottom:8px')}>
            <span style={css("font-family:'Space Grotesk',sans-serif;font-size:22px;font-weight:700;letter-spacing:-.6px")}>{v.account?.plan?.creditsRemaining ?? '—'}</span>
            <span style={css('font-size:12px;font-weight:700;color:#6F687A')}>/ {v.account?.plan?.creditAllowance ?? '—'}</span>
          </div>
          <div style={css('height:11px;border:2px solid #2B2336;border-radius:999px;background:#FFF8E7;overflow:hidden')}>
            <div style={css(`width:${v.account?.plan?.creditAllowance ? Math.max(0, Math.min(100, (v.account.plan.creditsRemaining / v.account.plan.creditAllowance) * 100)) : 0}%;height:100%;background:repeating-linear-gradient(45deg,#B7F34A 0 7px,#9FE034 7px 14px)`)}></div>
          </div>
          <div style={css('font-size:10.5px;color:#6F687A;margin-top:8px;font-weight:500')}>You will absolutely use them all.</div>
        </div>
        <Sx as="button"
          style="display:flex;align-items:center;gap:10px;padding:8px;border-radius:12px;border:2px solid transparent;background:transparent;cursor:pointer;text-align:left;width:100%"
          hover="border:2px solid #2B2336;background:#FFF">
          <span style={css("width:32px;height:32px;border-radius:10px;background:#4CC9F0;border:2px solid #2B2336;display:grid;place-items:center;font:700 12px 'Space Grotesk',sans-serif;color:#2B2336;flex:none")}>AR</span>
          <span style={css('flex:1;min-width:0')}>
            <span style={css('display:block;font-size:12.5px;font-weight:700')}>{v.account?.user?.displayName || 'Professional Overthinker'}</span>
            <span style={css('display:block;font-size:10.5px;color:#6F687A;font-weight:600')}>{v.account?.plan?.name || 'Free'} · authenticated somehow</span>
          </span>
          <span style={css('color:#6F687A;font-size:12px')}>⌄</span>
        </Sx>
        <Sx as="button" onClick={v.askLogout}
          style="display:flex;align-items:center;justify-content:center;gap:8px;padding:10px;border-radius:12px;border:2.5px solid #2B2336;background:#FFF;color:#1A1720;font-family:'Space Grotesk',sans-serif;font-size:12.5px;font-weight:700;cursor:pointer;box-shadow:3px 3px 0 #2B2336;transition:transform .12s,box-shadow .12s"
          hover="background:#FF4D4D;color:#FFF;transform:translate(-1px,-2px);box-shadow:4px 5px 0 #2B2336"
          active="transform:translate(1px,1px);box-shadow:1px 1px 0 #2B2336">🚪 Log Out</Sx>
      </div>
    </aside>
  );
}
