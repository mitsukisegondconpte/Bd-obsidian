import { ShieldCheck } from 'lucide-react'
import Layout from '../components/layout/Layout'

function Section({ number, title, children }) {
  return (
    <section>
      <div className="flex items-center gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-extrabold text-accent">
          {number}
        </span>
        <h2 className="text-base font-bold text-zinc-100">{title}</h2>
      </div>
      <div className="mt-2 space-y-2 pl-10 text-sm leading-relaxed text-zinc-400">{children}</div>
    </section>
  )
}

export default function Confidentialite() {
  return (
    <Layout>
      <div className="mx-auto max-w-2xl px-4 pb-16 pt-10 sm:px-6">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15">
            <ShieldCheck size={26} className="text-accent" />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold text-zinc-50">Politique de confidentialité</h1>
          <p className="mt-1 text-sm text-zinc-500">Hypercube World — plateforme de création, publication et lecture</p>
          <p className="mt-1 text-xs text-zinc-600">En vigueur depuis le 31 août 2026</p>
        </div>

        <div className="mt-10 space-y-8">
          <Section number="1" title="Objet">
            <p>
              Cette politique explique comment Hypercube collecte, utilise, conserve et protège les informations
              relatives aux utilisateurs de Hypercube World. La plateforme permet notamment de créer un profil
              d'auteur, publier des œuvres, lire des œuvres, commenter, aimer, suivre des comptes et, selon les
              fonctionnalités disponibles, acheter certains contenus ou services.
            </p>
          </Section>

          <Section number="2" title="Statut des utilisateurs et auteurs">
            <p>
              Tout utilisateur autorisé à publier peut être présenté comme auteur sur la plateforme. Ce statut ne
              signifie pas que l'utilisateur est membre, salarié, représentant ou affilié de HOS ou de Bohio Mag.
              Cette politique ne crée aucun lien d'affiliation éditoriale.
            </p>
          </Section>

          <Section number="3" title="Informations collectées">
            <ul className="list-disc space-y-1.5 pl-4">
              <li>Compte : nom ou pseudonyme, adresse e-mail, identifiants de connexion, langue, photo ou avatar.</li>
              <li>Œuvres : titres, textes, chapitres, couvertures, images, catégories et informations de publication.</li>
              <li>Interactions : commentaires, likes, abonnements, signalements, favoris, historique de lecture.</li>
              <li>Transactions : informations nécessaires au traitement d'un achat ou d'un service d'édition.</li>
              <li>Données techniques : adresse IP, appareil, navigateur, journaux de connexion et de sécurité.</li>
              <li>Communications : messages envoyés au support.</li>
            </ul>
          </Section>

          <Section number="4" title="Finalités">
            <ul className="list-disc space-y-1.5 pl-4">
              <li>Créer et administrer les comptes, publier et afficher les œuvres et profils.</li>
              <li>Permettre les commentaires, likes, abonnements et autres interactions.</li>
              <li>Fournir les achats et services demandés.</li>
              <li>Prévenir la fraude, les abus, le spam et les atteintes aux droits d'auteur.</li>
              <li>Assurer la sécurité, la maintenance et l'amélioration technique du service.</li>
              <li>Répondre aux obligations légales et aux demandes légitimes des autorités compétentes.</li>
            </ul>
          </Section>

          <Section number="5" title="Données rendues publiques">
            <p>
              Une œuvre publiée, un pseudonyme, une image de profil, des commentaires, likes et abonnements peuvent
              être visibles par d'autres utilisateurs. Évite de publier dans ton profil ou tes œuvres des
              informations personnelles que tu ne souhaites pas rendre publiques.
            </p>
          </Section>

          <Section number="6" title="Contenu des œuvres">
            <p>
              Les œuvres sont des contenus créés par les utilisateurs. Hypercube peut les stocker, afficher,
              sécuriser, modérer et indexer afin de faire fonctionner la plateforme, sans jamais devenir
              propriétaire des droits d'auteur des utilisateurs.
            </p>
          </Section>

          <Section number="7" title="Interconnexion avec les autres plateformes Hypercube">
            <p>
              Les services Hypercube sont techniquement interconnectés (même compte utilisateur). Des informations
              limitées peuvent être échangées lorsque cela est nécessaire à l'authentification, la sécurité ou les
              redirections entre plateformes. Être auteur sur Hypercube World ne suffit pas à attribuer à une
              personne le statut d'auteur HOS ou Bohio Mag.
            </p>
          </Section>

          <Section number="8" title="Partage avec des prestataires">
            <p>
              Hypercube fait appel à Vercel (hébergement de l'application) et Supabase (base de données,
              authentification et stockage des fichiers) pour faire fonctionner le service. Ces prestataires ne
              reçoivent que les informations techniquement nécessaires à leurs fonctions.
            </p>
          </Section>

          <Section number="9" title="Conservation">
            <p>
              Les données sont conservées tant que le compte reste actif. En cas de suppression du compte, les
              données personnelles sont supprimées dans un délai raisonnable, sous réserve des obligations légales,
              de la sécurité et de la résolution d'éventuels litiges.
            </p>
          </Section>

          <Section number="10" title="Sécurité">
            <p>
              Les échanges avec nos serveurs sont chiffrés (HTTPS). L'accès aux données en base est protégé par des
              règles de sécurité au niveau des lignes (row-level security) : chaque utilisateur ne peut modifier que
              son propre contenu. Aucun système connecté à Internet ne peut toutefois être garanti totalement
              sécurisé.
            </p>
          </Section>

          <Section number="11" title="Droits et demandes">
            <p>
              Tu peux demander à tout moment l'accès, la correction ou la suppression de tes données personnelles,
              y compris la suppression complète de ton compte, en écrivant à{' '}
              <a href="mailto:hypercubofficial@gmail.com" className="font-semibold text-accent hover:underline">
                hypercubofficial@gmail.com
              </a>
              .
            </p>
          </Section>

          <Section number="12" title="Cookies">
            <p>
              Seuls des cookies techniques essentiels sont utilisés (maintien de la session via Supabase Auth,
              préférence de langue). Hypercube World n'utilise actuellement aucun outil d'analyse ou de publicité
              tiers.
            </p>
          </Section>

          <Section number="13" title="Âge minimum">
            <p>Le service est destiné aux personnes âgées d'au moins 13 ans.</p>
          </Section>

          <Section number="14" title="Modifications">
            <p>
              Cette politique peut évoluer avec le service. La version en vigueur est toujours celle publiée sur
              cette page.
            </p>
          </Section>
        </div>

        <div className="mt-10 rounded-2xl border border-white/10 bg-surface-1 p-5 text-center">
          <p className="text-sm font-semibold text-zinc-200">Une question sur cette politique ou tes données ?</p>
          <a
            href="mailto:hypercubofficial@gmail.com"
            className="mt-1.5 inline-block text-sm font-bold text-accent hover:underline"
          >
            hypercubofficial@gmail.com
          </a>
        </div>
      </div>
    </Layout>
  )
}
