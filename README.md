# Hypercube Obsidian — aperçu front-end

Aperçu visuel (front-end uniquement) d'une plateforme de publication de BD /
webtoons : les auteurs publient des chapitres en scroll vertical, les
lecteurs parcourent, lisent et s'abonnent aux œuvres. Chapitres gratuits et
payants.

Aucun backend n'est branché — toutes les données viennent de
`src/data/mockData.js`, et tous les visuels (couvertures, bannières,
avatars, planches de lecture) sont générés localement en SVG
(`src/utils/placeholders.js`), sans dépendance à un service d'images
externe.

## Lancer le projet

```bash
npm install
npm run dev
```

## Stack

- React 19 + React Router
- Tailwind CSS v4 (via `@tailwindcss/vite`)
- lucide-react pour les icônes
- Mobile-first — le layout est pensé pour une lecture au téléphone en
  premier, le desktop en second

## Pages

- `/` — Accueil : hero, tendances, nouveautés, grille populaire, auteurs
- `/serie/:slug` — Page série : couverture, résumé, chapitres, abonnement
- `/serie/:slug/chapitre/:chapterId` — Lecture d'un chapitre : scroll
  vertical, navigation précédent/suivant, palier payant, commentaires
- `/profil/:authorId` — Profil auteur : bio, œuvres, abonnés
- `/explorer`, `/abonnements` — pages secondaires de navigation

## Structure

```
src/
  components/
    layout/   Navbar, barre d'onglets mobile, Layout partagé
    ui/       SeriesCard, ChapterListItem, SubscribeButton, CommentItem...
  data/       Données mockées (séries, auteurs, chapitres, commentaires)
  pages/      Une page par route
  utils/      Générateur de visuels placeholder (SVG, sans réseau)
```

## Brancher le backend plus tard

Toutes les données transitent par `src/data/mockData.js` (séries, auteurs,
chapitres, commentaires) et ses fonctions d'accès (`findSeriesBySlug`,
`findAuthorById`, `getChapterPages`, ...). Pour brancher une API, il suffit
de remplacer ces fonctions par des appels réseau (ou des hooks
React Query/SWR) sans toucher aux composants, qui consomment déjà des
props/formes de données stables.
