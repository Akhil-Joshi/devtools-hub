import TypeScriptGeneratorClient from "./TypeScriptGeneratorClient";
import AdSenseAd from "../components/AdSenseAd";

export const metadata = {
  title: "Free JSON to TypeScript Generator Online | DevTools Hub",
  description:
    "Convert JSON to TypeScript interfaces and types instantly. Free online tool to auto-generate accurate TypeScript definitions from any JSON data.",
};

export default function Page() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-slate-50">
          TypeScript Generator
        </h1>

        <p className="mt-2 max-w-3xl text-slate-600 dark:text-slate-400">
          Paste JSON and instantly generate TypeScript interfaces and type
          definitions.
        </p>
      </div>

      <AdSenseAd label="TypeScript generator top" />
      <TypeScriptGeneratorClient />

      <AdSenseAd label="TypeScript generator bottom" />

      <section className="mt-10 border-t border-slate-200 pt-6 dark:border-slate-800">
        <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-50">
          About TypeScript Generators
        </h2>
        <p className="mt-2 max-w-3xl text-slate-600 dark:text-slate-400">
          TypeScript interfaces provide compile-time type checking for your
          JavaScript code. Generating interfaces from JSON is a common workflow
          when integrating with APIs — this tool analyses your JSON structure and
          produces clean, nested interfaces automatically.
        </p>

        <h3 className="mt-6 text-lg font-semibold text-slate-950 dark:text-slate-50">
          Features
        </h3>
        <ul className="mt-2 list-disc pl-6 text-slate-600 dark:text-slate-400">
          <li>Convert any JSON object or array to TypeScript interfaces</li>
          <li>Supports nested objects and arrays of objects</li>
          <li>Handles mixed-type arrays with union types</li>
          <li>Detects optional fields when merging array items</li>
          <li>Customisable root interface name</li>
          <li>One-click copy to clipboard</li>
        </ul>
      </section>
    </main>
  );
}
