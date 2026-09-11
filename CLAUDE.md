# Instructions projet — thai-fr

Application d'apprentissage du thaï pour francophones. Ce fichier dit comment travailler dans ce dépôt.
La référence complète (programme, cahier des charges, roadmap) est dans **`docs/PROJET-THAI.md`** — à lire
avant toute décision de contenu ou d'architecture.

## Règle n°1 — le contenu ne vit jamais dans le code

Tout le cours est dans `content/*.json`. `src/app.js` ne contient que de la logique.
Ajouter une leçon, un mot ou une lettre ne doit **jamais** demander de toucher au JavaScript.
Si une fonctionnalité oblige à écrire du contenu dans le code, c'est le design de la donnée qui est à revoir.

## Structure

```
index.html            page unique
src/app.css           styles
src/app.js            moteur : stockage, répétition espacée, audio, syllabes, rendu
content/letters.json  les 44 consonnes
content/vowels.json   les voyelles enseignées
content/tones.json    la table des tons (Annexe B) : marques + règles par classe
content/clusters.json les groupes consonantiques อักษรควบแท้ (§0.14) : liste fermée, sans exception
content/lots.json     le découpage en lots
content/glyphs.json   tracés SVG + position de la boucle (GÉNÉRÉ — ne pas éditer à la main)
assets/fonts/         Noto Sans Thai Looped (apprentissage) + Noto Sans Thai (lecture)
scripts/              outils de développement
docs/PROJET-THAI.md   document de fondation
```

## Lancer le projet

```bash
node scripts/serve.mjs          # depuis la racine du dépôt (ou : python3 -m http.server 8123)
# puis http://localhost:8123
```

Un serveur est nécessaire : la page charge `content/*.json` par `fetch`, ce que `file://` interdit.

## Vérifier le contenu

```bash
node scripts/validate-content.mjs
```

À lancer après **toute** modification de `content/`. Le script vérifie : les 44 consonnes présentes et
uniques, les classes valides, les sons initiaux/finaux renseignés, la correspondance avec `glyphs.json`,
la cohérence des lots.

## Régénérer les tracés de lettres

```bash
pip install fonttools brotli
python3 scripts/extract-glyphs.py
```

À relancer seulement si on change de police ou si on ajoute des caractères.

## Conventions de contenu

- **Romanisation** : système « lisible par un francophone », figé — `ɔ ɛ ʉ ə` pour les voyelles,
  accents pour les tons (`a` moyen · `á` haut · `à` bas · `â` descendant · `ǎ` montant).
  Voir `docs/PROJET-THAI.md` Annexe A. **Ne jamais en changer** : tout le contenu déjà écrit en dépend.
- **Classes de tons** : `moyenne`, `haute`, `basse` — en français, en minuscules.
- **Son final** : la chaîne `—` quand la lettre ne peut pas être en fin de syllabe.
- **Rien n'est publié sans relecture native** : tout mot ou phrase ajouté porte
  `reviewed: { by, date, ok }` et reste invisible tant que `ok` est faux (cf. §5.6 du doc de fondation).

## Conventions de code

- JavaScript classique, sans framework, sans étape de build, sans dépendance npm.
  C'est un choix : le projet doit rester ouvrable et modifiable dans dix ans.
- Pas de `onclick` en HTML : toutes les interactions passent par `data-act="action:argument"`
  et le gestionnaire unique en bas de `app.js`.
- Toute écriture de progression passe par `Storage` — jamais d'appel direct à `localStorage` ailleurs.
  C'est ce point unique qui permettra de brancher une base en ligne sans toucher au reste.
- Le français est la langue de l'interface, des commentaires et des noms de variables métier.

## Ce qu'il ne faut pas faire

- Ajouter une bibliothèque pour un problème qu'on peut résoudre en 30 lignes.
- Mettre des paroles de chansons complètes dans le dépôt (question de droits — extraits courts seulement).
- Casser le format d'export de la progression sans écrire de migration : c'est la progression réelle
  de l'utilisateur, il n'y a pas de sauvegarde serveur.
- Enrichir l'app avant que le contenu du niveau en cours soit complet et relu.
