import { ScrollText } from 'lucide-react'
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

export default function ConditionsUtilisation() {
  return (
    <Layout>
      <div className="mx-auto max-w-2xl px-4 pb-16 pt-10 sm:px-6">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15">
            <ScrollText size={26} className="text-accent" />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold text-zinc-50">Conditions d'utilisation</h1>
          <p className="mt-1 text-sm text-zinc-500">Hypercube Realms — réseau communautaire, canaux et communautés</p>
          <p className="mt-1 text-xs text-zinc-600">En vigueur depuis le 31 août 2026</p>
        </div>

        <div className="mt-10 space-y-8">
          <Section number="1" title="Objet">
            <p>
              Ces conditions encadrent l'utilisation de Hypercube Realms, destiné à organiser les échanges autour
              d'œuvres sélectionnées et des univers HOS et Bohio Mag.
            </p>
          </Section>

          <Section number="2" title="Accès et comptes">
            <p>
              Participer aux communautés ne signifie pas que tu deviens auteur, membre ou représentant de HOS ou
              de Bohio Mag.
            </p>
          </Section>

          <Section number="3" title="Objet des canaux">
            <p>
              Les canaux sont des espaces de publication et de suivi créés par les auteurs autour des œuvres HOS,
              Bohio Mag et des œuvres actuellement dans le Top 10 de Hypercube World. Ils servent à publier des
              annonces et actualités liées à l'œuvre.
            </p>
          </Section>

          <Section number="4" title="Objet des communautés de fans">
            <p>
              Une communauté est un espace collectif créé par un utilisateur autour d'une œuvre ou d'un univers
              éligible, fonctionnant comme un groupe de fans avec publications et discussions.
            </p>
          </Section>

          <Section number="5" title="Approbation et mention « validée »">
            <p>
              Hypercube peut refuser, suspendre ou retirer une communauté qui ne respecte pas ces conditions. La
              mention « validée » peut être attribuée puis retirée selon des critères tels que l'activité, la
              durée d'existence, ou le lien avec l'auteur de l'œuvre concernée.
            </p>
          </Section>

          <Section number="6" title="Règles de conduite">
            <ul className="list-disc space-y-1.5 pl-4">
              <li>Respecte les autres membres et les auteurs.</li>
              <li>Ne harcèle, ne menace et n'intimide personne.</li>
              <li>N'usurpe l'identité de personne, ni d'Hypercube, HOS ou Bohio Mag.</li>
              <li>Ne publie pas de spam, de fraude ou de contenu illégal.</li>
              <li>Respecte les règles spécifiques de chaque canal ou communauté.</li>
            </ul>
          </Section>

          <Section number="7" title="Propriété intellectuelle">
            <p>
              Tu restes responsable des contenus que tu publies et dois disposer des droits nécessaires. Tu
              accordes à Hypercube une licence limitée et nécessaire pour héberger et afficher tes publications
              au sein de Hypercube Realms, sans transfert automatique de propriété.
            </p>
          </Section>

          <Section number="8" title="Œuvres HOS, Bohio Mag et Top 10">
            <p>
              La présence d'une œuvre ou d'une communauté sur Hypercube Realms ne signifie pas que tous les
              utilisateurs qui la suivent sont affiliés à HOS ou Bohio Mag.
            </p>
          </Section>

          <Section number="9" title="Redirections">
            <p>
              Hypercube Realms peut contenir des liens vers les autres sites Hypercube ou des services autorisés,
              qui peuvent avoir leurs propres conditions et politiques.
            </p>
          </Section>

          <Section number="10" title="Modération et signalements">
            <p>
              Hypercube peut supprimer, masquer ou modérer une publication, un canal ou une communauté en cas de
              violation des règles. Tu peux signaler un contenu directement depuis la page concernée ou en
              écrivant à{' '}
              <a href="mailto:hypercubofficial@gmail.com" className="font-semibold text-accent hover:underline">
                hypercubofficial@gmail.com
              </a>
              .
            </p>
          </Section>

          <Section number="11" title="Suspension">
            <p>
              Un compte ou une communauté peut être suspendu en cas de violation grave ou répétée, fraude,
              harcèlement ou atteinte aux droits d'auteur.
            </p>
          </Section>

          <Section number="12" title="Disponibilité et responsabilité">
            <p>
              Le service peut être interrompu pour maintenance ou évolution technique. Les utilisateurs restent
              responsables de leurs publications et interactions.
            </p>
          </Section>

          <Section number="13" title="Droit applicable">
            <p>Ces conditions sont régies par le droit applicable en République d'Haïti.</p>
          </Section>

          <Section number="14" title="Modifications">
            <p>Hypercube peut modifier ces conditions pour tenir compte de l'évolution de la plateforme.</p>
          </Section>
        </div>

        <div className="mt-10 rounded-2xl border border-white/10 bg-surface-1 p-5 text-center">
          <p className="text-sm font-semibold text-zinc-200">Une question sur ces conditions ?</p>
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
