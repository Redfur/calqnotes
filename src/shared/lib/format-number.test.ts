import { describe, expect, it } from "vitest";
import { DEFAULT_NUMBER_FORMAT, formatExact, formatNumber, type NumberFormat, toClipboardText } from "./format-number";

const NB = " ";
const fmt = (value: number, patch: Partial<NumberFormat> = {}) =>
	formatNumber(value, { ...DEFAULT_NUMBER_FORMAT, ...patch });

describe("formatNumber", () => {
	it("авто: до двух знаков, разделители, без ложного округления float", () => {
		expect(fmt(0.1 + 0.2)).toEqual({ text: "0,3", rounded: false });
		expect(fmt(2500 / 3)).toEqual({ text: "833,33", rounded: true });
		expect(fmt(1234567.891)).toEqual({ text: `1${NB}234${NB}567,89`, rounded: true });
		expect(fmt(12750)).toEqual({ text: `12${NB}750`, rounded: false });
		expect(fmt(1 / 3).text).toBe("0,3333");
	});

	it("отрицательные числа — типографский минус", () => {
		expect(fmt(-1500).text).toBe(`−1${NB}500`);
	});

	it("фиксированное число знаков и нули в конце", () => {
		expect(fmt(12.5, { mode: "fixed", digits: 2 }).text).toBe("12,5");
		expect(fmt(12.5, { mode: "fixed", digits: 2, trailingZeros: true }).text).toBe("12,50");
		expect(fmt(2500 / 3, { mode: "fixed", digits: 0 })).toEqual({ text: "833", rounded: true });
	});

	it("значащие цифры", () => {
		expect(fmt(1234567.891, { mode: "significant", digits: 3 }).text).toBe(`1${NB}230${NB}000`);
	});

	it("разделители", () => {
		expect(fmt(1234.5, { group: "comma", decimal: "dot" }).text).toBe("1,234.5");
		expect(fmt(1234.5, { group: "none" }).text).toBe("1234,5");
	});

	it("экспоненциальная запись", () => {
		expect(fmt(2 ** 70)).toEqual({ text: "1,18e+21", rounded: true });
		expect(fmt(2 ** 70, { expThreshold: Number.POSITIVE_INFINITY }).text).toBe(
			`1${NB}180${NB}591${NB}620${NB}717${NB}411${NB}300${NB}000`,
		);
		expect(fmt(2 ** 40, { expThreshold: 1e12 }).text).toBe("1,1e+12");
	});

	it("точное значение и текст для буфера", () => {
		const f = { group: "space", decimal: "comma" } as const;
		expect(formatExact(2500 / 3, f)).toBe("833,3333333333334");
		expect(formatExact(2 ** 70, f)).toBe(`1${NB}180${NB}591${NB}620${NB}717${NB}411${NB}303${NB}424`);
		expect(toClipboardText(`−1${NB}500,5`)).toBe("-1 500,5");
	});
});
