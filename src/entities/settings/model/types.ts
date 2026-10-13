import type { NumberFormat } from "@/shared/lib/format-number";
import type { Language } from "@/shared/lib/i18n";
import type { ThemePreference } from "@/shared/lib/theme";

export type EditorFont = "geist" | "system" | "mono";
export type FontSize = 14 | 15 | 16 | 18;

export interface EditorSettings {
	lineNumbers: boolean;
	autosave: boolean;
	highlightVariable: boolean;
	autocomplete: boolean;
	wrap: boolean;
}

export interface AppSettings {
	language: Language;
	numberFormat: NumberFormat;
	theme: ThemePreference;
	font: EditorFont;
	fontSize: FontSize;
	editor: EditorSettings;
	/** Пользователь скрыл баннер на заметке-примере */
	welcomeDismissed: boolean;
}

/** Точность для отдельной заметки: авто или число знаков после запятой */
export type Precision = "auto" | number;

export const PRECISION_OPTIONS: Precision[] = ["auto", 0, 1, 2, 4];
