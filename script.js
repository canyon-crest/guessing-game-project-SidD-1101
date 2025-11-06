let playerName = '';
const dateEl = document.getElementById('date');
const playBtn = document.getElementById('playBtn');
const guessBtn = document.getElementById('guessBtn');
const giveUpBtn = document.getElementById('giveUpBtn');
const nameInput = document.getElementById('nameInput');
const setNameBtn = document.getElementById('setNameBtn');
const hintBtn = document.getElementById('hintBtn');
const guessInput = document.getElementById('guess');
const msg = document.getElementById('msg');
const winsEl = document.getElementById('wins');
const avgScoreEl = document.getElementById('avgScore');
const levelArr = document.getElementsByName('level');
const lb = document.getElementById('leaderboard');
const roundTimeEl = document.getElementById('roundTime');
const fastestEl = document.getElementById('fastest');
const totalTimeEl = document.getElementById('totalTime');
const avgTimeEl = document.getElementById('avgTime');
const streakEl = document.getElementById('streak');
const thermFill = document.getElementById('thermometer-fill');

let scoreArr = [];
let records = [];
let score = 0;
let answer = null;
let level = 3;
let startTime = null;
let roundInterval = null;
let totalTime = 0;
let gamesRecorded = 0;
let fastestTime = null;
let hintsUsed = 0;
const maxHints = 3;
let streak = 0;

function getDaySuffix(d) {
  if (d >= 11 && d <= 13) return 'th';
  switch (d % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}
function formatDateTime() {
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const d = new Date();
  const month = months[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();
  const h = String(d.getHours()).padStart(2,'0');
  const m = String(d.getMinutes()).padStart(2,'0');
  const s = String(d.getSeconds()).padStart(2,'0');
  return `${month} ${day}${getDaySuffix(day)}, ${year} ${h}:${m}:${s}`;
}
function formatMillis(ms) {
  return (ms/1000).toFixed(3) + 's';
}

setInterval(()=> {
  dateEl.textContent = formatDateTime();
}, 1000);

document.addEventListener('keydown', (e)=>{
  if (e.key === 'Enter' && !guessInput.disabled) return makeGuess();
  if ((e.key === 'h' || e.key === 'H') && !hintBtn.disabled) return giveHint();
  if ((e.key === 'g' || e.key === 'G') && !giveUpBtn.disabled) return giveUp();
});

setNameBtn.addEventListener('click', setName);
playBtn.addEventListener('click', play);
guessBtn.addEventListener('click', makeGuess);
giveUpBtn.addEventListener('click', giveUp);
hintBtn.addEventListener('click', giveHint);

function setName() {
  const raw = (nameInput.value || '').trim();
  if (!raw) {
    msg.textContent = 'Please enter a name to continue.';
    nameInput.focus();
    return;
  }
  const normalized = raw.toLowerCase();
  playerName = normalized.charAt(0).toUpperCase() + normalized.slice(1);
  msg.textContent = `${playerName}, your name is set. Click Play to start.`;
  playBtn.disabled = false;
}

function play() {
  playBtn.disabled = true;
  guessBtn.disabled = false;
  guessInput.disabled = false;
  giveUpBtn.disabled = false;
  hintBtn.disabled = false;
  hintsUsed = 0;
  for (let i = 0; i < levelArr.length; i++) {
    levelArr[i].disabled = true;
    if (levelArr[i].checked) level = parseInt(levelArr[i].value);
  }
  answer = Math.floor(Math.random()*level) + 1;
  score = 0;
  thermFill.style.width = '0%';
  startTime = Date.now();
  if (roundInterval) clearInterval(roundInterval);
  roundInterval = setInterval(()=>{
    roundTimeEl.textContent = 'Round Time: ' + formatMillis(Date.now()-startTime);
  },200);
  msg.textContent = `${playerName}, guess a number from 1-${level}`;
  guessInput.placeholder = '';
}

function makeGuess() {
  const userGuess = parseInt(guessInput.value);
  if (isNaN(userGuess) || userGuess < 1 || userGuess > level) {
    msg.textContent = `${playerName}, INVALID: enter a number 1-${level}`;
    return;
  }
  score++;
  const diff = Math.abs(userGuess - answer);
  const pct = diff/level;
  if (diff === 0) {
    const elapsed = Date.now() - startTime;
    endRound(elapsed, false);
    return;
  }
  const heatPct = Math.max(0, 1 - pct);
  thermFill.style.width = Math.min(100, Math.round(heatPct*100)) + '%';
  if (pct <= 0.05) msg.textContent = `${playerName}, Burning! ${userGuess} is extremely close.`;
  else if (pct <= 0.15) msg.textContent = `${playerName}, Very Hot — you're almost there.`;
  else if (pct <= 0.3) msg.textContent = `${playerName}, Hot — close.`;
  else if (pct <= 0.5) msg.textContent = `${playerName}, Warm — getting there.`;
  else if (pct <= 0.75) msg.textContent = `${playerName}, Cool — a bit off.`;
  else if (pct <= 0.9) msg.textContent = `${playerName}, Cold — far.`;
  else msg.textContent = `${playerName}, Freezing — way off.`;
}

function giveUp(){
  if (startTime === null) return;
  const elapsed = Date.now() - startTime;
  score = level;
  msg.textContent = `${playerName}, you gave up. The answer was ${answer}.`;
  endRound(elapsed, true);
}

function endRound(elapsed, gaveUp) {
  if (roundInterval) clearInterval(roundInterval);
  roundTimeEl.textContent = 'Round Time: ' + formatMillis(elapsed);
  totalTime += elapsed;
  gamesRecorded++;
  if (!gaveUp) {
    if (fastestTime === null || elapsed < fastestTime) fastestTime = elapsed;
  }
  updateScoreAndTimes(score, elapsed, gaveUp);
  reset();
}

function reset() {
  guessBtn.disabled = true;
  giveUpBtn.disabled = true;
  hintBtn.disabled = true;
  guessInput.value = '';
  guessInput.disabled = true;
  playBtn.disabled = false;
  for (let i = 0; i < levelArr.length; i++) levelArr[i].disabled = false;
  startTime = null;
}

function giveHint() {
  if (startTime === null) return;
  if (hintsUsed >= maxHints) {
    msg.textContent = `${playerName}, no more hints available.`;
    hintBtn.disabled = true;
    return;
  }
  hintsUsed++;
  score++;
  let hintText = '';
  if (hintsUsed === 1) {
    const span = Math.max(1, Math.ceil(level/4));
    const low = Math.max(1, answer - span);
    const high = Math.min(level, answer + span);
    hintText = `${playerName}, hint: the number is between ${low} and ${high}.`;
  } else if (hintsUsed === 2) {
    const parity = (answer % 2 === 0) ? 'even' : 'odd';
    let divHint = '';
    if (answer % 3 === 0) divHint = ' divisible by 3';
    else if (answer % 5 === 0) divHint = ' divisible by 5';
    hintText = `${playerName}, hint: the number is ${parity}.${divHint}`;
  } else {
    const narrow = Math.max(1, Math.ceil(level/10));
    const low = Math.max(1, answer - narrow);
    const high = Math.min(level, answer + narrow);
    hintText = `${playerName}, final hint: it's between ${low} and ${high}.`;
  }
  msg.textContent = hintText;
  if (hintsUsed >= maxHints) hintBtn.disabled = true;
}

function updateScoreAndTimes(sc, elapsed, gaveUp) {
  const game = {name: playerName, score: sc, time: elapsed, level: level, date: new Date().toISOString(), gaveUp: !!gaveUp};
  if (!gaveUp) scoreArr.push(sc);
  records.push(game);
  saveGameRecord(game);
  winsEl.textContent = `Games won: ${scoreArr.length}`;
  let sum = 0;
  scoreArr.sort((a,b)=>a-b);
  for (let i = 0; i < scoreArr.length; i++) sum += scoreArr[i];
  renderLeaderboard();
  const avg = scoreArr.length ? sum/scoreArr.length : 0;
  avgScoreEl.textContent = `Average Score (wins only): ${avg.toFixed(2)}`;
  fastestEl.textContent = fastestTime === null ? 'Fastest Time: N/A' : `Fastest Time: ${formatMillis(fastestTime)}`;
  totalTimeEl.textContent = `Total Time: ${formatMillis(totalTime)}`;
  avgTimeEl.textContent = `Average Time / game: ${gamesRecorded?formatMillis(totalTime/gamesRecorded):'0.000s'}`;
  const quality = scoreQuality(sc);
  if (!gaveUp && quality === 'good') streak++; else streak = 0;
  streakEl.textContent = `Win Streak: ${streak}`;
  if (gaveUp) msg.textContent += ` Score recorded as ${sc}. That's ${quality}.`;
  else {
    msg.textContent = `${playerName}, Correct! It took ${sc} tries. That's ${quality}.`;
    if (streak >= 3) msg.textContent += ` Nice streak (${streak})!`;
  }
}

function saveGameRecord(game) {
  const saved = JSON.parse(localStorage.getItem('gg_records')||'[]');
  saved.push(game);
  localStorage.setItem('gg_records', JSON.stringify(saved));
}

function loadGameRecords() {
  try {
    return JSON.parse(localStorage.getItem('gg_records')||'[]');
  } catch(e) {
    return [];
  }
}

function renderLeaderboard() {
  const recordsLoaded = loadGameRecords();
  recordsLoaded.sort((a,b)=> a.score - b.score || a.time - b.time);
  lb.innerHTML = '';
  for (let i = 0; i < Math.min(3, recordsLoaded.length); i++) {
    const r = recordsLoaded[i];
    const li = document.createElement('li');
    li.textContent = `${i+1}. ${r.name} — ${r.score} tries — ${formatMillis(r.time)}`;
    lb.appendChild(li);
  }
}

function scoreQuality(sc) {
  if (sc <= Math.ceil(level/4)) return 'good';
  if (sc <= Math.ceil(level/2)) return 'ok';
  return 'bad';
}

document.addEventListener('DOMContentLoaded', ()=>{
  records = loadGameRecords();
  const winsOnly = records.filter(r=>!r.gaveUp).map(r=>r.score);
  scoreArr = winsOnly.slice();
  gamesRecorded = records.length;
  totalTime = records.reduce((s,r)=>s+r.time,0);
  fastestTime = records.filter(r=>!r.gaveUp).reduce((best,r)=> best===null || r.time < best ? r.time : best, null);
  winsEl.textContent = `Games won: ${scoreArr.length}`;
  avgScoreEl.textContent = `Average Score (wins only): ${scoreArr.length ? (scoreArr.reduce((a,b)=>a+b,0)/scoreArr.length).toFixed(2) : '0.00'}`;
  fastestEl.textContent = fastestTime === null ? 'Fastest Time: N/A' : `Fastest Time: ${formatMillis(fastestTime)}`;
  totalTimeEl.textContent = `Total Time: ${formatMillis(totalTime)}`;
  avgTimeEl.textContent = `Average Time / game: ${gamesRecorded?formatMillis(totalTime/gamesRecorded):'0.000s'}`;
  renderLeaderboard();
});
