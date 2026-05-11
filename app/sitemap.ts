import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://your-domain.com";

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
  ];
}
