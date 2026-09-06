// All copy, colours and numbers below are transcribed verbatim from the
// "Overthinker AI v2" mockup. Do not edit — the design is the source of truth.

export const agentDefs = [
  { emoji:'🤑', color:'#FFD84D', name:'Financial Analyst', tagline:'Professional penny counter',
    analysis:'The proposed ₹250 expense represents approximately zero meaningful long-term financial impact, although repeated biryani acquisition could theoretically compound into a mid-sized liability by 2041.',
    verdict:'PROBABLY FINE', conf:87, time:'1.9s', sticker:'CERTIFIED OVERTHINKER', badge:'FINANCIALLY IRRESPONSIBLE',
    thinking:'CALCULATING', personality:'Treats every single rupee as a leading economic indicator.',
    drama:58, useful:34, confid:87, knowledge:'Suspiciously specific' },
  { emoji:'🚨', color:'#FF4D4D', name:'Risk Analyst', tagline:'Sees danger everywhere',
    analysis:'Identified 14 downside scenarios including delivery delay, insufficient raita, and the non-trivial probability of falling asleep immediately afterwards. None are fatal. One is inconvenient.',
    verdict:'MILD PANIC', conf:74, time:'2.3s', sticker:'WORST CASE ONLY', badge:'QUESTIONABLE LOGIC',
    thinking:'PANICKING', personality:'Assumes everything could go wrong, because technically it could.',
    drama:88, useful:22, confid:74, knowledge:'Fear-based' },
  { emoji:'😭', color:'#FF4FA3', name:'Emotional Analyst', tagline:'Powered entirely by vibes',
    analysis:'Sentiment analysis of your phrasing indicates you already mentally committed. This was not a question. This was a request for institutional validation. Granted.',
    verdict:'VIBES DETECTED', conf:96, time:'1.4s', sticker:'TRUST ME BRO', badge:'WHY NOT?',
    thinking:'FEELING THINGS', personality:'Reads between lines that were never written.',
    drama:71, useful:64, confid:96, knowledge:'Emotionally accurate' },
  { emoji:'🤓', color:'#4CC9F0', name:'Practicality Analyst', tagline:'Already tired of this',
    analysis:'Six agents have now been provisioned to resolve a question with two possible answers. Practical recommendation: eat. Secondary recommendation: reconsider this platform entirely.',
    verdict:'WHY ARE WE DOING THIS', conf:81, time:'1.1s', sticker:'TOO SERIOUS', badge:'HIGHLY UNNECESSARY',
    thinking:'SIGHING', personality:'The only one making sense. Nobody listens.',
    drama:19, useful:91, confid:81, knowledge:'Actually fine' },
  { emoji:'😈', color:'#8B5CF6', name:'Devil’s Advocate', tagline:'Disagrees recreationally',
    analysis:'While the other five have reached a comfortable consensus, consensus is precisely what a system like this should distrust. I object. I decline to elaborate further.',
    verdict:'ABSOLUTELY NOT', conf:41, time:'3.0s', sticker:'CONTRARIAN', badge:'QUESTIONABLE LOGIC',
    thinking:'DISAGREEING', personality:'Contrarian as a service. Bills hourly.',
    drama:97, useful:8, confid:41, knowledge:'Questionable' },
  { emoji:'⚖️', color:'#B7F34A', name:'Final Judge', tagline:'Pretends to have authority',
    analysis:'Weighing all submissions, including one dissent lodged without justification, the tribunal finds overwhelming support for the proposed action. Motion carried. Costs awarded to hunger.',
    verdict:'ORDER IT', conf:94, time:'2.1s', sticker:'TRUST THE PROCESS', badge:'EXTREMELY IMPORTANT',
    thinking:'DELIBERATING', personality:'Calm, final, and mildly tired of everyone here.',
    drama:44, useful:77, confid:94, knowledge:'Borrowed' }
];

export const loadingMsgs = ['Summoning unnecessary experts…','Consulting the council…','Making this way harder than it needs to be…','Calculating vibes…','Pretending this is important…','Allocating GPU resources irresponsibly…','Generating opinions nobody asked for…','Creating problems from solutions…'];

export const logScript = [
  { t:'09:41:02', msg:'Decision received. Nobody is happy about it.', color:'#E9E2F5' },
  { t:'09:41:03', msg:'🤑 Financial Analyst has entered the chat', color:'#FFD84D' },
  { t:'09:41:04', msg:'₹250 financial exposure detected. Sirens optional.', color:'#FFD84D' },
  { t:'09:41:06', msg:'🚨 Risk Analyst listed 14 ways this ends badly', color:'#FF7A7A' },
  { t:'09:41:07', msg:'😭 Emotional Analyst: “bro already wants the biryani”', color:'#FF9BC8' },
  { t:'09:41:09', msg:'🤓 Practicality Analyst questioned why we exist', color:'#8FDCF7' },
  { t:'09:41:10', msg:'😈 Devil’s Advocate disagreed for no clear reason', color:'#C4A6FF' },
  { t:'09:41:12', msg:'⚖️ Final Judge is weighing six loud opinions', color:'#CFF58E' },
  { t:'09:41:13', msg:'Consensus reached. Confidence 94%. Nutrition: unchanged.', color:'#B7F34A' }
];

export const loginSteps = [
  { label:'Checking vibes', done:'PROBABLY FINE', color:'#FFD84D', emoji:'🌈' },
  { label:'Inspecting confidence levels', done:'SUSPICIOUS', color:'#FF8C42', emoji:'📈' },
  { label:'Verifying suspiciously human behavior', done:'PROBABLY FINE', color:'#4CC9F0', emoji:'🫥' },
  { label:'Consulting authentication experts', done:'WHY NOT', color:'#FF4FA3', emoji:'🧑‍⚖️' },
  { label:'Questioning whether passwords are even real', done:'WHY NOT', color:'#8B5CF6', emoji:'🔑' },
  { label:'Reconsidering the concept of identity', done:'SUSPICIOUS', color:'#FF4D4D', emoji:'🪞' },
  { label:'Granting access anyway', done:'VERIFIED SOMEHOW', color:'#B7F34A', emoji:'✅' }
];

export const loginMsgs = ['Checking if you look familiar…','Cross-referencing absolutely nothing…','Comparing vibes…','Decrypting your personality…','Asking the security team…','The security team is just one confused AI…','Validating your existence…','Searching for credentials we never asked for…','Reconsidering zero-trust architecture…','Trusting you anyway…'];

export const historyRows = [
  { q:'Should I drink coffee?', verdict:'Drink it. Immediately.', level:'SEVERE', agents:'6', conf:'91%', date:'Today' },
  { q:'Should I attend class?', verdict:'UNFORTUNATELY, yes.', level:'EXISTENTIAL', agents:'8', conf:'96%', date:'Yesterday' },
  { q:'Should I buy another keyboard?', verdict:'ABSOLUTELY NOT.', level:'SEVERE', agents:'6', conf:'89%', date:'2 days ago' },
  { q:'Should I reply now or wait 5 minutes?', verdict:'Wait exactly 4 minutes.', level:'EXISTENTIAL', agents:'8', conf:'73%', date:'3 days ago' },
  { q:'Should I start studying?', verdict:'Yes, but you won’t.', level:'NORMAL', agents:'4', conf:'68%', date:'Last week' },
  { q:'Should I text her again?', verdict:'The council refused to answer.', level:'EXISTENTIAL', agents:'8', conf:'52%', date:'Last week' }
];

export const quizQuestionDefs = [
  { q:'Do you remember your own name?', a:['Yes','Mostly'] },
  { q:'Have you ever forgotten why you entered a room?', a:['Constantly','Never (lying)'] },
  { q:'Do you currently feel like yourself?', a:['Yes','Define yourself'] },
  { q:'Are you sure?', a:['Yes','No'] },
  { q:'Really sure?', a:['…yes','I want to leave'] }
];

export const authMetrics = [
  { k:'IDENTITY CONFIDENCE', v:'73%', bg:'#FFD84D' },
  { k:'HUMAN PROBABILITY', v:'92%', bg:'#B7F34A' },
  { k:'BOT PROBABILITY', v:'8%', bg:'#FFF' },
  { k:'VIBE MATCH', v:'Strong', bg:'#FF4FA3' },
  { k:'CREDENTIALS CHECKED', v:'0', bg:'#4CC9F0' },
  { k:'SECURITY LEVEL', v:'Questionable', bg:'#FFF' }
];

export const navDefs = [
  { id:'new', label:'New Decision', emoji:'🧠', chip:'#FFD84D', badge:false },
  { id:'history', label:'Things You Couldn’t Decide', emoji:'📜', chip:'#FF4FA3', badge:'6' },
  { id:'analytics', label:'Questionable Statistics', emoji:'📊', chip:'#4CC9F0', badge:false },
  { id:'lab', label:'Council of Experts', emoji:'⚖️', chip:'#B7F34A', badge:false },
  { id:'settings', label:'Settings (but why)', emoji:'🔧', chip:'#FF8C42', badge:false }
];

export const pageTitles = { new:'NEW DECISION', history:'YOUR REGRETS', analytics:'THE NUMBERS', lab:'THE COUNCIL', settings:'SETTINGS' };

export const catColors = { Food:'#FFD84D', Career:'#4CC9F0', College:'#B7F34A', Relationships:'#FF4FA3', Money:'#FF8C42', Life:'#8B5CF6', Other:'#FFF' };

export const levelDefs = [
  { name:'NORMAL', desc:'Still pretending to be reasonable.', emoji:'🙂', color:'#4CC9F0' },
  { name:'SEVERE', desc:'This could have been a 5-second decision.', emoji:'😵', color:'#FF8C42' },
  { name:'EXISTENTIAL', desc:'You may question reality.', emoji:'🌀', color:'#FF4FA3' }
];

export const levelHints = { NORMAL:'4 experts · ~7s', SEVERE:'6 experts · ~12s', EXISTENTIAL:'8 experts · ~19s' };

export const exampleLabels = ['Should I go to class today?','Should I buy another mechanical keyboard?','Should I reply now or wait 5 minutes?','Should I drink coffee?','Should I start studying?'];
export const exColors = ['#FFD84D','#FF4FA3','#4CC9F0','#B7F34A','#FF8C42'];

export const lvlBg = { NORMAL:'#4CC9F0', SEVERE:'#FF8C42', EXISTENTIAL:'#FF4FA3' };
export const lvlEmoji = { NORMAL:'🙂', SEVERE:'😵', EXISTENTIAL:'🌀' };

export const metricsDone = [
  { label:'EXPERTS BOTHERED', value:'6', note:'Five would have been plenty.', color:'#1A1720', tf:'rotate(-.8deg)' },
  { label:'TIME WE’LL NEVER GET BACK', value:'11.8 sec', note:'Your gut took 0.4s.', color:'#1A1720', tf:'none' },
  { label:'TOKENS SACRIFICED', value:'4,821', note:'Mostly Devil’s Advocate.', color:'#FF4FA3', tf:'rotate(.8deg)' },
  { label:'MONEY BURNED', value:'₹0.37', note:'Biryani not included.', color:'#1A1720', tf:'none' },
  { label:'ACTUAL PROBLEM DIFFICULTY', value:'2 / 100', note:'Statistically trivial.', color:'#8B5CF6', tf:'rotate(-.6deg)' },
  { label:'MENTAL GYMNASTICS SCORE', value:'98 / 100', note:'Personal best. Congrats?', color:'#FF4D4D', tf:'rotate(.6deg)' }
];

export const statCards = [
  { label:'DECISIONS OVERTHOUGHT', value:'147', note:'+12 this week', bg:'#FFF', tf:'rotate(-.7deg)' },
  { label:'AVG EXPERTS BOTHERED', value:'6.4', note:'Consistently excessive', bg:'#FFD84D', tf:'none' },
  { label:'TOKENS SACRIFICED', value:'712k', note:'≈ 3 short novels', bg:'#FFF', tf:'rotate(.7deg)' },
  { label:'TIME SPENT AVOIDING', value:'4h 51m', note:'Deliberation excluded', bg:'#FF8C42', tf:'none' },
  { label:'CONFIDENCE (UNEARNED)', value:'88%', note:'Stable, somehow', bg:'#FFF', tf:'rotate(-.5deg)' }
];

export const weekBars = [
  { d:'MON', n:'4', h:'30%', fill:'#4CC9F0' }, { d:'TUE', n:'6', h:'46%', fill:'#B7F34A' },
  { d:'WED', n:'9', h:'70%', fill:'#FFD84D' }, { d:'THU', n:'5', h:'38%', fill:'#4CC9F0' },
  { d:'FRI', n:'12', h:'94%', fill:'#FF4FA3' }, { d:'SAT', n:'8', h:'62%', fill:'#FF8C42' },
  { d:'SUN', n:'3', h:'22%', fill:'#B7F34A' }
];

export const catBars = [
  { label:'🍛 Food', pct:'38%', fill:'#FFD84D' }, { label:'🎓 College', pct:'24%', fill:'#4CC9F0' },
  { label:'💔 Relationships', pct:'17%', fill:'#FF4FA3' }, { label:'💸 Money', pct:'13%', fill:'#FF8C42' },
  { label:'💼 Career', pct:'8%', fill:'#B7F34A' }
];

export const customFields = [
  { k:'AGENT NAME', v:'Mom', color:'#1A1720' },
  { k:'ROLE', v:'Rejects every unnecessary purchase.', color:'#1A1720' },
  { k:'PERSONALITY', v:'Warm, but fiscally merciless.', color:'#6F687A' },
  { k:'INSTRUCTIONS', v:'Ask if there is food at home before approving anything.', color:'#6F687A' }
];

export const presetAgents = [
  { label:'👩 Mom', bg:'#FFD84D' },
  { label:'🤝 Friend — “bro just do it”', bg:'#B7F34A' },
  { label:'🌙 Sleep-Deprived Me', bg:'#4CC9F0' }
];

export const themeLabels = ['Cream (correct)','Light','Dark (cowardly)'];

export const humorNotes = {
  Professional:'Agents will pretend this is a board matter.',
  Dry:'Agents stay deadpan throughout. Recommended.',
  Unhinged:'Agents may develop opinions about your life.'
};

export const toggleDefs = [
  { k:'stream', label:'Stream agent reasoning live', note:'Watch six professionals slowly reach an obvious conclusion.' },
  { k:'verbose', label:'Verbose group chat', note:'Every internal event, including the pointless ones.' },
  { k:'notify', label:'Notify me when a verdict lands', note:'You will have already acted by then.' },
  { k:'chime', label:'Consensus chime', note:'A small sound of institutional relief.' },
  { k:'autosave', label:'Auto-save every analysis', note:'For future regret and quarterly review.' }
];
