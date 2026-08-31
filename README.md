# Hypercube Obsidian — monorepo des 3 plateformes

Trois plateformes distinctes, un seul compte utilisateur partagé (Supabase).
Voir `database/README.md` pour l'architecture complète (pourquoi 3
déploiements séparés, comment ils partagent la même base, etc.).

## Applications

| App | Statut | URL | Description |
|-----|--------|-----|-------------|
| `apps/lecture` | Déployé, branché sur Supabase | https://bd-obsidian-lecture.vercel.app | BD / webtoons : publication, lecture en scroll vertical, chapitres payants |
| `apps/ecriture` | Déployé, branché sur Supabase | https://bd-obsidian-ecriture.vercel.app | Écriture façon Wattpad : romans/light novels, images de couverture, service d'édition |
| `apps/communaute` | Branché sur Supabase, pas encore déployé | — | Réseau social : canaux, communautés de fans |

Chaque app affiche un sélecteur "Plateformes Hypercube" (icône grille dans
la navbar) qui pointe vers les 2 autres — les redirections inter-plateformes
du doc client sont réelles.

## Lancer un projet

```bash
npm install                 # à la racine — installe les 3 workspaces d'un coup
cp .env.example .env.local  # remplir avec les clés Supabase (déjà pré-remplies pour ce projet)

npm run dev:lecture         # http://localhost:5173
npm run dev:ecriture        # http://localhost:5174
npm run dev:communaute      # http://localhost:5175
```

Les 3 apps lisent le **même** `.env.local` à la racine (voir `envDir` dans
chaque `vite.config.js`) — c'est ce qui garantit qu'un compte créé sur l'une
fonctionne sur les autres.

## Stack commune

- React 19 + React Router, Tailwind CSS v4 (`@tailwindcss/vite`), lucide-react
- Mobile-first, un accent de couleur différent par plateforme (violet /
  ambre / corail) pour les distinguer visuellement tout en restant famille Hypercube
- Supabase (PostgreSQL + Auth + Storage) — voir `database/` et
  `supabase/migrations/` pour le schéma

## `apps/lecture` — BD / webtoons

Branché pour de vrai sur Supabase (auth, base) — voir `apps/lecture/src/api/`
pour les requêtes. Les couvertures/planches restent des visuels générés
localement (pas de vrai artwork à héberger pour l'instant), mais les séries,
chapitres, auteurs, abonnements, likes, commentaires et achats de chapitres
sont de vraies lignes en base.

- `/` — Accueil : hero, tendances, nouveautés, grille populaire, auteurs
- `/serie/:slug` — Page série : couverture, résumé, chapitres, abonnement
- `/serie/:slug/chapitre/:chapterId` — Lecture d'un chapitre en scroll vertical, achat de chapitre simulé
- `/profil/:username` — Profil auteur
- `/connexion`, `/inscription` — Authentification Supabase (email/mot de passe)

Fonctionnalités ajoutées au-delà du brief client : "Tendance"/"Nouveau"
calculés depuis les vraies vues/dates de publication (pas des drapeaux
figés), compteur de vues incrémenté à chaque visite.

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

## `apps/communaute` — réseau social

Branché sur Supabase, même auth que les 2 autres.

- `/`, `/canaux`, `/communautes` — Découverte
- `/canal/:channelId` — Canal (façon chaîne WhatsApp) : posts, abonnement
- `/communaute/:communityId` — Communauté : posts, membres, rejoindre, signaler
- `/creer-canal` — Réservé aux auteurs (vérifié côté base, pas juste côté UI)
- `/creer-communaute` — Ouvert à tous, avec option "lier à mon œuvre"
- `/profil/:username` — Profil unifié : agrège séries (plateforme 1) et
  œuvres (plateforme 2) du même compte, avec liens directs vers les 2 autres apps

Fonctionnalités ajoutées au-delà du brief client : un utilisateur devient
auteur automatiquement (et débloque la création de canal) dès qu'il publie
une série ou une œuvre ailleurs ; une communauté créée par l'auteur pour sa
propre œuvre est certifiée automatiquement ; accepter un repêchage
(plateforme 2) poste une annonce sur le canal de l'auteur (plateforme 3).
