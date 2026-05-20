export const languages = [
  { value: 'en', label: 'English' },
  { value: 'de', label: 'Deutsch' },
  { value: 'pt-br', label: 'Português (Brasil)' },
] as const;

export type SupportedLocale = (typeof languages)[number]['value'];
