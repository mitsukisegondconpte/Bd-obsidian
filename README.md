# Hypercube Obsidian — monorepo des 3 plateformes

Trois plateformes distinctes, un seul compte utilisateur partagé (Supabase).
Voir `database/README.md` pour l'architecture complète (pourquoi 3
déploiements séparés, comment ils partagent la même base, etc.).

## Applications

| App | Statut | Description |
|-----|--------|-------------|
| `apps/lecture` | Front-end + données mockées | BD / webtoons : publication, lecture en scroll vertical, chapitres payants |
| `apps/ecriture` | Branché sur Supabase (réel) | Écriture façon Wattpad : romans/light novels, images de couverture, service d'édition |
| `apps/communaute` | À venir | Réseau social : canaux, communautés de fans |

## Lancer un projet

```bash
npm install                 # à la racine — installe les 3 workspaces d'un coup
cp .env.example .env.local  # remplir avec les clés Supabase (déjà pré-remplies pour ce projet)

npm run dev:lecture         # http://localhost:5173
npm run dev:ecriture        # http://localhost:5174
```

Les deux apps lisent le **même** `.env.local` à la racine (voir `envDir`
dans chaque `vite.config.js`) — c'est ce qui garantit qu'un compte créé sur
l'une fonctionne sur l'autre.

## Stack commune

- React 19 + React Router, Tailwind CSS v4 (`@tailwindcss/vite`), lucide-react
- Mobile-first
- Supabase (PostgreSQL + Auth + Storage) — voir `database/` et
  `supabase/migrations/` pour le schéma

## `apps/lecture` — BD / webtoons

Toujours en données mockées (`apps/lecture/src/data/mockData.js`) — pas de
backend branché pour l'instant, volontairement.

- `/` — Accueil : hero, tendances, nouveautés, grille populaire, auteurs
- `/serie/:slug` — Page série : couverture, résumé, chapitres, abonnement
- `/serie/:slug/chapitre/:chapterId` — Lecture d'un chapitre en scroll vertical
- `/profil/:authorId` — Profil auteur

## `apps/ecriture` — écriture façon Wattpad

Branché pour de vrai sur Supabase (auth, base, storage) — voir
`apps/ecriture/src/api/` pour les requêtes.

- `/`, `/explorer` — Découverte des œuvres (romans / light novels)
- `/oeuvre/:workId` — Page œuvre : chapitres, suivre l'auteur
- `/oeuvre/:workId/chapitre/:chapterId` — Lecture (police serif, reprise de lecture automatique)
- `/creer`, `/oeuvre/:workId/nouveau-chapitre` — Créer une œuvre / un chapitre (brouillon ou publié)
- `/mes-oeuvres` — Tableau de bord auteur (+ propositions de repêchage Hypercube/Bohio Mag)
- `/edition` — Service d'édition (3 niveaux, crédits gratuits)
- `/connexion`, `/inscription` — Authentification Supabase (email/mot de passe)

Fonctionnalités ajoutées au-delà du brief client (proposées et
implémentées) : tags libres, brouillon/publié par chapitre, reprise de
lecture, listes de lecture.
