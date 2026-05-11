import UUIDClient from "./UUIDClient";
import AdSenseAd from "../components/AdSenseAd";

export const metadata = {
  title: "UUID Generator Online (v4) Free Tool",
  description:
    "Generate random UUIDs instantly with our free online UUID generator tool for developers.",
};

export default function Page() {
  return (
    <main className="min-h-screen px-4 py-10 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">UUID Generator</h1>

      <p className="text-gray-600 mb-6">
        Generate random UUID (v4) instantly for your apps and APIs.
      </p>
      <AdSenseAd label="UUID top" />
      <UUIDClient />
      <AdSenseAd label="UUID bottom" />
      <section className="mt-10">
        <h2 className="text-xl font-semibold">What is a UUID?</h2>
        <p className="text-gray-600">
          A UUID (Universally Unique Identifier) is a 128-bit identifier used in
          databases and systems to uniquely identify records.
        </p>
      </section>
    </main>
  );
}
