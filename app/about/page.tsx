export const metadata = {
  title: "About DevTools Hub",
  description:
    "Learn about DevTools Hub, a free collection of online developer tools for everyday use.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-10">
      <h1 className="mb-4 text-3xl font-bold">About DevTools Hub</h1>

      <p className="mb-4 text-gray-600">
        DevTools Hub is a free collection of simple, fast, and reliable online
        tools built for developers, students, and professionals.
      </p>

      <p className="mb-4 text-gray-600">
        Our goal is to make everyday development tasks easier — whether you are
        formatting JSON, encoding Base64, generating UUIDs, or converting
        timestamps.
      </p>

      <h2 className="mt-6 mb-2 text-xl font-semibold">What We Offer</h2>
      <ul className="list-disc pl-6 text-gray-600">
        <li>Fast and lightweight browser-based tools</li>
        <li>No login or signup required</li>
        <li>Free access to all utilities</li>
        <li>Privacy-focused — your data stays in your browser</li>
      </ul>

      <h2 className="mt-6 mb-2 text-xl font-semibold">Our Mission</h2>
      <p className="text-gray-600">
        We aim to provide a growing collection of developer tools that are easy
        to use, accessible, and efficient for everyday workflows.
      </p>
    </main>
  );
}
