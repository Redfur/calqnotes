import { describe, expect, it } from "vitest";
import { lineTranslations } from "@/entities/line/translations";
import { noteTranslations } from "@/entities/note/translations";
import { installAppTranslations } from "@/features/install-app/translations";
import { noteActionsTranslations } from "@/features/note-actions/translations";
import { precisionPickerTranslations } from "@/features/precision-picker/translations";
import { notebookPageTranslations } from "@/pages/notebook/translations";
import { appHeaderTranslations } from "@/widgets/app-header/translations";
import { helpPanelTranslations } from "@/widgets/help-panel/translations";
import { noteEditorTranslations } from "@/widgets/note-editor/translations";
import { notePaletteTranslations } from "@/widgets/note-palette/translations";
import { settingsDialogTranslations } from "@/widgets/settings-dialog/translations";
import { commonTranslations } from "./translations";

const ALL: Record<string, Record<string, Record<string, string>>> = {
	common: commonTranslations,
	line: lineTranslations,
	note: noteTranslations,
	"install-app": installAppTranslations,
	"note-actions": noteActionsTranslations,
	"precision-picker": precisionPickerTranslations,
	"notebook-page": notebookPageTranslations,
	"app-header": appHeaderTranslations,
	"help-panel": helpPanelTranslations,
	"note-editor": noteEditorTranslations,
	"note-palette": notePaletteTranslations,
	"settings-dialog": settingsDialogTranslations,
};

/** Формы множественного числа у языков разные: count_one/_few/_many/_other → count */
const baseKeys = (dict: Record<string, string>) =>
	[...new Set(Object.keys(dict).map((k) => k.replace(/_(zero|one|two|few|many|other)$/, "")))].sort();

const placeholders = (s: string) => [...s.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]).sort();

describe("переводы", () => {
	for (const [ns, langs] of Object.entries(ALL)) {
		it(`${ns}: ru и en с одинаковыми ключами`, () => {
			expect(baseKeys(langs.en)).toEqual(baseKeys(langs.ru));
		});

		it(`${ns}: одинаковые подстановки {{…}}`, () => {
			for (const [key, ru] of Object.entries(langs.ru)) {
				const en = langs.en[key] ?? langs.en[key.replace(/_(few|many)$/, "_other")];
				if (en !== undefined) expect(placeholders(en), `${ns}:${key}`).toEqual(placeholders(ru));
			}
		});
	}
});
