import Link from "next/link";
import AdSenseAd from "./components/AdSenseAd";

export const metadata = {
  title: "DevTools Hub - Free Online Developer Tools",
  description:
    "Free online developer tools for developers: JSON formatter, Base64 encoder, UUID generator, timestamp converter, URL tools and more.",
};

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-10 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold mb-3">
        Free Developer Tools Online 🚀
      </h1>

      <p className="text-gray-600 mb-8">
        Fast, free and simple tools for developers. Format JSON, encode Base64,
        generate UUIDs, convert timestamps and more.
      </p>

      <AdSenseAd label="Home top" />

      {/* TOOL GRID */}
      <div className="grid md:grid-cols-2 gap-5">
        <ToolCard href="/json-formatter" title="JSON Formatter" />
        <ToolCard href="/base64-encoder" title="Base64 Encoder" />
        <ToolCard href="/uuid-generator" title="UUID Generator" />
        <ToolCard href="/timestamp-converter" title="Timestamp Converter" />
        <ToolCard href="/url-encoder" title="URL Encoder/Decoder" />
      </div>

      {/* SEO CONTENT (VERY IMPORTANT) */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-3">What is DevTools Hub?</h2>

        <p className="text-gray-600 mb-4">
          DevTools Hub is a collection of free online developer tools designed
          to speed up your workflow. Whether you are working with APIs,
          debugging data, or converting formats, these tools help you save time.
        </p>

        <h3 className="text-xl font-semibold mb-2">Popular Tools</h3>

        <ul className="list-disc pl-6 text-gray-600">
          <li>JSON Formatter & Validator</li>
          <li>Base64 Encode / Decode</li>
          <li>UUID Generator</li>
          <li>Timestamp Converter</li>
          <li>URL Encoder / Decoder</li>
        </ul>
      </section>

      <AdSenseAd label="Home bottom" />
    </main>
  );
}

function ToolCard({ href, title }: { href: string; title: string }) {
  return (
    <Link
      href={href}
      className="p-5 border rounded-xl hover:shadow-md transition"
    >
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-gray-500 text-sm mt-1">Open tool →</p>
    </Link>
  );
}
