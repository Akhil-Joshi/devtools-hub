export const metadata = {
  title: "Contact DevTools Hub",
  description:
    "Get in touch with the DevTools Hub team for support or feedback.",
};

export default function ContactPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-10">
      <h1 className="mb-4 text-3xl font-bold">Contact</h1>

      <p className="mb-4 text-gray-600">
        If you have feedback, suggestions, or encounter any issues while using
        DevTools Hub, feel free to reach out.
      </p>

      <h2 className="mt-6 mb-2 text-xl font-semibold">Email</h2>
      <p className="text-gray-600">📧 akhilesh.akhiljoshi@gmail.com</p>

      <h2 className="mt-6 mb-2 text-xl font-semibold">
        What You Can Contact Us For
      </h2>
      <ul className="list-disc pl-6 text-gray-600">
        <li>Bug reports</li>
        <li>Feature requests</li>
        <li>Tool suggestions</li>
        <li>General feedback</li>
      </ul>

      <p className="mt-6 text-gray-600">
        We typically respond within 24–48 hours.
      </p>
    </main>
  );
}
