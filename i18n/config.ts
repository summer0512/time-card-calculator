export const languages = [
  { value: 'en', label: 'English' },
  { value: 'de', label: 'Deutsch' },
  { value: 'pt-br', label: 'Português (Brasil)' },
  { value: 'fr', label: 'Français' },
] as const;

export type SupportedLocale = (typeof languages)[number]['value'];
