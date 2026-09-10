# thai-fr

Apprendre le thaï quand on est francophone : lire d'abord, parler ensuite.

Application autonome, sans dépendance, sans compte, qui fonctionne hors ligne.
Le programme complet et les décisions du projet sont dans [`docs/PROJET-THAI.md`](docs/PROJET-THAI.md).

## Démarrer

1. Ouvrir un terminal dans ce dossier
2. Lancer un serveur local :
   ```bash
   node scripts/serve.mjs
   ```
3. Ouvrir <http://localhost:8123>

> Le double-clic sur `index.html` ne suffit pas : la page charge ses leçons depuis `content/*.json`,
> et les navigateurs bloquent ces lectures en `file://`.

## Ce que fait l'app aujourd'hui (v0.2)

- Les 44 consonnes en 5 lots, débloqués progressivement
- Répétition espacée : l'app redemande chaque élément juste avant l'oubli
- Lecture de syllabes réelles, avec la règle de ton expliquée à chaque réponse
- Tracé des lettres au doigt, départ marqué sur la boucle (หัว)
- Synthèse vocale thaïe quand l'appareil en a une
- Progression sauvegardée localement, exportable en JSON

## Ajouter du contenu

Tout se passe dans `content/`, jamais dans le code :

```bash
# éditer content/letters.json ou content/vowels.json
node scripts/validate-content.mjs      # vérifie la cohérence
```

## Structure

Voir [`CLAUDE.md`](CLAUDE.md) — c'est aussi le fichier que lit Claude Code pour travailler sur le projet.

## Feuille de route

| Version | Contenu |
|---|---|
| v0.1 ✅ | lettres du lot 1, tracé, quiz |
| v0.2 ✅ | 44 consonnes, répétition espacée, lecture de syllabes, audio, export |
| v0.3 | voyelles courtes, les 4 marques de ton, premiers mots |
| v0.4 | vocabulaire A1, phrases, dictionnaire |
| v1.0 | contenu relu par une locutrice native, comptes et synchronisation |
