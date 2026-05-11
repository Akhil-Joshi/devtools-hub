import TimestampClient from "./TimestampClient";
import AdSenseAd from "../components/AdSenseAd";

export const metadata = {
  title: "Timestamp Converter Online (Unix to Date)",
  description:
    "Convert Unix timestamps to human readable date and vice versa with this free developer tool.",
};

export default function Page() {
  return (
    <main className="min-h-screen px-4 py-10 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Timestamp Converter</h1>

      <p className="text-gray-600 mb-6">
        Convert Unix timestamps to readable dates instantly.
      </p>
      <AdSenseAd label="Timestamp top" />
      <TimestampClient />
      <AdSenseAd label="Timestamp bottom" />
    </main>
  );
}
