import type { EvalFunction, MathNode } from "mathjs";
import * as math from "mathjs";
import { closest, typoDistance } from "../lib/fuzzy";
import { FUNCTION_NAMES, UNITS } from "./catalog";
import type { EvaluatedLine, Line, LineError, LineErrorCode, LineResult } from "./types";

// Поддержка кириллицы в идентификаторах (math.js по умолчанию только латиница/греческий)
// Патчим isValidLatinOrGreek — parse.isAlpha вызывает её для проверки символов
const originalValid = math.parse.isValidLatinOrGreek;
math.parse.isValidLatinOrGreek = (c: string) => originalValid(c) || /^[Ѐ-ӿ]$/.test(c);

const ID_START = "A-Za-z\\u0400-\\u04FF_";
const ID_CHAR = "A-Za-z0-9\\u0400-\\u04FF_";
const WORD = `[${ID_START}][${ID_CHAR}]*`;
const NOT_ID_BEFORE = `(?<![${ID_CHAR}])`;
const NOT_ID_AFTER = `(?![${ID_CHAR}])`;

/** `имя из нескольких слов = …`, но не `==` */
const ASSIGN_RE = new RegExp(`^(\\s*)(${WORD}(?:[ \\t]+${WORD})*)\\s*=(?!=)`);
/** Слова, которые не могут входить в имя переменной */
const RESERVED = new Set(["of", "to", "in", "mod", "and", "or", "not", "xor"]);
const NUMBER = "\\d+(?:\\.\\d+)?(?:e[+-]?\\d+)?";
/** `20% of 500` → `(20 / 100) * 500` */
const PERCENT_OF_RE = new RegExp(`(${NUMBER})\\s*%\\s*of${NOT_ID_AFTER}`, "g");

/**
 * Единицы, имена которых в math.js заняты функциями (`min`): после числа и после `to`
 * они должны читаться как единицы, иначе `25 min` — это умножение на функцию.
 */
const CONFLICTING_UNITS = UNITS.filter((u) => Object.hasOwn(math, u) && math.Unit.isValuelessUnit(u));
const UNIT_AFTER_NUMBER_RE = CONFLICTING_UNITS.length
	? new RegExp(`(${NUMBER})\\s*(${CONFLICTING_UNITS.join("|")})${NOT_ID_AFTER}(?!\\s*\\()`, "g")
	: null;
const UNIT_AFTER_TO_RE = CONFLICTING_UNITS.length
	? new RegExp(`${NOT_ID_BEFORE}(to|in)\\s+(${CONFLICTING_UNITS.join("|")})${NOT_ID_AFTER}`, "g")
	: null;

const CACHE_LIMIT = 2000;
const parseCache = new Map<string, { node: MathNode; compiled: EvalFunction }>();

function compile(expr: string) {
	let cached = parseCache.get(expr);
	if (!cached) {
		const node = math.parse(expr);
		cached = { node, compiled: node.compile() };
		if (parseCache.size >= CACHE_LIMIT) parseCache.clear();
		parseCache.set(expr, cached);
	}
	return cached;
}

function escapeRegExp(s: string): string {
	return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function nameRegExp(name: string, flags = "g"): RegExp {
	const body = name.split(" ").map(escapeRegExp).join("[ \\t]+");
	return new RegExp(`${NOT_ID_BEFORE}${body}${NOT_ID_AFTER}`, flags);
}

function normalizeName(raw: string): string {
	return raw.trim().split(/\s+/).join(" ");
}

/** Имена переменных, известные к текущей строке, и их идентификаторы для math.js */
class Names {
	private toIdent = new Map<string, string>();
	private fromIdent = new Map<string, string>();
	/** Многословные имена, от длинных к коротким — для замены в тексте */
	private multiword: { name: string; ident: string; re: RegExp }[] = [];

	define(name: string): string {
		const existing = this.toIdent.get(name);
		if (existing) return existing;
		const ident = name.includes(" ") ? `__v${this.toIdent.size}` : name;
		this.toIdent.set(name, ident);
		this.fromIdent.set(ident, name);
		if (ident !== name) {
			this.multiword.push({ name, ident, re: nameRegExp(name) });
			this.multiword.sort((a, b) => b.name.length - a.name.length);
		}
		return ident;
	}

	has(name: string): boolean {
		return this.toIdent.has(name);
	}

	original(ident: string): string {
		return this.fromIdent.get(ident) ?? ident;
	}

	all(): string[] {
		return [...this.toIdent.keys()];
	}

	replaceIn(expr: string): string {
		let out = expr;
		for (const m of this.multiword) out = out.replace(m.re, m.ident);
		return out;
	}
}

function preprocess(expr: string, names: Names): string {
	let out = names.replaceIn(expr);
	out = out.replace(PERCENT_OF_RE, "($1 / 100) *");
	if (UNIT_AFTER_NUMBER_RE) out = out.replace(UNIT_AFTER_NUMBER_RE, '($1 * unit("$2"))');
	if (UNIT_AFTER_TO_RE) out = out.replace(UNIT_AFTER_TO_RE, '$1 unit("$2")');
	return out;
}

type Converted = { kind: "result"; result: LineResult } | { kind: "error"; code: LineErrorCode } | { kind: "none" };

function formatUnits(units: string): string {
	return units.replace(/\s*\/\s*/g, "/").replace(/\s*\*\s*/g, "·");
}

function convert(value: unknown): Converted {
	if (typeof value === "number") {
		if (Number.isNaN(value)) return { kind: "error", code: "notANumber" };
		if (!Number.isFinite(value)) return { kind: "error", code: "divisionByZero" };
		return { kind: "result", result: { value, unit: null } };
	}
	if (typeof value === "boolean") return { kind: "result", result: { value: value ? 1 : 0, unit: null } };
	if (typeof value === "function" || value === undefined || value === null) return { kind: "none" };
	if (math.isUnit(value)) {
		const units = value.formatUnits();
		const num = units ? value.toNumber(units) : value.toNumber();
		if (!Number.isFinite(num)) return { kind: "error", code: "divisionByZero" };
		return { kind: "result", result: { value: num, unit: units ? formatUnits(units) : null } };
	}
	if (math.isBigNumber(value) || math.isFraction(value)) return convert(math.number(value));
	return { kind: "error", code: "unsupported" };
}

function isLiteral(node: MathNode): boolean {
	if (math.isConstantNode(node)) return true;
	if (math.isParenthesisNode(node)) return isLiteral(node.content);
	return math.isOperatorNode(node) && node.fn === "unaryMinus" && node.args.length === 1 && isLiteral(node.args[0]);
}

function collectUses(node: MathNode, names: Names): string[] {
	const uses = new Set<string>();
	node.traverse((n, path, parent) => {
		if (!math.isSymbolNode(n)) return;
		if (parent && math.isFunctionNode(parent) && path === "fn") return;
		const name = names.original(n.name);
		if (name === "last" || names.has(name)) uses.add(name);
	});
	return [...uses];
}

function wordsAt(text: string, from: number, count: number): { phrase: string; to: number } | null {
	const re = new RegExp(`${WORD}(?:[ \\t]+${WORD}){${count - 1}}`, "y");
	re.lastIndex = from;
	const m = re.exec(text);
	return m ? { phrase: m[0], to: from + m[0].length } : null;
}

/** Неизвестное имя: ищем его в строке и ближайшее известное — с учётом имён из нескольких слов */
function unknownSymbolError(symbol: string, input: string, searchFrom: number, names: Names, raw: string): LineError {
	const m = nameRegExp(symbol, "g");
	m.lastIndex = searchFrom;
	const found = m.exec(input);
	const from = found ? found.index : null;
	const before = from !== null ? input.slice(0, from) : "";
	const isUnit = new RegExp(`(?:\\d|${NOT_ID_BEFORE}(?:to|in))\\s*$`).test(before);

	let name = symbol;
	let to = from !== null ? from + symbol.length : null;
	let suggestion: string | null = null;

	if (isUnit) {
		suggestion = closest(symbol, UNITS);
	} else if (from !== null) {
		const candidates = [...names.all(), "last", ...FUNCTION_NAMES];
		let best: { distance: number; phrase: string; to: number; candidate: string } | null = null;
		for (const candidate of candidates) {
			const words = candidate.split(" ").length;
			const at = wordsAt(input, from, words);
			if (!at) continue;
			const distance = typoDistance(at.phrase, candidate);
			if (distance !== null && (!best || distance < best.distance)) {
				best = { distance, phrase: at.phrase, to: at.to, candidate };
			}
		}
		if (best) {
			name = best.phrase;
			to = best.to;
			suggestion = best.candidate;
		}
	}

	return {
		code: isUnit ? "unknownUnit" : "undefinedVariable",
		name,
		suggestion,
		from,
		to,
		raw,
	};
}

function mapError(err: unknown, input: string, exprFrom: number, names: Names): LineError {
	const raw = err instanceof Error ? err.message : String(err);
	const base: LineError = { code: "invalid", name: null, suggestion: null, from: null, to: null, raw };

	const undefinedSymbol = raw.match(/^Undefined symbol (\S+)/);
	if (undefinedSymbol) return unknownSymbolError(names.original(undefinedSymbol[1]), input, exprFrom, names, raw);

	const unitNotFound = raw.match(/^Unit "(.+)" not found/);
	if (unitNotFound) return unknownSymbolError(unitNotFound[1], input, exprFrom, names, raw);

	if (/Parenthesis \) expected/.test(raw)) return { ...base, code: "missingParen" };
	if (/Unexpected end of expression/.test(raw)) return { ...base, code: "incomplete" };
	if (/Units do not match|Cannot convert|not convertible/i.test(raw)) return { ...base, code: "unitMismatch" };
	return base;
}

function emptyLine(line: Line, kind: EvaluatedLine["kind"]): EvaluatedLine {
	return { ...line, kind, result: null, error: null, assigns: null, uses: [], inputOnly: false };
}

export function evaluateNotebook(lines: Line[]): EvaluatedLine[] {
	const scope: Record<string, unknown> = {};
	const names = new Names();

	return lines.map((line) => {
		const { input } = line;
		const trimmed = input.trim();
		if (!trimmed) return emptyLine(line, "empty");
		if (trimmed.startsWith("#")) return emptyLine(line, "comment");

		const hash = input.indexOf("#");
		const code = hash >= 0 ? input.slice(0, hash) : input;
		if (!code.trim()) return emptyLine(line, "comment");

		const evaluated = emptyLine(line, "expression");
		let expr = code;
		let exprFrom = 0;
		let assigns: string | null = null;

		const assign = code.match(ASSIGN_RE);
		if (assign) {
			const name = normalizeName(assign[2]);
			if (!name.split(" ").some((w) => RESERVED.has(w))) {
				assigns = name;
				exprFrom = assign[0].length;
				expr = code.slice(exprFrom);
			}
		}

		try {
			if (!expr.trim()) throw new Error("Unexpected end of expression");
			const { node, compiled } = compile(preprocess(expr, names));
			const value = compiled.evaluate(scope);
			evaluated.uses = collectUses(node, names);

			const converted = convert(value);
			if (converted.kind === "error") {
				evaluated.error = {
					code: converted.code,
					name: null,
					suggestion: null,
					from: null,
					to: null,
					raw: String(value),
				};
			} else if (converted.kind === "result") {
				evaluated.result = converted.result;
				scope.last = value;
			}

			if (assigns) {
				scope[names.define(assigns)] = value;
				evaluated.assigns = assigns;
				evaluated.inputOnly = isLiteral(node);
			}
		} catch (err) {
			evaluated.error = mapError(err, input, exprFrom, names);
			if (assigns) evaluated.assigns = assigns;
		}

		return evaluated;
	});
}
