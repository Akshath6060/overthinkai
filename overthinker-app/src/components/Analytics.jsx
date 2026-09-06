import React from 'react';
import { css } from '../lib/sx.jsx';
import { statCards, weekBars, catBars } from '../data.js';

export default function Analytics(v) {
  return (
    <div style={css('max-width:1240px;margin:0 auto;display:flex;flex-direction:column;gap:16px')}>
      <div>
        <h1 style={css('margin:0;font-family:Bangers,cursive;font-size:clamp(30px,5vw,52px);letter-spacing:1px;line-height:1;color:#2B2336')}>YOUR QUESTIONABLE DECISION-MAKING STATISTICS</h1>
        <p style={css('margin:10px 0 0;font-size:13.5px;color:#6F687A;font-weight:600')}>Numbers nobody asked for, presented with total confidence.</p>
      </div>

      <div style={css('background:#B7F34A;border:4px solid #2B2336;border-radius:22px;padding:clamp(20px,3vw,30px);box-shadow:8px 8px 0 #2B2336;display:flex;flex-wrap:wrap;align-items:center;gap:20px')}>
        <div style={css('flex:1;min-width:260px')}>
          <span style={css('display:inline-block;font:700 10px Inter,sans-serif;letter-spacing:.14em;padding:3px 10px;border:2px solid #2B2336;border-radius:999px;background:#FFF;margin-bottom:12px')}>MATH, UNFORTUNATELY</span>
          <div style={css('font-family:Bangers,cursive;font-size:clamp(22px,3.6vw,36px);letter-spacing:.8px;line-height:1.06;color:#2B2336;text-wrap:pretty')}>YOU SPENT 47 MINUTES AVOIDING 9 DECISIONS THAT REQUIRED APPROXIMATELY 3 MINUTES TOTAL.</div>
        </div>
        <div style={css('display:flex;gap:12px;flex-wrap:wrap')}>
          <div style={css('background:#FFF;border:3px solid #2B2336;border-radius:16px;padding:14px 18px;box-shadow:4px 4px 0 #2B2336')}><div style={css('font:700 9.5px Inter,sans-serif;letter-spacing:.12em;color:#6F687A;margin-bottom:6px')}>TIME RECLAIMABLE</div><div style={css("font-family:'Space Grotesk',sans-serif;font-size:28px;font-weight:700;letter-spacing:-1px")}>2h 04m</div></div>
          <div style={css('background:#FFF;border:3px solid #2B2336;border-radius:16px;padding:14px 18px;box-shadow:4px 4px 0 #2B2336')}><div style={css('font:700 9.5px Inter,sans-serif;letter-spacing:.12em;color:#6F687A;margin-bottom:6px')}>TREND</div><div style={css("font-family:'Space Grotesk',sans-serif;font-size:28px;font-weight:700;letter-spacing:-1px;color:#FF4D4D")}>↑ 34%</div></div>
        </div>
      </div>

      <div style={css('display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:12px')}>
        {statCards.map((s, i) => (
          <div key={i} style={css(`background:${s.bg};border:3px solid #2B2336;border-radius:16px;padding:15px 16px;box-shadow:4px 4px 0 #2B2336;transform:${s.tf}`)}>
            <div style={css('font:700 9.5px Inter,sans-serif;letter-spacing:.1em;color:#3A3244;margin-bottom:10px')}>{s.label}</div>
            <div style={css("font-family:'Space Grotesk',sans-serif;font-size:27px;font-weight:700;letter-spacing:-1px")}>{s.value}</div>
            <div style={css('font-size:11px;color:#3A3244;margin-top:5px;font-weight:600')}>{s.note}</div>
          </div>
        ))}
      </div>

      <div style={css('display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:16px')}>
        <div style={css('background:#FFF;border:3px solid #2B2336;border-radius:18px;padding:18px;box-shadow:5px 5px 0 #2B2336')}>
          <div style={css('display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:20px;flex-wrap:wrap')}>
            <span style={css('font-family:Bangers,cursive;font-size:19px;letter-spacing:.7px')}>DAILY OVERTHINKING</span>
            <span style={css('font:700 10px Inter,sans-serif;padding:3px 8px;border:2px solid #2B2336;border-radius:999px;background:#FFD84D')}>47 TOTAL</span>
          </div>
          <div style={css('display:flex;align-items:flex-end;gap:9px;height:160px')}>
            {weekBars.map((b, i) => (
              <div key={i} style={css('flex:1;display:flex;flex-direction:column;align-items:center;gap:7px;height:100%;justify-content:flex-end')}>
                <span style={css("font:700 11px 'Space Grotesk',sans-serif;color:#3A3244")}>{b.n}</span>
                <span style={css(`width:100%;border:2.5px solid #2B2336;border-radius:8px 8px 3px 3px;background:${b.fill};height:${b.h};transition:height .5s ease`)}></span>
                <span style={css('font:700 9.5px Inter,sans-serif;color:#6F687A')}>{b.d}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={css('background:#FFF;border:3px solid #2B2336;border-radius:18px;padding:18px;box-shadow:5px 5px 0 #2B2336')}>
          <div style={css('font-family:Bangers,cursive;font-size:19px;letter-spacing:.7px;margin-bottom:20px')}>MOST AVOIDED DECISIONS</div>
          <div style={css('display:flex;flex-direction:column;gap:14px')}>
            {catBars.map((c, i) => (
              <div key={i}>
                <div style={css('display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px')}>
                  <span style={css('font-size:13px;color:#1A1720;font-weight:700')}>{c.label}</span>
                  <span style={css("font:700 11.5px 'Space Grotesk',sans-serif;color:#6F687A")}>{c.pct}</span>
                </div>
                <div style={css('height:13px;border:2.5px solid #2B2336;border-radius:999px;background:#FFF8E7;overflow:hidden')}><div style={css(`height:100%;width:${c.pct};background:${c.fill}`)}></div></div>
              </div>
            ))}
          </div>
        </div>

        <div style={css('background:#FFF;border:3px solid #2B2336;border-radius:18px;padding:18px;box-shadow:5px 5px 0 #2B2336')}>
          <div style={css('display:flex;align-items:center;gap:9px;margin-bottom:18px;flex-wrap:wrap')}>
            <span style={css('font-family:Bangers,cursive;font-size:19px;letter-spacing:.7px')}>AGENT DRAMA INDEX</span>
            <span style={css('font:700 9.5px Inter,sans-serif;padding:3px 8px;border:2px solid #2B2336;border-radius:999px;background:#FF4FA3;color:#FFF')}>SPICY</span>
          </div>
          <div style={css('display:flex;flex-direction:column;gap:12px')}>
            {v.agreeRows.map((a, i) => (
              <div key={i} style={css('display:flex;align-items:center;gap:11px')}>
                <span style={css(`width:30px;height:30px;border-radius:9px;background:${a.color};border:2.5px solid #2B2336;display:grid;place-items:center;font-size:15px;flex:none`)}>{a.emoji}</span>
                <span style={css('flex:1;min-width:0;font-size:12.5px;font-weight:700')}>{a.name}</span>
                <span style={css('width:80px;height:11px;border:2.5px solid #2B2336;border-radius:999px;background:#FFF8E7;overflow:hidden')}><span style={css(`display:block;height:100%;width:${a.pct};background:${a.fill}`)}></span></span>
                <span style={css("width:44px;text-align:right;font:700 12px 'Space Grotesk',sans-serif")}>{a.pct}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={css('background:#4CC9F0;border:3px solid #2B2336;border-radius:18px;padding:18px;box-shadow:5px 5px 0 #2B2336;display:flex;flex-direction:column')}>
          <div style={css('font-family:Bangers,cursive;font-size:19px;letter-spacing:.7px;color:#1A1720')}>CONFIDENCE DESPITE NO EVIDENCE</div>
          <div style={css('font-size:12px;color:#1A1720;font-weight:600;margin-bottom:18px;margin-top:4px')}>Actual problem difficulty, measured honestly.</div>
          <div style={css('display:flex;align-items:baseline;gap:7px')}><span style={css('font-family:Bangers,cursive;font-size:clamp(46px,8vw,74px);letter-spacing:1.5px;line-height:.9;color:#2B2336')}>2</span><span style={css('font-family:Bangers,cursive;font-size:22px;color:#2B2336')}>/ 100</span></div>
          <div style={css('margin-top:16px;height:14px;border:3px solid #2B2336;border-radius:999px;background:#FFF;overflow:hidden')}><div style={css('height:100%;width:2%;min-width:8px;background:#FF4D4D')}></div></div>
          <div style={css('margin-top:16px;padding-top:14px;border-top:2px dashed #2B2336;font-size:12.5px;line-height:1.55;color:#1A1720;font-weight:600')}>Average compute per decision: <span style={css('font-weight:800')}>4,821 tokens sacrificed</span>.</div>
          <div style={css('margin-top:auto;padding-top:16px;font-size:11.5px;color:#1A1720;font-weight:700')}>Not enough unnecessary decisions yet? Keep going.</div>
        </div>
      </div>
    </div>
  );
}
