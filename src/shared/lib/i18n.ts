import i18n from "i18next";
import { initReactI18next } from "react-i18next";

export type Language = "ru" | "en";

export const LANGUAGES: Language[] = ["ru", "en"];

const LOCALES: Record<Language, string> = { ru: "ru-RU", en: "en-US" };

/** Язык браузера: русский для ru-*, иначе английский */
export function detectLanguage(): Language {
	if (typeof navigator === "undefined") return "ru";
	const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
	return langs.some((l) => l?.toLowerCase().startsWith("ru")) ? "ru" : "en";
}

/** Локаль для Intl: даты, время */
export function localeOf(language: string): string {
	return LOCALES[language as Language] ?? LOCALES.en;
}

i18n.use(initReactI18next).init({
	lng: detectLanguage(),
	fallbackLng: "en",
	supportedLngs: LANGUAGES,
	defaultNS: "common",
	// Ключи плоские, точка — часть имени ключа (`error.incomplete`)
	keySeparator: false,
	interpolation: {
		escapeValue: false,
	},
});

export { i18n };

export function injectTranslation(namespace: string, resources: Record<string, Record<string, string>>) {
	for (const [lang, translations] of Object.entries(resources)) {
		i18n.addResourceBundle(lang, namespace, translations, true, true);
	}
}
