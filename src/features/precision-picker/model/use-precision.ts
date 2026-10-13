import { useTranslation } from "react-i18next";
import { useActiveNote, useNotesStore } from "@/entities/note";
import { effectiveFormat, type Precision, precisionOf, useSettingsStore } from "@/entities/settings";
import { TRANS_NS } from "..";

export type PrecisionScope = "note" | "all";

/** Текущая точность активной заметки и действия для переключателя */
export function usePrecision() {
	const { t } = useTranslation(TRANS_NS);
	const note = useActiveNote();
	const setNotePrecision = useNotesStore((s) => s.setPrecision);
	const globalFormat = useSettingsStore((s) => s.numberFormat);
	const setGlobalPrecision = useSettingsStore((s) => s.setGlobalPrecision);

	const notePrecision = note?.precision ?? null;
	const current: Precision | null = notePrecision ?? precisionOf(globalFormat);
	const scope: PrecisionScope = notePrecision !== null ? "note" : "all";
	const format = effectiveFormat(globalFormat, notePrecision);

	const pick = (p: Precision, inScope: PrecisionScope) => {
		if (!note) return;
		if (inScope === "note") setNotePrecision(note.id, p);
		else {
			setGlobalPrecision(p);
			if (notePrecision !== null) setNotePrecision(note.id, null);
		}
	};

	const setScope = (next: PrecisionScope) => {
		if (!note || next === scope) return;
		if (next === "note") setNotePrecision(note.id, current ?? "auto");
		else {
			if (notePrecision !== null) setGlobalPrecision(notePrecision);
			setNotePrecision(note.id, null);
		}
	};

	const label = current === null ? t("significant") : t(`option.${current}`);
	const shortLabel = current === null ? t("significant") : t(`short.${current}`);

	return { current, scope, format, globalFormat, label, shortLabel, pick, setScope, isCustom: scope === "note" };
}
