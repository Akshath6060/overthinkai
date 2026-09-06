import React, { useState } from 'react';
import { css, Sx } from '../lib/sx.jsx';

export default function Lab(v) {
  const emptyAgent = { name: '', emoji: '🧠', color: '#FFD84D', tagline: 'Custom overthinker', personality: 'Opinionated but useful', instructions: '' };
  const [draft, setDraft] = useState(emptyAgent);
  const [submitting, setSubmitting] = useState(false);
  const update = event => setDraft(current => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async event => {
    event.preventDefault();
    if (!draft.name.trim() || !draft.instructions.trim() || submitting) return;
    setSubmitting(true);
    if (await v.createAgent({ ...draft, name: draft.name.trim(), instructions: draft.instructions.trim(), role: 'analyst', enabled: true })) setDraft(emptyAgent);
    setSubmitting(false);
  };

  if (v.agentsLoading) return <div className="panel-state" role="status">🌀 Assembling the unnecessary experts…</div>;
  return (
    <div style={css('max-width:1240px;margin:0 auto;display:flex;flex-direction:column;gap:18px')}>
      <div style={css('display:flex;flex-wrap:wrap;gap:14px;align-items:flex-end;justify-content:space-between')}>
        <div>
          <h1 style={css('margin:0;font-family:Bangers,cursive;font-size:clamp(30px,5vw,52px);letter-spacing:1px;line-height:1;color:#2B2336')}>COUNCIL OF UNNECESSARY EXPERTS</h1>
          <p style={css('margin:10px 0 0;font-size:13.5px;color:#6F687A;font-weight:600')}>Hire them. Fire them. Rank them. They will still disagree.</p>
        </div>
        <div style={css('display:flex;gap:10px;align-items:center;flex-wrap:wrap')}>
          <span style={css('font:700 11px Inter,sans-serif;color:#6F687A')}>{v.enabledCount} OF {v.agentCount} ON DUTY</span>
          <Sx as="button" type="button" onClick={() => document.getElementById('custom-agent-name')?.focus()}
            style={`padding:12px 18px;border-radius:14px;border:3px solid #2B2336;background:${v.accent};color:#FFF;font-family:Bangers,cursive;font-size:19px;letter-spacing:.8px;cursor:pointer;box-shadow:5px 5px 0 #2B2336;transition:transform .12s,box-shadow .12s`}
            hover="transform:translate(-2px,-3px);box-shadow:7px 8px 0 #2B2336"
            active="transform:translate(2px,2px);box-shadow:1px 1px 0 #2B2336">+ HIRE SOMEONE WEIRD</Sx>
        </div>
      </div>

      <div style={css('display:grid;grid-template-columns:repeat(auto-fit,minmax(310px,1fr));gap:15px')}>
        {v.labAgents.map(a => (
          <div key={a.key} style={css(`background:#FFF;border:3px solid #2B2336;border-radius:18px;padding:16px;box-shadow:5px 5px 0 #2B2336;display:flex;flex-direction:column;gap:13px;opacity:${a.opacity};transform:${a.tf};transition:opacity .2s`)}>
            <div style={css('display:flex;align-items:flex-start;gap:11px')}>
              <span style={css(`width:44px;height:44px;border-radius:13px;background:${a.color};border:3px solid #2B2336;display:grid;place-items:center;font-size:22px;flex:none;box-shadow:2px 2px 0 #2B2336`)}>{a.emoji}</span>
              <span style={css('flex:1;min-width:0')}>
                <span style={css("display:block;font-family:'Space Grotesk',sans-serif;font-size:15.5px;font-weight:700;letter-spacing:-.3px")}>{a.name}</span>
                <span style={css('display:block;font-size:11.5px;font-weight:600;color:#6F687A;margin-top:2px')}>{a.tagline}</span>
              </span>
              <span style={css('display:flex;gap:5px;flex:none')}>
                <Sx as="button" type="button" aria-label={`Move ${a.name} up`} onClick={a.up}
                  style="width:28px;height:28px;border-radius:9px;border:2px solid #2B2336;background:#FFF8E7;color:#2B2336;font-size:12px;font-weight:700;cursor:pointer;box-shadow:2px 2px 0 #2B2336"
                  active="transform:translate(1px,1px);box-shadow:0 0 0 #2B2336">↑</Sx>
                <Sx as="button" type="button" aria-label={`Move ${a.name} down`} onClick={a.down}
                  style="width:28px;height:28px;border-radius:9px;border:2px solid #2B2336;background:#FFF8E7;color:#2B2336;font-size:12px;font-weight:700;cursor:pointer;box-shadow:2px 2px 0 #2B2336"
                  active="transform:translate(1px,1px);box-shadow:0 0 0 #2B2336">↓</Sx>
              </span>
            </div>
            <div style={css('font-size:12.5px;line-height:1.5;color:#1A1720;font-weight:600')}>{a.personality}</div>
            <div style={css('display:flex;flex-direction:column;gap:8px')}>
              {a.stats.map((st, i) => (
                <div key={i} style={css('display:flex;align-items:center;gap:9px')}>
                  <span style={css('width:78px;flex:none;font:700 9.5px Inter,sans-serif;letter-spacing:.09em;color:#6F687A')}>{st.k}</span>
                  <span style={css('flex:1;height:10px;border:2px solid #2B2336;border-radius:999px;background:#FFF8E7;overflow:hidden')}><span style={css(`display:block;height:100%;width:${st.w};background:${st.fill}`)}></span></span>
                  <span style={css("width:38px;text-align:right;font:700 11.5px 'Space Grotesk',sans-serif")}>{st.v}</span>
                </div>
              ))}
              <div style={css('display:flex;align-items:baseline;gap:9px;padding-top:2px')}>
                <span style={css('width:78px;flex:none;font:700 9.5px Inter,sans-serif;letter-spacing:.09em;color:#6F687A')}>KNOWLEDGE</span>
                <span style={css('font:700 11.5px Inter,sans-serif;color:#FF4D4D')}>{a.knowledge}</span>
              </div>
            </div>
            <div style={css('margin-top:auto;padding-top:12px;border-top:2px dashed #D8CFC0;display:flex;align-items:center;justify-content:space-between;gap:10px')}>
              <span style={css('font:700 11.5px Inter,sans-serif;color:#1A1720')}>{a.toggleLabel}</span>
              <button type="button" role="switch" aria-checked={a.toggleLabel === 'ON DUTY'} aria-label={`${a.name} enabled`} onClick={a.toggle} style={css(`width:46px;height:26px;flex:none;border-radius:999px;border:2.5px solid #2B2336;background:${a.trackBg};cursor:pointer;padding:0;display:flex;align-items:center;justify-content:${a.knobPos};transition:all .18s`)}>
                <span style={css('width:18px;height:18px;border-radius:50%;background:#FFF;border:2px solid #2B2336;margin:0 2px;display:block')}></span>
              </button>
            </div>
          </div>
        ))}

        <form onSubmit={submit} style={css('background:#FFFDF6;border:3px dashed #2B2336;border-radius:18px;padding:16px;display:flex;flex-direction:column;gap:12px')}>
          <div style={css('display:flex;align-items:center;gap:11px')}>
            <span style={css('width:44px;height:44px;border-radius:13px;border:3px dashed #2B2336;display:grid;place-items:center;color:#2B2336;font-size:22px;flex:none')}>＋</span>
            <span><span style={css('display:block;font-family:Bangers,cursive;font-size:19px;letter-spacing:.7px')}>HIRE A CUSTOM EXPERT</span><span style={css('display:block;font-size:11.5px;color:#6F687A;margin-top:2px;font-weight:600')}>One more voice in the committee.</span></span>
          </div>
          <div style={css('display:flex;flex-direction:column;gap:8px')}>
            <label style={css('font:700 9px Inter,sans-serif;letter-spacing:.11em;color:#6F687A')}>AGENT NAME<input id="custom-agent-name" required maxLength={80} name="name" value={draft.name} onChange={update} placeholder="Mom" style={css('display:block;width:100%;margin-top:4px;padding:9px 12px;border:2px solid #2B2336;border-radius:11px;background:#FFF')} /></label>
            <label style={css('font:700 9px Inter,sans-serif;letter-spacing:.11em;color:#6F687A')}>ROLE<input maxLength={160} name="tagline" value={draft.tagline} onChange={update} style={css('display:block;width:100%;margin-top:4px;padding:9px 12px;border:2px solid #2B2336;border-radius:11px;background:#FFF')} /></label>
            <label style={css('font:700 9px Inter,sans-serif;letter-spacing:.11em;color:#6F687A')}>PERSONALITY<input maxLength={500} name="personality" value={draft.personality} onChange={update} style={css('display:block;width:100%;margin-top:4px;padding:9px 12px;border:2px solid #2B2336;border-radius:11px;background:#FFF')} /></label>
            <label style={css('font:700 9px Inter,sans-serif;letter-spacing:.11em;color:#6F687A')}>INSTRUCTIONS<textarea required maxLength={4000} name="instructions" value={draft.instructions} onChange={update} placeholder="Ask if there is food at home before approving anything." rows={3} style={css('display:block;width:100%;resize:vertical;margin-top:4px;padding:9px 12px;border:2px solid #2B2336;border-radius:11px;background:#FFF')} /></label>
          </div>
          <div style={css('display:flex;gap:6px;flex-wrap:wrap')}>
            {v.agentPresets.map((p, i) => (
              <button type="button" key={p.id} onClick={() => setDraft(current => ({ ...current, name: p.name, emoji: p.emoji, tagline: p.tagline, personality: p.personality, instructions: p.instructions }))} style={css(`font:700 10.5px Inter,sans-serif;padding:4px 10px;border:2px solid #2B2336;border-radius:999px;background:${['#FFD84D','#B7F34A','#4CC9F0'][i % 3]};cursor:pointer`)}>{p.emoji} {p.name}</button>
            ))}
          </div>
          <Sx as="button" type="submit" disabled={submitting}
            style="margin-top:auto;padding:11px;border-radius:12px;border:3px solid #2B2336;background:#FFD84D;color:#1A1720;font-family:Bangers,cursive;font-size:18px;letter-spacing:.8px;cursor:pointer;box-shadow:4px 4px 0 #2B2336"
            hover="transform:translate(-2px,-2px);box-shadow:6px 6px 0 #2B2336">{submitting ? 'DEPLOYING…' : 'DEPLOY THIS MENACE'}</Sx>
        </form>
      </div>
      {v.agentsError && <div role="alert" style={css('padding:12px 14px;border:3px solid #2B2336;border-radius:12px;background:#FFB3B3;font-weight:700')}>{v.agentsError} <button type="button" onClick={v.retryAgents}>Try again</button></div>}
    </div>
  );
}
