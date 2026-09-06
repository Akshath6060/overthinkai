import React from 'react';
import { css, Sx } from '../lib/sx.jsx';
import { authMetrics } from '../data.js';
import Logo from './Logo.jsx';
import { useDialogFocus } from '../lib/useDialogFocus.js';

export default function LoginScreen(v) {
  const quizRef = useDialogFocus(v.quizOpen, v.closeQuiz);
  return (
    <div style={css('min-height:100vh;background:#FFF8E7;font-family:Inter,ui-sans-serif,system-ui,sans-serif;color:#1A1720;padding:clamp(18px,4vw,52px) clamp(14px,4vw,40px);display:flex;flex-direction:column;align-items:center;gap:22px')}>

      <div style={css('display:flex;align-items:center;gap:11px;align-self:flex-start;flex-wrap:wrap')}>
        <span style={css('width:38px;height:38px;flex:none;border:3px solid #2B2336;border-radius:12px;background:#8B5CF6;box-shadow:3px 3px 0 #2B2336;display:grid;place-items:center')}>
          <Logo size={21} />
        </span>
        <span style={css('font-family:Bangers,cursive;font-size:24px;letter-spacing:.6px;color:#2B2336')}>OVERTHINKER AI</span>
        <span style={css('font:700 10px Inter,sans-serif;letter-spacing:.1em;padding:4px 10px;border:2px solid #2B2336;border-radius:999px;background:#FFD84D')}>POWERED BY ZERO EVIDENCE™</span>
        <span style={css('font:700 10px Inter,sans-serif;letter-spacing:.1em;padding:4px 10px;border:2px solid #2B2336;border-radius:999px;background:#4CC9F0;transform:rotate(-1.5deg)')}>MILITARY-GRADE GUESSING</span>
      </div>

      <div style={css('width:100%;max-width:780px;text-align:center')}>
        <h1 style={css('margin:0;font-family:Bangers,cursive;font-size:clamp(34px,6.4vw,68px);line-height:.95;letter-spacing:1px;color:#2B2336;text-wrap:balance')}>VERIFYING THAT YOU ARE <span style={css('color:#8B5CF6')}>PROBABLY YOU</span></h1>
        <p style={css('margin:14px auto 0;max-width:520px;font-size:14.5px;line-height:1.55;color:#6F687A;font-weight:600;text-wrap:pretty')}>Credentials would make this unnecessarily straightforward.</p>
      </div>

      <div style={css('width:100%;max-width:780px;background:#FFF;border:4px solid #2B2336;border-radius:24px;box-shadow:9px 9px 0 #2B2336;overflow:hidden')}>
        <div style={css('display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:14px 20px;border-bottom:3px solid #2B2336;background:#FF4FA3')}>
          <span style={css('font-family:Bangers,cursive;font-size:20px;letter-spacing:.8px;color:#FFF')}>IDENTITY CRISIS CHECK</span>
          <span style={css('font:700 9.5px Inter,sans-serif;letter-spacing:.1em;padding:3px 9px;border:2px solid #2B2336;border-radius:999px;background:#FFF8E7;color:#1A1720')}>ZERO-TRUST, TOTAL CONFUSION</span>
        </div>

        <div style={css('padding:16px 20px 20px;display:flex;flex-direction:column;gap:8px')}>
          {v.loginRows.map((r, i) => (
            <div key={i} style={css(`display:flex;align-items:center;gap:11px;padding:10px 12px;border:2.5px solid #2B2336;border-radius:13px;background:${r.bg};box-shadow:${r.sh};opacity:${r.op};animation:${r.anim};transition:opacity .25s`)}>
              <span style={css(`width:30px;height:30px;flex:none;border:2px solid #2B2336;border-radius:9px;background:${r.chipBg};display:grid;place-items:center;font-size:15px`)}>{r.emoji}</span>
              <span style={css('font:700 10px Inter,sans-serif;color:#6F687A;flex:none')}>{r.num}</span>
              <span style={css("flex:1;min-width:0;font-family:'Space Grotesk',sans-serif;font-size:13.5px;font-weight:600;line-height:1.3")}>{r.label}</span>
              <span style={css('display:flex;align-items:center;gap:6px;flex:none;padding:3px 9px;border:2px solid #2B2336;border-radius:999px;background:#FFF8E7')}>
                <span style={css(`width:6px;height:6px;border-radius:50%;background:#2B2336;animation:${r.dotAnim}`)}></span>
                <span style={css('font:700 9.5px Inter,sans-serif;letter-spacing:.07em;color:#1A1720;white-space:nowrap')}>{r.status}</span>
              </span>
            </div>
          ))}

          {v.loginRunning && (
            <div style={css('display:flex;align-items:center;gap:9px;margin-top:4px')}>
              <span style={css('font-size:16px;animation:ot-bob 1s ease-in-out infinite')}>🔍</span>
              <span style={css('font-family:Bangers,cursive;font-size:18px;letter-spacing:.5px;color:#8B5CF6')}>{v.loginMsg}</span>
            </div>
          )}

          {v.loginGranted && (
            <div style={css('margin-top:8px;background:#B7F34A;border:3px solid #2B2336;border-radius:18px;padding:clamp(18px,3vw,26px);box-shadow:6px 6px 0 #2B2336;animation:ot-slam .45s cubic-bezier(.2,.9,.3,1.1) both;text-align:center')}>
              <span style={css('display:inline-block;font-family:Bangers,cursive;font-size:clamp(17px,2.6vw,22px);letter-spacing:1.1px;color:#2B2336;background:#FFF8E7;border:3px solid #2B2336;border-radius:999px;padding:3px 14px;box-shadow:3px 3px 0 #2B2336')}>ACCESS GRANTED</span>
              <div style={css('font-family:Bangers,cursive;font-size:clamp(32px,6.6vw,58px);line-height:.95;letter-spacing:1.5px;color:#2B2336;margin-top:14px;text-shadow:3px 3px 0 #FFF8E7')}>YOU SEEM LEGIT ENOUGH.</div>
              <div style={css('font-size:13px;font-weight:700;color:#2B2336;margin-top:12px')}>IDENTITY VERIFIED* &nbsp;·&nbsp; <span style={css('font-weight:600')}>*We have absolutely no proof.</span></div>
              <div style={css('font-size:12px;font-weight:600;color:#3A3244;margin-top:6px')}>No passwords were harmed during this authentication process.</div>
              <Sx as="button" onClick={v.enterApp}
                style={`margin-top:18px;padding:14px 22px;border-radius:15px;border:3px solid #2B2336;background:${v.accent};color:#FFF;font-family:Bangers,cursive;font-size:clamp(20px,3vw,26px);letter-spacing:1px;cursor:pointer;box-shadow:6px 6px 0 #2B2336;transition:transform .12s,box-shadow .12s`}
                hover="transform:translate(-2px,-3px);box-shadow:8px 9px 0 #2B2336"
                active="transform:translate(3px,3px);box-shadow:1px 1px 0 #2B2336">ENTER OVERTHINKER AI →</Sx>
              <div style={css('font-size:11px;font-weight:600;color:#3A3244;margin-top:9px')}>Entering automatically, because waiting would be another decision.</div>
            </div>
          )}

          {v.loginNotGranted && (
            <div style={css('margin-top:8px;display:flex;flex-direction:column;gap:10px')}>
              <Sx as="button" onClick={v.startLogin}
                style={`width:100%;display:flex;align-items:center;justify-content:center;gap:10px;padding:17px;border-radius:16px;border:3px solid #2B2336;background:${v.accent};color:#FFF;font-family:Bangers,cursive;font-size:clamp(24px,4vw,34px);letter-spacing:1.2px;cursor:pointer;box-shadow:6px 6px 0 #2B2336;transition:transform .12s,box-shadow .12s`}
                hover="transform:translate(-2px,-3px);box-shadow:8px 9px 0 #2B2336"
                active="transform:translate(3px,3px);box-shadow:1px 1px 0 #2B2336">🚪 LET ME IN I GUESS</Sx>
              <div style={css('display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:center')}>
                <Sx as="button" onClick={v.openQuiz}
                  style="padding:9px 15px;border-radius:12px;border:2.5px solid #2B2336;background:#FFF8E7;color:#1A1720;font-size:12.5px;font-weight:700;cursor:pointer;box-shadow:3px 3px 0 #2B2336"
                  hover="transform:translate(-1px,-2px);box-shadow:4px 5px 0 #2B2336"
                  active="transform:translate(1px,1px);box-shadow:1px 1px 0 #2B2336">Overthink My Identity First</Sx>
                <span style={css('font-size:11.5px;color:#A79FB2;font-weight:600')}>No email. No password. No OTP. No point.</span>
              </div>
            </div>
          )}
        </div>

        <div style={css('border-top:3px solid #2B2336;background:#FFF8E7;padding:14px 20px 18px')}>
          <div style={css('font:700 9.5px Inter,sans-serif;letter-spacing:.13em;color:#6F687A;margin-bottom:10px')}>AUTHENTICATION TELEMETRY (MEANINGLESS)</div>
          <div style={css('display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:9px')}>
            {authMetrics.map((m, i) => (
              <div key={i} style={css(`border:2.5px solid #2B2336;border-radius:12px;background:${m.bg};padding:10px 12px;box-shadow:3px 3px 0 #2B2336`)}>
                <div style={css('font:700 9px Inter,sans-serif;letter-spacing:.1em;color:#3A3244;margin-bottom:6px')}>{m.k}</div>
                <div style={css("font-family:'Space Grotesk',sans-serif;font-size:19px;font-weight:700;letter-spacing:-.6px;color:#1A1720")}>{m.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {v.quizOpen && (
        <div style={css('position:fixed;inset:0;z-index:50;background:rgba(43,35,54,.55);display:flex;align-items:center;justify-content:center;padding:18px;overflow:auto')}>
          <div ref={quizRef} role="dialog" aria-modal="true" aria-labelledby="identity-dialog-title" style={css('width:100%;max-width:520px;background:#FFF;border:4px solid #2B2336;border-radius:22px;box-shadow:9px 9px 0 #2B2336;animation:ot-pop .3s cubic-bezier(.2,.9,.3,1.1) both;overflow:hidden')}>
            <div style={css('display:flex;align-items:center;gap:10px;padding:14px 18px;border-bottom:3px solid #2B2336;background:#FFD84D')}>
              <span id="identity-dialog-title" style={css('font-family:Bangers,cursive;font-size:19px;letter-spacing:.7px;color:#2B2336')}>EXTENDED IDENTITY INTERROGATION</span>
              <button type="button" aria-label="Close identity questions" onClick={v.closeQuiz} style={css('margin-left:auto;width:28px;height:28px;flex:none;border:2px solid #2B2336;border-radius:9px;background:#FFF;color:#2B2336;font-size:13px;font-weight:700;cursor:pointer;box-shadow:2px 2px 0 #2B2336')}>✕</button>
            </div>
            <div style={css('padding:16px 18px;display:flex;flex-direction:column;gap:12px')}>
              {v.quizQuestions.map((qq, i) => (
                <div key={i} style={css('border:2.5px solid #2B2336;border-radius:13px;padding:11px 13px;background:#FFF8E7')}>
                  <div style={css("font-family:'Space Grotesk',sans-serif;font-size:13.5px;font-weight:700;margin-bottom:9px")}>{qq.q}</div>
                  <div style={css('display:flex;gap:7px;flex-wrap:wrap')}>
                    {qq.opts.map((o, j) => (
                      <Sx key={j} as="button"
                        style={`padding:6px 13px;border-radius:999px;border:2px solid #2B2336;background:${o.bg};color:#1A1720;font-size:12px;font-weight:700;cursor:pointer;box-shadow:2px 2px 0 #2B2336`}
                        active="transform:translate(1px,1px);box-shadow:0 0 0 #2B2336">{o.label}</Sx>
                    ))}
                  </div>
                </div>
              ))}
              <div style={css('font-size:11.5px;color:#A79FB2;font-weight:600')}>Your answers have been recorded nowhere and weighted at 0%.</div>
              <Sx as="button" onClick={v.startLogin}
                style={`padding:14px;border-radius:14px;border:3px solid #2B2336;background:${v.accent};color:#FFF;font-family:Bangers,cursive;font-size:22px;letter-spacing:1px;cursor:pointer;box-shadow:5px 5px 0 #2B2336`}
                hover="transform:translate(-2px,-3px);box-shadow:7px 8px 0 #2B2336"
                active="transform:translate(2px,2px);box-shadow:1px 1px 0 #2B2336">FINE, VERIFY ME</Sx>
            </div>
          </div>
        </div>
      )}

      {v.apiError && <div role="alert" style={css('max-width:780px;padding:10px 14px;border:2px solid #2B2336;border-radius:10px;background:#FFB3B3;color:#1A1720;font-size:12.5px;font-weight:700')}>{v.apiError}</div>}
      <div style={css('max-width:780px;text-align:center;font-size:11.5px;color:#A79FB2;font-weight:600')}>This creates a private guest session. No email, password, or unnecessary paperwork required.</div>
    </div>
  );
}
