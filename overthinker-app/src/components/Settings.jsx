import React from 'react';
import { css } from '../lib/sx.jsx';
import { themeLabels } from '../data.js';

const DARK = '#2B2336';
const SHADOW = '3px 3px 0 ' + DARK;

export default function Settings(v) {
  const themes = themeLabels.map((t, i) => ({ label: t, bg: i === 0 ? '#FFD84D' : '#FFF', sh: i === 0 ? SHADOW : 'none' }));
  return (
    <div style={css('max-width:880px;margin:0 auto;display:flex;flex-direction:column;gap:16px')}>
      <div>
        <h1 style={css('margin:0;font-family:Bangers,cursive;font-size:clamp(30px,5vw,52px);letter-spacing:1px;line-height:1;color:#2B2336')}>SETTINGS (BUT WHY)</h1>
        <p style={css('margin:10px 0 0;font-size:13.5px;color:#6F687A;font-weight:600')}>Configure exactly how thoroughly we waste your time.</p>
      </div>

      <div style={css('background:#FFF;border:3px solid #2B2336;border-radius:18px;padding:18px;box-shadow:5px 5px 0 #2B2336')}>
        <div style={css('font-family:Bangers,cursive;font-size:19px;letter-spacing:.7px')}>APPEARANCE</div>
        <div style={css('font-size:12px;color:#6F687A;margin:5px 0 14px;font-weight:600')}>Cream is the only correct answer.</div>
        <div style={css('display:flex;gap:9px;flex-wrap:wrap')}>
          {themes.map((t, i) => (
            <button key={i} style={css(`padding:10px 16px;border-radius:12px;border:2.5px solid #2B2336;background:${t.bg};color:#1A1720;font-size:12.5px;font-weight:700;cursor:pointer;box-shadow:${t.sh}`)}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={css('background:#FFF;border:3px solid #2B2336;border-radius:18px;padding:18px;box-shadow:5px 5px 0 #2B2336')}>
        <div style={css('font-family:Bangers,cursive;font-size:19px;letter-spacing:.7px;margin-bottom:14px')}>DEFAULT PANIC LEVEL</div>
        <div style={css('display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px')}>
          {v.levels.map(l => (
            <button key={l.name} onClick={l.pick} style={css(`text-align:left;padding:12px 14px;border-radius:13px;border:3px solid #2B2336;background:${l.bg};cursor:pointer;box-shadow:${l.sh}`)}>
              <span style={css('display:flex;align-items:center;gap:7px')}><span style={css('font-size:17px')}>{l.emoji}</span><span style={css(`font-family:Bangers,cursive;font-size:18px;letter-spacing:.7px;color:${l.fg}`)}>{l.name}</span></span>
              <span style={css(`display:block;font-size:11.5px;color:${l.sub};margin-top:5px;line-height:1.45;font-weight:600`)}>{l.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={css('background:#FF4FA3;border:3px solid #2B2336;border-radius:18px;padding:18px;box-shadow:5px 5px 0 #2B2336')}>
        <div style={css('font-family:Bangers,cursive;font-size:19px;letter-spacing:.7px;color:#FFF')}>HUMOR LEVEL</div>
        <div style={css('font-size:12px;color:#FFF;margin:5px 0 14px;font-weight:600')}>Affects agent tone. Does not affect agent confidence.</div>
        <div style={css('display:flex;gap:5px;padding:5px;border:3px solid #2B2336;background:#FFF;border-radius:14px;width:fit-content;max-width:100%;flex-wrap:wrap')}>
          {v.humorOpts.map(h => (
            <button key={h.label} onClick={h.pick} style={css(`padding:8px 17px;border-radius:9px;border:2px solid ${h.bd};background:${h.bg};color:#1A1720;font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:700;cursor:pointer`)}>{h.label}</button>
          ))}
        </div>
        <div style={css('font-size:12.5px;color:#FFF;margin-top:11px;font-weight:700')}>{v.humorNote}</div>
      </div>

      <div style={css('background:#FFF;border:3px solid #2B2336;border-radius:18px;overflow:hidden;box-shadow:5px 5px 0 #2B2336')}>
        <div style={css('padding:15px 18px;border-bottom:3px solid #2B2336;background:#4CC9F0;font-family:Bangers,cursive;font-size:19px;letter-spacing:.7px')}>WHO IS DOING THE THINKING</div>
        {v.providers.map((p, i) => (
          <div key={i} style={css('display:flex;align-items:center;gap:12px;padding:14px 18px;border-bottom:2px solid #EFE6D4')}>
            <span style={css('width:18px;height:18px;border-radius:50%;border:2.5px solid #2B2336;display:grid;place-items:center;flex:none;background:#FFF8E7')}><span style={css(`width:8px;height:8px;border-radius:50%;background:${p.inner};display:block`)}></span></span>
            <span style={css('flex:1;min-width:0')}><span style={css('display:block;font-size:13px;font-weight:700')}>{p.name}</span><span style={css('display:block;font-size:11.5px;color:#6F687A;margin-top:2px;font-weight:600')}>{p.note}</span></span>
            <span style={css('font:700 10.5px Inter,sans-serif;color:#1A1720;border:2px solid #2B2336;border-radius:999px;padding:3px 9px;background:#FFF8E7')}>{p.latency}</span>
          </div>
        ))}
      </div>

      <div style={css('background:#FFF;border:3px solid #2B2336;border-radius:18px;overflow:hidden;box-shadow:5px 5px 0 #2B2336')}>
        {v.toggleRows.map(t => (
          <div key={t.k} style={css('display:flex;align-items:center;gap:14px;padding:15px 18px;border-bottom:2px solid #EFE6D4')}>
            <span style={css('flex:1;min-width:0')}><span style={css('display:block;font-size:13px;font-weight:700')}>{t.label}</span><span style={css('display:block;font-size:11.5px;color:#6F687A;margin-top:3px;line-height:1.45;font-weight:600')}>{t.note}</span></span>
            <button onClick={t.toggle} style={css(`width:46px;height:26px;flex:none;border-radius:999px;border:2.5px solid #2B2336;background:${t.trackBg};cursor:pointer;padding:0;display:flex;align-items:center;justify-content:${t.knobPos};transition:all .18s`)}>
              <span style={css('width:18px;height:18px;border-radius:50%;background:#FFF;border:2px solid #2B2336;margin:0 2px;display:block')}></span>
            </button>
          </div>
        ))}
      </div>

      <div style={css('background:#FFD84D;border:3px solid #2B2336;border-radius:18px;padding:18px;box-shadow:5px 5px 0 #2B2336;display:flex;flex-wrap:wrap;gap:14px;align-items:center')}>
        <div style={css('flex:1;min-width:230px')}>
          <div style={css('font-family:Bangers,cursive;font-size:19px;letter-spacing:.7px')}>DATA &amp; HISTORY</div>
          <div style={css('font-size:12.5px;color:#3A3244;margin-top:5px;font-weight:600')}>Deleting your history will not delete the memory of the decisions.</div>
        </div>
        <div style={css('display:flex;gap:9px;flex-wrap:wrap')}>
          <button style={css('padding:10px 15px;border-radius:12px;border:2.5px solid #2B2336;background:#FFF;color:#1A1720;font-size:12.5px;font-weight:700;cursor:pointer;box-shadow:3px 3px 0 #2B2336')}>Export JSON</button>
          <button style={css('padding:10px 15px;border-radius:12px;border:2.5px solid #2B2336;background:#FF4D4D;color:#FFF;font-size:12.5px;font-weight:700;cursor:pointer;box-shadow:3px 3px 0 #2B2336')}>Delete All Evidence</button>
        </div>
      </div>
    </div>
  );
}
