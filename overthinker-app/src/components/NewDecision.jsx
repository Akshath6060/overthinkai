import React from 'react';
import { css, Sx } from '../lib/sx.jsx';

export default function NewDecision(v) {
  return (
    <div style={css('max-width:820px;margin:0 auto')}>
      <div style={css('display:flex;justify-content:center;margin-bottom:14px')}>
        <span style={css('transform:rotate(-1.5deg);display:flex;align-items:center;gap:8px;padding:6px 13px;border:2px solid #2B2336;background:#FF4FA3;border-radius:999px;box-shadow:3px 3px 0 #2B2336')}>
          <span style={css('font:700 10.5px Inter,sans-serif;letter-spacing:.1em;color:#FFF')}>MULTI-AGENT · VERY SERIOUS ANALYSIS</span>
        </span>
      </div>
      <h1 style={css('margin:0;text-align:center;font-family:Bangers,cursive;font-size:clamp(38px,7vw,74px);line-height:.94;letter-spacing:1px;color:#2B2336;text-wrap:balance')}>WHAT ARE WE <span style={css('color:#8B5CF6')}>OVERTHINKING</span> TODAY?</h1>
      <p style={css('margin:16px auto 26px;text-align:center;max-width:520px;font-size:14.5px;line-height:1.55;color:#6F687A;font-weight:500;text-wrap:pretty')}>Because making a simple decision yourself would be <em style={css('font-style:normal;font-weight:700;color:#1A1720')}>far too efficient</em>.</p>

      <div style={css('background:#FFF;border:3px solid #2B2336;border-radius:20px;box-shadow:7px 7px 0 #2B2336;overflow:hidden')}>
        <div style={css('padding:15px 18px 0;display:flex;flex-wrap:wrap;gap:9px;align-items:center')}>
          <span style={css('font-family:Bangers,cursive;font-size:17px;letter-spacing:.6px;color:#2B2336')}>DROP YOUR LIFE-CHANGING PROBLEM HERE</span>
          <span style={css('transform:rotate(2deg);font:700 9.5px Inter,sans-serif;letter-spacing:.08em;padding:3px 8px;border:2px solid #2B2336;border-radius:999px;background:#FFD84D')}>EXTREMELY IMPORTANT</span>
        </div>
        <textarea value={v.q} onChange={v.onQ} rows="3" placeholder="Should I finally make this decision?" style={css("display:block;width:100%;border:0;outline:none;resize:none;background:transparent;color:#1A1720;font-family:'Space Grotesk',sans-serif;font-size:19px;line-height:1.45;font-weight:600;padding:12px 18px 6px;letter-spacing:-.3px")}></textarea>
        <div style={css('padding:0 18px 12px;font-size:11.5px;color:#A79FB2;font-weight:600')}>Please ensure this decision is unnecessarily complicated.</div>
        <div style={css('display:flex;flex-wrap:wrap;gap:7px;padding:0 18px 16px')}>
          {v.cats.map(c => (
            <Sx key={c.label} as="button" onClick={c.pick}
              style={`padding:5px 12px;border-radius:999px;border:2px solid #2B2336;background:${c.bg};color:#1A1720;font-size:12px;font-weight:700;cursor:pointer;box-shadow:${c.sh};transition:transform .12s,box-shadow .12s`}
              hover="transform:translate(-1px,-1px);box-shadow:3px 3px 0 #2B2336"
              active="transform:translate(1px,1px);box-shadow:0 0 0 #2B2336">{c.label}</Sx>
          ))}
        </div>

        <div style={css('border-top:3px solid #2B2336;background:#FFF8E7;padding:16px 18px 20px')}>
          <div style={css('display:flex;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:12px')}>
            <span style={css('font-family:Bangers,cursive;font-size:17px;letter-spacing:.6px;color:#2B2336')}>HOW BAD IS IT?</span>
            <span style={css('font-size:11.5px;font-weight:700;color:#6F687A')}>{v.levelHint}</span>
          </div>
          <div style={css('display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px')}>
            {v.levels.map(l => (
              <Sx key={l.name} as="button" onClick={l.pick}
                style={`text-align:left;padding:13px 14px;border-radius:14px;border:3px solid #2B2336;background:${l.bg};cursor:pointer;box-shadow:${l.sh};transform:${l.tf};transition:transform .13s,box-shadow .13s`}
                hover="transform:translate(-2px,-2px);box-shadow:5px 5px 0 #2B2336"
                active="transform:translate(1px,1px);box-shadow:1px 1px 0 #2B2336">
                <span style={css('display:flex;align-items:center;gap:8px;margin-bottom:6px')}>
                  <span style={css('font-size:19px;line-height:1')}>{l.emoji}</span>
                  <span style={css(`font-family:Bangers,cursive;font-size:19px;letter-spacing:.7px;color:${l.fg}`)}>{l.name}</span>
                  {l.on && (
                    <span style={css('margin-left:auto;font:700 9px Inter,sans-serif;padding:2px 7px;border:2px solid #2B2336;border-radius:999px;background:#2B2336;color:#FFF8E7')}>PICKED</span>
                  )}
                </span>
                <span style={css(`display:block;font-size:12px;line-height:1.45;color:${l.sub};font-weight:600`)}>{l.desc}</span>
              </Sx>
            ))}
          </div>
          <Sx as="button" onClick={v.begin}
            style={`margin-top:18px;width:100%;display:flex;align-items:center;justify-content:center;gap:10px;padding:16px;border-radius:16px;border:3px solid #2B2336;background:${v.accent};color:#FFF;font-family:Bangers,cursive;font-size:clamp(24px,3.6vw,32px);letter-spacing:1.2px;cursor:pointer;box-shadow:6px 6px 0 #2B2336;transition:transform .12s,box-shadow .12s`}
            hover="transform:translate(-2px,-3px);box-shadow:8px 9px 0 #2B2336"
            active="transform:translate(3px,3px);box-shadow:1px 1px 0 #2B2336">
            <span style={css('font-size:26px;line-height:1')}>🧠</span> BEGIN OVERTHINKING <span style={css('opacity:.85')}>→</span>
          </Sx>
          {v.apiError && <div role="alert" style={css('margin-top:12px;padding:10px 12px;border:2px solid #2B2336;border-radius:10px;background:#FFB3B3;color:#1A1720;font-size:12.5px;font-weight:700')}>{v.apiError}</div>}
          <div style={css('text-align:center;font-size:11.5px;color:#6F687A;font-weight:600;margin-top:10px')}>Average unnecessary analysis time: 12 seconds. Yours may be worse.</div>
        </div>
      </div>

      <div style={css('margin-top:30px')}>
        <div style={css('font-family:Bangers,cursive;font-size:17px;letter-spacing:.6px;color:#2B2336;margin-bottom:11px')}>OR ESCALATE SOMETHING TINY</div>
        <div style={css('display:flex;flex-wrap:wrap;gap:8px')}>
          {v.examples.map((e, i) => (
            <Sx key={i} as="button" onClick={e.pick}
              style={`padding:9px 13px;border-radius:12px;border:2px solid #2B2336;background:#FFF;color:#1A1720;font-size:12.5px;font-weight:600;cursor:pointer;box-shadow:3px 3px 0 #2B2336;transform:${e.tf};transition:transform .12s,box-shadow .12s`}
              hover={`transform:translate(-1px,-2px);box-shadow:4px 5px 0 #2B2336;background:${e.hov}`}
              active="transform:translate(1px,1px);box-shadow:1px 1px 0 #2B2336">{e.label}</Sx>
          ))}
        </div>
      </div>
    </div>
  );
}
