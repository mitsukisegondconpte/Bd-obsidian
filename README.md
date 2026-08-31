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
du doc client sont réelles. **Connexion automatique** : si tu es déjà
connecté et changes de plateforme via ce sélecteur, ton token de session
voyage dans le fragment d'URL (jamais envoyé au serveur, ni visible dans les
logs) vers l'app de destination, qui l'utilise pour ouvrir ta session sans
te redemander tes identifiants — la vérification email/mot de passe ou
Google n'est nécessaire qu'une seule fois, sur la première plateforme.

Google OAuth Console demande un lien de politique de confidentialité et de
conditions d'utilisation : `/confidentialite` et `/conditions-utilisation`
existent sur les 3 apps (contenu réel, à affiner — voir ces pages).

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

**Recherche unifiée** : le champ de recherche de chaque app interroge
d'abord son propre contenu, puis affiche une section "Sur les autres
plateformes Hypercube" (fonction Postgres `global_search`, une seule
requête qui couvre séries, œuvres, communautés, canaux et auteurs à la
fois) avec liens directs vers les 2 autres apps. `apps/communaute` avait
un `/explorer` manquant — ajouté avec la même logique.

**Séries de régularité + badges** : `record_streak_activity()` (RPC
security definer, appelée par le client mais protégée contre
l'auto-triche — un utilisateur ne peut pas écrire directement dans
`user_streaks`) compte les jours consécutifs de lecture, de publication ou
d'activité communautaire — le même compteur "lecture" ou "écriture"
progresse qu'on soit sur `lecture` ou `ecriture`, puisque c'est le même
compte. Des badges (`badges`/`user_badges`) se débloquent à 3/7/30 jours,
plus un badge "Premier pas" à la première publication. Affichés sur le
profil (les 3 apps).

**Classement hebdomadaire** (`/classement`, icône trophée) : nouveaux
abonnés des 7 derniers jours par série/œuvre/communauté/canal (fonctions
`top_*_weekly`, réutilisent `follows`/`community_members` existants — pas
de nouvelle table de séries temporelles), plus un classement "Top
créateurs Hypercube" commun aux 3 apps (BD et écriture confondues, même
compte).

**Français / Kreyòl** : bascule FR/HT dans la navbar des 3 apps
(`LanguageContext`, préférence mémorisée en local). Couvre le chrome
partagé — navigation, recherche, connexion/inscription — le contenu publié
par les utilisateurs (séries, œuvres, posts) reste dans la langue de son
auteur, il n'est pas traduit automatiquement.

## Panels admin

Chaque app a son propre `/admin` (icône bouclier dans la navbar,
visible seulement si `profile.is_platform_admin` — même compte, donc le
statut admin est valable partout à la fois). Choix délibéré plutôt
qu'une 4ᵉ app séparée : l'admin agit directement là où vit le contenu
qu'il modère, sans jongler entre déploiements, et ça évite un 4ᵉ projet
Vercel à maintenir pour une surface qui n'a pas de public propre.

Fondation commune aux 3 (`admin_set_profile_flags`, voir
`supabase/migrations/20260831100000_admin_profile_management.sql`) :
une fonction RPC security-definer est désormais le seul moyen d'accorder
auteur/éditeur/admin ou de suspendre un compte — les colonnes privilégiées
de `profiles` restent verrouillées côté client (cf. la faille corrigée
plus haut), la fonction vérifie elle-même que l'appelant est admin.
Un compte suspendu voit un écran dédié à la place de l'app.

- **`apps/lecture`** — tableau de bord (utilisateurs/séries/chapitres/vues/
  revenus), gestion des utilisateurs, modération des séries (suppression),
  gestion des genres.
- **`apps/ecriture`** — tableau de bord, utilisateurs, modération des
  œuvres, **catalogue d'images en vente** (upload, prix, suppression —
  avant cette session n'importe quel compte pouvait injecter une image
  "catalogue" avec un prix arbitraire, corrigé au niveau RLS), demandes
  d'images sur-mesure, demandes d'édition (auto-assignation), et
  déclenchement de propositions de repêchage vers la plateforme lecture.
- **`apps/communaute`** — tableau de bord, utilisateurs, modération des
  communautés et des canaux (suppression), signalements (déjà existant,
  intégré au hub).

Modération de contenu (suppression) disponible pour un admin sur :
séries, chapitres, œuvres, chapitres d'œuvre, canaux, communautés,
commentaires, posts de communauté, posts de canal — voir
`supabase/migrations/20260831101000_admin_content_moderation.sql`.
Plusieurs de ces policies de suppression n'existaient tout simplement pas
avant (même le propriétaire ne pouvait pas supprimer son propre post de
communauté ou de canal, par exemple).

⚠️ **Sécurité** : `supabase/migrations/20260831062000_fix_profiles_privilege_escalation.sql`
corrige une faille où n'importe quel utilisateur connecté pouvait
s'auto-attribuer `is_platform_admin` (aucune colonne n'était protégée par
la policy RLS d'update — corrigé au niveau des GRANT/REVOKE de colonnes,
pas seulement RLS). Toutes les fonctions internes (triggers) ont aussi
été retirées de l'API publique (`get_advisors` de Supabase est propre à
part 2 faux positifs documentés dans leurs migrations respectives —
`increment_series_views` et `decrement_edition_credit` sont
volontairement publiques et déjà auto-protégées).

**Performance base de données** : les 54 policies RLS appelant
`auth.uid()` directement ont été réécrites en `(select auth.uid())`
(Postgres l'évalue une fois par requête au lieu d'une fois par ligne —
correction recommandée par Supabase, voir
`20260831083000_optimize_rls_auth_uid_calls.sql`), les 2 policies UPDATE
redondantes sur `communities` fusionnées en une, et un index ajouté sur
les 25 colonnes de clé étrangère qui n'en avaient pas. Toutes vérifiées
avec des comptes jetables avant/après — comportement RLS identique,
juste plus rapide.

**Reste à faire manuellement (réglage Dashboard, pas de tool SQL pour ça)** :
Authentication → Policies → activer "Leaked password protection"
(vérifie les mots de passe contre HaveIBeenPwned).

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

Branché pour de vrai sur Supabase (auth, base, storage) — voir
`apps/lecture/src/api/` pour les requêtes. Séries, chapitres, planches,
auteurs, abonnements, likes, commentaires et achats de chapitres sont de
vraies lignes en base ; les couvertures/planches uploadées par un auteur
sont de vrais fichiers dans Storage (buckets `series-covers` et
`chapter-pages`). Une couverture générée localement sert de secours quand
l'auteur n'en fournit pas.

- `/` — Accueil : hero, tendances, nouveautés, grille populaire, auteurs
- `/serie/:slug` — Page série : couverture, résumé, chapitres, abonnement
- `/serie/:slug/chapitre/:chapterId` — Lecture d'un chapitre en scroll vertical, achat de chapitre simulé
- `/profil/:username` — Profil auteur (+ vitrine cross-plateforme : œuvres/communautés/canaux du même compte sur les 2 autres apps, badges, séries de régularité)
- `/mes-series`, `/creer-serie`, `/serie/:slug/ajouter-chapitre` — Panel auteur : créer une série, y ajouter des chapitres (upload des planches, page par page, réordonnables)
- `/classement` — Top séries et top créateurs Hypercube de la semaine
- `/connexion`, `/inscription` — Authentification Supabase (email/mot de passe)

Fonctionnalités ajoutées au-delà du brief client : "Tendance"/"Nouveau"
calculés depuis les vraies vues/dates de publication (pas des drapeaux
figés), compteur de vues incrémenté à chaque visite, hero d'accueil en
carrousel (les séries les plus vues défilent automatiquement, swipe manuel
possible) avec une transition "hexagone qui se déforme" reprenant le
langage visuel du logo, panel auteur complet (n'importe quel compte
connecté peut créer une série et publier des chapitres — le flip
`is_author` est automatique via trigger Postgres, aucune validation manuelle
requise).

Aucune donnée de démonstration n'est seedée en base — la plateforme
démarre vide et affiche un état vide propre tant qu'aucun auteur n'a publié.

## `apps/ecriture` — écriture façon Wattpad

Branché pour de vrai sur Supabase (auth, base, storage) — voir
`apps/ecriture/src/api/` pour les requêtes.

- `/`, `/explorer` — Découverte des œuvres (romans / light novels)
- `/oeuvre/:workId` — Page œuvre : chapitres, suivre l'auteur
- `/oeuvre/:workId/chapitre/:chapterId` — Lecture (police serif, reprise de lecture automatique)
- `/creer`, `/oeuvre/:workId/nouveau-chapitre` — Créer une œuvre / un chapitre (brouillon ou publié)
- `/mes-oeuvres` — Tableau de bord auteur (+ propositions de repêchage Hypercube)
- `/profil/:username` — Vitrine cross-plateforme (séries/communautés/canaux), badges, séries de régularité
- `/classement` — Top œuvres et top créateurs Hypercube de la semaine
- `/edition` — Service d'édition (3 niveaux, crédits gratuits)
- `/connexion`, `/inscription` — Authentification Supabase (email/mot de passe + Google OAuth)

Fonctionnalités ajoutées au-delà du brief client (proposées et
implémentées) : tags libres, brouillon/publié par chapitre, reprise de
lecture, listes de lecture, bandeau d'accueil explicatif qui se referme
tout seul après 10s (ou au clic sur fermer).

## `apps/communaute` — réseau social

Branché sur Supabase, même auth que les 2 autres.

- `/`, `/explorer`, `/canaux`, `/communautes` — Découverte
- `/canal/:channelId` — Canal à sens unique (façon chaîne WhatsApp) : seul
  le propriétaire publie, mais avec image (bucket `channel-media`) ; les
  abonnés peuvent liker, partager sur les réseaux sociaux (Web Share API /
  copier le lien), ou repartager directement dans un de leurs groupes de
  fans — contrairement aux groupes, les canaux supportent les médias
- `/communaute/:communityId` — Communauté : discussion de groupe façon WhatsApp
  (bulles, répondre à un message précis, mentionner `@pseudo` avec notification
  et autocomplétion, mais sans partage de médias — comme un groupe WhatsApp
  texte seul), membres, rejoindre, signaler
- `/creer-canal` — Réservé aux auteurs (vérifié côté base, pas juste côté UI)
- `/creer-communaute` — Ouvert à tous, avec option "lier à mon œuvre"
- `/profil/:username` — Profil unifié : agrège séries (plateforme 1),
  œuvres (plateforme 2) et communautés créées ici, avec liens directs vers
  les 2 autres apps, badges et séries de régularité
- `/classement` — Top communautés, top canaux et top créateurs Hypercube de la semaine
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
