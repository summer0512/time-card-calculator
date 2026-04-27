import { use } from "react";
import HeadInfo from "@/components/head-info";
import TimeCardCalculator from "@/components/time-card-calculator";
import Link from "next/link";
import { toolCalculators } from "@/lib/tool-calculators";

const relatedGuides = [
  {
    title: "How to Use a Time Card Calculator with Lunch",
    href: "/guides/time-card-calculator-with-lunch"
  },
  {
    title: "How to Calculate Time Card Breaks",
    href: "/guides/time-card-calculator-with-breaks"
  },
  {
    title: "Biweekly Time Card Guide",
    href: "/guides/biweekly-time-card-calculator"
  }
];

export default function Home(props: { params: Promise<{ locale: string }> }) {
  const params = use(props.params);

  return (
    <div>
      <HeadInfo
        locale={params.locale}
        page=""
        title="Free Time Card Calculator with Lunch Breaks & Overtime"
        description="Calculate weekly or biweekly work hours with lunch breaks, multiple in/out punches, overtime totals, and printable timesheets."
        keywords="free time card calculator, time card calculator with lunch, biweekly time card calculator, timesheet calculator, work hours calculator, overtime calculator"
        ogImageAlt="Free time card calculator dashboard preview"
      />

      <main className="py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 2xl:px-8">
          <section className="mb-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Free Time Card Calculator</h1>
            <p className="text-lg text-gray-600 mt-2">
              Calculate weekly or biweekly work hours with lunch breaks, multiple in/out punches, overtime, and printable timesheets.
            </p>
          </section>

          <TimeCardCalculator
            mode="time-card"
            defaultBreakMinutes={30}
            showLunchBreak
            showMultipleBreaks
            showBiweekly={false}
            showOvertime
            showPrintableTimesheet
            timeFormat="auto"
            labels={{
              start: "Start Time",
              end: "End Time",
              break: "Break",
              lunch: "Lunch",
              day: "Day"
            }}
          />

          <section className="mt-8 bg-white rounded-lg border p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Popular Time Card Calculators</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {toolCalculators.map((tool) => (
                <article key={tool.slug} className="border rounded-lg p-4 hover:border-blue-500 transition-colors">
                  <h3 className="text-lg font-semibold text-gray-900">{tool.title}</h3>
                  <p className="text-sm text-gray-600 mt-2">{tool.metaDescription}</p>
                  <Link href={`/${tool.slug}`} className="inline-block mt-3 text-blue-600 hover:text-blue-700 font-medium">
                    Open calculator
                  </Link>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-6 bg-white rounded-lg border p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Why Use This Calculator?</h2>
            <ul className="space-y-2 text-gray-700 list-disc list-inside">
              <li>Free to use with no sign-in required.</li>
              <li>Works with lunch breaks and multiple break columns.</li>
              <li>Supports weekly and biweekly totals.</li>
              <li>Handles multiple in/out punch workflows.</li>
              <li>Shows overtime totals by week.</li>
              <li>Includes printable timesheet support.</li>
              <li>Supports 12-hour, 24-hour, and military time entry.</li>
            </ul>
          </section>

          <section className="mt-6 bg-white rounded-lg border p-6 mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Related Guides</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedGuides.map((guide) => (
                <Link
                  key={guide.href}
                  href={guide.href}
                  className="border rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <p className="font-semibold text-gray-900">{guide.title}</p>
                  <p className="text-sm text-gray-600 mt-1">Tutorial and examples with direct links to the matching calculator tool.</p>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
