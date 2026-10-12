import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_NUMBER_FORMAT, type NumberFormat } from "@/shared/lib/format-number";
import { readLegacyTheme } from "@/shared/lib/theme";
import type { AppSettings, EditorSettings, Precision } from "./types";

const DEFAULT_SETTINGS: AppSettings = {
	numberFormat: DEFAULT_NUMBER_FORMAT,
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
				return {
					...current,
					...p,
					numberFormat: { ...current.numberFormat, ...p.numberFormat },
					editor: { ...current.editor, ...p.editor },
				};
			},
		},
	),
);
