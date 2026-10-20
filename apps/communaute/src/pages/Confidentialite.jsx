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
          <p className="mt-1 text-sm text-zinc-500">Hypercube Realms — canaux, communautés et redirections</p>
          <p className="mt-1 text-xs text-zinc-600">En vigueur depuis le 31 août 2026</p>
        </div>

        <div className="mt-10 space-y-8">
          <Section number="1" title="Objet">
            <p>
              Cette politique décrit le traitement des données sur Hypercube Realms. Ce service permet de suivre
              des canaux, rejoindre des communautés de fans, publier des contenus communautaires et accéder à des
              redirections vers les autres plateformes Hypercube.
            </p>
          </Section>

          <Section number="2" title="Périmètre des communautés">
            <p>
              Les canaux et communautés sont conçus autour des œuvres de HOS, de Bohio Mag et des œuvres
              actuellement dans le Top 10 hebdomadaire de Hypercube World.
            </p>
          </Section>

          <Section number="3" title="Données collectées">
            <ul className="list-disc space-y-1.5 pl-4">
              <li>Compte : nom/pseudonyme, e-mail, avatar et paramètres.</li>
              <li>Activité : abonnements aux canaux, participation aux communautés, publications, réactions, signalements.</li>
              <li>Données techniques et de sécurité : adresse IP, appareil, navigateur, journaux de connexion.</li>
              <li>Informations liées aux demandes adressées au support et à la modération.</li>
            </ul>
          </Section>

          <Section number="4" title="Finalités">
            <ul className="list-disc space-y-1.5 pl-4">
              <li>Permettre la création, l'administration et la participation aux communautés.</li>
              <li>Gérer les canaux et abonnements, examiner les demandes d'approbation.</li>
              <li>Attribuer et afficher la mention « validée » d'une communauté.</li>
              <li>Prévenir le spam, le harcèlement, la fraude et l'usurpation.</li>
              <li>Permettre les redirections et l'interconnexion avec les autres plateformes Hypercube.</li>
            </ul>
          </Section>

          <Section number="5" title="Communautés et données publiques">
            <p>
              Les publications, commentaires et pseudonymes partagés dans un espace public peuvent être visibles
              par d'autres utilisateurs. Évite de publier des informations personnelles que tu ne souhaites pas
              rendre publiques.
            </p>
          </Section>

          <Section number="6" title="Statut « validée »">
            <p>
              Une communauté peut recevoir la mention « validée » selon des critères tels que sa durée
              d'existence, son activité, ou le fait d'être créée par l'auteur de l'œuvre concernée. Cette mention
              n'est ni une certification officielle ni une garantie absolue sur le contenu.
            </p>
          </Section>

          <Section number="7" title="Interconnexion">
            <p>
              Hypercube Realms peut échanger certaines informations avec les autres plateformes Hypercube pour
              l'authentification, la reconnaissance de statuts nécessaires au fonctionnement, et les
              redirections. Les données échangées restent limitées à ce qui est nécessaire.
            </p>
          </Section>

          <Section number="8" title="Partage avec des prestataires">
            <p>
              Hypercube fait appel à Vercel (hébergement) et Supabase (base de données, authentification et
              stockage) pour faire fonctionner le service. Ces prestataires ne reçoivent que les informations
              techniquement nécessaires à leurs fonctions.
            </p>
          </Section>

          <Section number="9" title="Conservation et sécurité">
            <p>
              Les données sont conservées tant que le compte reste actif, puis supprimées dans un délai
              raisonnable après suppression du compte. Hypercube applique des mesures raisonnables de sécurité
              (chiffrement HTTPS, règles de sécurité au niveau des lignes) sans pouvoir garantir une sécurité
              absolue.
            </p>
          </Section>

          <Section number="10" title="Droits et demandes">
            <p>
              Pour toute demande concernant tes données personnelles, écris à{' '}
              <a href="mailto:hypercubofficial@gmail.com" className="font-semibold text-accent hover:underline">
                hypercubofficial@gmail.com
              </a>
              .
            </p>
          </Section>

          <Section number="11" title="Cookies">
            <p>
              Seuls des cookies techniques essentiels sont utilisés (session, préférence de langue). Hypercube
              Realms n'utilise actuellement aucun outil d'analyse ou de publicité tiers.
            </p>
          </Section>

          <Section number="12" title="Âge minimum">
            <p>Le service est destiné aux personnes âgées d'au moins 13 ans.</p>
          </Section>

          <Section number="13" title="Modifications">
            <p>Hypercube peut mettre à jour cette politique. La version en vigueur est toujours celle publiée ici.</p>
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
