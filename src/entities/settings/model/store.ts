import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type NumberFormat, numberFormatForLanguage } from "@/shared/lib/format-number";
import { detectLanguage, type Language } from "@/shared/lib/i18n";
import { readLegacyTheme } from "@/shared/lib/theme";
import type { AppSettings, EditorSettings, Precision } from "./types";

const DEFAULT_LANGUAGE = detectLanguage();

const DEFAULT_SETTINGS: AppSettings = {
	language: DEFAULT_LANGUAGE,
	numberFormat: numberFormatForLanguage(DEFAULT_LANGUAGE),
	theme: "system",
	font: "geist",
	fontSize: 15,
	editor: {
		lineNumbers: false,
		autosave: true,
		highlightVariable: true,
		autocomplete: true,
		wrap: true,
	},
	welcomeDismissed: false,
};

interface SettingsActions {
	update: (patch: Partial<Omit<AppSettings, "numberFormat" | "editor">>) => void;
	updateNumberFormat: (patch: Partial<NumberFormat>) => void;
	updateEditor: (patch: Partial<EditorSettings>) => void;
	/** Сменить язык; разделители чисел следуют за ним, если пользователь их не менял */
	setLanguage: (language: Language) => void;
	/** Точность «для всех заметок» из быстрого переключателя */
	setGlobalPrecision: (precision: Precision) => void;
}

export const useSettingsStore = create<AppSettings & SettingsActions>()(
	persist(
		(set) => ({
			...DEFAULT_SETTINGS,
			theme: readLegacyTheme() ?? DEFAULT_SETTINGS.theme,
			update: (patch) => set(patch),
			updateNumberFormat: (patch) => set((s) => ({ numberFormat: { ...s.numberFormat, ...patch } })),
			updateEditor: (patch) => set((s) => ({ editor: { ...s.editor, ...patch } })),
			setLanguage: (language) =>
				set((s) => {
					const was = numberFormatForLanguage(s.language);
					const untouched = s.numberFormat.group === was.group && s.numberFormat.decimal === was.decimal;
					const next = numberFormatForLanguage(language);
					return {
						language,
						numberFormat: untouched ? { ...s.numberFormat, group: next.group, decimal: next.decimal } : s.numberFormat,
					};
				}),
			setGlobalPrecision: (precision) =>
				set((s) => ({
					numberFormat:
						precision === "auto"
							? { ...s.numberFormat, mode: "auto" }
							: { ...s.numberFormat, mode: "fixed", digits: precision },
				})),
		}),
		{
			name: "calqnotes-settings",
			version: 1,
			merge: (persisted, current) => {
				const p = (persisted ?? {}) as Partial<AppSettings>;
				// Настройки из версии без выбора языка: приложение тогда было только на русском
				const language = p.language ?? (persisted ? "ru" : current.language);
				return {
					...current,
					...p,
					language,
					numberFormat: { ...numberFormatForLanguage(language), ...p.numberFormat },
					editor: { ...current.editor, ...p.editor },
				};
			},
		},
	),
);
