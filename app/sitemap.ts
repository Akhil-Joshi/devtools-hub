import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://devtools-hub-six.vercel.app";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/json-formatter`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/base64-encoder`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/uuid-generator`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/timestamp-converter`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/url-encoder`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/typescript-generator`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
    },
  ];
}