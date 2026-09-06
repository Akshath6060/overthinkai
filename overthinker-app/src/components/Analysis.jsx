import React from 'react';
import { css, Sx } from '../lib/sx.jsx';

export default function Analysis(v) {
  return (
    <div style={css('display:flex;gap:22px;align-items:flex-start;max-width:1500px;margin:0 auto')}>
      <div style={css('flex:1;min-width:0;display:flex;flex-direction:column;gap:18px')}>

        <div style={css('background:#FFF;border:3px solid #2B2336;border-radius:18px;box-shadow:6px 6px 0 #2B2336;padding:18px 20px')}>
          <div style={css('display:flex;flex-wrap:wrap;gap:14px;align-items:flex-start;justify-content:space-between')}>
            <div style={css('min-width:0;flex:1')}>
              <div style={css('font:700 10px Inter,sans-serif;letter-spacing:.14em;color:#A79FB2;margin-bottom:8px')}>THE PROBLEM · {v.runId}</div>
              <h1 style={css("margin:0;font-family:'Space Grotesk',sans-serif;font-size:clamp(21px,2.8vw,30px);font-weight:700;letter-spacing:-.8px;line-height:1.15;text-wrap:pretty")}>“{v.question}”</h1>
              <div style={css('display:flex;flex-wrap:wrap;gap:7px;margin-top:13px')}>
                <span style={css('font:700 10px Inter,sans-serif;color:#1A1720;border:2px solid #2B2336;background:#FFD84D;padding:3px 9px;border-radius:999px')}>{v.levelUpper} MODE</span>
                <span style={css('font:700 10px Inter,sans-serif;color:#1A1720;border:2px solid #2B2336;background:#4CC9F0;padding:3px 9px;border-radius:999px')}>{v.catUpper}</span>
                <span style={css('font:700 10px Inter,sans-serif;color:#1A1720;border:2px solid #2B2336;background:#FFF8E7;padding:3px 9px;border-radius:999px')}>{v.expertCount} EXPERTS BOTHERED</span>
              </div>
            </div>
            <div style={css(`display:flex;align-items:center;gap:9px;padding:8px 13px;border-radius:999px;border:3px solid #2B2336;background:${v.statusBg};box-shadow:3px 3px 0 #2B2336`)}>
              <span style={css(`width:9px;height:9px;border-radius:50%;background:#2B2336;animation:${v.statusAnim}`)}></span>
              <span style={css('font-family:Bangers,cursive;font-size:16px;letter-spacing:.7px;color:#2B2336')}>{v.statusLabel}</span>
            </div>
          </div>
          <div style={css('margin-top:16px;height:14px;border:3px solid #2B2336;border-radius:999px;background:#FFF8E7;overflow:hidden')}>
            <div style={css(`height:100%;background:repeating-linear-gradient(45deg,${v.accent} 0 9px,#7C4DEC 9px 18px);width:${v.progressPct};transition:width .5s cubic-bezier(.4,0,.2,1)`)}></div>
          </div>
          {v.isRunning && (
            <div style={css('margin-top:11px;display:flex;align-items:center;gap:9px')}>
              <span style={css('font-size:15px;animation:ot-bob 1.1s ease-in-out infinite')}>🌀</span>
              <span style={css('font-family:Bangers,cursive;font-size:17px;letter-spacing:.5px;color:#8B5CF6')}>{v.loadingMsg}</span>
            </div>
          )}
        </div>

        <div style={css('background:#FFFDF6;border:3px solid #2B2336;border-radius:18px;padding:16px 18px;box-shadow:4px 4px 0 #2B2336')}>
          <div style={css('display:flex;align-items:center;gap:9px;margin-bottom:14px;flex-wrap:wrap')}>
            <span style={css('font-family:Bangers,cursive;font-size:17px;letter-spacing:.6px;color:#2B2336')}>THE ASSEMBLY LINE OF DOUBT</span>
            <span style={css('font:700 9.5px Inter,sans-serif;padding:3px 8px;border:2px solid #2B2336;border-radius:999px;background:#B7F34A')}>TOTALLY NECESSARY</span>
          </div>
          <div style={css('display:flex;flex-wrap:wrap;align-items:center;gap:5px')}>
            {v.pipeline.map((n, i) => (
              <div key={i} style={css('display:flex;align-items:center;gap:5px;min-width:0')}>
                {n.hasLine && (
                  <span style={css(`width:14px;height:3px;background:#2B2336;flex:none;opacity:${n.lineOp}`)}></span>
                )}
                <span style={css(`display:flex;align-items:center;gap:7px;padding:6px 11px 6px 8px;border-radius:999px;border:2.5px solid #2B2336;background:${n.bg};min-width:0;box-shadow:${n.sh};opacity:${n.op};transform:${n.tf};transition:all .25s;animation:${n.anim}`)}>
                  <span style={css('font-size:14px;line-height:1')}>{n.emoji}</span>
                  <span style={css("font:700 11px 'Space Grotesk',sans-serif;color:#1A1720;white-space:nowrap")}>{n.label}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={css('display:grid;grid-template-columns:repeat(auto-fit,minmax(345px,1fr));gap:16px')}>
          {v.visibleAgents.map(a => (
            <div key={a.name} style={css(`background:#FFF;border:3px solid #2B2336;border-radius:18px;padding:16px 17px;box-shadow:5px 5px 0 #2B2336;animation:${a.cardAnim};position:relative;display:flex;flex-direction:column;gap:13px;transform:${a.tf}`)}>
              <span style={css(`position:absolute;top:-12px;right:12px;transform:rotate(${a.stickerRot});font-family:Bangers,cursive;font-size:12.5px;letter-spacing:.5px;padding:3px 10px;border:2.5px solid #2B2336;border-radius:999px;background:${a.color};color:#1A1720;box-shadow:2px 2px 0 #2B2336;white-space:nowrap`)}>{a.sticker}</span>
              <div style={css('display:flex;align-items:flex-start;gap:12px')}>
                <span style={css(`width:44px;height:44px;border-radius:13px;background:${a.color};border:3px solid #2B2336;display:grid;place-items:center;font-size:22px;flex:none;box-shadow:2px 2px 0 #2B2336`)}>{a.emoji}</span>
                <span style={css('flex:1;min-width:0')}>
                  <span style={css("display:block;font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:700;letter-spacing:-.3px")}>{a.name}</span>
                  <span style={css('display:block;font-size:12px;font-weight:600;color:#6F687A;margin-top:2px')}>{a.tagline}</span>
                </span>
              </div>
              <div style={css('display:flex;flex-wrap:wrap;gap:6px')}>
                <span style={css(`display:flex;align-items:center;gap:6px;padding:3px 9px;border-radius:999px;border:2px solid #2B2336;background:${a.stBg}`)}>
                  <span style={css(`width:6px;height:6px;border-radius:50%;background:#2B2336;animation:${a.stAnim}`)}></span>
                  <span style={css('font:700 9.5px Inter,sans-serif;letter-spacing:.08em;color:#1A1720')}>{a.statusLabel}</span>
                </span>
                {a.done && (
                  <span style={css('font:700 9.5px Inter,sans-serif;letter-spacing:.08em;padding:3px 9px;border-radius:999px;border:2px solid #2B2336;background:#FFF8E7;color:#1A1720')}>{a.badge}</span>
                )}
              </div>

              {a.pending && (
                <div style={css('display:flex;flex-direction:column;gap:8px;padding:2px 0 4px')}>
                  <span style={css('height:11px;border-radius:6px;width:96%;border:2px solid #2B2336;background:linear-gradient(90deg,#FFF8E7 0%,#FFE9A8 50%,#FFF8E7 100%);background-size:200% 100%;animation:ot-sheen 1.4s linear infinite')}></span>
                  <span style={css('height:11px;border-radius:6px;width:84%;border:2px solid #2B2336;background:linear-gradient(90deg,#FFF8E7 0%,#FFE9A8 50%,#FFF8E7 100%);background-size:200% 100%;animation:ot-sheen 1.4s linear infinite')}></span>
                  <span style={css('height:11px;border-radius:6px;width:52%;border:2px solid #2B2336;background:linear-gradient(90deg,#FFF8E7 0%,#FFE9A8 50%,#FFF8E7 100%);background-size:200% 100%;animation:ot-sheen 1.4s linear infinite')}></span>
                </div>
              )}

              {a.done && (
                <div>
                  <p style={css('margin:0;font-size:13.5px;line-height:1.6;color:#1A1720;font-weight:500;text-wrap:pretty')}>{a.analysis}</p>
                  <div style={css('display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-top:14px;padding-top:13px;border-top:2px dashed #D8CFC0')}>
                    <span style={css(`font-family:Bangers,cursive;font-size:15px;letter-spacing:.6px;padding:3px 10px;border-radius:999px;color:#1A1720;background:${a.vBg};border:2.5px solid #2B2336`)}>{a.verdict}</span>
                    <span style={css('display:flex;align-items:center;gap:7px;flex:1;min-width:130px')}>
                      <span style={css('font:700 9.5px Inter,sans-serif;color:#6F687A')}>CONF</span>
                      <span style={css('flex:1;height:9px;border:2px solid #2B2336;border-radius:999px;background:#FFF8E7;overflow:hidden;min-width:40px')}><span style={css(`display:block;height:100%;background:${a.color};width:${a.confPct};transition:width .7s ease`)}></span></span>
                      <span style={css("font:700 12px 'Space Grotesk',sans-serif")}>{a.confPct}</span>
                    </span>
                    <span style={css('font:600 10.5px Inter,sans-serif;color:#A79FB2')}>{a.time}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {v.isDone && (
          <>
            <div style={css('animation:ot-slam .45s cubic-bezier(.2,.9,.3,1.1) both;background:#FFD84D;border:4px solid #2B2336;border-radius:24px;padding:clamp(22px,4vw,40px);box-shadow:10px 10px 0 #2B2336;position:relative;overflow:hidden')}>
              <span style={css('position:absolute;top:14px;right:-4px;transform:rotate(9deg);font-family:Bangers,cursive;font-size:clamp(15px,2.4vw,20px);letter-spacing:1px;padding:6px 22px;border:3px solid #2B2336;border-radius:999px;background:#FF4FA3;color:#FFF;box-shadow:3px 3px 0 #2B2336')}>SCIENCE™</span>
              <div style={css('display:flex;align-items:center;gap:9px;margin-bottom:14px')}>
                <span style={css('font-family:Bangers,cursive;font-size:clamp(17px,2.5vw,22px);letter-spacing:1.2px;color:#2B2336;background:#FFF8E7;border:3px solid #2B2336;border-radius:999px;padding:3px 14px;box-shadow:3px 3px 0 #2B2336')}>FINAL VERDICT</span>
              </div>
              <div style={css('font-family:Bangers,cursive;font-size:clamp(38px,7vw,78px);line-height:.94;letter-spacing:2px;color:#2B2336;text-shadow:4px 4px 0 #FFF8E7;text-wrap:balance')}>{v.finalHeadline}</div>
              <p style={css('margin:20px 0 0;max-width:700px;font-size:14px;line-height:1.6;color:#3A3244;font-weight:600;text-wrap:pretty')}>{v.finalExplanation}</p>
              <div style={css('display:flex;flex-wrap:wrap;gap:14px;margin-top:24px')}>
                <div style={css('background:#FFF;border:3px solid #2B2336;border-radius:16px;padding:14px 18px;box-shadow:4px 4px 0 #2B2336;min-width:150px')}>
                  <div style={css('font:700 9.5px Inter,sans-serif;letter-spacing:.12em;color:#6F687A;margin-bottom:6px')}>CONFIDENCE (UNEARNED)</div>
                  <div style={css('display:flex;align-items:baseline;gap:3px')}><span style={css("font-family:'Space Grotesk',sans-serif;font-size:38px;font-weight:700;letter-spacing:-1.4px")}>{v.overall}</span><span style={css('font-size:19px;font-weight:700;color:#6F687A')}>%</span></div>
                </div>
                <div style={css('background:#B7F34A;border:3px solid #2B2336;border-radius:16px;padding:14px 18px;box-shadow:4px 4px 0 #2B2336;min-width:160px')}>
                  <div style={css('font:700 9.5px Inter,sans-serif;letter-spacing:.12em;color:#3A3244;margin-bottom:8px')}>THE COUNCIL SAYS</div>
                  <div style={css('font-size:13px;font-weight:700;line-height:1.5;color:#1A1720')}>{v.approveCount} agents approve<br /><span style={css('font-weight:600;color:#3A3244')}>{v.disapproveCount} agents disagree</span></div>
                </div>
                <div style={css('background:#FFF;border:3px dashed #2B2336;border-radius:16px;padding:14px 18px;min-width:160px')}>
                  <div style={css('font:700 9.5px Inter,sans-serif;letter-spacing:.12em;color:#6F687A;margin-bottom:8px')}>LONE HATER</div>
                  <div style={css('font-size:13px;font-weight:700;line-height:1.5')}>😈 {v.dissentingNames}</div>
                </div>
              </div>
              <div style={css('display:flex;flex-wrap:wrap;gap:10px;margin-top:24px')}>
                <Sx as="button" onClick={v.reset}
                  style={`padding:13px 20px;border-radius:14px;border:3px solid #2B2336;background:${v.accent};color:#FFF;font-family:Bangers,cursive;font-size:20px;letter-spacing:.9px;cursor:pointer;box-shadow:5px 5px 0 #2B2336;transition:transform .12s,box-shadow .12s`}
                  hover="transform:translate(-2px,-3px);box-shadow:7px 8px 0 #2B2336"
                  active="transform:translate(2px,2px);box-shadow:1px 1px 0 #2B2336">OVERTHINK ANOTHER ONE</Sx>
                <Sx as="button" type="button" onClick={v.shareResult}
                  style="padding:13px 20px;border-radius:14px;border:3px solid #2B2336;background:#4CC9F0;color:#1A1720;font-family:Bangers,cursive;font-size:20px;letter-spacing:.9px;cursor:pointer;box-shadow:5px 5px 0 #2B2336;transition:transform .12s,box-shadow .12s"
                  hover="transform:translate(-2px,-3px);box-shadow:7px 8px 0 #2B2336"
                  active="transform:translate(2px,2px);box-shadow:1px 1px 0 #2B2336">SHARE THE SHAME</Sx>
                <Sx as="button" type="button" onClick={v.downloadResult}
                  style="padding:13px 20px;border-radius:14px;border:3px solid #2B2336;background:#FFF;color:#1A1720;font-family:Bangers,cursive;font-size:20px;letter-spacing:.9px;cursor:pointer;box-shadow:5px 5px 0 #2B2336;transition:transform .12s,box-shadow .12s"
                  hover="transform:translate(-2px,-3px);box-shadow:7px 8px 0 #2B2336"
                  active="transform:translate(2px,2px);box-shadow:1px 1px 0 #2B2336">SAVE FOR THERAPY</Sx>
              </div>
              {v.actionStatus && <div role="status" aria-live="polite" style={css('margin-top:14px;font-size:12px;font-weight:700;color:#3A3244')}>{v.actionStatus}</div>}
            </div>

            <div style={css('display:grid;grid-template-columns:repeat(auto-fit,minmax(165px,1fr));gap:12px')}>
              {v.metricsCards.map((m, i) => (
                <div key={i} style={css(`background:#FFF;border:3px solid #2B2336;border-radius:14px;padding:14px;box-shadow:4px 4px 0 #2B2336;transform:${m.tf}`)}>
                  <div style={css('font:700 9.5px Inter,sans-serif;letter-spacing:.1em;color:#6F687A;margin-bottom:9px')}>{m.label}</div>
                  <div style={css(`font-family:'Space Grotesk',sans-serif;font-size:24px;font-weight:700;letter-spacing:-.8px;color:${m.color}`)}>{m.value}</div>
                  <div style={css('font-size:10.5px;color:#A79FB2;margin-top:5px;font-weight:600')}>{m.note}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <aside data-rightpanel="1" style={css('width:340px;flex:none;position:sticky;top:82px;display:flex;flex-direction:column;gap:14px')}>
        <div style={css('background:#2B2336;border:3px solid #2B2336;border-radius:18px;overflow:hidden;box-shadow:5px 5px 0 #FFD84D')}>
          <button type="button" aria-expanded={v.logOpen} onClick={v.toggleLog} style={css('width:100%;display:flex;align-items:center;gap:9px;padding:13px 15px;background:#2B2336;border:0;cursor:pointer;text-align:left')}>
            <span style={css('width:8px;height:8px;border-radius:50%;background:#B7F34A;animation:ot-blink 1.4s ease-in-out infinite')}></span>
            <span style={css('flex:1;font-family:Bangers,cursive;font-size:16px;letter-spacing:.7px;color:#FFF8E7')}>GROUP CHAT (AGENT ACTIVITY)</span>
            <span style={css('font-size:12px;color:#FFF8E7')}>{v.logChevron}</span>
          </button>
          {v.logOpen && (
            <div style={css('padding:6px 15px 15px;max-height:330px;overflow:auto;display:flex;flex-direction:column;gap:9px')}>
              {v.logs.map((g, i) => (
                <div key={i} style={css('display:flex;gap:9px;font:500 11.5px/1.45 Inter,sans-serif;animation:ot-pop .25s ease both')}>
                  <span style={css('color:#8A7FA0;flex:none;font-variant-numeric:tabular-nums')}>{g.t}</span>
                  <span style={css(`color:${g.color};font-weight:600`)}>{g.msg}</span>
                </div>
              ))}
              {v.isRunning && (
                <div style={css('display:flex;gap:9px;font:600 11.5px Inter,sans-serif;color:#8A7FA0')}><span>····</span><span>someone is typing<span style={css('animation:ot-blink 1s infinite')}>_</span></span></div>
              )}
            </div>
          )}
        </div>

        <div style={css('background:#FFF;border:3px solid #2B2336;border-radius:18px;padding:15px;box-shadow:4px 4px 0 #2B2336')}>
          <div style={css('font-family:Bangers,cursive;font-size:16px;letter-spacing:.6px;color:#2B2336;margin-bottom:12px')}>RESOURCES WASTED, LIVE</div>
          <div style={css('display:flex;flex-direction:column;gap:10px')}>
            {v.telemetry.map((t, i) => (
              <div key={i} style={css('display:flex;align-items:baseline;justify-content:space-between;gap:10px')}>
                <span style={css('font-size:12.5px;color:#6F687A;font-weight:600')}>{t.k}</span>
                <span style={css("font:700 12.5px 'Space Grotesk',sans-serif;color:#1A1720")}>{t.v}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={css('background:#FF4FA3;border:3px solid #2B2336;border-radius:18px;padding:15px;box-shadow:4px 4px 0 #2B2336;transform:rotate(-1deg)')}>
          <div style={css('font-family:Bangers,cursive;font-size:16px;letter-spacing:.6px;color:#FFF;margin-bottom:8px')}>DID YOU KNOW?</div>
          <div style={css('font-size:12.5px;line-height:1.6;color:#FFF;font-weight:600')}>You could have made this decision yourself in the time it took to read this panel. The agents are aware. They do not care.</div>
        </div>
      </aside>
    </div>
  );
}
