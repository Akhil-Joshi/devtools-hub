import Base64Client from "./Base64Client";
import AdSenseAd from "../components/AdSenseAd";

export const metadata = {
  title: "Base64 Encoder & Decoder Online Tool",
  description:
    "Encode and decode Base64 strings instantly with our free online developer tool.",
};

export default function Page() {
  return (
    <main className="min-h-screen px-4 py-10 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Base64 Encoder / Decoder</h1>

      <p className="text-gray-600 mb-6">
        Convert text to Base64 and decode it instantly.
      </p>

      <AdSenseAd label="Base64 top" />
      <Base64Client />
      <AdSenseAd label="Base64 bottom" />

      <section className="mt-10">
        <h2 className="text-xl font-semibold">What is Base64?</h2>
        <p className="text-gray-600">
          Base64 is a binary-to-text encoding scheme used in APIs, email, and
          web systems.
        </p>
      </section>
    </main>
  );
}
