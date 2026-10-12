import { evaluateNotebook, formatLineResult, textToLines } from "@/entities/line";
import type { NumberFormat } from "@/shared/lib/format-number";

/** Текст заметки, где у каждой строки с расчётом дописан результат: `1250 * 12 = 15 000` */
export function textWithResults(content: string, format: NumberFormat): { text: string; count: number } {
	const lines = evaluateNotebook(textToLines(content));
	const out = lines.map((l) => {
		if (l.kind !== "expression" || !l.result || l.inputOnly) return l.input;
		return `${l.input.trimEnd()} = ${formatLineResult(l.result, format).text}`;
	});
	return { text: out.join("\n").replace(/[  ]/g, " ").replace(/−/g, "-"), count: lines.length };
}
