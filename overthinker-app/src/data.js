// Static visual definitions and interface copy retained from the approved mockup.
// User-specific results, history, analytics, settings, and agents come from the API.

export const agentDefs = [
  { emoji:'🤑', color:'#FFD84D', name:'Financial Analyst', tagline:'Professional penny counter',
    conf:87, sticker:'CERTIFIED OVERTHINKER', badge:'FINANCIALLY IRRESPONSIBLE',
    thinking:'CALCULATING', personality:'Treats every single rupee as a leading economic indicator.',
    drama:58, useful:34, confid:87, knowledge:'Suspiciously specific' },
  { emoji:'🚨', color:'#FF4D4D', name:'Risk Analyst', tagline:'Sees danger everywhere',
    conf:74, sticker:'WORST CASE ONLY', badge:'QUESTIONABLE LOGIC',
    thinking:'PANICKING', personality:'Assumes everything could go wrong, because technically it could.',
    drama:88, useful:22, confid:74, knowledge:'Fear-based' },
  { emoji:'😭', color:'#FF4FA3', name:'Emotional Analyst', tagline:'Powered entirely by vibes',
    conf:96, sticker:'TRUST ME BRO', badge:'WHY NOT?',
    thinking:'FEELING THINGS', personality:'Reads between lines that were never written.',
    drama:71, useful:64, confid:96, knowledge:'Emotionally accurate' },
  { emoji:'🤓', color:'#4CC9F0', name:'Practicality Analyst', tagline:'Already tired of this',
    conf:81, sticker:'TOO SERIOUS', badge:'HIGHLY UNNECESSARY',
    thinking:'SIGHING', personality:'The only one making sense. Nobody listens.',
    drama:19, useful:91, confid:81, knowledge:'Actually fine' },
  { emoji:'😈', color:'#8B5CF6', name:'Devil’s Advocate', tagline:'Disagrees recreationally',
    conf:41, sticker:'CONTRARIAN', badge:'QUESTIONABLE LOGIC',
    thinking:'DISAGREEING', personality:'Contrarian as a service. Bills hourly.',
    drama:97, useful:8, confid:41, knowledge:'Questionable' },
  { emoji:'⚖️', color:'#B7F34A', name:'Final Judge', tagline:'Pretends to have authority',
    conf:94, sticker:'TRUST THE PROCESS', badge:'EXTREMELY IMPORTANT',
    thinking:'DELIBERATING', personality:'Calm, final, and mildly tired of everyone here.',
    drama:44, useful:77, confid:94, knowledge:'Borrowed' }
];

export const loadingMsgs = ['Summoning unnecessary experts…','Consulting the council…','Making this way harder than it needs to be…','Calculating vibes…','Pretending this is important…','Allocating GPU resources irresponsibly…','Generating opinions nobody asked for…','Creating problems from solutions…'];

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

export const exampleLabels = ['Should I go to class today?','Should I buy another mechanical keyboard?','Should I reply now or wait 5 minutes?','Should I drink coffee?','Should I start studying?'];
export const exColors = ['#FFD84D','#FF4FA3','#4CC9F0','#B7F34A','#FF8C42'];

export const lvlBg = { NORMAL:'#4CC9F0', SEVERE:'#FF8C42', EXISTENTIAL:'#FF4FA3' };
export const lvlEmoji = { NORMAL:'🙂', SEVERE:'😵', EXISTENTIAL:'🌀' };

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
