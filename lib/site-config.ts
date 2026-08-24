export const siteConfig = {
  name: "Time Card Calculator",
  url: (process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") || "https://time-card-calculator.work"),
} as const;
