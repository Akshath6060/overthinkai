import React from 'react';
import { css, Sx } from '../lib/sx.jsx';

const COLORS = ['#FFD84D', '#4CC9F0', '#FF4FA3', '#FF8C42', '#B7F34A', '#8B5CF6'];

function formatDuration(ms = 0) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.round((ms % 60000) / 1000);
  return minutes ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

export default function Analytics(v) {
  if (v.analyticsLoading) return <div className="panel-state" role="status">🌀 Crunching numbers nobody asked for…</div>;
  if (v.analyticsError) return <div className="panel-state" role="alert"><strong>THE NUMBERS REFUSED TO COOPERATE.</strong><span>{v.analyticsError}</span><Sx as="button" onClick={v.retryAnalytics} style="padding:10px 16px;border:3px solid #2B2336;border-radius:12px;background:#FFD84D;box-shadow:3px 3px 0 #2B2336;font-weight:800;cursor:pointer">TRY AGAIN</Sx></div>;

  const data = v.analyticsData;
  const summary = data?.summary || {};
  if (!summary.decisionCount) {
    return <div className="panel-state"><span aria-hidden="true" style={{ fontSize: 42 }}>📊</span><h1>NOT ENOUGH DATA TO OVERANALYSE.</h1><p>Make a few decisions first and we’ll find patterns to overanalyse.</p><Sx as="button" onClick={v.goNew} style={`padding:12px 20px;border:3px solid #2B2336;border-radius:13px;background:${v.accent};color:#FFF;box-shadow:4px 4px 0 #2B2336;font-family:Bangers,cursive;font-size:19px;cursor:pointer`}>START OVERTHINKING</Sx></div>;
  }

  const cards = [
    ['DECISIONS OVERTHOUGHT', summary.decisionCount, `${summary.decisionCountDelta >= 0 ? '+' : ''}${summary.decisionCountDelta} vs previous period`],
    ['AVG EXPERTS BOTHERED', summary.averageAgentCount, 'Consistently excessive'],
    ['TOKENS SACRIFICED', Number(summary.totalTokens || 0).toLocaleString(), 'Real provider usage'],
    ['TIME SPENT THINKING', formatDuration(summary.totalDurationMs), 'Backend execution time'],
    ['CONFIDENCE (UNEARNED)', `${summary.averageConfidence || 0}%`, 'A mathematically confident shrug'],
  ];
  const maxDaily = Math.max(1, ...(data.daily || []).map(day => day.count));

  return (
    <div style={css('max-width:1240px;margin:0 auto;display:flex;flex-direction:column;gap:16px')}>
      <header>
        <h1 style={css('margin:0;font-family:Bangers,cursive;font-size:clamp(30px,5vw,52px);letter-spacing:1px;line-height:1;color:#2B2336')}>YOUR QUESTIONABLE DECISION-MAKING STATISTICS</h1>
        <p style={css('margin:10px 0 0;font-size:13.5px;color:#6F687A;font-weight:600')}>Numbers nobody asked for, presented with total confidence.</p>
      </header>

      <section aria-labelledby="analytics-summary" style={css('background:#B7F34A;border:4px solid #2B2336;border-radius:22px;padding:clamp(20px,3vw,30px);box-shadow:8px 8px 0 #2B2336')}>
        <span style={css('display:inline-block;font:700 10px Inter,sans-serif;letter-spacing:.14em;padding:3px 10px;border:2px solid #2B2336;border-radius:999px;background:#FFF;margin-bottom:12px')}>MATH, UNFORTUNATELY</span>
        <h2 id="analytics-summary" style={css('margin:0;font-family:Bangers,cursive;font-size:clamp(22px,3.6vw,36px);letter-spacing:.8px;line-height:1.06;color:#2B2336')}>YOU OVERTHOUGHT {summary.decisionCount} {summary.decisionCount === 1 ? 'DECISION' : 'DECISIONS'} AND BOTHERED {summary.averageAgentCount} EXPERTS ON AVERAGE.</h2>
      </section>

      <section aria-label="Analytics summary" style={css('display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:12px')}>
        {cards.map(([label, value, note], i) => <article key={label} style={css(`background:${i === 1 ? '#FFD84D' : i === 3 ? '#FF8C42' : '#FFF'};border:3px solid #2B2336;border-radius:16px;padding:15px 16px;box-shadow:4px 4px 0 #2B2336`)}><div style={css('font:700 9.5px Inter,sans-serif;letter-spacing:.1em;color:#3A3244;margin-bottom:10px')}>{label}</div><div style={css("font-family:'Space Grotesk',sans-serif;font-size:27px;font-weight:700;letter-spacing:-1px")}>{value}</div><div style={css('font-size:11px;color:#3A3244;margin-top:5px;font-weight:600')}>{note}</div></article>)}
      </section>

      <div style={css('display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,330px),1fr));gap:16px')}>
        <section aria-labelledby="daily-heading" style={css('background:#FFF;border:3px solid #2B2336;border-radius:18px;padding:18px;box-shadow:5px 5px 0 #2B2336')}>
          <h2 id="daily-heading" style={css('font-family:Bangers,cursive;font-size:19px;letter-spacing:.7px;margin:0 0 18px')}>DAILY HESITATION</h2>
          <div style={css('height:190px;display:flex;align-items:flex-end;gap:8px')}>
            {(data.daily || []).map((day, i) => <div key={day.date} style={css('flex:1;min-width:0;text-align:center')}><div style={css(`height:${Math.max(5, day.count / maxDaily * 150)}px;background:${COLORS[i % COLORS.length]};border:2px solid #2B2336;border-radius:7px 7px 2px 2px`)} title={`${day.count} decisions`}></div><div style={css('font-size:9px;font-weight:800;margin-top:6px')}>{new Date(`${day.date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase()}</div><div style={css('font-size:11px;font-weight:700')}>{day.count}</div></div>)}
          </div>
        </section>

        <section aria-labelledby="categories-heading" style={css('background:#FFF;border:3px solid #2B2336;border-radius:18px;padding:18px;box-shadow:5px 5px 0 #2B2336')}>
          <h2 id="categories-heading" style={css('font-family:Bangers,cursive;font-size:19px;letter-spacing:.7px;margin:0 0 18px')}>WHAT YOU OVERTHINK</h2>
          <div style={css('display:flex;flex-direction:column;gap:14px')}>
            {(data.categories || []).map((category, i) => <div key={category.category}><div style={css('display:flex;justify-content:space-between;font-size:12px;font-weight:700;margin-bottom:5px')}><span>{category.category}</span><span>{category.percentage}%</span></div><div style={css('height:12px;border:2px solid #2B2336;border-radius:999px;background:#FFF8E7;overflow:hidden')}><div style={css(`height:100%;width:${category.percentage}%;background:${COLORS[i % COLORS.length]}`)}></div></div></div>)}
          </div>
        </section>

        <section aria-labelledby="difficulty-heading" style={css('background:#4CC9F0;border:3px solid #2B2336;border-radius:18px;padding:18px;box-shadow:5px 5px 0 #2B2336')}>
          <h2 id="difficulty-heading" style={css('font-family:Bangers,cursive;font-size:19px;letter-spacing:.7px;margin:0')}>ACTUAL PROBLEM DIFFICULTY</h2>
          <div style={css('display:flex;align-items:baseline;gap:7px;margin-top:18px')}><span style={css('font-family:Bangers,cursive;font-size:clamp(46px,8vw,74px);line-height:.9')}>{summary.averageDifficulty || 0}</span><span style={css('font-family:Bangers,cursive;font-size:22px')}>/ 100</span></div>
          <div style={css('margin-top:16px;height:14px;border:3px solid #2B2336;border-radius:999px;background:#FFF;overflow:hidden')}><div style={css(`height:100%;width:${summary.averageDifficulty || 0}%;min-width:8px;background:#FF4D4D`)}></div></div>
        </section>
      </div>
    </div>
  );
}
