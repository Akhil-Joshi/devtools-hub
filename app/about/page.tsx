export const metadata = {
  title: "About DevTools Hub",
  description:
    "Learn about DevTools Hub, a collection of free online developer tools.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-10">
      <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-950 dark:text-slate-50">
        About DevTools Hub
      </h1>

      <p className="text-slate-600 dark:text-slate-400">
        DevTools Hub is a collection of fast, simple browser-based utilities for
        developers working with data formats, encodings, identifiers, timestamps,
        and URLs.
      </p>
    </main>
  );
}
