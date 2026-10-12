import { describe, expect, it } from "vitest";
import { evaluateNotebook } from "./evaluate";

function run(...inputs: string[]) {
	return evaluateNotebook(inputs.map((input, i) => ({ id: `line-${i}`, input })));
}

function value(input: string) {
	const [line] = run(input);
	return line.result;
}

describe("evaluateNotebook", () => {
	it.each([
		["2 + 2 * 2", 6],
		["(2 + 2) * 2", 8],
		["2^10", 1024],
		["17 mod 5", 2],
		["1250 * 12 - 15%", 12750],
		["1250 - 15%", 1062.5],
		["1250 + 20%", 1500],
		["20% of 500", 100],
		["sqrt(3^2 + 4^2)", 5],
		["round(1 / 3, 4)", 0.3333],
		["min(3, 7, 1)", 1],
		["sin(30 deg)", 0.5],
	])("%s = %d", (input, expected) => {
		const result = value(input);
		expect(result?.unit).toBeNull();
		expect(result?.value).toBeCloseTo(expected, 10);
	});

	it.each([
		["2 inch to cm", 5.08, "cm"],
		["72 kg to lb", 158.7328, "lb"],
		["5 km / 25 min to km/h", 12, "km/h"],
		["10 km / 52 min", 0.1923, "km/min"],
		["2 h + 30 min", 2.5, "h"],
	])("%s — единицы", (input, expected, unit) => {
		const result = value(input);
		expect(result?.unit).toBe(unit);
		expect(result?.value).toBeCloseTo(expected, 3);
	});

	it("переменные из нескольких слов и last", () => {
		const lines = run(
			"зарплата = 185000",
			"налог = зарплата * 13%",
			"на руки = зарплата - налог",
			"в день = на руки / 21",
			"last * 21",
		);
		expect(lines.map((l) => l.result?.value)).toEqual([185000, 24050, 160950, 160950 / 21, 160950]);
		expect(lines[2].assigns).toBe("на руки");
		expect(lines[3].uses).toEqual(["на руки"]);
		expect(lines[4].uses).toEqual(["last"]);
	});

	it("строка, которая только задаёт число", () => {
		const lines = run("цена = 1500", "итог = цена * 2", "минус = -5");
		expect(lines.map((l) => l.inputOnly)).toEqual([true, false, true]);
	});

	it("комментарии и пустые строки", () => {
		const lines = run("# Проценты", "", "2 + 2 # пояснение");
		expect(lines.map((l) => l.kind)).toEqual(["comment", "empty", "expression"]);
		expect(lines[2].result?.value).toBe(4);
	});

	it("опечатка в многословном имени — подсказка", () => {
		const lines = run("на руки = 160950", "на рукки * 12");
		const error = lines[1].error;
		expect(error?.code).toBe("undefinedVariable");
		expect(error?.name).toBe("на рукки");
		expect(error?.suggestion).toBe("на руки");
		expect(lines[1].input.slice(error?.from ?? 0, error?.to ?? 0)).toBe("на рукки");
	});

	it("неизвестная единица — подсказка", () => {
		const [line] = run("5 kgg to lb");
		expect(line.error?.code).toBe("unknownUnit");
		expect(line.error?.name).toBe("kgg");
		expect(line.error?.suggestion).toBe("kg");
	});

	it.each([
		["1250 * (12 - 3", "missingParen"],
		["5 / 0", "divisionByZero"],
		["2 +", "incomplete"],
		["5 km + 2 kg", "unitMismatch"],
		["x * 2", "undefinedVariable"],
	])("%s — ошибка %s", (input, code) => {
		const [line] = run(input);
		expect(line.result).toBeNull();
		expect(line.error?.code).toBe(code);
	});

	it("ошибка в строке не ломает следующие", () => {
		const lines = run("a = 2", "a +", "a * 3");
		expect(lines[1].error).not.toBeNull();
		expect(lines[2].result?.value).toBe(6);
	});
});
