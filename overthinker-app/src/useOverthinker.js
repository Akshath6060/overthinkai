import { useState, useRef, useEffect, useCallback } from 'react';
import {
  agentDefs, loadingMsgs, logScript, loginSteps, loginMsgs, historyRows,
  quizQuestionDefs, navDefs, pageTitles, catColors, levelDefs, levelHints,
  exampleLabels, exColors, lvlBg, lvlEmoji, humorNotes, toggleDefs
} from './data.js';

const DARK = '#2B2336';
const SHADOW = '3px 3px 0 ' + DARK;

const readAuth = () => {
  try { return localStorage.getItem('ot_auth') === '1'; } catch (e) { return false; }
};

export function useOverthinker(props = {}) {
  const accent = props.accent || '#8B5CF6';

  const [authed, setAuthed] = useState(readAuth);
  const [loginPhase, setLoginPhase] = useState('idle');
  const [loginStep, setLoginStep] = useState(-1);
  const [loginMsgIdx, setLoginMsgIdx] = useState(0);
  const [quizOpen, setQuizOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const [page, setPage] = useState('new');
  const [phase, setPhase] = useState('input');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState(null);
  const [levelState, setLevelState] = useState(null);

  const [step, setStep] = useState(-1);
  const [logs, setLogs] = useState([]);
  const [logOpen, setLogOpen] = useState(true);
  const [overall, setOverall] = useState(0);
  const [msgIdx, setMsgIdx] = useState(0);

  const [hFilter, setHFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [humorState, setHumorState] = useState(null);

  const [order, setOrder] = useState([0, 1, 2, 3, 4, 5]);
  const [disabled, setDisabled] = useState({});
  const [toggles, setToggles] = useState({ stream: true, verbose: true, notify: false, chime: false, autosave: true });

  const timers = useRef([]);
  const msgTimer = useRef(null);
  const countTimer = useRef(null);

  const clearAll = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    clearInterval(msgTimer.current);
    clearInterval(countTimer.current);
  }, []);

  useEffect(() => clearAll, [clearAll]);

  const level = levelState || props.defaultLevel || 'SEVERE';
  const humor = humorState || props.humorLevel || 'Dry';

  const enterApp = useCallback(() => {
    clearAll();
    try { localStorage.setItem('ot_auth', '1'); } catch (e) {}
    setAuthed(true);
    setLoginPhase('idle');
    setLoginStep(-1);
    setQuizOpen(false);
  }, [clearAll]);

  const startLogin = useCallback(() => {
    clearAll();
    setLoginPhase('running');
    setLoginStep(0);
    setLoginMsgIdx(0);
    setQuizOpen(false);
    msgTimer.current = setInterval(() => setLoginMsgIdx(i => (i + 1) % 10), 900);
    const n = loginSteps.length;
    for (let i = 0; i < n; i++) {
      timers.current.push(setTimeout(() => setLoginStep(i + 1), 620 * (i + 1)));
    }
    timers.current.push(setTimeout(() => {
      clearInterval(msgTimer.current);
      setLoginPhase('granted');
      timers.current.push(setTimeout(enterApp, 2600));
    }, 620 * n + 500));
  }, [clearAll, enterApp]);

  const logout = useCallback(() => {
    try { localStorage.setItem('ot_auth', '0'); } catch (e) {}
    clearAll();
    setAuthed(false);
    setLogoutOpen(false);
    setLoginPhase('idle');
    setLoginStep(-1);
    setPhase('input');
    setPage('new');
  }, [clearAll]);

  const begin = useCallback(() => {
    clearAll();
    setPhase('running');
    setStep(0);
    setLogs(logScript.slice(0, 2));
    setOverall(0);
    setMsgIdx(0);
    msgTimer.current = setInterval(() => setMsgIdx(i => (i + 1) % 8), 2200);
    for (let i = 0; i < 6; i++) {
      timers.current.push(setTimeout(() => {
        setStep(i + 1);
        setLogs(logScript.slice(0, Math.min(logScript.length, 3 + i)));
      }, 1400 * (i + 1)));
    }
    timers.current.push(setTimeout(() => {
      clearInterval(msgTimer.current);
      setPhase('done');
      setStep(6);
      setLogs(logScript);
      let v = 0;
      countTimer.current = setInterval(() => {
        v += 3;
        if (v >= 94) { v = 94; clearInterval(countTimer.current); }
        setOverall(v);
      }, 24);
    }, 1400 * 6 + 700));
  }, [clearAll]);

  const reset = useCallback(() => {
    clearAll();
    setPhase('input');
    setStep(-1);
    setLogs([]);
    setOverall(0);
  }, [clearAll]);

  const go = id => () => setPage(id);

  // ---- derived view values (the mockup's renderVals) ----

  const nav = navDefs.map(n => {
    const on = page === n.id;
    return { ...n, go: go(n.id), bg: on ? n.chip : '#FFF', bd: on ? DARK : 'transparent',
      sh: on ? SHADOW : 'none', mbg: on ? n.chip : '#FFF' };
  });

  const cats = Object.keys(catColors).map(c => {
    const on = cat === c;
    return { label: c, pick: () => setCat(on ? null : c),
      bg: on ? catColors[c] : '#FFF', sh: on ? SHADOW : 'none' };
  });

  const levels = levelDefs.map(l => {
    const on = level === l.name;
    return { ...l, on, pick: () => setLevelState(l.name),
      bg: on ? l.color : '#FFF', sh: on ? '5px 5px 0 ' + DARK : '2px 2px 0 ' + DARK,
      tf: on ? 'rotate(-1deg)' : 'none', fg: DARK, sub: on ? '#2B2336' : '#6F687A' };
  });

  const examples = exampleLabels.map((e, i) => ({
    label: e, pick: () => setQ(e),
    tf: i % 2 ? 'rotate(.7deg)' : 'rotate(-.7deg)', hov: exColors[i]
  }));

  const question = (q || '').trim() || 'Should I order biryani?';

  const agents = agentDefs.map((d, i) => {
    const done = step > i || phase === 'done';
    const thinking = step === i && phase === 'running';
    return { ...d, done, pending: thinking,
      statusLabel: done ? 'DONE FOR SOME REASON' : thinking ? d.thinking : 'WAITING',
      stBg: done ? '#B7F34A' : thinking ? d.color : '#FFF8E7',
      stAnim: thinking ? 'ot-blink 1s ease-in-out infinite' : 'none',
      cardAnim: (thinking && d.name.indexOf('Devil') === 0) ? 'ot-shake .5s ease-in-out 2, ot-pop .3s ease both'
        : 'ot-pop .34s cubic-bezier(.2,.9,.3,1.1) both',
      tf: i % 3 === 1 ? 'rotate(-.5deg)' : i % 3 === 2 ? 'rotate(.5deg)' : 'none',
      stickerRot: i % 2 ? '3deg' : '-3deg',
      vBg: d.color, confPct: d.conf + '%' };
  });
  const visibleAgents = agents.filter(a => a.done || a.pending);

  const pipeDefs = [{ emoji: '❓', label: 'Your Problem', color: '#FFF' }]
    .concat(agentDefs.map(d => ({ emoji: d.emoji, label: d.name.replace(' Analyst', ''), color: d.color })))
    .concat([{ emoji: '🎉', label: 'Verdict', color: '#FFD84D' }]);

  const pipeline = pipeDefs.map((n, i) => {
    const st = i === 0 ? (phase === 'input' ? 'queued' : 'done')
      : i === 7 ? (phase === 'done' ? 'done' : 'queued')
      : (step > i - 1 || phase === 'done') ? 'done' : (step === i - 1 && phase === 'running') ? 'active' : 'queued';
    return { emoji: n.emoji, label: n.label, hasLine: i > 0,
      lineOp: st === 'queued' ? '.25' : '1',
      bg: st === 'queued' ? '#FFF' : n.color,
      sh: st === 'active' ? '4px 4px 0 ' + DARK : st === 'done' ? '2px 2px 0 ' + DARK : 'none',
      op: st === 'queued' ? '.55' : '1',
      tf: st === 'active' ? 'scale(1.06)' : 'none',
      anim: st === 'active' ? 'ot-bob 1.1s ease-in-out infinite' : 'none' };
  });

  const running = phase === 'running', done = phase === 'done';

  const rows = historyRows
    .filter(r => hFilter === 'All' || r.level === hFilter.toUpperCase())
    .filter(r => r.q.toLowerCase().includes(search.toLowerCase()))
    .map(r => ({ ...r, levelUp: r.level, emoji: lvlEmoji[r.level], lvlBg: lvlBg[r.level],
      confColor: parseInt(r.conf) > 85 ? '#B7F34A' : parseInt(r.conf) > 65 ? '#FFD84D' : '#FF4D4D' }));

  const labAgents = order.map((idx, pos) => {
    const d = agentDefs[idx], off = !!disabled[idx];
    return { ...d, key: idx, opacity: off ? .55 : 1,
      tf: pos % 3 === 1 ? 'rotate(-.6deg)' : pos % 3 === 2 ? 'rotate(.6deg)' : 'none',
      stats: [
        { k: 'DRAMA', v: d.drama + '%', w: d.drama + '%', fill: '#FF4FA3' },
        { k: 'USEFULNESS', v: d.useful + '%', w: d.useful + '%', fill: '#B7F34A' },
        { k: 'CONFIDENCE', v: d.confid + '%', w: d.confid + '%', fill: '#4CC9F0' }
      ],
      toggleLabel: off ? 'BENCHED' : 'ON DUTY',
      trackBg: off ? '#FFF8E7' : '#B7F34A',
      knobPos: off ? 'flex-start' : 'flex-end',
      toggle: () => setDisabled(st => ({ ...st, [idx]: !st[idx] })),
      up: () => setOrder(st => { const o = [...st]; if (pos > 0) { [o[pos - 1], o[pos]] = [o[pos], o[pos - 1]]; } return o; }),
      down: () => setOrder(st => { const o = [...st]; if (pos < o.length - 1) { [o[pos + 1], o[pos]] = [o[pos], o[pos + 1]]; } return o; }) };
  });

  const toggleRows = toggleDefs.map(t => {
    const on = toggles[t.k];
    return { ...t, trackBg: on ? accent : '#FFF8E7', knobPos: on ? 'flex-end' : 'flex-start',
      toggle: () => setToggles(st => ({ ...st, [t.k]: !st[t.k] })) };
  });

  const humorOpts = ['Professional', 'Dry', 'Unhinged'].map(h => {
    const on = humor === h;
    return { label: h, pick: () => setHumorState(h),
      bg: on ? '#FFD84D' : 'transparent', bd: on ? DARK : 'transparent' };
  });

  const loginRows = loginSteps.map((st, i) => {
    const fin = loginStep > i, act = loginStep === i && loginPhase === 'running';
    return { label: st.label, emoji: st.emoji, num: '0' + (i + 1),
      status: fin ? st.done : act ? 'THINKING' : 'QUEUED',
      bg: fin ? st.color : act ? '#FFF8E7' : '#FFF',
      chipBg: fin ? '#FFF' : act ? st.color : '#FFF8E7',
      sh: fin ? '3px 3px 0 ' + DARK : act ? '4px 4px 0 ' + DARK : 'none',
      op: (fin || act) ? '1' : '.5',
      anim: act ? 'ot-bob 1s ease-in-out infinite' : fin ? 'ot-pop .3s ease both' : 'none',
      dotAnim: act ? 'ot-blink .9s ease-in-out infinite' : 'none' };
  });

  return {
    authed, needsAuth: !authed,
    loginIdle: loginPhase === 'idle', loginRunning: loginPhase === 'running',
    loginGranted: loginPhase === 'granted', loginNotGranted: loginPhase !== 'granted',
    loginRows, loginMsg: loginMsgs[loginMsgIdx],
    startLogin, enterApp,
    quizOpen,
    openQuiz: () => setQuizOpen(true),
    closeQuiz: () => setQuizOpen(false),
    quizQuestions: quizQuestionDefs.map(x => ({ ...x, opts: x.a.map((label, i) => ({ label, bg: i ? '#FFF' : '#FFD84D' })) })),
    logoutOpen,
    askLogout: () => setLogoutOpen(true),
    cancelLogout: () => setLogoutOpen(false),
    doLogout: logout,
    accent,
    nav, pageTitle: pageTitles[page],
    pageMeta: page === 'new' ? (done ? 'verdict delivered · 6 experts bothered' : running ? 'overthinking in progress' : 'idle · awaiting something trivial')
      : page === 'history' ? '6 regrets on file'
      : page === 'analytics' ? 'last 7 days of hesitation'
      : page === 'lab' ? '6 experts · 1 weird draft' : 'nothing here will help',
    isNew: page === 'new', isHistory: page === 'history', isAnalytics: page === 'analytics',
    isLab: page === 'lab', isSettings: page === 'settings',
    isInput: page === 'new' && phase === 'input',
    inAnalysis: page === 'new' && phase !== 'input',
    isRunning: running, isDone: done,
    q, onQ: e => setQ(e.target.value),
    cats, levels, levelHint: levelHints[level], examples, begin, reset,
    goNew: go('new'),
    question, runId: 'RUN-8F42C', levelUpper: level, catUpper: (cat || 'UNCLASSIFIED').toUpperCase(),
    statusLabel: done ? 'OVERTHINKING COMPLETE' : 'OVERTHINKING IN PROGRESS',
    statusBg: done ? '#B7F34A' : '#FFD84D',
    statusAnim: done ? 'none' : 'ot-blink 1s ease-in-out infinite',
    progressPct: done ? '100%' : Math.round(Math.max(0, step) / 6 * 100) + '%',
    loadingMsg: loadingMsgs[msgIdx],
    pipeline, visibleAgents,
    logs, logOpen, logChevron: logOpen ? '⌄' : '›',
    toggleLog: () => setLogOpen(o => !o),
    telemetry: [
      { k: 'Experts bothered', v: '6' },
      { k: 'Arguments started', v: done ? '18' : String(Math.max(0, step) * 3) },
      { k: 'Tokens sacrificed', v: done ? '4,821' : (Math.max(0, step) * 780).toLocaleString() },
      { k: 'Money burned', v: done ? '₹0.37' : '₹0.0' + Math.max(0, step) },
      { k: 'Necessity score', v: '0.4 / 10' }
    ],
    overall,
    filters: ['All', 'Normal', 'Severe', 'Existential'].map(f => ({
      label: f, pick: () => setHFilter(f),
      bg: hFilter === f ? '#FFD84D' : 'transparent', bd: hFilter === f ? DARK : 'transparent' })),
    search, onSearch: e => setSearch(e.target.value),
    rows, rowCount: rows.length, noRows: rows.length === 0,
    agreeRows: agentDefs.map(d => ({ emoji: d.emoji, color: d.color, name: d.name, pct: d.drama + '%',
      fill: d.drama > 80 ? '#FF4D4D' : d.drama > 50 ? '#FF8C42' : '#B7F34A' })),
    enabledCount: 6 - Object.values(disabled).filter(Boolean).length,
    labAgents,
    humorOpts, humorNote: humorNotes[humor],
    providers: [
      { name: 'Overthinker Council v4', note: 'Six-agent default. Deliberately slow.', latency: '~12s', inner: accent },
      { name: 'Single Model, One Opinion', note: 'Answers instantly. Defeats the entire purpose.', latency: '~0.8s', inner: 'transparent' },
      { name: 'Bring Your Own Key', note: 'Route the chaos through your own provider.', latency: 'varies', inner: 'transparent' }
    ],
    toggleRows
  };
}
