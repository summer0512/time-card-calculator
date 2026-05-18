export const languages = [
  { value: 'en', label: 'English' },
  { value: 'de', label: 'Deutsch' },
] as const;

export type SupportedLocale = (typeof languages)[number]['value'];
