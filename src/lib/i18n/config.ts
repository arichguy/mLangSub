export const locales = [
  "zh-CN", "en", "ja", "ko", "es",
  "fr", "de", "pt", "ru", "ar",
  "hi", "th", "vi", "id", "it",
  "tr", "nl", "pl", "uk", "bn",
  "ms",
] as const;

export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "zh-CN";

export const localeLabels: Record<Locale, string> = {
  "zh-CN": "中文(简体)",
  en: "English",
  ja: "日本語",
  ko: "한국어",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  pt: "Português",
  ru: "Русский",
  ar: "العربية",
  hi: "हिन्दी",
  th: "ไทย",
  vi: "Tiếng Việt",
  id: "Bahasa Indonesia",
  it: "Italiano",
  tr: "Türkçe",
  nl: "Nederlands",
  pl: "Polski",
  uk: "Українська",
  bn: "বাংলা",
  ms: "Bahasa Melayu",
};

export const localeNames: Record<Locale, string> = {
  "zh-CN": "简体中文",
  en: "English",
  ja: "日本語",
  ko: "한국어",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  pt: "Português",
  ru: "Русский",
  ar: "العربية",
  hi: "हिन्दी",
  th: "ไทย",
  vi: "Tiếng Việt",
  id: "Bahasa Indonesia",
  it: "Italiano",
  tr: "Türkçe",
  nl: "Nederlands",
  pl: "Polski",
  uk: "Українська",
  bn: "বাংলা",
  ms: "Bahasa Melayu",
};
