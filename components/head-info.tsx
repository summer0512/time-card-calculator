import { languages } from "@/i18n/config";

const SITE_NAME = "Time Card Calculator";

const ogLocaleMap: Record<string, string> = {
  en: "en_US",
};

const sanitizePageSegment = (value?: string) => {
  if (!value) {
    return "";
  }

  return value.replace(/^\/+|\/+$/g, "");
};

const buildAbsoluteUrl = (base: string, pathOrUrl?: string) => {
  if (!pathOrUrl) {
    return undefined;
  }

  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  const normalizedPath = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;

  if (!base) {
    return normalizedPath;
  }

  return `${base}${normalizedPath}`;
};

interface HeadInfoProps {
  locale: string;
  page?: string;
  title: string;
  description: string;
  keywords: string;
  ogImage?: string;
  ogImageAlt?: string;
  ogType?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  noindex?: boolean;
  structuredData?: Record<string, unknown>;
}

const HeadInfo = ({
  locale,
  page,
  title,
  description,
  keywords,
  ogImage,
  ogImageAlt,
  ogType = "website",
  publishedTime,
  modifiedTime,
  noindex,
  structuredData,
}: HeadInfoProps) => {
  const normalizedBase = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") ?? "";
  const sanitizedPage = sanitizePageSegment(page);

  const buildPath = (targetLocale: string) => {
    const localeSegment = targetLocale === "en" ? "" : `/${targetLocale}`;
    const slugSegment = sanitizedPage ? `/${sanitizedPage}` : "";
    const path = `${localeSegment}${slugSegment}`;
    return path || "/";
  };

  const buildUrl = (targetLocale: string) => {
    const path = buildPath(targetLocale);
    if (!normalizedBase) {
      return path;
    }

    if (path === "/") {
      return `${normalizedBase}/`;
    }

    return `${normalizedBase}${path}`;
  };

  const canonicalUrl = buildUrl(locale);
  const defaultOgImage = ogImage ?? "/og-image.png";
  const ogImageUrl = buildAbsoluteUrl(normalizedBase, defaultOgImage);
  const ogImageAltText = ogImageAlt ?? `${title} | ${SITE_NAME}`;
  const ogLocale = ogLocaleMap[locale] ?? ogLocaleMap.en;
  const alternateOgLocales = languages
    .map((lang) => lang.value)
    .filter((value) => value !== locale)
    .map((value) => ogLocaleMap[value])
    .filter((value): value is string => Boolean(value));
  const robotsContent = noindex ? "noindex, nofollow" : "index, follow";

  let twitterDomain: string | undefined;
  if (normalizedBase) {
    try {
      twitterDomain = new URL(normalizedBase).host;
    } catch (error) {
      twitterDomain = undefined;
    }
  }

  const structuredDataPayload = structuredData ?? (() => {
    const baseData: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": ogType === "article" ? "Article" : "WebPage",
      name: title,
      description,
      url: canonicalUrl,
      inLanguage: locale,
    };

    if (ogImageUrl) {
      baseData.image = ogImageUrl;
    }

    if (ogType === "article") {
      if (publishedTime) {
        baseData.datePublished = publishedTime;
      }

      if (modifiedTime || publishedTime) {
        baseData.dateModified = modifiedTime ?? publishedTime;
      }

      baseData.publisher = {
        "@type": "Organization",
        name: SITE_NAME,
        ...(ogImageUrl
          ? {
              logo: {
                "@type": "ImageObject",
                url: ogImageUrl,
              },
            }
          : {}),
      };
    } else {
      baseData.isPartOf = {
        "@type": "WebSite",
        name: SITE_NAME,
        url: normalizedBase || canonicalUrl,
      };
    }

    return baseData;
  })();

  const structuredDataJson = structuredDataPayload
    ? JSON.stringify(structuredDataPayload).replace(/</g, "\\u003c")
    : undefined;

  const twitterHandle = process.env.NEXT_PUBLIC_TWITTER_HANDLE?.trim();

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={robotsContent} />

      <link rel="canonical" href={canonicalUrl} />
      {languages.map((item) => (
        <link
          key={`${item.value}-alternate`}
          rel="alternate"
          hrefLang={item.value}
          href={buildUrl(item.value)}
        />
      ))}
      <link rel="alternate" hrefLang="x-default" href={buildUrl("en")} />

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:locale" content={ogLocale} />
      {alternateOgLocales.map((value) => (
        <meta key={value} property="og:locale:alternate" content={value} />
      ))}
      {ogImageUrl && (
        <>
          <meta property="og:image" content={ogImageUrl} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:image:type" content="image/png" />
          {ogImageAltText && (
            <meta property="og:image:alt" content={ogImageAltText} />
          )}
        </>
      )}
      {publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {(modifiedTime ?? publishedTime) && (
        <meta
          property="article:modified_time"
          content={modifiedTime ?? publishedTime}
        />
      )}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {twitterDomain && <meta name="twitter:domain" content={twitterDomain} />}
      {ogImageUrl && <meta name="twitter:image" content={ogImageUrl} />}
      {ogImageAltText && <meta name="twitter:image:alt" content={ogImageAltText} />}
      {twitterHandle && <meta name="twitter:site" content={twitterHandle} />}
      {twitterHandle && <meta name="twitter:creator" content={twitterHandle} />}

      {structuredDataJson && (
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: structuredDataJson }}
        />
      )}
    </>
  );
};

export default HeadInfo;
