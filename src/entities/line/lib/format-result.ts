import { formatExact, formatNumber, type NumberFormat } from "@/shared/lib/format-number";
import type { LineResult } from "../model/types";

export interface FormattedResult {
	text: string;
	rounded: boolean;
	exact: string;
}

export function formatLineResult(result: LineResult, format: NumberFormat): FormattedResult {
	const suffix = result.unit ? ` ${result.unit}` : "";
	const { text, rounded } = formatNumber(result.value, format);
	return { text: text + suffix, rounded, exact: formatExact(result.value, format) + suffix };
}
