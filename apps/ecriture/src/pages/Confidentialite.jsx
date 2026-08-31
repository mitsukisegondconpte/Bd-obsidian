import Layout from '../components/layout/Layout'

export default function Confidentialite() {
  return (
    <Layout>
      <div className="mx-auto max-w-2xl px-4 pb-16 pt-8 text-sm leading-relaxed text-zinc-300 sm:px-6">
        <h1 className="text-2xl font-extrabold text-zinc-50">Politique de confidentialité</h1>
        <p className="mt-1 text-xs text-zinc-500">Dernière mise à jour : 31 août 2026</p>

        <p className="mt-6">
          Cette politique couvre les trois plateformes Hypercube Obsidian — Lecture &amp; BD, Écriture et
          Communauté — qui partagent un même compte utilisateur et une même base de données. Créer un compte
          sur l'une de ces plateformes te donne accès aux trois.
        </p>

        <h2 className="mt-8 text-lg font-bold text-zinc-100">1. Données que nous collectons</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5">
          <li>Informations de compte : adresse email, nom d'utilisateur, nom affiché, mot de passe (jamais stocké en clair — géré par notre fournisseur d'authentification, Supabase).</li>
          <li>Si tu te connectes avec Google : ton nom, ton adresse email et ta photo de profil telles que fournies par Google.</li>
          <li>Contenu que tu publies : séries, œuvres, chapitres, commentaires, messages dans les communautés, avatar, biographie.</li>
          <li>Données d'usage : pages consultées, séries de régularité (lecture/écriture/communauté), badges obtenus, abonnements et likes.</li>
        </ul>

        <h2 className="mt-8 text-lg font-bold text-zinc-100">2. Comment nous utilisons ces données</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5">
          <li>Faire fonctionner le service : afficher ton contenu, tes abonnements, tes notifications.</li>
          <li>Personnaliser ton expérience : recommandations, classements, séries de régularité, badges.</li>
          <li>Assurer la sécurité et la modération de la plateforme.</li>
          <li>Te contacter pour des communications essentielles liées à ton compte (jamais de marketing sans ton accord).</li>
        </ul>

        <h2 className="mt-8 text-lg font-bold text-zinc-100">3. Partage des données</h2>
        <p className="mt-2">
          Nous ne vendons aucune donnée personnelle. Tes données sont hébergées par Supabase (base de données
          et authentification). Si tu utilises la connexion Google, Google traite les informations nécessaires
          à cette authentification selon sa propre politique de confidentialité. Le contenu que tu publies
          publiquement (séries, œuvres, messages de communauté) est visible par les autres utilisateurs, comme
          prévu par la nature du service.
        </p>

        <h2 className="mt-8 text-lg font-bold text-zinc-100">4. Sécurité</h2>
        <p className="mt-2">
          Les échanges avec nos serveurs sont chiffrés (HTTPS). L'accès aux données en base est protégé par des
          règles de sécurité au niveau des lignes (row-level security) : chaque utilisateur ne peut modifier que
          son propre contenu.
        </p>

        <h2 className="mt-8 text-lg font-bold text-zinc-100">5. Tes droits</h2>
        <p className="mt-2">
          Tu peux à tout moment modifier ton profil, et nous contacter pour demander l'accès, la correction ou
          la suppression de tes données personnelles, y compris la suppression complète de ton compte.
        </p>

        <h2 className="mt-8 text-lg font-bold text-zinc-100">6. Âge minimum</h2>
        <p className="mt-2">
          Le service est destiné aux personnes âgées d'au moins 13 ans. Si tu as moins de 13 ans, merci de ne
          pas créer de compte.
        </p>

        <h2 className="mt-8 text-lg font-bold text-zinc-100">7. Modifications</h2>
        <p className="mt-2">
          Cette politique peut évoluer. Les changements importants seront annoncés sur la plateforme.
        </p>

        <h2 className="mt-8 text-lg font-bold text-zinc-100">8. Contact</h2>
        <p className="mt-2">
          Pour toute question sur cette politique ou tes données personnelles :{' '}
          <a href="mailto:contact@hypercube-obsidian.com" className="text-accent hover:underline">
            contact@hypercube-obsidian.com
          </a>
        </p>
      </div>
    </Layout>
  )
}
