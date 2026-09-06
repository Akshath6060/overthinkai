import React from 'react';
import { css, Sx } from '../lib/sx.jsx';

const GRID = 'display:grid;grid-template-columns:minmax(190px,2.3fr) minmax(150px,1.6fr) 130px 80px 110px 110px;gap:12px';

export default function History(v) {
  return (
    <div style={css('max-width:1240px;margin:0 auto;display:flex;flex-direction:column;gap:18px')}>
      <div>
        <h1 style={css('margin:0;font-family:Bangers,cursive;font-size:clamp(30px,5vw,52px);letter-spacing:1px;line-height:1;color:#2B2336')}>THINGS YOU COULDN’T DECIDE YOURSELF</h1>
        <p style={css('margin:10px 0 0;font-size:13.5px;color:#6F687A;font-weight:600')}>A permanent, searchable archive of your hesitation.</p>
      </div>
      <div style={css('display:flex;flex-wrap:wrap;gap:10px;align-items:center')}>
        <div style={css('display:flex;gap:5px;padding:5px;border:3px solid #2B2336;background:#FFF;border-radius:14px;box-shadow:3px 3px 0 #2B2336;flex-wrap:wrap')}>
          {v.filters.map(f => (
            <button key={f.label} onClick={f.pick} style={css(`padding:6px 13px;border-radius:9px;border:2px solid ${f.bd};background:${f.bg};color:#1A1720;font-size:12px;font-weight:700;cursor:pointer`)}>{f.label}</button>
          ))}
        </div>
        <div style={css('flex:1;min-width:210px;display:flex;align-items:center;gap:9px;padding:10px 13px;border:3px solid #2B2336;background:#FFF;border-radius:14px;box-shadow:3px 3px 0 #2B2336')}>
          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.3" stroke="#2B2336" strokeWidth="2"></circle><path d="M9.3 9.3 12.5 12.5" stroke="#2B2336" strokeWidth="2" strokeLinecap="round"></path></svg>
          <label htmlFor="history-search" className="sr-only">Search decision history</label>
          <input id="history-search" type="search" value={v.search} onChange={v.onSearch} placeholder="Search your regrets…" style={css('flex:1;min-width:0;border:0;outline:none;background:transparent;color:#1A1720;font-size:13px;font-weight:600')} />
        </div>
        <span style={css('font:700 11px Inter,sans-serif;color:#6F687A')}>{v.rowCount} REGRETS</span>
      </div>

      <div style={css('background:#FFF;border:3px solid #2B2336;border-radius:18px;overflow-x:auto;box-shadow:6px 6px 0 #2B2336')}>
        <div style={css('min-width:880px')}>
        <div style={css(GRID + ';padding:12px 18px;border-bottom:3px solid #2B2336;background:#FFD84D')}>
          <span style={css('font:700 9.5px Inter,sans-serif;letter-spacing:.12em;color:#2B2336')}>THE QUESTION</span>
          <span style={css('font:700 9.5px Inter,sans-serif;letter-spacing:.12em;color:#2B2336')}>WHAT THEY SAID</span>
          <span style={css('font:700 9.5px Inter,sans-serif;letter-spacing:.12em;color:#2B2336')}>SEVERITY</span>
          <span style={css('font:700 9.5px Inter,sans-serif;letter-spacing:.12em;color:#2B2336')}>EXPERTS</span>
          <span style={css('font:700 9.5px Inter,sans-serif;letter-spacing:.12em;color:#2B2336')}>CONFIDENCE</span>
          <span style={css('font:700 9.5px Inter,sans-serif;letter-spacing:.12em;color:#2B2336')}>WHEN</span>
        </div>
        {v.historyLoading && <div role="status" style={css('padding:50px 24px;text-align:center;font-weight:700')}>🌀 Retrieving your previous overthinking…</div>}
        {!v.historyLoading && v.rows.map(r => (
          <Sx key={r.decisionId}
            style={GRID + ';padding:14px 18px;border-bottom:2px solid #EFE6D4;align-items:center;cursor:pointer;transition:background .12s'}
            hover="background:#FFF8E7">
            <span style={css("font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:700;letter-spacing:-.2px;min-width:0")}>{r.q}</span>
            <span style={css('font-size:13px;color:#3A3244;min-width:0;font-weight:600')}>{r.verdict}</span>
            <span style={css(`font:700 10px Inter,sans-serif;letter-spacing:.06em;color:#1A1720;border:2px solid #2B2336;background:${r.lvlBg};padding:3px 9px;border-radius:999px;justify-self:start`)}>{r.emoji} {r.levelUp}</span>
            <span style={css("font:700 13px 'Space Grotesk',sans-serif;color:#3A3244")}>{r.agents}</span>
            <span style={css('display:flex;align-items:center;gap:7px')}><span style={css('flex:1;height:9px;border:2px solid #2B2336;background:#FFF8E7;border-radius:999px;overflow:hidden')}><span style={css(`display:block;height:100%;width:${r.conf};background:${r.confColor}`)}></span></span><span style={css("font:700 11.5px 'Space Grotesk',sans-serif")}>{r.conf}</span></span>
            <span style={css('font:600 11.5px Inter,sans-serif;color:#6F687A')}>{r.date}</span>
          </Sx>
        ))}
        {!v.historyLoading && !v.historyError && v.noRows && (
          <div style={css('padding:60px 24px;text-align:center')}>
            <div style={css('font-size:40px;margin-bottom:10px')}>🫥</div>
            <div style={css('font-family:Bangers,cursive;font-size:30px;letter-spacing:1px;color:#2B2336')}>{v.search ? 'EVEN WE COULDN’T FIND THAT.' : 'NOTHING TO OVERTHINK YET.'}</div>
            <div style={css('font-size:14px;color:#6F687A;margin-top:8px;font-weight:600')}>{v.search ? 'Try a less impressively specific search.' : 'Your archive of hesitation is currently suspiciously peaceful.'}</div>
            <Sx as="button" onClick={v.goNew}
              style={`margin-top:18px;padding:12px 20px;border-radius:14px;border:3px solid #2B2336;background:${v.accent};color:#FFF;font-family:Bangers,cursive;font-size:19px;letter-spacing:.8px;cursor:pointer;box-shadow:5px 5px 0 #2B2336`}
              hover="transform:translate(-2px,-3px)">START OVERTHINKING</Sx>
          </div>
        )}
        </div>
      </div>

      {v.historyError && <div role="alert" style={css('background:#FF4D4D;border:3px solid #2B2336;border-radius:18px;padding:18px 20px;box-shadow:6px 6px 0 #2B2336;display:flex;flex-wrap:wrap;gap:16px;align-items:center')}>
        <div style={css('flex:1;min-width:240px')}>
          <div style={css('display:flex;align-items:center;gap:9px')}>
            <span style={css('font-size:24px;animation:ot-shake 2.6s ease-in-out infinite')}>🚨</span>
            <span style={css('font-family:Bangers,cursive;font-size:clamp(22px,3.2vw,30px);letter-spacing:1px;color:#FFF')}>WE OVERTHOUGHT TOO HARD.</span>
          </div>
          <div style={css('font-size:13px;color:#FFF;font-weight:600;margin-top:7px')}>{v.historyError}</div>
        </div>
        <div style={css('display:flex;gap:9px;flex-wrap:wrap')}>
          <Sx as="button" onClick={v.retryHistory}
            style="padding:11px 16px;border-radius:12px;border:3px solid #2B2336;background:#FFF;color:#1A1720;font-family:Bangers,cursive;font-size:17px;letter-spacing:.7px;cursor:pointer;box-shadow:4px 4px 0 #2B2336"
            hover="transform:translate(-2px,-2px)">TRY AGAIN</Sx>
          <Sx as="button" onClick={v.goNew}
            style="padding:11px 16px;border-radius:12px;border:3px solid #2B2336;background:#FFD84D;color:#1A1720;font-family:Bangers,cursive;font-size:17px;letter-spacing:.7px;cursor:pointer;box-shadow:4px 4px 0 #2B2336"
            hover="transform:translate(-2px,-2px)">GIVE UP &amp; DECIDE YOURSELF</Sx>
        </div>
      </div>}
    </div>
  );
}
