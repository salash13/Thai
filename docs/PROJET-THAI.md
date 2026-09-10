# PROJET — Apprendre le thaï (français → thaï)

> Document de fondation. Il sert à trois choses : fixer **quoi** on enseigne (le programme),
> **comment** l'app le présente (le produit), et **avec quoi** on le construit (la technique).
> Tout le reste du projet doit pouvoir se déduire de ce fichier.

- **Nom de code** : `thai-fr` (nom définitif à choisir — voir §10.3)
- **Auteur** : Ben
- **Version du document** : 0.1 — 10 septembre 2026
- **Statut** : fondations posées, rien de codé (hors prototype « Alphabet lot 1 »)

### Décisions déjà prises

| Sujet | Décision |
|---|---|
| Public | Francophones débutants complets, moi en premier |
| Portée | D'abord un outil perso, ouverture publique si ça marche pour moi |
| Audio | Voix de synthèse du navigateur (Web Speech API) au départ |
| Romanisation | **Figée** : système « fiche de chanson » (ɔ ɛ ʉ ə + accents de ton) — Annexe A |
| Démarrage | Fichier HTML unique sans installation, migration vers le vrai projet plus tard |
| Stack | À trancher au moment de la migration — recommandation en §6 |
| Relecture | Une locutrice native relit le contenu avant publication |
| Langue de l'interface | Français |

---

## 1. Le pari du projet (avis honnête)

**Ce qui rend l'idée solide :**

- Les ressources pour apprendre le thaï **en français** sont rares comparées à ce qui existe en anglais. Un francophone débutant se retrouve vite à apprendre le thaï *via* l'anglais, ce qui ajoute une couche de difficulté inutile.
- Le thaï a une particularité qui joue en notre faveur : **la grammaire est simple** (pas de conjugaison, pas de genre, pas de pluriel, pas d'accord). La difficulté est concentrée sur **l'écriture et les tons** — deux choses qu'une app fait très bien travailler, mieux qu'un livre.
- Construire le cours est, en soi, la meilleure façon d'apprendre. Le projet te fait progresser même s'il ne sort jamais.

**Ce qui va faire mal :**

- **Le contenu, c'est 80 % du travail.** Le code d'une app de ce type est faisable en quelques week-ends. Écrire, vérifier et faire relire 2 000 mots et 800 phrases, c'est des mois.
- Sans relecture native, le contenu sera **faux par endroits** — et un cours faux est pire que pas de cours. C'est le point de contrôle non négociable.
- La synthèse vocale thaïe est **inégale** selon les appareils : correcte sur iOS/macOS et Android, parfois absente sur Chrome desktop. Il faut le prévoir dès le départ (§6.5).

**Règle de survie du projet :** ne jamais laisser le développement passer devant l'apprentissage. Si une semaine tu codes 10 h et n'apprends aucun mot, le projet a échoué à son but principal.

---

## 2. Principes pédagogiques

Ces principes tranchent tous les arbitrages produits qui suivront.

1. **Petits lots, souvent.** 5 à 10 éléments nouveaux par séance, jamais plus. Une séance = 5 à 10 minutes.
2. **Rappel actif, pas relecture.** L'utilisateur doit *produire* la réponse avant de la voir. Une carte qu'on retourne sans avoir essayé ne compte pas.
3. **Répétition espacée systématique.** Tout élément appris entre dans une file de révision (§4.3). Le moteur décide quoi revoir, pas l'utilisateur.
4. **L'écriture dès le début, la romanisation comme béquille temporaire.** La translittération est affichée au début, puis s'efface progressivement (option « masquer la phonétique » activée par défaut à partir du niveau A1).
5. **Le ton fait partie du mot.** Un mot n'est jamais présenté sans son ton. Les paires minimales (ข้าว / ขาว / ข่าว) sont enseignées tôt et volontairement.
6. **Des phrases vraies, pas des phrases d'exercice.** Chaque phrase du cours doit être une phrase qu'un Thaï dirait vraiment. C'est le critère n°1 de la relecture native.
7. **On explique la logique, on ne fait pas mémoriser des tableaux.** Les règles de tons s'apprennent par petites briques, chacune immédiatement mise en pratique (§3.3).
8. **Le contexte culturel compte.** ครับ/ค่ะ, les registres, le ใจ (le « cœur » dans des dizaines d'expressions), le tutoiement par le prénom : ce sont des leçons, pas des notes de bas de page.

---

## 3. Le programme

### 3.1 Vue d'ensemble

| Niveau | Objectif à la sortie | Unités | Mots cumulés | Durée estimée (15 min/jour) |
|---|---|---|---|---|
| **N0 — Lire** | Déchiffrer n'importe quel mot thaï à voix haute, même sans le comprendre | 14 | ~150 | 6 à 10 semaines |
| **A1** | Se présenter, commander, acheter, poser des questions simples | 12 | ~700 | 4 à 6 mois |
| **A2** | Raconter sa journée, expliquer un problème, comprendre une conversation lente | 10 | ~1 500 | 6 à 8 mois |
| **B1** | Suivre une conversation normale, lire des messages et des textes courts | 8 | ~2 800 | 8 à 12 mois |

> **Décision structurante :** on ne commence pas par « bonjour / merci » comme la plupart des apps. On commence par **lire**. Un francophone qui sait déchiffrer avance ensuite trois fois plus vite, parce qu'il peut lire tout ce qu'il croise.

### 3.2 Niveau 0 — Lire et écrire (le socle)

| # | Unité | Contenu | Ce qu'on sait faire à la fin |
|---|---|---|---|
| 0.1 | Comment marche l'écriture thaïe | 44 consonnes, ~32 voyelles, pas d'espaces entre les mots, pas de majuscules, pas de ponctuation de phrase, les voyelles s'écrivent autour de la consonne | Comprendre ce qu'on regarde |
| 0.2 | Consonnes — lot 1 | ก ค ง ด ต น บ ม ร ล ส | Reconnaître 11 lettres, les tracer |
| 0.3 | Voyelles longues de base | -า -ี -ู -ื -อ + le rôle de อ comme porteur | Lire des syllabes ouvertes |
| 0.4 | Première lecture | consonne + voyelle longue = syllabe ; ton moyen par défaut (classe moyenne) | Lire มา ดี ตา ปู… à voix haute |
| 0.5 | Syllabes vivantes / mortes | คำเป็น (finit par voyelle longue ou m/n/ng/w/y) vs คำตาย (voyelle courte ou p/t/k) | Classer une syllabe — prérequis de tout le système de tons |
| 0.6 | Consonnes — lot 2 | ห อ ท พ ว ย จ ข ช ป | 21 lettres connues |
| 0.7 | Voyelles courtes | -ะ -ิ -ุ -ึ เ-ะ แ-ะ โ-ะ เ-าะ + la longueur qui change le sens | Entendre et écrire la différence khǎo / khǎao |
| 0.8 | Les 4 marques de ton (classe moyenne) | ่ ้ ๊ ๋ appliquées aux consonnes moyennes | Lire les 5 tons sur ก ด ต บ ป จ อ |
| 0.9 | Consonnes — lot 3 + classe haute | ถ ผ ฝ ฟ ซ ศ ษ ฉ ญ ณ + règles de tons de la classe haute | Lire un mot en classe haute sans hésiter |
| 0.10 | Classe basse | le croisement vivante/morte × voyelle courte/longue | Le morceau le plus dur du thaï, franchi |
| 0.11 | ห นำ et อ นำ | หน หม หล หร หว หย หง + les 4 mots en อ (อย่า อยู่ อย่าง อยาก) | Lire หมา, หนู, อยาก correctement |
| 0.12 | Voyelles composées | เ-ีย เ-ือ -ัว ไ- ใ- เ-า -ำ | Lire des mots de 2-3 syllabes |
| 0.13 | Consonnes finales | les 8 sons finaux possibles et quelles lettres y mènent (ด ต ถ ท ส ช ญ… → -t) | Ne plus être surpris par ประโยชน์ |
| 0.14 | Groupes, lettres muettes, exceptions | กร กล ขว ปล… ; le การันต์ ( ์ ) ; ร ห muets ; les mots qui ne suivent pas la règle | Lire un panneau de rue |

**Sortie de N0 :** l'utilisateur lit à voix haute un texte thaï inconnu, avec les bons tons, sans forcément le comprendre. C'est un cap énorme et très motivant.

### 3.3 Les règles de tons — comment on les enseigne

Le tableau complet fait peur. On ne le montre **jamais en entier** avant l'unité 0.10. On l'enseigne en 4 briques, chacune avec ses exercices :

1. **Brique 1 (U0.4)** — classe moyenne + syllabe vivante + pas de marque = **ton moyen**. Rien d'autre.
2. **Brique 2 (U0.8)** — les 4 marques sur la classe moyenne : ่ = bas, ้ = descendant, ๊ = haut, ๋ = montant. Une marque = un ton, c'est simple, et ça donne confiance.
3. **Brique 3 (U0.9)** — la classe haute : sans marque + vivante = **montant** ; sans marque + morte = **bas** ; ่ = bas ; ้ = descendant.
4. **Brique 4 (U0.10)** — la classe basse, où la longueur de la voyelle entre en jeu.

Le tableau de référence complet est en **Annexe B**. Dans l'app, il est accessible à tout moment via un bouton « la règle », mais jamais imposé.

### 3.4 A1 — Parler de soi et se débrouiller

| # | Unité | Grammaire clé | Exemples de vocabulaire |
|---|---|---|---|
| 1.1 | Se présenter | ผม / ฉัน / เรา, ชื่อ, ครับ / ค่ะ | สวัสดี, ชื่อ, ยินดี |
| 1.2 | Politesse et registres | les particules ครับ ค่ะ นะ สิ หรอ จ๊ะ | quand vouvoyer, quand être familier |
| 1.3 | Les nombres | 0 → 1 000 000, les chiffres thaïs ๐๑๒๓, l'heure | ราคา, บาท, กี่ |
| 1.4 | La famille | พ่อ แม่ พี่ น้อง ลูก แฟน + l'usage de พี่/น้อง avec des inconnus | |
| 1.5 | Manger et boire | สั่ง, เอา, ไม่เอา, la commande au restaurant | อร่อย, เผ็ด, ข้าว, น้ำ |
| 1.6 | Questions et négation | ไหม / มั้ย, ใช่ไหม, ไม่, อะไร, ที่ไหน, ใคร | |
| 1.7 | Le temps | แล้ว (accompli), จะ (futur), กำลัง (en cours), เมื่อวาน / วันนี้ / พรุ่งนี้ | |
| 1.8 | Se déplacer | ไป / มา, อยู่ที่, ไปยังไง, les directions | รถ, แท็กซี่, ตรงไป, เลี้ยว |
| 1.9 | **Les classificateurs** | คน ตัว อัน ใบ ขวด คัน… — la vraie difficulté grammaticale du thaï | |
| 1.10 | Décrire | adjectifs, มาก, กว่า, ที่สุด | สวย, ใหญ่, ร้อน, ดี |
| 1.11 | Les mots du cœur (ใจ) | ดีใจ, เสียใจ, เข้าใจ, ตกใจ, สบายใจ, สองใจ | une famille de mots très thaïe |
| 1.12 | Messages et couple | écrire un message simple, les mots d'affection, คิดถึง | |

### 3.5 A2 et B1 (esquisse, à détailler plus tard)

**A2** — verbes en série, ให้ / ได้ / เป็น / คือ, les relatives avec ที่, ก็ / เลย / ค่อย, le téléphone, la santé, le travail, raconter un souvenir, comprendre une chanson, l'argot courant.

**B1** — textes courts authentiques, registre formel vs familier, les tournures indirectes de la politesse thaïe, l'humour et les idiomes, écrire des messages longs, comprendre un accent régional.

### 3.6 Volume de contenu à produire

| Élément | N0 | A1 | A2 | B1 | Total |
|---|---|---|---|---|---|
| Mots | 150 | 550 | 800 | 1 300 | ~2 800 |
| Phrases d'exemple | 80 | 300 | 400 | 500 | ~1 280 |
| Exercices générés | automatique (§4.2) | | | | |
| Notes de grammaire | 12 | 25 | 30 | 25 | ~92 |

> À raison de **20 mots vérifiés par semaine**, N0 + A1 représentent environ 8 mois de production de contenu. C'est le vrai calendrier du projet.

---

## 4. Cahier des charges produit

### 4.1 Écrans

1. **Parcours** — la carte des unités, avec l'état de chacune (verrouillée / en cours / acquise) et le nombre de révisions dues aujourd'hui.
2. **Leçon** — une suite de 8 à 12 exercices, barre de progression, sortie possible à tout moment sans perdre l'acquis.
3. **Révision** — la file de répétition espacée du jour, tous éléments confondus, mélangée.
4. **Dictionnaire** — tous les mots vus, filtrables par unité / thème / classe de ton, avec recherche en français et en thaï.
5. **Écriture** — le module de tracé des lettres (prototype déjà existant).
6. **Profil** — statistiques : mots acquis, tons les plus ratés, série de jours, temps passé, export des données.
7. **La règle** — les tableaux de référence (tons, voyelles, consonnes), accessibles partout.

### 4.2 Types d'exercices

| # | Type | Exemple | Sert à |
|---|---|---|---|
| 1 | Lettre → son | « ค » → kh- / k- / t- / ng- | reconnaissance visuelle |
| 2 | Son → lettre | « m- » → ม / น / ค / ร | rappel actif |
| 3 | Assemblage de syllabe | poser ก + -า + ่ → lire « kàa » | mécanique de lecture |
| 4 | Écoute → ton | on entend « khǎao » → choisir parmi les 5 tons | oreille tonale |
| 5 | Paire minimale | entendre puis choisir entre ข้าว / ขาว / ข่าว | discrimination fine |
| 6 | Mot → traduction | กิน → manger / boire / dormir / aller | vocabulaire passif |
| 7 | Traduction FR → TH par blocs | « je mange du riz » → [ผม] [กิน] [ข้าว] | production, ordre des mots |
| 8 | Phrase à trous | ผม ___ ข้าว (กิน / ไป / ดี) | grammaire en contexte |
| 9 | Dictée | on entend, on écrit avec un clavier thaï simplifié | orthographe |
| 10 | Tracé | écrire la lettre au doigt, départ marqué sur la boucle | mémoire motrice |
| 11 | Lecture à voix haute | la phrase s'affiche, l'utilisateur la lit, puis compare avec l'audio | fluidité |
| 12 | Classificateur | « 3 chiens » → หมา 3 ___ (ตัว / คน / อัน) | le piège n°1 du thaï |

**Règle de génération :** les exercices ne sont pas écrits à la main un par un. Ils sont **générés depuis les données** (§5) : un mot bien décrit produit automatiquement les exercices 1, 2, 4, 5, 6, 9 ; une phrase bien décrite produit les 7, 8, 11.

### 4.3 Moteur de répétition espacée

Algorithme : **SM-2 simplifié** (celui d'Anki, allégé). Chaque élément (lettre, mot, phrase, règle) porte :

```
{ id, dernierePassage, prochainePassage, intervalle, facilite (2.5 par défaut), reussitesConsecutives }
```

Réponse de l'utilisateur → nouvel intervalle :

| Réponse | Effet |
|---|---|
| Ratée | intervalle → 1 (revoir dans la même séance, puis demain), facilité − 0.2 |
| Juste mais lente (> 6 s) | intervalle × 1.4, facilité inchangée |
| Juste et rapide | intervalle × facilité, facilité + 0.05 (plafonnée à 3.0) |

Paliers indicatifs : `10 min → 1 j → 3 j → 7 j → 16 j → 35 j → 75 j`.

**Composition d'une séance** (10 exercices) : 70 % de révisions dues, 30 % de nouveau. S'il y a plus de 40 révisions en retard, on passe à 100 % révision et on bloque le nouveau contenu — c'est ce qui empêche la noyade.

### 4.4 Gamification — et ce qu'on refuse

**On garde :** la série de jours (streak), un objectif quotidien réglable (5/10/20 min), le compteur de mots acquis, les paliers d'unité.

**On refuse explicitement :** les cœurs/vies qui bloquent l'apprentissage après des erreurs (ça punit exactement le moment où l'utilisateur apprend le plus), les notifications culpabilisantes, les classements entre utilisateurs.

### 4.5 Contraintes techniques produit

- **Mobile d'abord** — la majorité des séances se feront sur téléphone, debout, une main.
- **Hors-ligne** — installable en PWA, tout le contenu embarqué, aucune requête réseau nécessaire pour une séance.
- **Progression exportable** — un bouton « exporter mes données » en JSON. Aucun enfermement.
- **Accessibilité** — taille de police réglable (le thaï est petit et dense), contraste suffisant, pas d'information portée uniquement par la couleur (les tons ont une couleur *et* un symbole).

---

## 5. Format des données

Tout le cours vit dans des fichiers JSON versionnés dans Git. **Le code ne contient aucun contenu pédagogique.** C'est la règle qui permet d'ajouter des leçons sans toucher au code, et de faire relire le contenu par quelqu'un qui ne programme pas.

### 5.1 Arborescence du contenu

```
content/
  letters.json         # les 44 consonnes + les voyelles + les marques de ton
  words/
    n0.json  a1.json  a2.json  b1.json
  sentences/
    a1.json  a2.json  b1.json
  grammar/
    a1-classificateurs.json  a1-questions.json  ...
  units.json           # l'ordre des unités et ce que chacune contient
```

### 5.2 Une lettre

```json
{
  "id": "c_kh_khwai",
  "char": "ค",
  "type": "consonne",
  "nameTh": "ค ควาย",
  "namePhon": "khɔɔ khwaai",
  "nameFr": "le buffle",
  "class": "basse",
  "initial": "kh",
  "final": "k",
  "loop": [314, -269],
  "traceHint": "Départ dans la boucle, au milieu à gauche, puis un seul trait continu.",
  "unit": "0.2",
  "examples": ["w_khon", "w_khit"]
}
```

### 5.3 Un mot

```json
{
  "id": "w_kin",
  "th": "กิน",
  "phon": "kin",
  "rtgs": "kin",
  "tones": ["moyen"],
  "syllables": [
    { "th": "กิน", "phon": "kin", "tone": "moyen", "class": "moyenne", "live": true }
  ],
  "fr": ["manger"],
  "pos": "verbe",
  "level": "N0",
  "unit": "0.4",
  "themes": ["nourriture", "verbe-fréquent"],
  "freq": 47,
  "classifier": null,
  "audio": null,
  "tts": { "lang": "th-TH", "text": "กิน" },
  "note": "S'emploie aussi pour boire dans le langage familier.",
  "seeAlso": ["w_khao_riz"],
  "reviewed": { "by": "native", "date": null, "ok": false }
}
```

Champs importants :

- `phon` — **notre** romanisation française (Annexe A). C'est ce qui s'affiche dans l'app.
- `rtgs` — la romanisation officielle thaïlandaise, utile pour chercher sur Google Maps ou dans un dico.
- `syllables` — c'est ce qui permet de générer automatiquement les exercices de tons et de coloration.
- `freq` — rang de fréquence approximatif ; sert à trier ce qu'on enseigne en premier.
- `reviewed` — **aucun mot n'est publié tant que `ok` est faux.** C'est le garde-fou qualité.

### 5.4 Une phrase

```json
{
  "id": "s_je_mange_riz",
  "th": "ผมกินข้าว",
  "phon": "phǒm kin khâao",
  "fr": "Je mange du riz.",
  "words": ["w_phom", "w_kin", "w_khao_riz"],
  "blocks": ["ผม", "กิน", "ข้าว"],
  "distractors": ["ไป", "ดี", "น้ำ"],
  "level": "A1",
  "unit": "1.5",
  "register": "poli-neutre",
  "grammar": ["ordre-sujet-verbe-objet"],
  "reviewed": { "by": "native", "date": null, "ok": false }
}
```

### 5.5 Une unité

```json
{
  "id": "0.4",
  "title": "Première lecture",
  "level": "N0",
  "goal": "Lire à voix haute une syllabe simple : consonne moyenne + voyelle longue.",
  "requires": ["0.2", "0.3"],
  "teaches": {
    "letters": [],
    "words": ["w_maa_venir", "w_dii", "w_taa"],
    "grammar": ["g_ton_moyen_defaut"]
  },
  "exerciseTypes": [3, 1, 6, 9],
  "minScoreToPass": 0.8
}
```

### 5.6 Règles d'écriture du contenu

- Une seule idée par mot : pas de `fr: "manger, bouffer, consommer"` — on choisit **la** traduction la plus utile, les autres vont dans `note`.
- Toute phrase doit être **prononçable telle quelle** par un Thaï dans la vraie vie. Pas de phrase grammaticalement correcte mais artificielle.
- Le registre est toujours précisé (`poli`, `poli-neutre`, `familier`, `intime`, `vulgaire`) — en thaï, se tromper de registre est une faute plus grave qu'une faute de grammaire.
- Un mot ne peut pas apparaître dans une phrase d'une unité si son unité d'introduction est postérieure. Un script vérifie ça automatiquement (§7.4).

---

## 6. Technique et hébergement

### 6.1 Recommandation

**Phase 1 — l'outil perso (v0.1 → v0.5)**

| Brique | Choix | Pourquoi |
|---|---|---|
| Front | **Vite + TypeScript + Preact** (ou React si tu préfères) | démarrage instantané, build statique, pas de serveur |
| Style | CSS simple avec variables, ou Tailwind si tu accroches | le design de l'app est simple, pas besoin d'usine |
| Contenu | fichiers JSON dans le repo | modifiable sans toucher au code, relisible par une non-développeuse |
| Progression | `localStorage` + export/import JSON | zéro backend, zéro RGPD, zéro coût |
| Hors-ligne | `vite-plugin-pwa` | installable sur le téléphone comme une vraie app |
| Audio | `speechSynthesis` (§6.5) | gratuit, immédiat |
| Hébergement | **Netlify** ou **Vercel** (ou GitHub Pages) | gratuit, déploiement automatique à chaque `git push` |

**Coût phase 1 : 0 €** (hors nom de domaine, ~12 €/an si tu en veux un).

**Phase 2 — l'ouverture aux autres (v1.0)**

On garde exactement le même front et on ajoute :

| Brique | Choix | Pourquoi |
|---|---|---|
| Comptes + base | **Supabase** (Postgres + auth) | auth Google/e-mail en quelques lignes, offre gratuite très large |
| Sync | table `progress` (user_id, item_id, état SRS) | progression retrouvée sur tous les appareils |
| Stats anonymes | table `events` | savoir quels exercices bloquent tout le monde = améliorer le cours |

**Coût phase 2 : 0 €** jusqu'à plusieurs centaines d'utilisateurs actifs.

### 6.2 Pourquoi pas un back PHP/Symfony

C'est faisable, et si tu es plus à l'aise avec Symfony tu iras plus vite au début. Mais ici l'application est à **95 % du front** : le contenu est statique, la logique SRS tourne dans le navigateur, et le seul vrai besoin serveur, c'est l'authentification et la synchronisation — exactement ce que Supabase donne sans serveur à maintenir, à mettre à jour et à sécuriser. Un back maison, ce sont des heures qui ne vont pas dans le contenu.

**Sauf si** tu veux te servir du projet comme prétexte pour progresser en Symfony — c'est une raison parfaitement valable, à assumer explicitement.

### 6.3 Arborescence du dépôt

```
thai-fr/
  content/            # tout le cours (JSON) — le vrai trésor du projet
  src/
    app/              # écrans
    engine/           # SRS, génération d'exercices, moteur de session
    lib/              # romanisation, découpage syllabique, TTS
    ui/               # composants
  public/
    fonts/            # Noto Sans Thai Looped (écriture manuscrite) + Noto Sans Thai
    audio/            # enregistrements natifs, quand il y en aura
  scripts/
    validate-content.ts   # vérifie tout le contenu (§7.4)
    stats.ts              # combien de mots, combien relus, couverture par unité
  docs/
    PROJET-THAI.md    # ce document
```

### 6.4 Polices

Deux polices thaïes, deux usages :

- **Noto Sans Thai Looped** — avec les boucles (หัว), c'est la forme qu'on apprend à écrire à la main. À utiliser pour l'apprentissage des lettres et le tracé.
- **Noto Sans Thai** — sans boucles, c'est la forme moderne qu'on voit partout (panneaux, sites, téléphones). À utiliser pour la lecture de phrases, sinon l'utilisateur sera perdu devant du thaï réel.

Les deux sont libres et embarquables dans le projet (déjà utilisées dans les prototypes).

### 6.5 Audio — synthèse vocale

```js
function parler(texte, vitesse = 0.85) {
  const voix = speechSynthesis.getVoices().filter(v => v.lang.startsWith('th'));
  if (!voix.length) return { ok: false, raison: 'aucune voix thaïe sur cet appareil' };
  const u = new SpeechSynthesisUtterance(texte);
  u.lang = 'th-TH';
  u.voice = voix[0];
  u.rate = vitesse;          // 0.7 pour l'apprentissage, 1.0 pour l'entraînement
  speechSynthesis.speak(u);
  return { ok: true };
}
```

Points de vigilance :

- La liste des voix arrive **de façon asynchrone** : il faut écouter `voiceschanged` au démarrage.
- iOS exige une **interaction utilisateur** avant le premier son.
- Si aucune voix thaïe n'est disponible, l'app doit le dire clairement et proposer l'exercice en mode visuel plutôt que de rester muette.
- Le champ `audio` de chaque mot permet de **remplacer plus tard** la synthèse par un vrai enregistrement, mot par mot, sans rien changer au code.

### 6.6 Déploiement

1. Créer le dépôt Git (privé au début)
2. Connecter Netlify au dépôt
3. Build : `npm run build`, dossier publié : `dist`
4. Chaque `git push` redéploie automatiquement
5. Plus tard : nom de domaine + HTTPS (automatique chez Netlify)

---

## 7. Compétences et ressources nécessaires

### 7.1 Ce que tu dois maîtriser toi-même

| Compétence | Niveau requis | Où tu en es / comment y arriver |
|---|---|---|
| HTML / CSS / JS | solide bases | indispensable, c'est le cœur du projet |
| TypeScript | notions | facultatif au début, très rentable ensuite (le contenu typé évite des dizaines de bugs) |
| Git / GitHub | bases (commit, push, branche) | indispensable, y compris pour ne pas perdre le contenu |
| JSON rigoureux | bon | c'est là que vit tout le cours |
| Design d'interface mobile | notions | on peut partir de maquettes simples |
| Notions de linguistique thaïe | en cours | **tu l'apprends en construisant** — c'est le but |
| Rigueur éditoriale | élevée | la qualité du projet = la qualité du contenu, pas du code |
| Supabase / auth | notions | seulement en phase 2 |

### 7.2 Ce que je peux prendre en charge

- Générer le contenu structuré (mots, phrases, exercices) au format JSON du projet, unité par unité
- Écrire et maintenir le moteur (SRS, génération d'exercices, découpage syllabique, coloration des tons)
- Produire les tableaux de référence, les fiches imprimables, les pages de quiz autonomes
- Écrire les scripts de validation du contenu
- Relire, corriger et expliquer les règles de tons quand un mot ne se comporte pas comme prévu

### 7.3 Ce dont j'ai besoin de ta part

1. **Valider la romanisation** (Annexe A) — une fois figée, tout en dépend, il ne faut plus en changer.
2. **Choisir le nom** du projet et le ton de l'interface (tutoiement ? humour ? sobre ?).
3. **Faire relire le contenu par une native** — 30 minutes par semaine suffisent si on prépare les questions (§8).
4. **Me dire ton rythme réel** (jours, durée) pour calibrer les unités : une unité doit tenir dans une séance.
5. **Décider de la stack** (§6.1) — après, on ne revient plus dessus.

### 7.4 Outils à créer pour aller vite (« skills »)

Ce sont des procédures réutilisables, à créer une fois et à rappeler ensuite d'une phrase :

| Nom | Ce qu'elle fait |
|---|---|
| `thai-unite` | Génère une unité complète (objectif, mots, phrases, exercices) au format JSON du projet, prête à relire |
| `thai-valide` | Vérifie un fichier de contenu : schéma correct, romanisation cohérente, tons calculés vs déclarés, doublons, mot utilisé avant d'être enseigné |
| `thai-fiche-chanson` | Transforme des paroles en fiche de chant (thaï / phonétique colorée par ton / traduction) — déjà fait une fois, à packager |
| `thai-quiz` | Fabrique une page de quiz autonome pour un lot de lettres ou de mots |
| `thai-prof` | Session de tuteur : interroge, corrige, adapte la difficulté, note ce qui bloque |

> Dis-le-moi quand tu veux que je te les propose : je peux te les enregistrer comme skills réutilisables.

### 7.5 Comptes et outils à ouvrir

- [ ] GitHub (dépôt privé)
- [ ] Netlify ou Vercel (connexion via GitHub)
- [ ] Supabase (phase 2 seulement)
- [ ] Un dossier partagé pour les enregistrements audio (phase 2)
- [ ] Nom de domaine (optionnel, quand l'app est montrable)

---

## 8. Relecture par une locutrice native

C'est le point de contrôle qualité du projet. Le piège classique : demander « c'est bon ? » et obtenir « oui c'est bon » — ce qui ne dit rien. Il faut des questions **fermées et précises**.

**Checklist à faire passer, phrase par phrase :**

1. Est-ce qu'un Thaï dirait vraiment ça, ou est-ce que ça sonne « livre de cours » ?
2. Est-ce que le registre est juste ? (à qui on peut dire ça : un inconnu, un ami, sa femme, un ancien ?)
3. Est-ce que le mot est actuel, ou vieilli / littéraire ?
4. Est-ce qu'il y a un sous-entendu, une connotation, une blague involontaire ?
5. Est-ce que ma phonétique correspond à ce que tu prononces, ou est-ce que je décale un ton ?
6. Si tu devais enseigner ce mot à un étranger, tu donnerais quel exemple ?

**Format pratique :** 20 lignes par session, dans un tableau à 3 colonnes (thaï / ma traduction / sa remarque). On coche `reviewed.ok = true` uniquement après son passage.

---

## 9. Risques et pièges

| Risque | Gravité | Parade |
|---|---|---|
| Le contenu prend 10× plus de temps que prévu | élevée | ne viser que N0 + A1 pour la v1 ; générer, puis relire, jamais l'inverse |
| Du contenu faux publié | élevée | rien n'est publié sans `reviewed.ok = true` |
| Synthèse vocale absente ou mauvaise | moyenne | détecter et dégrader proprement ; prévoir le remplacement par de l'audio natif |
| Dérive du périmètre (« et si on ajoutait… ») | élevée | ce document fait foi ; toute idée nouvelle va dans une liste « plus tard », pas dans la v1 |
| Paroles de chansons publiées telles quelles | juridique | pour un usage perso c'est une chose, pour une app publique c'en est une autre : extraits courts, ou reformulations, ou accord |
| Le projet remplace l'apprentissage | réelle | règle : pas de séance de code sans séance de thaï le même jour |
| Perte du contenu | moyenne | tout dans Git, sauvegarde distante, export régulier |

---

## 10. Roadmap

### 10.1 Versions

| Version | Contenu | Critère de sortie |
|---|---|---|
| **v0.1** ✅ | Squelette + lettres lot 1 + tracé + quiz | livré |
| **v0.2** ✅ | Moteur SRS + écran Révision + les 44 consonnes + voyelles longues + lecture de syllabes + audio + export | livré le 10/09/2026 — reste à l'utiliser tous les jours |
| **v0.3** | Voyelles + syllabes + règles de tons (N0 complet) | je lis un mot inconnu à voix haute |
| **v0.4** | A1 unités 1 à 4 + dictionnaire + audio TTS | je tiens une présentation simple |
| **v0.5** | PWA installable + statistiques + export | je m'en sers sur mon téléphone tous les jours |
| **v1.0** | A1 complet, relu par une native, comptes + sync | montrable à d'autres sans avoir honte |

### 10.2 Les 8 prochaines étapes concrètes

1. [ ] Valider la romanisation (Annexe A) — 15 min, mais bloquant pour tout le reste
2. [ ] Choisir la stack (§6.1) et créer le dépôt Git avec l'arborescence de §6.3
3. [ ] Écrire `content/letters.json` avec les 44 consonnes (classe, nom, son initial/final) — je peux le générer
4. [ ] Porter le prototype « Alphabet lot 1 » dans le repo comme premier écran
5. [ ] Coder le moteur SRS (§4.3) et l'écran Révision — le cœur de l'app, ~200 lignes
6. [ ] Écrire les unités 0.1 à 0.5 complètes et les tester sur moi pendant une semaine
7. [ ] Déployer sur Netlify et l'installer sur le téléphone
8. [ ] Première session de relecture native (§8) sur les 50 premiers mots

### 10.3 Nom du projet (à choisir)

| Nom | Sens | Remarque |
|---|---|---|
| **Sabai** (สบาย) | « à l'aise, tranquille » | très thaï, positif, facile à retenir en français |
| **Kin Thai** (กิน) | jeu de mot « manger du thaï » | sympa mais peut prêter à confusion avec la cuisine |
| **Hua Jai** (หัวใจ) | « le cœur » | joli, mais très utilisé |
| **Aan Thai** (อ่าน) | « lire le thaï » | colle au parti pris pédagogique (on apprend à lire d'abord) |
| **Mai Pen Rai** (ไม่เป็นไร) | « pas de souci » | l'expression thaïe la plus connue, sûrement déjà prise |

---

## Annexe A — Romanisation du projet (à valider)

Principe : **lisible par un francophone**, pas conforme à une norme internationale. Une norme (RTGS) est stockée en parallèle dans les données pour les recherches externes.

**Consonnes**

| On écrit | Son | Piège à éviter |
|---|---|---|
| `k` | k sec, non soufflé (ก) | ce n'est pas « c » |
| `kh` | k soufflé (ข ค) | jamais « ch » français |
| `t` / `th` | t sec (ต) / t soufflé (ท ถ) | `th` n'est pas le « th » anglais |
| `p` / `ph` | p sec (ป) / p soufflé (พ ผ) | `ph` n'est **jamais** « f » |
| `dj` | จ | proche de « dj » de djinn |
| `tch` | ช ฉ | |
| `ng` | ง | comme « parking », même en début de mot |
| `ï` | le i d'une diphtongue (ไ ใ) | djaï se lit « djaïe » |

**Voyelles**

| On écrit | Son | Exemple |
|---|---|---|
| `a` / `aa` | a bref / long | มา = maa |
| `i` / `ii` | i bref / long | ดี = dii |
| `u` / `uu` | ou bref / long | ดู = duu |
| `ʉ` / `ʉʉ` | « ou » lèvres étirées | ลืม = lʉʉm |
| `e` / `ee` | é | เธอ = təə |
| `ɛ` / `ɛɛ` | è très ouvert | แต่ = tɛ̀ɛ |
| `o` / `oo` | o fermé | โต = too |
| `ɔ` / `ɔɔ` | o très ouvert | สอง = sɔ̌ɔng |
| `ə` / `əə` | eu | เธอ = təə |

**Tons** : `a` moyen · `á` haut · `à` bas · `â` descendant · `ǎ` montant.

---

## Annexe B — Règles de tons (référence complète)

**Étape 1 — la classe de la consonne initiale** (Annexe C)
**Étape 2 — la syllabe est-elle vivante ou morte ?**

- **Vivante** (คำเป็น) : finit par une voyelle longue, ou par -m, -n, -ng, -w, -y
- **Morte** (คำตาย) : finit par une voyelle courte, ou par -p, -t, -k

**Étape 3 — y a-t-il une marque de ton ?**

**Sans marque de ton :**

| Classe | Syllabe vivante | Syllabe morte |
|---|---|---|
| Moyenne | **moyen** | **bas** |
| Haute | **montant** | **bas** |
| Basse | **moyen** | voyelle courte → **haut** · voyelle longue → **descendant** |

**Avec marque de ton :**

| Classe | ่ (mái èek) | ้ (mái thoo) | ๊ (mái trii) | ๋ (mái djàt-tà-waa) |
|---|---|---|---|---|
| Moyenne | bas | descendant | haut | montant |
| Haute | bas | descendant | — | — |
| Basse | descendant | haut | — | — |

**Cas particuliers à connaître :**

- **ห นำ** — un ห muet devant ง ญ น ม ย ร ล ว fait passer la syllabe en **classe haute** : หมา (mǎa), หนู (nǔu), ให้ (hâi).
- **อ นำ** — un อ muet devant ย dans exactement 4 mots : อย่า, อยู่, อย่าง, อยาก (classe moyenne).
- Les consonnes doubles où la 2e porte le ton : ประ, สบาย…

---

## Annexe C — Les 44 consonnes et leur classe

**Classe moyenne (9)** — la plus simple, elle accepte les 5 tons :
ก จ ฎ ฏ ด ต บ ป อ

**Classe haute (11)** :
ข ฃ ฉ ฐ ถ ผ ฝ ศ ษ ส ห

**Classe basse (24)** :
ค ฅ ฆ ง ช ซ ฌ ญ ฑ ฒ ณ ท ธ น พ ฟ ภ ม ย ร ล ว ฬ ฮ

> Astuce d'apprentissage : on ne mémorise que les **20 lettres** des classes moyenne et haute. Tout le reste est de classe basse par élimination. C'est deux fois moins d'efforts.

Les deux lettres ฃ et ฅ ne sont plus utilisées dans le thaï moderne — on les montre, on ne les fait pas travailler.

---

## Annexe D — Glossaire

| Thaï | Prononcé | Sens |
|---|---|---|
| พยัญชนะ | phá-yan-chá-ná | consonne |
| สระ | sà-rà | voyelle |
| วรรณยุกต์ | wan-ná-yúk | ton / marque de ton |
| หัว | hǔa | la « tête », la petite boucle par où on commence à écrire |
| คำเป็น | kham pen | syllabe vivante |
| คำตาย | kham taai | syllabe morte |
| การันต์ | kaa-ran | le signe ์ qui rend une lettre muette |
| ไม้เอก / ไม้โท | máai èek / máai thoo | les 1re et 2e marques de ton |

---

## Journal des décisions

| Date | Décision | Raison |
|---|---|---|
| 2026-09-10 | Commencer par la lecture, pas par « bonjour merci » | un lecteur autonome progresse 3× plus vite ensuite |
| 2026-09-10 | Contenu 100 % en JSON, hors du code | permet la relecture par une non-développeuse |
| 2026-09-10 | Synthèse vocale d'abord, audio natif ensuite | ne pas bloquer le projet sur la production d'audio |
| 2026-09-10 | Romanisation figée : ɔ ɛ ʉ ə + accents de ton | les accents servent aux tons, donc les voyelles ont besoin de lettres propres |
| 2026-09-10 | Démarrage en fichier HTML unique, sans Node ni Git | apprendre dès cette semaine plutôt que passer une soirée à installer |
| | | |
