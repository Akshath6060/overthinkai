import { useState, useRef, useEffect, useCallback } from 'react';
import {
  agentDefs, loadingMsgs, loginSteps, loginMsgs,
  quizQuestionDefs, navDefs, pageTitles, catColors, levelDefs, levelHints,
  exampleLabels, exColors, lvlBg, lvlEmoji, humorNotes, toggleDefs
} from './data.js';
import { API_URL, AUTH_EXPIRED_EVENT, ApiError, api } from './api.js';

const DARK = '#2B2336';
const SHADOW = '3px 3px 0 ' + DARK;

const defaultAgentIds = ['agent_finance', 'agent_risk', 'agent_emotion', 'agent_practical', 'agent_devil', 'agent_judge'];

function normalizeAgent(agent, fallback = {}) {
  return {
    ...fallback,
    ...agent,
    drama: agent.dramaScore ?? fallback.drama ?? 50,
    useful: agent.usefulnessScore ?? fallback.useful ?? 50,
    confid: agent.confidenceProfile ?? fallback.confid ?? 70,
    conf: agent.confidenceProfile ?? fallback.conf ?? 70,
    knowledge: agent.knowledgeLabel ?? fallback.knowledge ?? 'User supplied',
    thinking: fallback.thinking || 'OVERTHINKING',
  };
}

export function useOverthinker(props = {}) {
  const accent = props.accent || '#8B5CF6';

  const [authed, setAuthed] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [serviceUnavailable, setServiceUnavailable] = useState(false);
  const [account, setAccount] = useState(null);
  const [loginPhase, setLoginPhase] = useState('idle');
  const [loginStep, setLoginStep] = useState(-1);
  const [loginMsgIdx, setLoginMsgIdx] = useState(0);
  const [quizOpen, setQuizOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const [page, setPage] = useState(props.initialPage || 'new');
  const [phase, setPhase] = useState('input');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState(null);
  const [levelState, setLevelState] = useState(null);

  const [step, setStep] = useState(-1);
  const [logs, setLogs] = useState([]);
  const [logOpen, setLogOpen] = useState(true);
  const [overall, setOverall] = useState(0);
  const [runId, setRunId] = useState(null);
  const [runAgents, setRunAgents] = useState([]);
  const [runProgress, setRunProgress] = useState(0);
  const [finalVerdict, setFinalVerdict] = useState(null);
  const [runUsage, setRunUsage] = useState(null);
  const [runMetrics, setRunMetrics] = useState(null);
  const [apiError, setApiError] = useState('');
  const [msgIdx, setMsgIdx] = useState(0);

  const [hFilter, setHFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [humorState, setHumorState] = useState(null);

  const [historyItems, setHistoryItems] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState('');
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsError, setSettingsError] = useState('');
  const [serverAgents, setServerAgents] = useState([]);
  const [agentPresets, setAgentPresets] = useState([]);
  const [agentsLoading, setAgentsLoading] = useState(false);
  const [agentsError, setAgentsError] = useState('');

  const [order, setOrder] = useState([0, 1, 2, 3, 4, 5]);
  const [disabled, setDisabled] = useState({});
  const [toggles, setToggles] = useState({ stream: true, verbose: true, notify: false, chime: false, autosave: true });

  const timers = useRef([]);
  const msgTimer = useRef(null);
  const countTimer = useRef(null);
  const streamRef = useRef(null);
  const initialRestoreStarted = useRef(false);

  const clearAll = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    clearInterval(msgTimer.current);
    clearInterval(countTimer.current);
    streamRef.current?.close();
    streamRef.current = null;
  }, []);

  useEffect(() => clearAll, [clearAll]);

  const applyAccount = useCallback(payload => {
    setAccount(payload);
    const settings = payload?.settings || {};
    if (settings.defaultSeverity) setLevelState(settings.defaultSeverity);
    if (settings.humorLevel) setHumorState(settings.humorLevel);
    setToggles(current => ({
      ...current,
      stream: settings.streamAgentOutput ?? current.stream,
      verbose: settings.verboseActivityLog ?? current.verbose,
      notify: settings.notifyOnComplete ?? current.notify,
      chime: settings.consensusChime ?? current.chime,
      autosave: settings.autoSave ?? current.autosave,
    }));
  }, []);

  const restoreSession = useCallback(async () => {
    setAuthReady(false);
    setServiceUnavailable(false);
    try {
      const payload = await api('/me');
      applyAccount(payload);
      setAuthed(true);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) setAuthed(false);
      else setServiceUnavailable(true);
    } finally {
      setAuthReady(true);
    }
  }, [applyAccount]);

  useEffect(() => {
    if (initialRestoreStarted.current) return;
    initialRestoreStarted.current = true;
    restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    const expire = () => {
      setAuthed(false);
      setAccount(null);
      setApiError('Your session expired. Please enter again.');
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, expire);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, expire);
  }, []);

  useEffect(() => {
    if (props.routePage && props.routePage !== page) setPage(props.routePage);
  }, [page, props.routePage]);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    setHistoryError('');
    try {
      const payload = await api('/decisions?limit=100');
      setHistoryItems(payload.items || []);
    } catch (error) {
      setHistoryError(error.message);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const loadAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    setAnalyticsError('');
    try {
      setAnalyticsData(await api(`/analytics?timezone=${encodeURIComponent(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC')}`));
    } catch (error) {
      setAnalyticsError(error.message);
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  const loadAgents = useCallback(async () => {
    setAgentsLoading(true);
    setAgentsError('');
    try {
      const [payload, presetsPayload] = await Promise.all([api('/agents'), api('/agent-presets')]);
      const incoming = payload.agents || [];
      setAgentPresets(presetsPayload.presets || []);
      setServerAgents(incoming);
      setOrder(incoming.map((_, index) => index));
      setDisabled(Object.fromEntries(incoming.map((agent, index) => [index, !agent.enabled])));
    } catch (error) {
      setAgentsError(error.message);
    } finally {
      setAgentsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authed && !serverAgents.length) loadAgents();
  }, [authed, loadAgents, serverAgents.length]);

  useEffect(() => {
    if (!authed) return;
    if (page === 'history') loadHistory();
    if (page === 'analytics') loadAnalytics();
  }, [authed, loadAnalytics, loadHistory, page]);

  const level = levelState || props.defaultLevel || 'SEVERE';
  const humor = humorState || props.humorLevel || 'Dry';

  const enterApp = useCallback(async () => {
    clearAll();
    try {
      const payload = await api('/auth/guest', { method: 'POST' });
      applyAccount(payload);
      setAuthed(true);
      setApiError('');
      setLoginPhase('idle');
      setLoginStep(-1);
      setQuizOpen(false);
    } catch (error) {
      setApiError(error.message);
      setLoginPhase('idle');
    }
  }, [applyAccount, clearAll]);

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

  const logout = useCallback(async () => {
    await api('/auth/logout', { method: 'POST' }).catch(() => null);
    clearAll();
    setAuthed(false);
    setLogoutOpen(false);
    setLoginPhase('idle');
    setLoginStep(-1);
    setPhase('input');
    setPage('new');
  }, [clearAll]);

  const begin = useCallback(async () => {
    clearAll();
    const submittedQuestion = q.trim();
    if (submittedQuestion.length < 3) {
      setApiError('Please enter at least three characters. The council needs something to overthink.');
      return;
    }
    setApiError('');
    setPhase('running');
    setStep(0);
    setLogs([]);
    setOverall(0);
    setFinalVerdict(null);
    setRunUsage(null);
    setRunMetrics(null);
    setRunProgress(0);
    const selectedIndexes = order.filter(index => !disabled[index]);
    const sourceAgents = serverAgents.length ? serverAgents.map((agent, index) => normalizeAgent(agent, agentDefs[defaultAgentIds.indexOf(agent.id)] || {})) : agentDefs.map((agent, index) => ({ ...agent, id: defaultAgentIds[index] }));
    const selectedAgentIds = selectedIndexes.map(index => sourceAgents[index].id);
    const initialAgents = selectedIndexes.map((index, position) => ({
      ...sourceAgents[index], position, status: 'queued'
    }));
    setRunAgents(initialAgents);
    setMsgIdx(0);
    msgTimer.current = setInterval(() => setMsgIdx(i => (i + 1) % 8), 2200);
    try {
      const created = await api('/decisions', {
        method: 'POST',
        headers: { 'Idempotency-Key': crypto.randomUUID() },
        body: JSON.stringify({
          question: submittedQuestion,
          category: cat || 'Other',
          severity: level,
          humorLevel: humor,
          providerMode: 'council',
          agentIds: selectedAgentIds,
          autoSave: toggles.autosave,
        }),
      });
      setRunId(created.runId);
      const stream = new EventSource(`${API_URL}${created.eventsUrl}`, { withCredentials: true });
      streamRef.current = stream;
      const listen = (type, handler) => stream.addEventListener(type, event => handler(JSON.parse(event.data)));
      listen('run.started', () => setRunProgress(1));
      listen('run.progress', event => setRunProgress(event.data.progress));
      listen('agent.started', event => {
        setStep(current => current + 1);
        setRunAgents(current => current.map(agent => agent.id === event.data.agentId ? { ...agent, status: 'running' } : agent));
      });
      listen('activity.created', event => setLogs(current => [...current, {
        t: new Date(event.createdAt).toLocaleTimeString([], { hour12: false }), msg: event.data.message, color: '#E9E2F5'
      }]));
      listen('agent.completed', event => {
        const result = event.data;
        setRunAgents(current => current.map(agent => agent.id === result.agentId ? {
          ...agent, status: 'completed', analysis: result.analysis || result.explanation,
          verdict: result.verdict || result.headline, conf: result.confidence,
          time: `${((result.durationMs || 0) / 1000).toFixed(1)}s`
        } : agent));
      });
      listen('agent.failed', event => setRunAgents(current => current.map(agent => agent.id === event.data.agentId ? { ...agent, status: 'failed' } : agent)));
      listen('usage.updated', event => setRunUsage(event.data));
      listen('run.completed', event => {
        clearInterval(msgTimer.current);
        setRunProgress(100);
        setRunUsage(event.data.usage);
        setRunMetrics(event.data.metrics);
        setFinalVerdict(event.data.finalVerdict);
        setOverall(event.data.finalVerdict.confidence);
        setPhase('done');
        stream.close();
      });
      const fail = event => {
        let message = 'The council failed to reach a verdict.';
        try { message = JSON.parse(event.data).data.message || message; } catch (_) {}
        clearInterval(msgTimer.current);
        setApiError(message);
        setPhase('input');
        stream.close();
      };
      stream.addEventListener('run.failed', fail);
      stream.addEventListener('run.cancelled', fail);
      stream.onerror = () => {
        if (!navigator.onLine) setApiError('Connection lost. The council will reconnect when you are online.');
        else api('/me').catch(() => null);
      };
    } catch (error) {
      clearInterval(msgTimer.current);
      setApiError(error.message);
      setPhase('input');
    }
  }, [cat, clearAll, disabled, humor, level, order, q, serverAgents, toggles.autosave]);

  const reset = useCallback(() => {
    clearAll();
    setPhase('input');
    setStep(-1);
    setLogs([]);
    setOverall(0);
    setRunId(null);
    setRunAgents([]);
    setRunProgress(0);
    setFinalVerdict(null);
    setRunUsage(null);
    setRunMetrics(null);
    setApiError('');
  }, [clearAll]);

  const go = id => () => {
    setPage(id);
    props.navigate?.(id);
  };

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
    return { ...l, on, pick: () => { setLevelState(l.name); if (page === 'settings') persistSetting('defaultSeverity', l.name); },
      bg: on ? l.color : '#FFF', sh: on ? '5px 5px 0 ' + DARK : '2px 2px 0 ' + DARK,
      tf: on ? 'rotate(-1deg)' : 'none', fg: DARK, sub: on ? '#2B2336' : '#6F687A' };
  });

  const examples = exampleLabels.map((e, i) => ({
    label: e, pick: () => setQ(e),
    tf: i % 2 ? 'rotate(.7deg)' : 'rotate(-.7deg)', hov: exColors[i]
  }));

  const question = (q || '').trim();

  const uiAgentDefs = serverAgents.length
    ? serverAgents.map(agent => normalizeAgent(agent, agentDefs[defaultAgentIds.indexOf(agent.id)] || {}))
    : agentDefs.map((agent, index) => ({ ...agent, id: defaultAgentIds[index], enabled: !disabled[index] }));
  const activeAgentDefs = runAgents.length ? runAgents : uiAgentDefs.map(agent => ({ ...agent, status: 'queued' }));
  const agents = activeAgentDefs.map((d, i) => {
    const done = d.status === 'completed';
    const thinking = d.status === 'running';
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
    .concat(activeAgentDefs.map(d => ({ emoji: d.emoji, label: d.name.replace(' Analyst', ''), color: d.color, status: d.status })))
    .concat([{ emoji: '🎉', label: 'Verdict', color: '#FFD84D' }]);

  const pipeline = pipeDefs.map((n, i) => {
    const st = i === 0 ? (phase === 'input' ? 'queued' : 'done')
      : i === pipeDefs.length - 1 ? (phase === 'done' ? 'done' : 'queued')
      : n.status === 'completed' ? 'done' : n.status === 'running' ? 'active' : 'queued';
    return { emoji: n.emoji, label: n.label, hasLine: i > 0,
      lineOp: st === 'queued' ? '.25' : '1',
      bg: st === 'queued' ? '#FFF' : n.color,
      sh: st === 'active' ? '4px 4px 0 ' + DARK : st === 'done' ? '2px 2px 0 ' + DARK : 'none',
      op: st === 'queued' ? '.55' : '1',
      tf: st === 'active' ? 'scale(1.06)' : 'none',
      anim: st === 'active' ? 'ot-bob 1.1s ease-in-out infinite' : 'none' };
  });

  const running = phase === 'running', done = phase === 'done';

  const rows = historyItems
    .filter(r => hFilter === 'All' || r.severity === hFilter.toUpperCase())
    .filter(r => r.question.toLowerCase().includes(search.toLowerCase()))
    .map(r => {
      const confidence = Number(r.confidence || 0);
      return { ...r, q: r.question, verdict: r.finalVerdictHeadline || (r.runStatus === 'completed' ? 'Verdict unavailable' : `Analysis ${r.runStatus}`),
        levelUp: r.severity, emoji: lvlEmoji[r.severity], lvlBg: lvlBg[r.severity], agents: r.agentCount,
        conf: `${confidence}%`, date: new Date(r.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' }),
        confColor: confidence > 85 ? '#B7F34A' : confidence > 65 ? '#FFD84D' : '#FF4D4D' };
    });

  const persistSetting = useCallback(async (key, value) => {
    setSettingsSaving(true);
    setSettingsError('');
    try {
      const settings = await api('/settings', { method: 'PATCH', body: JSON.stringify({ [key]: value }) });
      setAccount(current => current ? { ...current, settings } : current);
    } catch (error) {
      setSettingsError(error.message);
    } finally {
      setSettingsSaving(false);
    }
  }, []);

  const saveAgentOrder = nextOrder => api('/agents/order', { method: 'PUT', body: JSON.stringify({ agentIds: nextOrder.map(index => uiAgentDefs[index].id) }) }).catch(error => setAgentsError(error.message));
  const labAgents = order.map((idx, pos) => {
    const d = uiAgentDefs[idx], off = !!disabled[idx];
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
      toggle: () => {
        const next = !off;
        setDisabled(st => ({ ...st, [idx]: next }));
        api(`/agents/${d.id}`, { method: 'PATCH', body: JSON.stringify({ enabled: !next }) }).catch(error => { setDisabled(st => ({ ...st, [idx]: off })); setAgentsError(error.message); });
      },
      up: () => { const o = [...order]; if (pos > 0) { [o[pos - 1], o[pos]] = [o[pos], o[pos - 1]]; setOrder(o); saveAgentOrder(o); } },
      down: () => { const o = [...order]; if (pos < o.length - 1) { [o[pos + 1], o[pos]] = [o[pos], o[pos + 1]]; setOrder(o); saveAgentOrder(o); } } };
  });

  const toggleRows = toggleDefs.map(t => {
    const on = toggles[t.k];
    return { ...t, trackBg: on ? accent : '#FFF8E7', knobPos: on ? 'flex-end' : 'flex-start',
      on, toggle: () => {
        const next = !on;
        setToggles(st => ({ ...st, [t.k]: next }));
        const keys = { stream: 'streamAgentOutput', verbose: 'verboseActivityLog', notify: 'notifyOnComplete', chime: 'consensusChime', autosave: 'autoSave' };
        persistSetting(keys[t.k], next);
      } };
  });

  const humorOpts = ['Professional', 'Dry', 'Unhinged'].map(h => {
    const on = humor === h;
    return { label: h, on, pick: () => { setHumorState(h); persistSetting('humorLevel', h); },
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
  const enabledCount = uiAgentDefs.length - Object.values(disabled).filter(Boolean).length;

  return {
    authed, needsAuth: !authed, authReady, serviceUnavailable, restoreSession, account,
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
    pageMeta: page === 'new' ? (done ? `verdict delivered · ${runAgents.length} experts bothered` : running ? 'overthinking in progress' : 'idle · awaiting something trivial')
      : page === 'history' ? `${account?.historyCount ?? historyItems.length} regrets on file`
      : page === 'analytics' ? 'last 7 days of hesitation'
      : page === 'lab' ? `${uiAgentDefs.length} experts · ${enabledCount} on duty` : 'nothing here will help',
    isNew: page === 'new', isHistory: page === 'history', isAnalytics: page === 'analytics',
    isLab: page === 'lab', isSettings: page === 'settings',
    isInput: page === 'new' && phase === 'input',
    inAnalysis: page === 'new' && phase !== 'input',
    isRunning: running, isDone: done,
    q, onQ: e => setQ(e.target.value),
    cats, levels, levelHint: `${enabledCount} experts · ${{ NORMAL: 'lower', SEVERE: 'standard', EXISTENTIAL: 'larger' }[level]} answer budget`, examples, begin, reset, apiError,
    goNew: go('new'),
    question, runId: runId || 'PENDING', levelUpper: level, catUpper: (cat || 'Other').toUpperCase(),
    expertCount: runAgents.length || enabledCount,
    statusLabel: done ? 'OVERTHINKING COMPLETE' : 'OVERTHINKING IN PROGRESS',
    statusBg: done ? '#B7F34A' : '#FFD84D',
    statusAnim: done ? 'none' : 'ot-blink 1s ease-in-out infinite',
    progressPct: `${done ? 100 : runProgress}%`,
    loadingMsg: loadingMsgs[msgIdx],
    pipeline, visibleAgents,
    logs, logOpen, logChevron: logOpen ? '⌄' : '›',
    toggleLog: () => setLogOpen(o => !o),
    telemetry: [
      { k: 'Experts bothered', v: String(runAgents.length || enabledCount) },
      { k: 'Arguments started', v: String(runMetrics?.argumentCount || Math.max(0, step)) },
      { k: 'Tokens sacrificed', v: (runUsage?.totalTokens || 0).toLocaleString() },
      { k: 'Money burned', v: `₹${((runUsage?.estimatedCostMinor || 0) / 100).toFixed(2)}` },
      { k: 'Necessity score', v: `${runMetrics?.necessityScore ?? 0} / 1` }
    ],
    overall,
    finalHeadline: finalVerdict?.headline || 'THE COUNCIL IS STILL THINKING.',
    finalExplanation: finalVerdict?.explanation || '',
    approveCount: finalVerdict?.approveCount || 0,
    disapproveCount: finalVerdict?.disapproveCount || 0,
    dissentingNames: (finalVerdict?.dissentingAgentIds || []).map(id => activeAgentDefs.find(agent => agent.id === id)?.name || id).join(', ') || 'Nobody filed a formal objection',
    metricsCards: [
      { label: 'EXPERTS BOTHERED', value: String(runAgents.length), note: 'Still more than your gut requested.', color: '#1A1720', tf: 'rotate(-.8deg)' },
      { label: 'TIME WE’LL NEVER GET BACK', value: `${((runUsage?.durationMs || 0) / 1000).toFixed(1)} sec`, note: 'At least the backend kept receipts.', color: '#1A1720', tf: 'none' },
      { label: 'TOKENS SACRIFICED', value: (runUsage?.totalTokens || 0).toLocaleString(), note: 'Real tokens from this run.', color: '#FF4FA3', tf: 'rotate(.8deg)' },
      { label: 'ESTIMATED AI COST', value: `₹${((runUsage?.estimatedCostMinor || 0) / 100).toFixed(2)}`, note: 'Stored in integer minor units.', color: '#1A1720', tf: 'none' },
      { label: 'ACTUAL PROBLEM DIFFICULTY', value: `${runMetrics?.actualDifficulty || 0} / 100`, note: 'A deliberately unserious product metric.', color: '#8B5CF6', tf: 'rotate(-.6deg)' },
      { label: 'MENTAL GYMNASTICS SCORE', value: `${runMetrics?.mentalGymnasticsScore || 0} / 100`, note: 'Not recognized by medical science.', color: '#FF4D4D', tf: 'rotate(.6deg)' }
    ],
    filters: ['All', 'Normal', 'Severe', 'Existential'].map(f => ({
      label: f, pick: () => setHFilter(f),
      bg: hFilter === f ? '#FFD84D' : 'transparent', bd: hFilter === f ? DARK : 'transparent' })),
    search, onSearch: e => setSearch(e.target.value),
    rows, rowCount: rows.length, noRows: rows.length === 0, historyLoading, historyError, retryHistory: loadHistory,
    analyticsData, analyticsLoading, analyticsError, retryAnalytics: loadAnalytics,
    agreeRows: uiAgentDefs.map(d => ({ emoji: d.emoji, color: d.color, name: d.name, pct: d.drama + '%',
      fill: d.drama > 80 ? '#FF4D4D' : d.drama > 50 ? '#FF8C42' : '#B7F34A' })),
    enabledCount,
    labAgents, agentCount: uiAgentDefs.length, agentPresets, agentsLoading, agentsError, retryAgents: loadAgents,
    createAgent: async values => {
      setAgentsError('');
      try { await api('/agents', { method: 'POST', body: JSON.stringify(values) }); await loadAgents(); return true; }
      catch (error) { setAgentsError(error.message); return false; }
    },
    humorOpts, humorNote: humorNotes[humor],
    providers: [
      { name: 'Overthinker Council v4', note: 'Six-agent default. Deliberately slow.', latency: '~12s', inner: accent },
      { name: 'Single Model, One Opinion', note: 'Answers instantly. Defeats the entire purpose.', latency: '~0.8s', inner: 'transparent' },
      { name: 'Bring Your Own Key', note: 'Route the chaos through your own provider.', latency: 'varies', inner: 'transparent' }
    ],
    toggleRows, settingsSaving, settingsError, persistSetting,
    exportData: () => { window.location.assign(`${API_URL}/api/v1/me/export`); },
    deleteHistory: async () => {
      setSettingsSaving(true); setSettingsError('');
      try { await api('/me/decisions', { method: 'DELETE' }); setHistoryItems([]); setAccount(current => current ? { ...current, historyCount: 0 } : current); }
      catch (error) { setSettingsError(error.message); }
      finally { setSettingsSaving(false); }
    }
  };
}
