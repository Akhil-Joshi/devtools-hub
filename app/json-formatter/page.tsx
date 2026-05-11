import JsonFormatterClient from "./JsonFormatterClient";
import AdSenseAd from "../components/AdSenseAd";

export const metadata = {
  title: "Free JSON Formatter & Validator Online",
  description:
    "Format, validate and minify JSON instantly with our free online JSON tool.",
};

export default function Page() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-slate-50">
          JSON Formatter
        </h1>

        <p className="mt-2 max-w-3xl text-slate-600 dark:text-slate-400">
          Format, validate, minify, and inspect JSON as a collapsible tree.
        </p>
      </div>

      <AdSenseAd label="JSON formatter top" />
      <JsonFormatterClient />

      <AdSenseAd label="JSON formatter bottom" />

      <section className="mt-10 border-t border-slate-200 pt-6 dark:border-slate-800">
        <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-50">
          About JSON
        </h2>
        <p className="mt-2 max-w-3xl text-slate-600 dark:text-slate-400">
          JSON is a lightweight data format used in APIs and web apps.
        </p>
      </section>
    </main>
  );
}
