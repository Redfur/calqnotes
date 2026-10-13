import type { NumberFormat } from "@/shared/lib/format-number";
import type { Precision } from "../model/types";

/** Формат с учётом точности, заданной для заметки */
export function effectiveFormat(format: NumberFormat, notePrecision: Precision | null): NumberFormat {
	if (notePrecision === null) return format;
	if (notePrecision === "auto") return { ...format, mode: "auto" };
	return { ...format, mode: "fixed", digits: notePrecision };
}

/** Точность, которую показывает быстрый переключатель для глобального формата */
export function precisionOf(format: NumberFormat): Precision | null {
	if (format.mode === "auto") return "auto";
	if (format.mode === "fixed") return format.digits;
	return null;
}
