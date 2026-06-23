import { Link } from "@/i18n/routing";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function LocaleNotFound() {
  return (
    <main className="min-h-[calc(100vh-8rem)] bg-gray-50 px-4 py-16">
      <section className="mx-auto flex max-w-2xl flex-col items-center justify-center rounded-2xl border bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">404</p>
        <h1 className="mt-3 text-3xl font-bold text-gray-900">Page not found</h1>
        <p className="mt-4 max-w-lg text-gray-600">
          We couldn’t find this page. It may have been moved, removed, or not yet available in this language.
        </p>
        <Link
          href="/"
          className="mt-8 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Back to home
        </Link>
      </section>
    </main>
  );
}
