export type RoundingMode = "auto" | "fixed" | "significant";
export type GroupSeparator = "space" | "comma" | "none";
export type DecimalSeparator = "comma" | "dot";

export interface NumberFormat {
	mode: RoundingMode;
	/** Знаков после запятой (fixed) или значащих цифр (significant) */
	digits: number;
	group: GroupSeparator;
	decimal: DecimalSeparator;
	/** Показывать нули в конце дробной части: 12,50 вместо 12,5 */
	trailingZeros: boolean;
	/** С какого модуля числа переходить на экспоненциальную запись; Infinity — никогда */
	expThreshold: number;
}

export const DEFAULT_NUMBER_FORMAT: NumberFormat = {
	mode: "auto",
	digits: 2,
	group: "space",
	decimal: "comma",
	trailingZeros: false,
	expThreshold: 1e15,
};

export const MAX_DIGITS = 10;

export interface FormattedNumber {
	text: string;
	/** Показанное значение отличается от точного */
	rounded: boolean;
}

const MINUS = "−";
const NBSP = " ";
/** Числа меньше этого (по модулю) в авто-режиме показываются в экспоненциальной записи */
const AUTO_TINY = 1e-6;
/** Относительная погрешность, ниже которой разница считается шумом float, а не округлением */
const EPSILON = 1e-12;

function groupChar(group: GroupSeparator): string {
	if (group === "space") return NBSP;
	if (group === "comma") return ",";
	return "";
}

function decimalChar(decimal: DecimalSeparator): string {
	return decimal === "comma" ? "," : ".";
}

/** Расставляет разделители в строке вида "-1234567.891" (en-US без группировки) */
function applySeparators(plain: string, format: Pick<NumberFormat, "group" | "decimal">): string {
	const negative = plain.startsWith("-");
	const unsigned = negative ? plain.slice(1) : plain;
	const [int, frac] = unsigned.split(".");
	const sep = groupChar(format.group);
	const grouped = sep ? int.replace(/\B(?=(\d{3})+(?!\d))/g, sep) : int;
	return (negative ? MINUS : "") + grouped + (frac ? decimalChar(format.decimal) + frac : "");
}

function toPlain(value: number, options: Intl.NumberFormatOptions): string {
	return value.toLocaleString("en-US", { ...options, useGrouping: false });
}

function formatExponential(value: number, format: NumberFormat): string {
	const fraction = format.mode === "auto" ? 2 : Math.min(format.digits, MAX_DIGITS);
	const [mantissa, exp] = value.toExponential(fraction).split("e");
	const trimmed = format.trailingZeros ? mantissa : mantissa.replace(/\.?0+$/, "");
	return `${applySeparators(trimmed, { group: "none", decimal: format.decimal })}e${exp}`;
}

function isRounded(shown: number, value: number): boolean {
	return Math.abs(shown - value) > EPSILON * Math.max(1, Math.abs(value));
}

export function formatNumber(value: number, format: NumberFormat): FormattedNumber {
	if (!Number.isFinite(value)) {
		return { text: value > 0 ? "∞" : value < 0 ? `${MINUS}∞` : "NaN", rounded: false };
	}
	const abs = Math.abs(value);
	const useExp = value !== 0 && (abs >= format.expThreshold || (format.mode === "auto" && abs < AUTO_TINY));
	if (useExp) {
		const text = formatExponential(value, format);
		const shown = Number(text.replace(MINUS, "-").replace(",", "."));
		return { text, rounded: isRounded(shown, value) };
	}

	const digits = Math.min(Math.max(format.digits, 0), MAX_DIGITS);
	let plain: string;
	if (format.mode === "auto") {
		plain =
			abs < 1 && value !== 0
				? toPlain(value, { maximumSignificantDigits: 4 })
				: toPlain(value, { maximumFractionDigits: 2 });
	} else if (format.mode === "fixed") {
		plain = toPlain(value, {
			minimumFractionDigits: format.trailingZeros ? digits : 0,
			maximumFractionDigits: digits,
		});
	} else {
		plain = toPlain(value, {
			maximumSignificantDigits: Math.max(1, digits),
			minimumSignificantDigits: format.trailingZeros ? Math.max(1, digits) : 1,
		});
	}
	if (plain === "-0") plain = "0";
	return { text: applySeparators(plain, format), rounded: isRounded(Number(plain), value) };
}

/** Точное значение для подсказки «Точно: …» — все значащие цифры, которые хранит число */
export function formatExact(value: number, format: Pick<NumberFormat, "group" | "decimal">): string {
	if (!Number.isFinite(value)) return formatNumber(value, DEFAULT_NUMBER_FORMAT).text;
	if (Number.isInteger(value) && Math.abs(value) < 1e30) {
		return applySeparators(BigInt(value).toString(), format);
	}
	const plain = String(value);
	if (plain.includes("e")) {
		const [mantissa, exp] = plain.split("e");
		return `${applySeparators(mantissa, { group: "none", decimal: format.decimal })}e${exp}`;
	}
	return applySeparators(plain, format);
}

/** Текст для буфера обмена: обычные пробелы и дефис вместо типографских символов */
export function toClipboardText(text: string): string {
	return text.replace(/[  ]/g, " ").replace(new RegExp(MINUS, "g"), "-");
}
