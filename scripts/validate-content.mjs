#!/usr/bin/env node
/* Vérifie la cohérence de content/*.json — à lancer après toute modification du contenu.
   node scripts/validate-content.mjs                                                     */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = n => JSON.parse(readFileSync(join(ROOT, 'content', n + '.json'), 'utf8'));

const erreurs = [], alertes = [];
const err = m => erreurs.push(m);
const warn = m => alertes.push(m);

const letters  = read('letters');
const vowels   = read('vowels');
const lots     = read('lots');
const glyphs   = read('glyphs');
const tones    = read('tones');
const clusters = read('clusters');

const CLASSES = ['moyenne', 'haute', 'basse'];
const FINALES = ['-k', '-ng', '-t', '-n', '-p', '-m', '-y', '-w', '—'];
const TONES_ATTENDUS = ['moyen', 'haut', 'bas', 'descendant', 'montant'];
const SANS_BOUCLE = ['ก', 'ธ'];   // lettres qui n'ont pas de หัว : normal
const ROMAN_OK = /^[a-zA-ZɔɛʉəŋÀ-ÿ\u0100-\u024F\u0300-\u036F '-]+$/;

/* --- consonnes --- */
if (letters.length !== 44) err(`44 consonnes attendues, ${letters.length} trouvées`);

const vus = new Set(), idsVus = new Set();
const ID_OK = /^c_[a-z]+_[a-z0-9-]+$/;
for (const l of letters) {
  const id = `${l.ch} (${l.namePh})`;
  if (vus.has(l.ch)) err(`lettre en double : ${id}`);
  vus.add(l.ch);
  if (!l.id) err(`${id} : id manquant`);
  else {
    if (!ID_OK.test(l.id)) err(`${id} : id « ${l.id} » ne respecte pas le format c_<initiale>_<mot>`);
    if (idsVus.has(l.id)) err(`${id} : id en double « ${l.id} »`);
    idsVus.add(l.id);
  }
  if (!CLASSES.includes(l.cls)) err(`${id} : classe invalide « ${l.cls} »`);
  if (typeof l.namable !== 'boolean') err(`${id} : champ namable manquant (ห นำ — Annexe B)`);
  if (!l.ini) err(`${id} : son initial manquant`);
  if (!FINALES.includes(l.fin)) err(`${id} : son final invalide « ${l.fin} »`);
  if (!l.nameTh || !l.namePh || !l.fr) err(`${id} : nom ou traduction manquant`);
  if (!lots[String(l.lot)]) err(`${id} : lot ${l.lot} inconnu`);
  if (!glyphs[l.ch]) err(`${id} : aucun tracé dans glyphs.json (relancer extract-glyphs.py)`);
  else {
    const g = glyphs[l.ch];
    if (!g.d || !g.vb || !Array.isArray(g.loop)) err(`${id} : tracé incomplet`);
    if (!g.hasLoop && !SANS_BOUCLE.includes(l.ch))
      warn(`${id} : pas de boucle détectée — vérifier le point de départ du tracé`);
  }
  if (l.namePh && !ROMAN_OK.test(l.namePh))
    warn(`${id} : la romanisation contient un caractère hors du système (cf. Annexe A)`);
}

/* --- ห นำ (Annexe B) : exactement les 8 sonantes basses sans pendant en classe haute --- */
const NAM_ATTENDU = new Set(['ง', 'ญ', 'น', 'ม', 'ย', 'ร', 'ล', 'ว']);
for (const l of letters) {
  const attendu = NAM_ATTENDU.has(l.ch);
  if (l.namable !== attendu)
    err(`${l.ch} : namable=${l.namable}, ${attendu} attendu (Annexe B)`);
}

/* --- répartition par classe (référence linguistique) --- */
const parClasse = c => letters.filter(l => l.cls === c).length;
const attendu = { moyenne: 9, haute: 11, basse: 24 };
for (const c of CLASSES)
  if (parClasse(c) !== attendu[c])
    err(`classe ${c} : ${parClasse(c)} lettres, ${attendu[c]} attendues`);

/* --- lots --- */
for (const [n, meta] of Object.entries(lots)) {
  const t = letters.filter(l => String(l.lot) === n).length;
  if (!t) err(`lot ${n} vide`);
  if (t > 12) warn(`lot ${n} : ${t} lettres, c'est beaucoup pour une seule série`);
  if (!meta.title || !meta.desc) err(`lot ${n} : titre ou description manquant`);
}

/* --- voyelles --- */
const LONGUEURS = ['longue', 'courte'];
for (const v of vowels) {
  const id = `${v.form} (${v.sound})`;
  if (!v.form.includes('-')) err(`voyelle ${v.sound} : la forme doit montrer où se place la consonne (« - »)`);
  if (!v.sound || !v.note) err(`voyelle ${v.form} : son ou explication manquant`);
  if (typeof v.before !== 'string' || typeof v.after !== 'string')
    err(`${id} : champs before/after manquants — nécessaires pour écrire la syllabe`);
  else if (!v.before && !v.after) err(`${id} : before et after vides — la voyelle ne s'accroche à rien`);
  if (!LONGUEURS.includes(v.length)) err(`${id} : longueur invalide « ${v.length} » (longue/courte attendu)`);
  if (typeof v.live !== 'boolean') err(`${id} : champ live manquant (vivante = true/false)`);
  if (v.markPos && !['before', 'after'].includes(v.markPos))
    err(`${id} : markPos invalide « ${v.markPos} » (before/after attendu, ou absent si la voyelle ne prend pas de marque)`);
  if (typeof v.closable !== 'boolean') err(`${id} : champ closable manquant (peut-elle être suivie d'une consonne finale ?)`);
  if (v.closable) {
    if (typeof v.closedBefore !== 'string' || typeof v.closedAfter !== 'string')
      err(`${id} : closable=true mais closedBefore/closedAfter manquants`);
    if (v.closedMarkPos && !['before', 'after'].includes(v.closedMarkPos))
      err(`${id} : closedMarkPos invalide « ${v.closedMarkPos} »`);
  }
  /* glideY/glideW (§0.13) : la diphtongue toute faite d'une voyelle fermée par -y/-w — ne
     concatène pas comme les autres finales, donc doit être écrite en toutes lettres */
  for (const g of ['glideY', 'glideW']) {
    if (v[g] === undefined) continue;
    if (typeof v[g] !== 'string' || !v[g]) err(`${id} : ${g} doit être une chaîne non vide si présent`);
    else if (!ROMAN_OK.test(v[g])) warn(`${id} : ${g} « ${v[g]} » contient un caractère hors du système (cf. Annexe A)`);
    if (!v.closable) err(`${id} : ${g} présent mais closable=false — la voyelle ne peut pas être fermée`);
  }
}

/* --- tons (Annexe B) --- */
const MARK_LIST = ['่', '้', '๊', '๋'];
if (!tones.marks || MARK_LIST.some(m => !tones.marks[m]))
  err('tones.json : les 4 marques de ton doivent être décrites dans "marks"');
for (const c of CLASSES) {
  const r = tones.rules && tones.rules[c];
  if (!r) { err(`tones.json : règles manquantes pour la classe ${c}`); continue; }
  if (!r.sansMarque || !TONES_ATTENDUS.includes(r.sansMarque.vivante))
    err(`tones.json : ton "vivante" invalide ou manquant pour la classe ${c}`);
  if (c === 'basse') {
    if (!TONES_ATTENDUS.includes(r.sansMarque.morteCourte) || !TONES_ATTENDUS.includes(r.sansMarque.morteLongue))
      err('tones.json : classe basse — morteCourte/morteLongue manquants ou invalides');
  } else if (!TONES_ATTENDUS.includes(r.sansMarque.morte)) {
    err(`tones.json : ton "morte" invalide ou manquant pour la classe ${c}`);
  }
  const attendues = c === 'moyenne' ? MARK_LIST : MARK_LIST.slice(0, 2);
  for (const m of attendues)
    if (!TONES_ATTENDUS.includes((r.avecMarque || {})[m]))
      err(`tones.json : classe ${c} + marque ${m} — ton invalide ou manquant`);
}

/* --- groupes consonantiques (อักษรควบแท้, §0.14) --- */
const lettersByChar = Object.fromEntries(letters.map(l => [l.ch, l]));
const vus2 = new Set();
for (const c of clusters) {
  const id = `${c.first}${c.second}`;
  if (vus2.has(id)) err(`cluster en double : ${id}`);
  vus2.add(id);
  if (!lettersByChar[c.first]) err(`cluster ${id} : première lettre « ${c.first} » inconnue`);
  if (!lettersByChar[c.second]) err(`cluster ${id} : seconde lettre « ${c.second} » inconnue`);
  if (!['ร', 'ล', 'ว'].includes(c.second))
    err(`cluster ${id} : seconde lettre « ${c.second} » invalide — seules ร, ล, ว forment un อักษรควบแท้`);
}

/* --- rapport --- */
const n = letters.length;
console.log(`\n  ${n} consonnes · ${vowels.length} voyelles · ${Object.keys(lots).length} lots · ${clusters.length} groupes consonantiques`);
console.log(`  répartition : ${CLASSES.map(c => `${parClasse(c)} ${c}`).join(' · ')}`);
if (alertes.length) { console.log('\n  Alertes :'); alertes.forEach(a => console.log('   ~ ' + a)); }
if (erreurs.length) {
  console.log('\n  Erreurs :'); erreurs.forEach(e => console.log('   ✗ ' + e));
  console.log(`\n  ${erreurs.length} erreur(s) — contenu non valide.\n`);
  process.exit(1);
}
console.log('\n  ✓ contenu valide\n');
