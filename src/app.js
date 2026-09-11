/* Thaï — application (cf. docs/PROJET-THAI.md)
   Ce fichier ne contient QUE de la logique : tout le cours vit dans content/*.json. */

async function loadContent() {
  const [letters, vowels, lots, glyphs, tones, clusters] = await Promise.all(
    ['letters', 'vowels', 'lots', 'glyphs', 'tones', 'clusters'].map(n =>
      fetch('./content/' + n + '.json').then(r => {
        if (!r.ok) throw new Error('content/' + n + '.json introuvable');
        return r.json();
      })));
  letters.forEach(l => l.glyph = glyphs[l.ch]);
  return { letters, vowels, lots, tones, clusters };
}

(async function main() {
/* =======================================================================
   1. CONTENU — chargé depuis content/*.json (aucune logique ici)
   ======================================================================= */
const CONTENT = await loadContent();
const LETTERS = CONTENT.letters, VOWELS = CONTENT.vowels, LOTS = CONTENT.lots, TONES_RULES = CONTENT.tones;
const byChar = Object.fromEntries(LETTERS.map(l => [l.ch, l]));
/* อักษรควบแท้ (§0.14) : les deux lettres se prononcent, la classe reste celle de la 1ère —
   liste fermée sans exception (contrairement à ผล/ทร etc., volontairement absents : ce sont
   des อักษรควบไม่แท้, la 2e lettre y est muette par exception lexicale, pas par règle générale) */
const CLUSTERS = CONTENT.clusters
  .map(c => ({ first: byChar[c.first], second: byChar[c.second] }))
  .filter(c => c.first && c.second);

/* =======================================================================
   2. STOCKAGE  (adaptateur — à remplacer par la base en ligne en phase 2)
   ======================================================================= */
const Storage = {
  KEY: 'thaifr.v2',
  mem: null,
  ok: true,
  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { this.ok = false; return this.mem; }
  },
  save(state) {
    this.mem = state;
    try { localStorage.setItem(this.KEY, JSON.stringify(state)); }
    catch (e) { this.ok = false; }
  }
};

function freshState() {
  return { v: 2, items: {}, settings: { tts: true, goal: 20 },
           day: { date: today(), answers: 0 }, streak: { count: 0, last: null },
           stats: { answers: 0, correct: 0 }, unlockedManually: [] };
}
function today() { return new Date().toISOString().slice(0, 10); }

let state = Storage.load() || freshState();
if (!state.items) state = freshState();
if (state.day.date !== today()) {
  const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  state.streak.count = (state.streak.last === y) ? state.streak.count : 0;
  state.day = { date: today(), answers: 0 };
}
function save() { Storage.save(state); }

/* =======================================================================
   3. MOTEUR — répétition espacée (SM-2 allégé, cf. PROJET-THAI.md §4.3)
   ======================================================================= */
const DAY = 864e5;
const FACETS = ['son', 'lettre', 'classe'];
const NEW_BATCH = 3;   // lettres nouvelles par séance

function itemId(ch, facet) { return 'L:' + ch + ':' + facet; }
function sylId(th) { return 'S:' + th; }
function getItem(id) {
  if (!state.items[id]) state.items[id] = { ef: 2.5, iv: 0, due: 0, reps: 0, lapses: 0 };
  return state.items[id];
}
function grade(id, ok, ms) {
  const it = getItem(id);
  if (!ok) {
    it.lapses++; it.reps = 0; it.ef = Math.max(1.6, it.ef - 0.2); it.iv = 0.007;
  } else {
    it.reps++;
    const slow = ms > 6000;
    if (it.iv === 0) it.iv = 0.007;
    else if (it.iv < 0.01) it.iv = 1;
    else it.iv = Math.min(3650, it.iv * (slow ? 1.4 : it.ef));   // plafond 10 ans : évite une dérive sans fin
    if (!slow) it.ef = Math.min(3.0, it.ef + 0.05);
  }
  it.due = Date.now() + it.iv * DAY;
  state.stats.answers++; if (ok) state.stats.correct++;
  state.day.answers++;
  if (state.streak.last !== today()) { state.streak.count++; state.streak.last = today(); }
  save();
}
function dueIds(now) {
  return Object.keys(state.items).filter(id => state.items[id].due <= now)
              .sort((a, b) => state.items[a].due - state.items[b].due);
}
function letterKnown(ch) { return FACETS.every(f => (state.items[itemId(ch, f)] || {}).reps >= 2); }
function letterSeen(ch)  { return FACETS.some(f => state.items[itemId(ch, f)]); }

function lotUnlocked(n) {
  if (n === 1 || state.unlockedManually.includes(n)) return true;
  const prev = LETTERS.filter(l => l.lot === n - 1);
  const known = prev.filter(l => letterKnown(l.ch)).length;
  return lotUnlocked(n - 1) && known / prev.length >= 0.8;
}
function unlockedLetters() { return LETTERS.filter(l => lotUnlocked(l.lot)); }
function newLetters() { return unlockedLetters().filter(l => !letterSeen(l.ch)); }

/* =======================================================================
   4. AUDIO — synthèse vocale (remplaçable par des enregistrements natifs)
   ======================================================================= */
const Audio2 = {
  voice: null,
  init() {
    if (typeof speechSynthesis === 'undefined') { renderTtsStatus(); return; }   // ex. webview Messenger/Instagram
    const pick = () => {
      const v = speechSynthesis.getVoices().filter(v => (v.lang || '').toLowerCase().startsWith('th'));
      this.voice = v[0] || null;
      renderTtsStatus();
    };
    pick();
    speechSynthesis.onvoiceschanged = pick;
    // Bug Chrome connu : le moteur se fige après ~15 s d'inactivité et ne relit plus rien
    // tant qu'on ne le "réveille" pas — https://bugs.chromium.org/p/chromium/issues/detail?id=679437
    setInterval(() => { speechSynthesis.pause(); speechSynthesis.resume(); }, 5000);
  },
  say(text, rate) {
    if (!state.settings.tts || !this.voice) return false;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'th-TH'; u.voice = this.voice; u.rate = rate || 0.8;
      u.onerror = e => console.error('Audio thaï — la lecture a échoué :', e.error);
      speechSynthesis.speak(u);
      return true;
    } catch (e) { return false; }
  }
};

/* =======================================================================
   5. SYLLABES — génération + calcul du ton
   ======================================================================= */
const TONE_MARK = { moyen: '', haut: '́', bas: '̀', descendant: '̂', montant: '̌' };
const TONES = ['moyen', 'haut', 'bas', 'descendant', 'montant'];
const MARKS = ['่', '้', '๊', '๋'];   // mái èek, mái thoo, mái trii, mái djàttàwaa

/* Annexe B, cf. content/tones.json — jamais de règle de ton codée en dur ici. */
function toneOf(cls, live, length, mark) {
  const r = TONES_RULES.rules[cls];
  if (mark) return r.avecMarque[mark];
  if (live) return r.sansMarque.vivante;
  if (cls === 'basse') return length === 'courte' ? r.sansMarque.morteCourte : r.sansMarque.morteLongue;
  return r.sansMarque.morte;
}
function toneRule(cls, live, length, mark) {
  if (mark) {
    const m = TONES_RULES.marks[mark];
    return 'classe ' + cls + ' + ' + m.name + ' (' + m.romanName + ') → ton <b>' + toneOf(cls, live, length, mark) + '</b>';
  }
  const etat = live ? 'vivante' : (cls === 'basse' ? 'morte, voyelle ' + length : 'morte');
  return 'classe ' + cls + ' + syllabe ' + etat + ', sans marque de ton → ton <b>' + toneOf(cls, live, length, mark) + '</b>';
}
function finalNote(syl) {
  if (!syl.final) return '';
  return ' · finale ' + syl.final.ch + ' (' + syl.final.fin + ') → syllabe ' + (syl.live ? 'vivante' : 'morte');
}
function onsetLabel(syl) {
  if (syl.cluster) return syl.cluster.first.ch + syl.cluster.second.ch + ' (groupe consonantique : ' +
    syl.cluster.first.ch + ' et ' + syl.cluster.second.ch + ' se prononcent toutes les deux, la classe reste celle de ' +
    syl.cluster.first.ch + ')';
  return syl.nam ? syl.nam.ch + syl.letter.ch + ' (' + syl.nam.ch + ' นำ : ' + syl.nam.ch +
    ' muet, fait passer ' + syl.letter.ch + ' en classe haute)' : syl.letter.ch;
}
/* marques possibles pour une classe donnée : la classe moyenne accepte les 4, haute et basse seulement 2 (Annexe B) */
function marksFor(cls) { return cls === 'moyenne' ? MARKS : MARKS.slice(0, 2); }
function pickMark(cls, markPos) {
  if (!markPos) return '';                                // pas de position connue : pas de marque, trop d'exceptions d'écriture
  if (Math.random() < 0.4) return '';                      // la plupart des syllabes n'ont pas de marque
  return pick(marksFor(cls));
}
/* §0.13 — sons finaux couverts : les 6 finales "simples" par concaténation directe.
   -y et -w (glissantes) ne concatènent pas : le son dépend de la voyelle qui précède
   (ex. -าย = "aai", pas "aay") — voir vowels.json champs glideY/glideW, et le tirage
   du pool de finales dans makeSyllable() qui ne propose -y/-w que si la voyelle piochée
   a la combinaison correspondante. */
const FINAL_SOUND = { '-k': 'k', '-ng': 'ng', '-t': 't', '-n': 'n', '-p': 'p', '-m': 'm' };
const LIVE_FINALS = ['-ng', '-n', '-m', '-y', '-w'];   // Annexe B : vivante = voyelle longue ou finale -m/-n/-ng/-w/-y
function writeSyl(onsetCh, vowel, mark, finalLetter) {
  mark = mark || '';
  const closed = !!finalLetter;
  const before = closed ? vowel.closedBefore : vowel.before;
  const after = closed ? vowel.closedAfter : vowel.after;
  const markPos = closed ? vowel.closedMarkPos : vowel.markPos;
  const body = markPos === 'after' ? before + onsetCh + after + mark : before + onsetCh + mark + after;
  return body + (finalLetter ? finalLetter.ch : '');
}
function phonOf(ini, sound, tone, finalSound) {
  const chars = Array.from(sound);
  const head = (ini === '(porteur)' ? '' : ini);
  return head + chars[0] + TONE_MARK[tone] + chars.slice(1).join('') + (finalSound || '');
}
/* -y/-w : la voyelle et la finale fusionnent en une diphtongue toute faite (V.glideY/glideW),
   ce n'est pas une simple concaténation comme pour les 6 finales "simples" */
function soundOf(V, F) {
  if (F && F.fin === '-y' && V.glideY) return { vowelSound: V.glideY, finalSound: '' };
  if (F && F.fin === '-w' && V.glideW) return { vowelSound: V.glideW, finalSound: '' };
  return { vowelSound: V.sound, finalSound: F ? (FINAL_SOUND[F.fin] || '') : '' };
}
/* §0.11 — ห นำ : un ห muet devant une sonante sans pendant en classe haute (ง ญ น ม ย ร ล ว) fait
   passer la syllabe en classe haute, mais c'est la 2e lettre qui porte le son initial (หมา = mǎa). */
function makeSyllable() {
  const pool = unlockedLetters().filter(l => !l.obsolete);
  const namH = pool.find(l => l.ch === 'ห');
  const namPool = namH ? pool.filter(l => l.namable) : [];
  const clusterPool = CLUSTERS.filter(c => pool.includes(c.first) && pool.includes(c.second));
  const roll = Math.random();
  let L, cls, onsetCh, onsetIni, cluster = null, nam = false;
  if (clusterPool.length > 0 && roll < 0.15) {
    cluster = pick(clusterPool);
    L = cluster.first; cls = L.cls;
    onsetCh = cluster.first.ch + cluster.second.ch;
    onsetIni = cluster.first.ini + cluster.second.ini;
  } else if (namPool.length > 0 && roll < 0.35) {
    L = pick(namPool); cls = 'haute'; nam = true;
    onsetCh = namH.ch + L.ch; onsetIni = L.ini;
  } else {
    L = pick(pool); cls = L.cls;
    onsetCh = L.ch; onsetIni = L.ini;
  }
  const V = pick(VOWELS);
  /* -y/-w ne rejoignent le pool que si CETTE voyelle a une forme glissante connue (glideY/glideW) */
  const finalPool = pool.filter(l => FINAL_SOUND[l.fin] ||
    (l.fin === '-y' && V.glideY) || (l.fin === '-w' && V.glideW));
  const closed = V.closable && finalPool.length > 0 && Math.random() < 0.45;
  const F = closed ? pick(finalPool) : null;
  const markPos = closed ? V.closedMarkPos : V.markPos;
  const mark = pickMark(cls, markPos);
  const live = closed ? LIVE_FINALS.includes(F.fin) : V.live;
  const tone = toneOf(cls, live, V.length, mark);
  const { vowelSound, finalSound } = soundOf(V, F);
  const good = phonOf(onsetIni, vowelSound, tone, finalSound);
  const cand = [];
  cand.push(phonOf(onsetIni, vowelSound, pick(TONES.filter(t => t !== tone)), finalSound));      // piège de ton
  const other = pool.filter(x => x.ini !== L.ini);
  if (other.length) cand.push(phonOf(pick(other).ini, vowelSound, tone, finalSound));          // piège de consonne
  cand.push(phonOf(onsetIni, pick(VOWELS.filter(v => v.sound !== V.sound)).sound, tone, finalSound)); // piège de voyelle
  if (F) {
    const otherFinals = finalPool.filter(f => f.fin !== F.fin);
    if (otherFinals.length) {
      const altF = pick(otherFinals);
      const alt = soundOf(V, altF);
      cand.push(phonOf(onsetIni, alt.vowelSound, tone, alt.finalSound));                          // piège de finale
    }
  }
  /* garantit 3 distracteurs uniques même quand les pièges ci-dessus se recoupent ou sont
     indisponibles (petit pool de lettres/voyelles en tout début de progression) */
  let distract = [...new Set(cand)].filter(o => o !== good);
  for (let guard = 0; distract.length < 3 && guard < 50; guard++) {
    cand.push(phonOf(onsetIni, pick(VOWELS).sound, pick(TONES), finalSound));
    distract = [...new Set(cand)].filter(o => o !== good);
  }
  distract = distract.slice(0, 3);
  return { th: writeSyl(onsetCh, V, mark, F), letter: L, cls: cls, nam: nam ? namH : null, cluster: cluster,
           vowel: V, final: F, mark: mark, live: live, tone: tone, good: good,
           options: shuffle([good, ...distract]) };
}
function pick(a) { return a[(Math.random() * a.length) | 0]; }
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; }

/* =======================================================================
   6. RENDU
   ======================================================================= */
function svgLetter(L, o) {
  o = o || {};
  const g = L.glyph;
  const dot = o.dot ? '<circle class="dot-ring pulse" cx="' + g.loop[0] + '" cy="' + g.loop[1] + '" r="0"/>' +
                      '<circle class="dot" cx="' + g.loop[0] + '" cy="' + g.loop[1] + '" r="34"/>' : '';
  return '<svg viewBox="' + g.vb + '" preserveAspectRatio="xMidYMid meet">' +
         '<path d="' + g.d + '" transform="scale(1,-1)" fill="' + (o.ghost ? '#EDE8DE' : '#22262B') + '"/>' +
         dot + '</svg>';
}

/* ---------- accueil ---------- */
function renderAccueil() {
  const due = dueIds(Date.now()).length, nw = newLetters().length;
  document.getElementById('btn-review').textContent =
    due ? 'Réviser (' + due + ')' : (nw ? 'Découvrir ' + Math.min(NEW_BATCH, nw) + ' nouvelles lettres' : 'Rien à réviser — entraînement libre');
  document.getElementById('review-hint').textContent =
    due ? 'Ces éléments sont sur le point d\'être oubliés : c\'est le moment le plus rentable pour les revoir.'
        : (nw ? 'Aucune révision en attente. Tu peux avancer.' : 'Tout est à jour. Reviens demain, ou va lire des syllabes.');
  const g = Math.min(1, state.day.answers / state.settings.goal);
  document.getElementById('goal-bar').style.width = (g * 100) + '%';
  document.getElementById('goal-txt').textContent = state.day.answers + ' / ' + state.settings.goal + ' réponses';
  document.getElementById('streak').innerHTML = 'série <b>' + state.streak.count + '</b> j · ' +
      LETTERS.filter(l => letterKnown(l.ch)).length + '/44 lettres';
  const badge = document.getElementById('due-badge');
  badge.textContent = due; badge.classList.toggle('hide', !due);

  document.getElementById('lots').innerHTML = Object.keys(LOTS).map(n => {
    n = +n;
    const ls = LETTERS.filter(l => l.lot === n);
    const known = ls.filter(l => letterKnown(l.ch)).length;
    const open = lotUnlocked(n);
    return '<div class="lot' + (open ? '' : ' locked') + '">' +
      '<div class="spread"><b class="small">' + LOTS[n].title + '</b>' +
      '<span class="tiny soft">' + known + '/' + ls.length + '</span></div>' +
      '<div class="letters">' + ls.map(l => l.ch).join(' ') + '</div>' +
      '<div class="bar"><i style="width:' + (known / ls.length * 100) + '%"></i></div>' +
      '<div class="tiny soft" style="margin-top:5px">' + LOTS[n].desc +
      (open ? '' : ' <button class="b" style="padding:2px 8px;font-size:11px;margin-left:6px" data-act="unlock:' + n + '">débloquer quand même</button>') +
      '</div></div>';
  }).join('');
}

/* ---------- lettres ---------- */
let curLetter = LETTERS[0].ch;
function renderLettres() {
  const L = byChar[curLetter];
  const open = lotUnlocked(L.lot);
  document.getElementById('letter-detail').innerHTML =
    '<div class="row" style="align-items:flex-start;gap:18px">' +
      '<div class="glyphbox" id="gbox">' + svgLetter(L, { dot: true, ghost: false }) + '<canvas id="trace"></canvas></div>' +
      '<div style="flex:1;min-width:230px">' +
        '<div class="th" style="font-size:23px">' + L.nameTh + '</div>' +
        '<div style="font-weight:650;color:var(--accent)">' + L.namePh + '</div>' +
        '<div class="small soft" style="font-style:italic">« ' + L.fr + ' »</div>' +
        '<div style="margin:10px 0"><span class="badge-cls b-' + L.cls + '">classe ' + L.cls + '</span>' +
          (L.obsolete ? ' <span class="tiny soft">— ne s\'écrit plus aujourd\'hui</span>' : '') + '</div>' +
        '<div class="small"><b style="color:var(--accent)">' + L.ini + '-</b> en début de syllabe' +
        (L.fin === '—' ? ' · ne se place jamais en fin de syllabe'
                       : ' · <b style="color:var(--accent)">' + L.fin + '</b> en fin de syllabe') + '</div>' +
        '<div class="rule small" style="margin-top:10px">' +
          (L.glyph.hasLoop ? 'Départ dans la boucle (le point rouge), puis un seul trait sans lever le crayon.'
                           : 'Cette lettre n\'a pas de boucle : on démarre au point rouge, en haut à gauche.') +
        '</div>' +
        '<div class="row" style="margin-top:12px">' +
          '<button class="b" data-act="say:' + L.ch + '">▶ Écouter</button>' +
          '<button class="b" data-act="clear-trace">Effacer le tracé</button>' +
          '<button class="b" data-act="letter:-1">←</button>' +
          '<button class="b" data-act="letter:1">→</button>' +
        '</div>' +
      '</div>' +
    '</div>' + (open ? '' : '<p class="tiny soft" style="margin-top:12px">Lettre d\'un lot pas encore débloqué — tu peux la regarder, elle ne sera pas mise en révision.</p>');
  setupTrace();
  document.getElementById('letter-grid').innerHTML = Object.keys(LOTS).map(n => {
    n = +n;
    const open = lotUnlocked(n);
    return '<div style="margin-bottom:12px"><div class="tiny soft" style="margin-bottom:5px">' + LOTS[n].title + '</div>' +
      '<div class="grid">' + LETTERS.filter(l => l.lot === n).map(l =>
        '<button class="cell ' + (letterKnown(l.ch) ? 'known' : (letterSeen(l.ch) ? 'seen' : '')) +
        (open ? '' : ' locked') + '" data-act="show:' + l.ch + '">' + l.ch + '</button>').join('') +
      '</div></div>';
  }).join('');
}

/* ---------- tracé ---------- */
let tctx = null, drawing = false;
function setupTrace() {
  const c = document.getElementById('trace'); if (!c) return;
  const r = c.getBoundingClientRect();
  c.width = r.width * 2; c.height = r.height * 2;
  tctx = c.getContext('2d'); tctx.scale(2, 2);
  tctx.lineWidth = 8; tctx.lineCap = 'round'; tctx.lineJoin = 'round';
  tctx.strokeStyle = 'rgba(138,90,43,.85)';
  const pos = e => { const b = c.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
  c.onpointerdown = e => { drawing = true; c.setPointerCapture(e.pointerId); const [x, y] = pos(e); tctx.beginPath(); tctx.moveTo(x, y); };
  c.onpointermove = e => { if (!drawing) return; const [x, y] = pos(e); tctx.lineTo(x, y); tctx.stroke(); };
  c.onpointerup = c.onpointerleave = () => drawing = false;
}
function clearTrace() { const c = document.getElementById('trace'); if (c && tctx) tctx.clearRect(0, 0, c.width, c.height); }

/* ---------- lire ---------- */
let curSyl = null, sylStart = 0, sylLocked = false, toneRulesRendered = false;
function renderToneRules() {
  if (toneRulesRendered) return; toneRulesRendered = true;
  const rows = c => {
    const r = TONES_RULES.rules[c];
    let out = '<tr><td><span class="badge-cls b-' + c + '">' + c + '</span></td><td>vivante, sans marque</td><td><b>' + r.sansMarque.vivante + '</b></td></tr>';
    if (c === 'basse') {
      out += '<tr><td></td><td>morte, voyelle courte, sans marque</td><td><b>' + r.sansMarque.morteCourte + '</b></td></tr>';
      out += '<tr><td></td><td>morte, voyelle longue, sans marque</td><td><b>' + r.sansMarque.morteLongue + '</b></td></tr>';
    } else {
      out += '<tr><td></td><td>morte, sans marque</td><td><b>' + r.sansMarque.morte + '</b></td></tr>';
    }
    for (const m of marksFor(c))
      out += '<tr><td></td><td>' + TONES_RULES.marks[m].name + ' (' + m + ')</td><td><b>' + r.avecMarque[m] + '</b></td></tr>';
    return out;
  };
  document.getElementById('tone-rules').innerHTML =
    '<table>' + ['moyenne', 'haute', 'basse'].map(rows).join('') + '</table>' +
    '<p class="small soft" style="margin-top:10px">Astuce : au départ, seule la classe <b>haute</b> change quelque ' +
    'chose par rapport à la classe basse (sans marque, syllabe vivante). C\'est pour ça qu\'on n\'apprend par cœur ' +
    'que les 20 lettres des classes moyenne et haute — tout le reste est de classe basse.</p>';
}
function renderLire() {
  renderToneRules();
  if (unlockedLetters().filter(l => !l.obsolete).length < 3) {
    document.getElementById('read-card').innerHTML = '<p class="small">Découvre d\'abord quelques lettres.</p>';
    return;
  }
  curSyl = makeSyllable(); sylStart = Date.now(); sylLocked = false;
  document.getElementById('read-card').innerHTML =
    '<div class="q-prompt">Comment lit-on cette syllabe ?</div>' +
    '<div class="q-big">' + curSyl.th + '</div>' +
    '<div class="opts" id="syl-opts">' +
      curSyl.options.map(o => '<button class="opt" data-act="syl:' + o + '">' + o + '</button>').join('') +
    '</div><div class="fb" id="syl-fb"></div>';
}
function answerSyl(choice) {
  if (sylLocked) return; sylLocked = true;
  const ok = choice === curSyl.good;
  document.querySelectorAll('#syl-opts .opt').forEach(b => {
    if (b.textContent === curSyl.good) b.classList.add('good');
    else if (b.textContent === choice) b.classList.add('bad');
  });
  grade(sylId(curSyl.th), ok, Date.now() - sylStart);
  Audio2.say(curSyl.th, 0.7);
  document.getElementById('syl-fb').innerHTML =
    (ok ? '<span class="g">Juste.</span> ' : '<span class="b">Non — c\'est ' + curSyl.good + '.</span> ') +
    '<div class="rule">' + onsetLabel(curSyl) + ' est de ' +
    toneRule(curSyl.cls, curSyl.live, curSyl.vowel.length, curSyl.mark) + finalNote(curSyl) +
    '<br>' + curSyl.vowel.form + ' = ' + curSyl.vowel.sound + ' — ' + curSyl.vowel.note + '</div>' +
    '<div class="row" style="margin-top:10px"><button class="b pri" data-act="nav:lire">Syllabe suivante →</button>' +
    '<button class="b" data-act="sayth:' + curSyl.th + '">▶ Réécouter</button></div>';
  renderStreak();
}

/* ---------- réviser ---------- */
let queue = [], curQ = null, qStart = 0, qLocked = false, sessionDone = 0, sessionOk = 0;
function buildQueue() {
  const due = dueIds(Date.now());
  const q = due.slice(0, 20);
  if (due.length < 40) {
    const fresh = [];
    newLetters().slice(0, NEW_BATCH).forEach(l => FACETS.forEach(f => fresh.push(itemId(l.ch, f))));
    for (const id of fresh) if (q.length < 24) q.push(id);
  }
  if (!q.length) for (let i = 0; i < 8; i++) q.push('NEWSYL');
  return shuffle(q);
}
function startReview() {
  queue = buildQueue(); sessionDone = 0; sessionOk = 0;
  show('reviser'); nextQ();
}
function nextQ() {
  const card = document.getElementById('review-card');
  if (!queue.length) {
    card.innerHTML = '<div class="center" style="padding:20px 6px">' +
      '<div style="font-size:34px">✓</div><h2 style="margin:10px 0 4px">Séance terminée</h2>' +
      '<p class="small soft">' + sessionOk + ' bonnes réponses sur ' + sessionDone + '.</p>' +
      '<div class="row" style="justify-content:center;margin-top:12px">' +
      '<button class="b pri" data-act="start:review">Nouvelle séance</button>' +
      '<button class="b" data-act="nav:accueil">Retour</button></div></div>';
    renderAccueil(); return;
  }
  const id = queue.shift();
  qStart = Date.now(); qLocked = false;
  if (id === 'NEWSYL') { curQ = { kind: 'syl', syl: makeSyllable() }; return renderQSyl(); }
  const [, ch, facet] = id.split(':');
  if (!byChar[ch] || !FACETS.includes(facet)) return nextQ();   // clé corrompue (ex. import invalide) : on passe au suivant plutôt que planter
  curQ = { kind: 'letter', id: id, ch: ch, facet: facet };
  renderQLetter();
}
function progressLine() {
  return '<div class="spread tiny soft" style="margin-bottom:8px"><span>' + (sessionDone + 1) + ' · reste ' +
         queue.length + '</span><span>' + sessionOk + ' justes</span></div>';
}
function iniDisplay(ini) { return ini === '(porteur)' ? '(porteur — aucun son propre)' : ini + '-'; }
function renderQLetter() {
  const L = byChar[curQ.ch], card = document.getElementById('review-card');
  const pool = unlockedLetters().filter(l => l.ch !== L.ch);
  let prompt, subject, opts, good;
  if (curQ.facet === 'son') {
    prompt = 'Quel son fait cette lettre en début de syllabe ?';
    subject = '<div class="q-big">' + L.ch + '</div>';
    good = L.ini;
    opts = uniq([good, ...shuffle(pool).map(l => l.ini)]).slice(0, 4);
    opts = ensure(opts, good);
    card.innerHTML = progressLine() + '<div class="q-prompt">' + prompt + '</div>' + subject +
      '<div class="opts">' + shuffle(opts).map(o => '<button class="opt" data-act="ans:' + o + '">' + iniDisplay(o) + '</button>').join('') + '</div><div class="fb" id="q-fb"></div>';
  } else if (curQ.facet === 'lettre') {
    prompt = 'Quelle lettre se prononce comme ça ?';
    subject = '<div class="q-mid">' + iniDisplay(L.ini) + ' <span class="soft" style="font-size:16px">(' + L.namePh + ')</span></div>';
    good = L.ch;
    opts = ensure(uniq([good, ...shuffle(pool).map(l => l.ch)]).slice(0, 4), good);
    card.innerHTML = progressLine() + '<div class="q-prompt">' + prompt + '</div>' + subject +
      '<div class="opts">' + shuffle(opts).map(o => '<button class="opt thai" data-act="ans:' + o + '">' + o + '</button>').join('') + '</div><div class="fb" id="q-fb"></div>';
  } else {
    prompt = 'À quelle classe de ton appartient cette lettre ?';
    subject = '<div class="q-big">' + L.ch + '</div>';
    good = L.cls;
    opts = ['moyenne', 'haute', 'basse'];
    card.innerHTML = progressLine() + '<div class="q-prompt">' + prompt + '</div>' + subject +
      '<div class="opts">' + opts.map(o => '<button class="opt" data-act="ans:' + o + '">classe ' + o + '</button>').join('') + '</div><div class="fb" id="q-fb"></div>';
  }
  curQ.good = good;
}
function renderQSyl() {
  const s = curQ.syl;
  document.getElementById('review-card').innerHTML = progressLine() +
    '<div class="q-prompt">Comment lit-on cette syllabe ?</div>' +
    '<div class="q-big">' + s.th + '</div>' +
    '<div class="opts">' + s.options.map(o => '<button class="opt" data-act="ans:' + o + '">' + o + '</button>').join('') +
    '</div><div class="fb" id="q-fb"></div>';
  curQ.good = s.good;
}
function uniq(a) { return [...new Set(a)]; }
function ensure(list, good) { return list.includes(good) ? list : [good, ...list.slice(0, 3)]; }

function answerQ(choice) {
  if (qLocked) return; qLocked = true;
  const ok = choice === curQ.good;
  const goodTxt = curQ.good;
  document.querySelectorAll('#review-card .opt').forEach(b => {
    const val = b.dataset.act.slice(4);
    if (val === goodTxt) b.classList.add('good');
    else if (val === choice) b.classList.add('bad');
    b.disabled = true;
  });
  sessionDone++; if (ok) sessionOk++;
  let fb;
  if (curQ.kind === 'letter') {
    const L = byChar[curQ.ch];
    grade(curQ.id, ok, Date.now() - qStart);
    Audio2.say(L.nameTh, 0.75);
    fb = (ok ? '<span class="g">Juste.</span> ' : '<span class="b">Non.</span> ') +
      L.ch + ' = ' + L.nameTh + ' (' + L.namePh + '), « ' + L.fr + ' » · ' + L.ini + '- en début, ' +
      (L.fin === '—' ? 'jamais en finale' : L.fin + ' en fin') + ', classe ' + L.cls + '.';
  } else {
    const s = curQ.syl;
    grade(sylId(s.th), ok, Date.now() - qStart);
    Audio2.say(s.th, 0.7);
    fb = (ok ? '<span class="g">Juste.</span> ' : '<span class="b">Non — c\'est ' + s.good + '.</span> ') +
      '<div class="rule">' + onsetLabel(s) + ' est de ' +
      toneRule(s.cls, s.live, s.vowel.length, s.mark) + finalNote(s) + '</div>';
  }
  document.getElementById('q-fb').innerHTML = fb +
    '<div class="row" style="margin-top:12px"><button class="b pri" data-act="next">Continuer →</button></div>';
  renderStreak();
}

/* ---------- données ---------- */
function renderTtsStatus() {
  const el = document.getElementById('tts-status'); if (!el) return;
  el.innerHTML = Audio2.voice
    ? 'Voix thaïe trouvée : <b>' + Audio2.voice.name + '</b>. L\'audio fonctionne.'
    : '<b style="color:var(--no)">Aucune voix thaïe sur cet appareil.</b> Les exercices marchent quand même, sans son.';
  const t = document.getElementById('tts-toggle'); if (t) t.checked = state.settings.tts;
}
function renderStats() {
  const known = LETTERS.filter(l => letterKnown(l.ch)).length;
  const seen = LETTERS.filter(l => letterSeen(l.ch)).length;
  const acc = state.stats.answers ? Math.round(state.stats.correct / state.stats.answers * 100) : 0;
  const syl = Object.keys(state.items).filter(k => k.startsWith('S:')).length;
  document.getElementById('stats').innerHTML =
    '<table>' +
    '<tr><td>Lettres sues</td><td><b>' + known + '</b> / 44</td></tr>' +
    '<tr><td>Lettres rencontrées</td><td>' + seen + ' / 44</td></tr>' +
    '<tr><td>Syllabes lues</td><td>' + syl + '</td></tr>' +
    '<tr><td>Réponses données</td><td>' + state.stats.answers + ' (' + acc + ' % justes)</td></tr>' +
    '<tr><td>Série</td><td>' + state.streak.count + ' jour(s)</td></tr>' +
    '<tr><td>À réviser maintenant</td><td>' + dueIds(Date.now()).length + '</td></tr>' +
    '</table>';
}
function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'thai-progression-' + today() + '.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
function importData() { document.getElementById('import-file').click(); }

/* =======================================================================
   7. NAVIGATION
   ======================================================================= */
const SCREENS = ['accueil', 'lettres', 'lire', 'reviser', 'donnees'];
function show(name) {
  SCREENS.forEach(s => {
    document.getElementById('s-' + s).classList.toggle('hide', s !== name);
    document.getElementById('t-' + s).classList.toggle('on', s === name);
  });
  if (name === 'accueil') renderAccueil();
  if (name === 'lettres') renderLettres();
  if (name === 'lire') renderLire();
  if (name === 'donnees') { renderTtsStatus(); renderStats(); }
  window.scrollTo(0, 0);
}
function renderStreak() {
  document.getElementById('streak').innerHTML = 'série <b>' + state.streak.count + '</b> j · ' +
    LETTERS.filter(l => letterKnown(l.ch)).length + '/44 lettres';
  const due = dueIds(Date.now()).length, badge = document.getElementById('due-badge');
  badge.textContent = due; badge.classList.toggle('hide', !due);
}

document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const raw = el.dataset.act;
  const i = raw.indexOf(':');
  const act = i < 0 ? raw : raw.slice(0, i), arg = i < 0 ? '' : raw.slice(i + 1);
  switch (act) {
    case 'nav': show(arg); break;
    case 'start': startReview(); break;
    case 'next': nextQ(); break;
    case 'ans': answerQ(arg); break;
    case 'syl': answerSyl(arg); break;
    case 'show': curLetter = arg; renderLettres(); window.scrollTo(0, 0); break;
    case 'letter': {
      const idx = LETTERS.findIndex(l => l.ch === curLetter);
      curLetter = LETTERS[(idx + (+arg) + LETTERS.length) % LETTERS.length].ch;
      renderLettres(); break;
    }
    case 'say': Audio2.say(byChar[arg].nameTh, 0.75); break;
    case 'sayth': Audio2.say(arg, 0.7); break;
    case 'clear-trace': clearTrace(); break;
    case 'unlock': state.unlockedManually.push(+arg); save(); renderAccueil(); break;
    case 'tts': Audio2.say('สวัสดีครับ ผมพูดภาษาไทย', 0.85) || alert('Aucune voix thaïe disponible sur cet appareil.'); break;
    case 'data':
      if (arg === 'export') exportData();
      if (arg === 'import') importData();
      if (arg === 'reset' && confirm('Effacer toute la progression ? Cette action est définitive.')) {
        state = freshState(); save(); show('accueil');
      }
      break;
  }
});
document.getElementById('tts-toggle').addEventListener('change', e => {
  state.settings.tts = e.target.checked; save();
});
document.getElementById('import-file').addEventListener('change', e => {
  const f = e.target.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      const s = JSON.parse(r.result);
      if (!s.items) throw 0;
      state = s; save(); show('accueil');
      alert('Progression importée.');
    } catch (err) { alert('Fichier illisible.'); }
  };
  r.readAsText(f);
});
document.addEventListener('keydown', e => {
  const n = parseInt(e.key, 10);
  if (n >= 1 && n <= 4) {
    const b = document.querySelectorAll('#s-reviser:not(.hide) .opt, #s-lire:not(.hide) .opt')[n - 1];
    if (b) b.click();
  }
  if (e.key === 'Enter') { const b = document.querySelector('#s-reviser:not(.hide) [data-act="next"]'); if (b) b.click(); }
});

/* =======================================================================
   8. DÉMARRAGE
   ======================================================================= */
Audio2.init();
if (!Storage.ok) document.getElementById('storage-warn').classList.remove('hide');
save();
show('accueil');
})().catch(err => {
  const isFile = location.protocol === 'file:';
  document.body.innerHTML = '<div style="font-family:sans-serif;max-width:640px;margin:40px auto;padding:0 20px">' +
    '<h2>Le contenu n\'a pas pu être chargé</h2>' +
    (isFile
      ? '<p>Cette version lit les leçons dans <code>content/*.json</code>, ce que le navigateur refuse ' +
        'quand la page est ouverte par double-clic (protocole <code>file://</code>).</p>' +
        '<p><b>Lance un petit serveur local :</b><br><code>cd thai-fr &amp;&amp; python3 -m http.server 8123</code><br>' +
        'puis ouvre <a href="http://localhost:8123">http://localhost:8123</a></p>'
      : '<p>Essaie de recharger la page. Si ça persiste, ouvre le lien dans le navigateur lui-même ' +
        '(Chrome, Safari…) plutôt que dans l\'aperçu intégré d\'une appli comme Messenger ou Instagram — ' +
        'ces navigateurs intégrés bloquent parfois des fonctions dont l\'app a besoin.</p>') +
    '<p style="color:#888;font-size:13px">Détail : ' + err.message + '</p></div>';
});
