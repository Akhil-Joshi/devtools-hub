export const metadata = {
  title: "Privacy Policy - DevTools Hub",
  description:
    "Read the privacy policy for DevTools Hub and learn how we handle your data.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-10">
      <h1 className="mb-4 text-3xl font-bold">Privacy Policy</h1>

      <p className="mb-4 text-gray-600">
        At DevTools Hub, we value your privacy. This Privacy Policy explains how
        we handle information when you use our website.
      </p>

      <h2 className="mt-6 mb-2 text-xl font-semibold">
        Information We Collect
      </h2>
      <p className="text-gray-600">
        We do not collect personal data directly. All tools operate in your
        browser, and your data is not stored on our servers.
      </p>

      <h2 className="mt-6 mb-2 text-xl font-semibold">
        Cookies and Advertising
      </h2>
      <p className="text-gray-600">
        We may use third-party advertising services such as Google AdSense.
        These services may use cookies to serve ads based on your visits to this
        and other websites.
      </p>

      <p className="text-gray-600 mt-2">
        Google uses the DoubleClick cookie to enable it and its partners to
        serve ads based on your visit to our site and/or other sites on the
        Internet.
      </p>

      <p className="text-gray-600 mt-2">
        Users may opt out of personalized advertising by visiting the Google Ads
        Settings page.
      </p>

      <h2 className="mt-6 mb-2 text-xl font-semibold">
        Third-Party Privacy Policies
      </h2>
      <p className="text-gray-600">
        DevTools Hub’s Privacy Policy does not apply to other advertisers or
        websites. We advise you to consult the respective privacy policies of
        third-party ad servers for more detailed information.
      </p>

      <h2 className="mt-6 mb-2 text-xl font-semibold">Consent</h2>
      <p className="text-gray-600">
        By using our website, you hereby consent to our Privacy Policy and agree
        to its terms.
      </p>
    </main>
  );
}
