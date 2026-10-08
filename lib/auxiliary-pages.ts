// These pages have English content only; localized copies are not published.
export const auxiliaryPages = ["contact", "privacy", "terms"] as const;

export const isAuxiliaryPage = (page: string) =>
  auxiliaryPages.some((value) => value === page);
