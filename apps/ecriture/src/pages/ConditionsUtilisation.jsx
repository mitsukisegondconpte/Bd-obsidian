import Layout from '../components/layout/Layout'

export default function ConditionsUtilisation() {
  return (
    <Layout>
      <div className="mx-auto max-w-2xl px-4 pb-16 pt-8 text-sm leading-relaxed text-zinc-300 sm:px-6">
        <h1 className="text-2xl font-extrabold text-zinc-50">Conditions d'utilisation</h1>
        <p className="mt-1 text-xs text-zinc-500">
          Plateforme ouverte de création, publication et lecture — Hypercube / HOS, Haïti
        </p>
        <p className="mt-1 text-xs font-semibold text-amber-400">
          Version de travail — à faire valider juridiquement avant mise en ligne.
        </p>

        <h2 className="mt-8 text-lg font-bold text-zinc-100">1. Objet et acceptation</h2>
        <p className="mt-2">
          Les présentes Conditions régissent l'accès et l'utilisation de cette plateforme d'Hypercube
          (« Plateforme »). En créant un compte, en publiant une œuvre ou en utilisant la Plateforme,
          l'utilisateur reconnaît avoir pris connaissance des présentes Conditions et les accepter, sous
          réserve des droits impératifs qui lui sont applicables.
        </p>

        <h2 className="mt-8 text-lg font-bold text-zinc-100">2. Nature de la Plateforme</h2>
        <p className="mt-2">
          La Plateforme fonctionne selon un modèle ouvert inspiré des plateformes de publication
          communautaire : les utilisateurs peuvent créer des ouvrages, notamment des romans et light novels,
          éventuellement accompagnés d'images, puis les publier pour permettre leur lecture et leur
          interaction par d'autres utilisateurs.
        </p>

        <h2 className="mt-8 text-lg font-bold text-zinc-100">3. Le statut d'auteur sur la Plateforme</h2>
        <p className="mt-2">
          Tout utilisateur autorisé à publier est un auteur de la Plateforme au sens fonctionnel. Cette
          qualité est indépendante de HOS et de Bohio Mag. La publication sur la Plateforme ne constitue ni
          une signature avec HOS/Bohio Mag, ni une admission dans leurs équipes, ni une reconnaissance
          automatique comme auteur officiel.
        </p>

        <h2 className="mt-8 text-lg font-bold text-zinc-100">4. Liberté créative et principes fondamentaux</h2>
        <p className="mt-2">
          Les auteurs disposent d'une large liberté créative et peuvent explorer les genres, styles, univers
          et thèmes qu'ils souhaitent. Toutefois, la Plateforme est exploitée dans un environnement dont les
          règles fondamentales sont inspirées des principes HOS suivants :
        </p>
        <ul className="mt-2 list-disc space-y-1.5 pl-5">
          <li>
            <span className="font-semibold text-zinc-100">Amour (Agapé / Charité)</span> : encourager l'amour
            du prochain, la patience, le pardon, l'intérêt d'autrui et une conduite fondée sur un amour
            intentionnel et non malveillant.
          </li>
          <li>
            <span className="font-semibold text-zinc-100">Foi / Connaissance</span> : valoriser la
            compréhension, l'apprentissage, la recherche de connaissances et la construction réfléchie des
            convictions.
          </li>
          <li>
            <span className="font-semibold text-zinc-100">Vérité</span> : valoriser la sincérité, les
            connaissances fondées sur la vérité et éviter la diffusion volontairement mensongère ou trompeuse.
          </li>
          <li>
            <span className="font-semibold text-zinc-100">Justice</span> : promouvoir le bien, dénoncer le
            mal, favoriser une moralité élevée et traiter les personnes de manière équitable.
          </li>
        </ul>
        <p className="mt-2">
          Ces principes constituent des règles de fonctionnement et de modération de la Plateforme. Ils
          n'impliquent pas que chaque utilisateur soit membre ou adhérent de HOS. Les utilisateurs restent
          libres d'explorer leurs propres univers créatifs dans les limites des présentes Conditions.
        </p>

        <h2 className="mt-8 text-lg font-bold text-zinc-100">5. Compte</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5">
          <li>L'utilisateur doit fournir des informations exactes dans la mesure nécessaire à la création du compte.</li>
          <li>Il est responsable de la confidentialité de ses identifiants.</li>
          <li>Il ne doit pas usurper l'identité d'une autre personne ni utiliser un compte pour tromper les utilisateurs.</li>
          <li>Hypercube peut demander une vérification lorsque cela est nécessaire à la sécurité ou à la prévention des abus.</li>
        </ul>

        <h2 className="mt-8 text-lg font-bold text-zinc-100">6. Publication des œuvres</h2>
        <p className="mt-2">
          L'auteur conserve, sous réserve des droits de tiers et de la loi applicable, ses droits sur ses
          œuvres. Il garantit qu'il dispose des droits nécessaires pour publier les textes, images, couvertures
          et autres contenus qu'il fournit.
        </p>
        <p className="mt-2">
          En publiant, l'auteur accorde à Hypercube une licence non exclusive, mondiale et nécessaire au
          fonctionnement de la Plateforme pour héberger, reproduire techniquement, formater, afficher,
          distribuer à la demande des utilisateurs, sauvegarder et promouvoir l'œuvre sur les espaces et
          fonctionnalités liés à la Plateforme. Cette licence cesse selon les modalités de retrait du contenu,
          sous réserve des copies techniques, obligations légales et autres droits contractuellement acquis.
        </p>

        <h2 className="mt-8 text-lg font-bold text-zinc-100">7. Contenus interdits ou susceptibles d'être retirés</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5">
          <li>Contenus dont l'utilisateur ne détient pas les droits nécessaires.</li>
          <li>Usurpation, fraude, escroquerie, spam ou manipulation artificielle des statistiques.</li>
          <li>Menaces, harcèlement ciblé, intimidation ou incitation à la violence.</li>
          <li>Contenus illégaux ou visant à faciliter une activité illégale.</li>
          <li>Contenus volontairement trompeurs lorsqu'ils sont utilisés pour nuire, frauder ou manipuler.</li>
          <li>Contenus incompatibles avec les principes fondamentaux de la Plateforme ou portant gravement atteinte à son environnement communautaire.</li>
          <li>Contenus portant atteinte aux droits, à la dignité ou à la sécurité d'autrui.</li>
          <li>Contenus soumis à des restrictions particulières qui ne respectent pas les règles de la Plateforme.</li>
        </ul>

        <h2 className="mt-8 text-lg font-bold text-zinc-100">8. Modération</h2>
        <p className="mt-2">
          Hypercube peut examiner, limiter, masquer, démonétiser, retirer ou supprimer un contenu lorsqu'il
          estime raisonnablement qu'il viole les présentes Conditions, les règles de la Plateforme, les droits
          de tiers ou le droit applicable. Selon la gravité, Hypercube peut également suspendre ou fermer le
          compte.
        </p>

        <h2 className="mt-8 text-lg font-bold text-zinc-100">9. Commentaires et interactions</h2>
        <p className="mt-2">
          Les commentaires, likes, abonnements et autres interactions doivent rester conformes aux règles de
          conduite. Hypercube peut modérer les interactions sans garantir qu'il détectera immédiatement toute
          violation.
        </p>

        <h2 className="mt-8 text-lg font-bold text-zinc-100">10. Images et ressources visuelles</h2>
        <p className="mt-2">
          Les images fournies par la Plateforme peuvent être gratuites ou payantes selon leur licence.
          L'utilisateur doit respecter les conditions applicables à chaque ressource. Une commande d'image
          personnalisée peut être organisée avec Hypercube ou un prestataire désigné, notamment via une
          messagerie externe. Les conditions, prix, délais et droits d'utilisation doivent être convenus avant
          paiement.
        </p>

        <h2 className="mt-8 text-lg font-bold text-zinc-100">11. Services d'édition</h2>
        <p className="mt-2">
          Hypercube peut proposer plusieurs niveaux d'édition. Les avantages, limites, essais gratuits, tarifs
          et modalités peuvent évoluer.
        </p>
        <ul className="mt-2 list-disc space-y-1.5 pl-5">
          <li>
            <span className="font-semibold text-zinc-100">Édition niveau 1</span> : lecture de l'œuvre et
            retour général sur les corrections, ajouts et améliorations à envisager ; quatre éditions peuvent
            être offertes gratuitement au lancement selon les règles commerciales en vigueur.
          </li>
          <li>
            <span className="font-semibold text-zinc-100">Édition niveau 2</span> : accompagnement plus
            approfondi, avec essai gratuit limité selon l'offre ; l'éditeur peut fournir une liste de
            corrections puis échanger avec l'auteur afin de proposer des conseils personnalisés.
          </li>
          <li>
            <span className="font-semibold text-zinc-100">Édition niveau 3</span> : service réservé aux
            personnes intégrant les structures concernées selon les modalités d'Hypercube, HOS ou Bohio Mag.
          </li>
        </ul>

        <h2 className="mt-8 text-lg font-bold text-zinc-100">12. Sélection par HOS ou Bohio Mag</h2>
        <p className="mt-2">
          Une œuvre publiée sur la Plateforme peut attirer l'attention de HOS ou de Bohio Mag. Une prise de
          contact ne constitue pas automatiquement une sélection ni un contrat. Si l'auteur accepte une
          proposition, les conditions de transfert, de republication, d'édition, de rémunération et de
          propriété des droits devront être définies dans un accord distinct.
        </p>
        <p className="mt-2">
          Lorsqu'une œuvre est effectivement transférée vers une plateforme officielle HOS ou Bohio Mag, elle
          peut être retirée de cette Plateforme conformément à l'accord conclu et au fonctionnement décrit par
          Hypercube. Les modalités concernant les chapitres déjà écrits ou déjà lus et leur gratuité devront
          être précisées dans l'offre ou le contrat concerné.
        </p>

        <h2 className="mt-8 text-lg font-bold text-zinc-100">13. Classement et Top 10</h2>
        <p className="mt-2">
          Hypercube peut établir un classement des œuvres. Les critères peuvent inclure la lecture,
          l'engagement, la qualité, la régularité, les évaluations, les signalements ou d'autres indicateurs.
          Faire partie du Top 10 ne garantit pas une sélection par HOS ou Bohio Mag.
        </p>

        <h2 className="mt-8 text-lg font-bold text-zinc-100">14. Plateforme communautaire</h2>
        <p className="mt-2">
          Les fonctions communautaires de la plateforme communautaire Hypercube sont distinctes. Les canaux et
          communautés de cette plateforme sont réservés aux œuvres HOS, Bohio Mag et aux œuvres éligibles
          sélectionnées parmi les dix meilleures œuvres de cette Plateforme, selon les règles de la plateforme
          communautaire.
        </p>

        <h2 className="mt-8 text-lg font-bold text-zinc-100">15. Paiements</h2>
        <p className="mt-2">
          Les prix sont affichés avant l'achat lorsque la fonctionnalité est disponible. Les modalités de
          paiement, taxes éventuelles, remboursements et frais seront précisés au moment de la transaction
          et/ou dans les conditions commerciales applicables.
        </p>

        <h2 className="mt-8 text-lg font-bold text-zinc-100">16. Propriété intellectuelle d'Hypercube</h2>
        <p className="mt-2">
          Les marques, logos, interfaces, éléments graphiques, logiciels, textes originaux et autres éléments
          appartenant à Hypercube ou à ses concédants restent protégés. Aucun droit n'est transféré à
          l'utilisateur au-delà du droit limité d'utiliser le service.
        </p>

        <h2 className="mt-8 text-lg font-bold text-zinc-100">17. Signalements</h2>
        <p className="mt-2">
          Toute personne peut signaler un contenu ou un comportement contraire aux règles à [E-MAIL /
          FORMULAIRE]. Les signalements abusifs ou volontairement faux peuvent eux-mêmes faire l'objet de
          mesures.
        </p>

        <h2 className="mt-8 text-lg font-bold text-zinc-100">18. Disponibilité</h2>
        <p className="mt-2">
          La Plateforme peut être temporairement indisponible pour maintenance, mise à jour, incident
          technique, sécurité ou événement indépendant de la volonté d'Hypercube.
        </p>

        <h2 className="mt-8 text-lg font-bold text-zinc-100">19. Suspension et fermeture</h2>
        <p className="mt-2">
          Hypercube peut suspendre ou fermer un compte en cas de violation grave ou répétée, fraude, atteinte
          à la sécurité, atteinte aux droits de tiers ou nécessité légale. Lorsque cela est raisonnablement
          possible, l'utilisateur peut être informé du motif.
        </p>

        <h2 className="mt-8 text-lg font-bold text-zinc-100">20. Limitation de responsabilité</h2>
        <p className="mt-2">
          Dans la mesure permise par le droit applicable, Hypercube ne garantit pas l'exactitude, la
          disponibilité permanente ou la qualité de chaque contenu publié par les utilisateurs. Les auteurs
          restent responsables de leurs œuvres et de leurs droits sur celles-ci.
        </p>

        <h2 className="mt-8 text-lg font-bold text-zinc-100">21. Droit applicable et règlement des litiges</h2>
        <p className="mt-2">
          Les présentes Conditions sont destinées à être régies par le droit applicable en République d'Haïti,
          sous réserve des règles impératives éventuellement applicables à l'utilisateur. Les modalités
          précises de juridiction, médiation ou règlement amiable devront être validées juridiquement et
          complétées.
        </p>

        <h2 className="mt-8 text-lg font-bold text-zinc-100">22. Modifications</h2>
        <p className="mt-2">
          Hypercube peut modifier les présentes Conditions. Les modifications importantes seront portées à la
          connaissance des utilisateurs par un moyen approprié. La poursuite de l'utilisation après l'entrée
          en vigueur des nouvelles Conditions vaut acceptation dans la mesure permise par le droit applicable.
        </p>

        <h2 className="mt-8 text-lg font-bold text-zinc-100">23. Contact</h2>
        <p className="mt-2">
          [DÉNOMINATION JURIDIQUE]
          <br />
          [ADRESSE EN HAÏTI]
          <br />
          [E-MAIL JURIDIQUE]
          <br />
          [DATE D'ENTRÉE EN VIGUEUR]
        </p>

        <div className="mt-8 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-amber-400">
            Informations à compléter avant publication
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-zinc-300">
            <li>Dénomination juridique exacte de l'entité exploitante</li>
            <li>Adresse officielle en Haïti</li>
            <li>Adresse e-mail de contact / support / juridique</li>
            <li>Date d'entrée en vigueur</li>
            <li>Prestataire(s) de paiement</li>
            <li>Prestataire(s) d'hébergement et sous-traitants techniques</li>
            <li>Outils d'analyse, cookies et technologies similaires effectivement utilisés</li>
            <li>Durées de conservation définitives</li>
            <li>Règles d'âge/minimum légal retenues par Hypercube</li>
          </ul>
        </div>
      </div>
    </Layout>
  )
}
