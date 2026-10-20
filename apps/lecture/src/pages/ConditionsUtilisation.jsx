import Layout from '../components/layout/Layout'

export default function ConditionsUtilisation() {
  return (
    <Layout>
      <div className="mx-auto max-w-2xl px-4 pb-16 pt-8 text-sm leading-relaxed text-zinc-300 sm:px-6">
        <h1 className="text-2xl font-extrabold text-zinc-50">Conditions d'utilisation</h1>
        <p className="mt-1 text-xs text-zinc-500">Dernière mise à jour : 31 août 2026</p>

        <p className="mt-6">
          Ces conditions s'appliquent aux trois plateformes Hypercube Obsidian — Lecture &amp; BD, Écriture et
          Communauté — qui partagent un même compte. En créant un compte, tu acceptes ces conditions sur les
          trois plateformes à la fois.
        </p>

        <h2 className="mt-8 text-lg font-bold text-zinc-100">1. Le service</h2>
        <p className="mt-2">
          Hypercube Obsidian permet de publier et lire des bandes dessinées/webtoons, des romans, et
          d'échanger au sein de communautés de fans. Le service est fourni "tel quel", en développement actif.
        </p>

        <h2 className="mt-8 text-lg font-bold text-zinc-100">2. Ton compte</h2>
        <p className="mt-2">
          Tu es responsable de la confidentialité de tes identifiants et de toute activité effectuée depuis
          ton compte. Les informations fournies à l'inscription doivent être exactes.
        </p>

        <h2 className="mt-8 text-lg font-bold text-zinc-100">3. Contenu publié</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5">
          <li>Tu conserves tous les droits sur le contenu que tu publies (séries, œuvres, chapitres, messages).</li>
          <li>En le publiant, tu nous accordes le droit de l'héberger et de l'afficher sur les plateformes Hypercube Obsidian, dans le seul but de fournir le service.</li>
          <li>Tu es seul responsable du contenu que tu publies et garantis détenir les droits nécessaires (illustrations, textes, etc.).</li>
          <li>Contenu interdit : contenu illégal, haineux, harcelant, plagié, ou portant atteinte aux droits d'un tiers.</li>
        </ul>

        <h2 className="mt-8 text-lg font-bold text-zinc-100">4. Modération</h2>
        <p className="mt-2">
          Nous nous réservons le droit de retirer un contenu, suspendre ou supprimer un compte qui enfreint ces
          conditions, sans préavis en cas d'infraction grave.
        </p>

        <h2 className="mt-8 text-lg font-bold text-zinc-100">5. Chapitres payants</h2>
        <p className="mt-2">
          Pendant la phase actuelle de test, les paiements pour débloquer certains chapitres sont simulés — aucune
          transaction financière réelle n'a lieu. Cela sera clairement indiqué si un système de paiement réel est
          introduit à l'avenir.
        </p>

        <h2 className="mt-8 text-lg font-bold text-zinc-100">6. Propriété de la plateforme</h2>
        <p className="mt-2">
          Le nom Hypercube Obsidian, le logo, et le code des plateformes restent notre propriété. Les présentes
          conditions ne te cèdent aucun droit dessus.
        </p>

        <h2 className="mt-8 text-lg font-bold text-zinc-100">7. Résiliation</h2>
        <p className="mt-2">
          Tu peux demander la suppression de ton compte à tout moment. Nous pouvons résilier ton accès en cas de
          violation de ces conditions.
        </p>

        <h2 className="mt-8 text-lg font-bold text-zinc-100">8. Limitation de responsabilité</h2>
        <p className="mt-2">
          Le service est fourni sans garantie de disponibilité continue. Nous ne sommes pas responsables du
          contenu publié par les utilisateurs.
        </p>

        <h2 className="mt-8 text-lg font-bold text-zinc-100">9. Modifications</h2>
        <p className="mt-2">
          Ces conditions peuvent évoluer. La poursuite de l'utilisation du service après une modification vaut
          acceptation des nouvelles conditions.
        </p>

        <h2 className="mt-8 text-lg font-bold text-zinc-100">10. Contact</h2>
        <p className="mt-2">
          Pour toute question :{' '}
          <a href="mailto:contact@hypercube-obsidian.com" className="text-accent hover:underline">
            contact@hypercube-obsidian.com
          </a>
        </p>
      </div>
    </Layout>
  )
}
