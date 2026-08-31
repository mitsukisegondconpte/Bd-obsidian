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
          <p className="mt-1 text-sm text-zinc-500">Hypercube World — plateforme de création, publication et lecture</p>
          <p className="mt-1 text-xs text-zinc-600">En vigueur depuis le 31 août 2026</p>
        </div>

        <div className="mt-10 space-y-8">
          <Section number="1" title="Objet et acceptation">
            <p>
              Les présentes conditions régissent l'accès et l'utilisation de Hypercube World. En créant un compte,
              en publiant une œuvre ou en utilisant la plateforme, tu reconnais avoir pris connaissance de ces
              conditions et les accepter.
            </p>
          </Section>

          <Section number="2" title="Nature de la plateforme">
            <p>
              Hypercube World fonctionne selon un modèle ouvert de publication communautaire : les utilisateurs
              peuvent créer des romans et light novels, éventuellement accompagnés d'images, puis les publier pour
              permettre leur lecture et leur interaction par d'autres utilisateurs.
            </p>
          </Section>

          <Section number="3" title="Le statut d'auteur">
            <p>
              Tout utilisateur autorisé à publier est un auteur de la plateforme au sens fonctionnel. Cette qualité
              est indépendante de HOS et de Bohio Mag : publier sur Hypercube World ne constitue ni une signature
              avec eux, ni une admission dans leurs équipes, ni une reconnaissance automatique comme auteur officiel.
            </p>
          </Section>

          <Section number="4" title="Liberté créative et principes fondamentaux">
            <p>
              Les auteurs disposent d'une large liberté créative. La plateforme est toutefois exploitée dans un
              environnement dont les règles de modération s'inspirent des principes HOS suivants :
            </p>
            <ul className="list-disc space-y-1.5 pl-4">
              <li>
                <span className="font-semibold text-zinc-300">Amour</span> — patience, pardon, une conduite fondée
                sur le respect d'autrui.
              </li>
              <li>
                <span className="font-semibold text-zinc-300">Connaissance</span> — valoriser l'apprentissage et la
                construction réfléchie des idées.
              </li>
              <li>
                <span className="font-semibold text-zinc-300">Vérité</span> — sincérité, éviter la diffusion
                volontairement mensongère ou trompeuse.
              </li>
              <li>
                <span className="font-semibold text-zinc-300">Justice</span> — traiter les personnes de manière
                équitable.
              </li>
            </ul>
            <p>Ces principes n'impliquent pas d'adhésion à HOS ; ils encadrent seulement la modération du service.</p>
          </Section>

          <Section number="5" title="Ton compte">
            <ul className="list-disc space-y-1.5 pl-4">
              <li>Fournis des informations exactes lors de la création de ton compte.</li>
              <li>Tu es responsable de la confidentialité de tes identifiants.</li>
              <li>N'usurpe pas l'identité d'une autre personne.</li>
              <li>Hypercube peut demander une vérification en cas de nécessité de sécurité.</li>
            </ul>
          </Section>

          <Section number="6" title="Publication des œuvres">
            <p>
              Tu conserves tes droits sur tes œuvres et garantis détenir les droits nécessaires pour publier les
              textes, images et couvertures fournis. En publiant, tu accordes à Hypercube une licence non exclusive
              et nécessaire au fonctionnement de la plateforme (hébergement, affichage, distribution aux
              utilisateurs), qui cesse selon les modalités de retrait du contenu.
            </p>
          </Section>

          <Section number="7" title="Contenus interdits">
            <ul className="list-disc space-y-1.5 pl-4">
              <li>Contenus dont tu ne détiens pas les droits nécessaires.</li>
              <li>Usurpation, fraude, spam ou manipulation artificielle des statistiques.</li>
              <li>Menaces, harcèlement ciblé ou incitation à la violence.</li>
              <li>Contenus illégaux ou portant gravement atteinte aux droits d'autrui.</li>
            </ul>
          </Section>

          <Section number="8" title="Modération">
            <p>
              Hypercube peut examiner, limiter, masquer ou retirer un contenu qui viole ces conditions, et
              suspendre ou fermer un compte selon la gravité de l'infraction.
            </p>
          </Section>

          <Section number="9" title="Images et services d'édition">
            <p>
              Les images fournies par la plateforme peuvent être gratuites ou payantes selon leur licence. Une
              commande d'image personnalisée peut être organisée directement avec Hypercube. Hypercube propose
              aussi plusieurs niveaux d'édition (retour de lecture, accompagnement approfondi, ou intégration aux
              structures HOS/Bohio Mag) dont les modalités et tarifs peuvent évoluer.
            </p>
          </Section>

          <Section number="10" title="Sélection par HOS ou Bohio Mag">
            <p>
              Une œuvre publiée peut attirer l'attention de HOS ou de Bohio Mag. Une prise de contact ne constitue
              pas automatiquement une sélection ni un contrat : les conditions de transfert, de republication ou de
              rémunération sont toujours définies dans un accord distinct. Si une œuvre est effectivement
              transférée, elle peut être retirée de Hypercube World selon cet accord — l'œuvre n'est jamais
              retirée automatiquement.
            </p>
          </Section>

          <Section number="11" title="Classement, Top 10 et Hypercube Realms">
            <p>
              Hypercube établit un classement hebdomadaire des œuvres selon leur engagement. Les canaux et
              communautés de Hypercube Realms sont réservés aux œuvres HOS, Bohio Mag et aux œuvres actuellement
              dans le Top 10 de Hypercube World. Faire partie du Top 10 ne garantit pas une sélection par HOS ou
              Bohio Mag.
            </p>
          </Section>

          <Section number="12" title="Paiements">
            <p>
              Les prix sont affichés avant l'achat lorsque la fonctionnalité est disponible. Aucun prestataire de
              paiement réel n'est actuellement intégré : les achats sont simulés durant cette phase de test, sans
              transaction financière réelle. Cela sera clairement indiqué si un système de paiement réel est
              introduit.
            </p>
          </Section>

          <Section number="13" title="Propriété intellectuelle d'Hypercube">
            <p>
              Les marques, logos, interfaces et le code de la plateforme restent la propriété d'Hypercube. Ces
              conditions ne cèdent aucun droit dessus au-delà du droit limité d'utiliser le service.
            </p>
          </Section>

          <Section number="14" title="Signalements">
            <p>
              Tu peux signaler un contenu ou un comportement contraire aux règles directement depuis la page
              concernée, ou en écrivant à{' '}
              <a href="mailto:hypercubofficial@gmail.com" className="font-semibold text-accent hover:underline">
                hypercubofficial@gmail.com
              </a>
              . Les signalements volontairement faux peuvent eux-mêmes faire l'objet de mesures.
            </p>
          </Section>

          <Section number="15" title="Disponibilité et responsabilité">
            <p>
              La plateforme peut être temporairement indisponible pour maintenance ou incident technique. Hypercube
              ne garantit pas l'exactitude ou la disponibilité permanente de chaque contenu publié par les
              utilisateurs ; les auteurs restent responsables de leurs œuvres.
            </p>
          </Section>

          <Section number="16" title="Suspension et résiliation">
            <p>
              Hypercube peut suspendre ou fermer un compte en cas de violation grave ou répétée de ces conditions.
              Tu peux demander la suppression de ton compte à tout moment.
            </p>
          </Section>

          <Section number="17" title="Droit applicable">
            <p>
              Ces conditions sont régies par le droit applicable en République d'Haïti, sous réserve des règles
              impératives éventuellement applicables à l'utilisateur.
            </p>
          </Section>

          <Section number="18" title="Modifications">
            <p>
              Hypercube peut modifier ces conditions pour tenir compte de l'évolution du service. La poursuite de
              l'utilisation après une modification vaut acceptation des nouvelles conditions.
            </p>
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
