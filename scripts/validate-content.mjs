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

const letters = read('letters');
const vowels  = read('vowels');
const lots    = read('lots');
const glyphs  = read('glyphs');

const CLASSES = ['moyenne', 'haute', 'basse'];
const FINALES = ['-k', '-ng', '-t', '-n', '-p', '-m', '-y', '-w', '—'];
const SANS_BOUCLE = ['ก', 'ธ'];   // lettres qui n'ont pas de หัว : normal
const ROMAN_OK = /^[a-zA-ZɔɛʉəŋÀ-ÿ\u0100-\u024F\u0300-\u036F '-]+$/;

/* --- consonnes --- */
if (letters.length !== 44) err(`44 consonnes attendues, ${letters.length} trouvées`);

const vus = new Set();
for (const l of letters) {
  const id = `${l.ch} (${l.namePh})`;
  if (vus.has(l.ch)) err(`lettre en double : ${id}`);
  vus.add(l.ch);
  if (!CLASSES.includes(l.cls)) err(`${id} : classe invalide « ${l.cls} »`);
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
for (const v of vowels) {
  if (!v.form.includes('-')) err(`voyelle ${v.sound} : la forme doit montrer où se place la consonne (« - »)`);
  if (!v.sound || !v.note) err(`voyelle ${v.form} : son ou explication manquant`);
}

/* --- rapport --- */
const n = letters.length;
console.log(`\n  ${n} consonnes · ${vowels.length} voyelles · ${Object.keys(lots).length} lots`);
console.log(`  répartition : ${CLASSES.map(c => `${parClasse(c)} ${c}`).join(' · ')}`);
if (alertes.length) { console.log('\n  Alertes :'); alertes.forEach(a => console.log('   ~ ' + a)); }
if (erreurs.length) {
  console.log('\n  Erreurs :'); erreurs.forEach(e => console.log('   ✗ ' + e));
  console.log(`\n  ${erreurs.length} erreur(s) — contenu non valide.\n`);
  process.exit(1);
}
console.log('\n  ✓ contenu valide\n');
