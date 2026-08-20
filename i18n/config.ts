export const languages = [
  { value: 'en', label: 'English' },
  { value: 'de', label: 'Deutsch' },
  { value: 'pt-br', label: 'Português (Brasil)' },
  { value: 'fr', label: 'Français' },
  { value: 'es', label: 'Español' },
] as const;

export type SupportedLocale = (typeof languages)[number]['value'];
