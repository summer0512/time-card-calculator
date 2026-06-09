import HeadInfo from "@/components/head-info";
import { Link } from "@/i18n/routing";

const SITE_URL = "https://time-card-calculator.work";

const faqItems = [
  {
    question: "Comment calculer les heures de travail ?",
    answer:
      "Additionnez la durée de chaque journée de travail, puis soustrayez les pauses non payées pour obtenir le temps net."
  },
  {
    question: "Comment calculer les heures de travail par jour ?",
    answer:
      "Prenez l'heure de fin, retirez l'heure de début, puis enlevez la pause déjeuner ou les pauses non payées."
  },
  {
    question: "Comment calculer des heures de travail sur une semaine ?",
    answer:
      "Cumulez les totaux journaliers de toute la semaine pour obtenir le total hebdomadaire."
  },
  {
    question: "Comment calculer heure de travail avec pause ?",
    answer:
      "Saisissez chaque pause séparément afin que le calculateur retire automatiquement le temps non payé."
  }
] as const;

export default function CommentCalculerHeuresTravailPage() {
  const canonicalUrl = `${SITE_URL}/fr/comment-calculer-heures-travail`;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Accueil",
            item: `${SITE_URL}/fr/`
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Comment calculer les heures de travail",
            item: canonicalUrl
          }
        ]
      },
      {
        "@type": "Article",
        headline: "Comment calculer les heures de travail",
        description:
          "Guide SEO en français pour calculer les heures de travail par jour, par semaine et avec pause.",
        url: canonicalUrl,
        inLanguage: "fr"
      },
      {
        "@type": "FAQPage",
        mainEntity: faqItems.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer
          }
        }))
      }
    ]
  };

  return (
    <div>
      <HeadInfo
        locale="fr"
        page="comment-calculer-heures-travail"
        title="Comment calculer les heures de travail"
        description="Guide SEO en français pour calculer les heures de travail par jour, par semaine et avec pause."
        keywords="comment calculer les heures de travail, comment calculer heure de travail, comment calculer des heures de travail, comment calculer les heures de travail par jour"
        ogType="article"
        ogImageAlt="Comment calculer les heures de travail - guide français"
        structuredData={structuredData}
      />

      <main className="py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-gray-600 mb-6">
            <Link href="/" className="hover:text-blue-600">
              Accueil
            </Link>
            <span className="mx-2">/</span>
            <span>Comment calculer les heures de travail</span>
          </nav>

          <section className="bg-white rounded-2xl border p-8 shadow-sm">
            <p className="text-sm font-semibold text-blue-600 mb-3 uppercase tracking-wide">
              Guide SEO France
            </p>
            <h1 className="text-4xl font-bold text-gray-900 leading-tight">
              Comment calculer les heures de travail
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Si vous cherchez comment calculer les heures de travail, cette page rassemble les méthodes les plus utiles pour le calcul journalier, hebdomadaire et avec pause.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/calcul-temps-de-travail"
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-3 text-white font-medium hover:bg-blue-700 transition-colors"
              >
                Ouvrir le calculateur d'heures
              </Link>
              <Link
                href="/calcul-temps-de-travail-avec-pause"
                className="inline-flex items-center justify-center rounded-md border border-blue-200 bg-blue-50 px-5 py-3 text-blue-700 font-medium hover:bg-blue-100 transition-colors"
              >
                Voir la version avec pause
              </Link>
            </div>
          </section>

          <section className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <article className="bg-white rounded-2xl border p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                Comment calculer les heures de travail par jour ?
              </h2>
              <p className="text-gray-700">
                Prenez l'heure de fin, soustrayez l'heure de début, puis retirez les pauses non payées. Le résultat correspond au temps net travaillé sur la journée.
              </p>
            </article>
            <article className="bg-white rounded-2xl border p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                Comment calculer des heures de travail sur une semaine ?
              </h2>
              <p className="text-gray-700">
                Additionnez les totaux journaliers de chaque jour ouvré. Cette méthode est idéale pour comparer vos heures réelles à votre contrat hebdomadaire.
              </p>
            </article>
            <article className="bg-white rounded-2xl border p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                Comment calculer heure de travail avec pause ?
              </h2>
              <p className="text-gray-700">
                Si vous avez une pause déjeuner ou plusieurs pauses, ajoutez-les séparément pour obtenir un calcul plus précis des heures payées.
              </p>
            </article>
            <article className="bg-white rounded-2xl border p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                Pourquoi cette page est utile ?
              </h2>
              <p className="text-gray-700">
                Elle cible les recherches longue traîne en français et dirige les visiteurs vers le calculateur le plus adapté en un clic.
              </p>
            </article>
          </section>

          <section className="mt-8 bg-white rounded-2xl border p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Questions fréquentes</h2>
            <div className="space-y-5">
              {faqItems.map((faq) => (
                <div key={faq.question} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                  <p className="text-gray-700 mt-1">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Envie de calculer vos heures maintenant ?
            </h2>
            <p className="text-gray-700 mb-4">
              Utilisez le calculateur principal pour vérifier vos heures de travail avec ou sans pause, puis comparez le total hebdomadaire ou mensuel.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md bg-gray-900 px-5 py-3 text-white font-medium hover:bg-gray-800 transition-colors"
            >
              Retour à l'accueil français
            </Link>
          </section>
        </div>
      </main>
    </div>
  );
}
