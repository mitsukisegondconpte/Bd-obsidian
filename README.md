# Hypercube Obsidian — monorepo des 3 plateformes

Trois plateformes distinctes, un seul compte utilisateur partagé (Supabase).
Voir `database/README.md` pour l'architecture complète (pourquoi 3
déploiements séparés, comment ils partagent la même base, etc.).

## Applications

| App | Statut | URL | Description |
|-----|--------|-----|-------------|
| `apps/lecture` | Déployé, branché sur Supabase | https://bd-obsidian-lecture.vercel.app | BD / webtoons : publication, lecture en scroll vertical, chapitres payants |
| `apps/ecriture` | Déployé, branché sur Supabase | https://bd-obsidian-ecriture.vercel.app | Écriture façon Wattpad : romans/light novels, images de couverture, service d'édition |
| `apps/communaute` | Déployé, branché sur Supabase | https://bd-obsidian-communaute.vercel.app | Réseau social : canaux, communautés de fans |

Chaque app affiche un sélecteur "Plateformes Hypercube" (icône grille dans
la navbar) qui pointe vers les 2 autres — les redirections inter-plateformes
du doc client sont réelles.

Identité visuelle commune : logo à fond transparent (plus de pastille
blanche dans la navbar), animation de chargement "hypercube qui se déforme
puis se reforme" (`components/ui/BrandLoader.jsx` + `LoadingScreen.jsx`,
dupliqués dans les 3 apps) affichée pendant la vérification de session au
démarrage. Connexion Google OAuth disponible en plus d'email/mot de passe
sur les 3 apps (voir section "Auth Google" plus bas).

**Notifications inter-plateformes** : une cloche dans la navbar (visible
connecté) des 3 apps, alimentée par une seule table `notifications` avec
Realtime activé. Un nouvel abonné sur une série (plateforme 1) ou une
œuvre (plateforme 2), un nouveau chapitre publié, ou un repêchage accepté
génèrent une notification que l'utilisateur voit apparaître en direct —
même s'il est en train d'utiliser une autre des 3 plateformes au moment où
ça se produit. Voir `supabase/migrations/20260831054500_cross_platform_notifications.sql`.

**Profil éditable** (`/profil/modifier`, lien "Modifier le profil" visible
sur son propre profil) : nom affiché, bio, avatar (bucket Storage
`avatars`, même schéma de policy par dossier utilisateur que
`work-covers`). Mot de passe oublié : `/mot-de-passe-oublie` puis
`/reinitialiser-mot-de-passe`, sur les 3 apps. Une page 404 de marque
remplace le blanc qu'affichait toute route non gérée jusqu'ici.

⚠️ **Sécurité** : `supabase/migrations/20260831062000_fix_profiles_privilege_escalation.sql`
corrige une faille où n'importe quel utilisateur connecté pouvait
s'auto-attribuer `is_platform_admin` (aucune colonne n'était protégée par
la policy RLS d'update — corrigé au niveau des GRANT/REVOKE de colonnes,
pas seulement RLS).

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

- React 19 + React Router (routes en `React.lazy`/`Suspense`), Tailwind CSS v4 (`@tailwindcss/vite`), lucide-react
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
figés), compteur de vues incrémenté à chaque visite, hero d'accueil en
carrousel (les séries les plus vues défilent automatiquement, swipe manuel
possible) avec une transition "hexagone qui se déforme" reprenant le
langage visuel du logo.

Aucune donnée de démonstration n'est seedée en base — la plateforme
démarre vide et affiche un état vide propre tant qu'aucun auteur n'a publié.

## `apps/ecriture` — écriture façon Wattpad

Branché pour de vrai sur Supabase (auth, base, storage) — voir
`apps/ecriture/src/api/` pour les requêtes.

- `/`, `/explorer` — Découverte des œuvres (romans / light novels)
- `/oeuvre/:workId` — Page œuvre : chapitres, suivre l'auteur
- `/oeuvre/:workId/chapitre/:chapterId` — Lecture (police serif, reprise de lecture automatique)
- `/creer`, `/oeuvre/:workId/nouveau-chapitre` — Créer une œuvre / un chapitre (brouillon ou publié)
- `/mes-oeuvres` — Tableau de bord auteur (+ propositions de repêchage Hypercube/Bohio Mag)
- `/edition` — Service d'édition (3 niveaux, crédits gratuits)
- `/connexion`, `/inscription` — Authentification Supabase (email/mot de passe + Google OAuth)

Fonctionnalités ajoutées au-delà du brief client (proposées et
implémentées) : tags libres, brouillon/publié par chapitre, reprise de
lecture, listes de lecture, bandeau d'accueil explicatif qui se referme
tout seul après 10s (ou au clic sur fermer).

## `apps/communaute` — réseau social

Branché sur Supabase, même auth que les 2 autres.

- `/`, `/canaux`, `/communautes` — Découverte
- `/canal/:channelId` — Canal (façon chaîne WhatsApp) : posts, abonnement
- `/communaute/:communityId` — Communauté : posts, membres, rejoindre, signaler
- `/creer-canal` — Réservé aux auteurs (vérifié côté base, pas juste côté UI)
- `/creer-communaute` — Ouvert à tous, avec option "lier à mon œuvre"
- `/profil/:username` — Profil unifié : agrège séries (plateforme 1) et
  œuvres (plateforme 2) du même compte, avec liens directs vers les 2 autres apps
- `/admin/signalements` — Réservé à `is_platform_admin` : liste des
  communautés signalées, bouton pour marquer résolu

Fonctionnalités ajoutées au-delà du brief client : un utilisateur devient
auteur automatiquement (et débloque la création de canal) dès qu'il publie
une série ou une œuvre ailleurs ; une communauté créée par l'auteur pour sa
propre œuvre est certifiée automatiquement ; accepter un repêchage
(plateforme 2) poste une annonce sur le canal de l'auteur (plateforme 3) ;
bandeau d'accueil qui se referme tout seul après 10s ; panneau admin pour
traiter les signalements de communautés.

## Auth Google (OAuth)

Les 3 apps exposent un bouton "Continuer/S'inscrire avec Google" sur
`/connexion` et `/inscription` (`context/AuthContext.jsx` →
`signInWithGoogle()`, qui appelle `supabase.auth.signInWithOAuth`). Le code
client est prêt sur les 3 plateformes, mais il faut une configuration
externe côté Supabase/Google que je ne peux pas faire à ta place :

1. Google Cloud Console → créer un OAuth Client ID (type "Web application"),
   avec comme URI de redirection autorisée
   `https://pcbjqxogwbjqcskwygpf.supabase.co/auth/v1/callback` (une seule
   URL ici — Google ne redirige jamais que vers Supabase, jamais directement
   vers une des 3 apps).
2. Supabase Dashboard → Authentication → Providers → Google → coller le
   Client ID et le Client Secret, puis activer le provider.
3. Supabase Dashboard → Authentication → URL Configuration → Redirect URLs
   → ajouter les **3** origines (chaque app appelle `signInWithOAuth` avec
   `redirectTo: window.location.origin`, donc Supabase doit connaître les
   3, pas juste 1 ou 2) :
   - `https://bd-obsidian-lecture.vercel.app/**`
   - `https://bd-obsidian-ecriture.vercel.app/**`
   - `https://bd-obsidian-communaute.vercel.app/**`
   - (en local, ajouter aussi `http://localhost:5173/**`, `:5174`, `:5175`)

Tant que ce n'est pas fait, cliquer sur le bouton Google renverra une
erreur "provider is not enabled" — c'est normal, ça ne dépend pas du code.
Le trigger `handle_new_user` gère déjà les comptes Google (pas de
username/display_name fournis par le formulaire) : il dérive un username
unique depuis l'email ou le nom Google, et récupère nom complet + avatar
depuis les métadonnées que Google fournit automatiquement.
