import URLClient from "./URLClient";
import AdSenseAd from "../components/AdSenseAd";

export const metadata = {
  title: "URL Encoder & Decoder Online Tool",
  description:
    "Encode and decode URLs instantly for free. Perfect for developers working with query strings.",
};

export default function Page() {
  return (
    <main className="min-h-screen px-4 py-10 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">URL Encoder / Decoder</h1>

      <p className="text-gray-600 mb-6">Encode or decode URLs instantly.</p>
      <AdSenseAd label="URL encoder top" />
      <URLClient />
      <AdSenseAd label="URL encoder bottom" />
    </main>
  );
}
