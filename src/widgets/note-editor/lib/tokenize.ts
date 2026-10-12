import { FUNCTIONS, KEYWORDS, UNITS } from "@/entities/line";

export type TokenKind = "number" | "variable" | "function" | "operator" | "comment" | "text";

export interface Token {
	from: number;
	to: number;
	kind: TokenKind;
	/** Имя переменной — для подсветки зависимостей */
	name?: string;
}

const ID_CHAR = /[A-Za-z0-9Ѐ-ӿ_]/;
const WORDS = new Set([...FUNCTIONS.map((f) => f.name), ...KEYWORDS, ...UNITS]);
const NUMBER_RE = /\d+(?:\.\d+)?(?:e[+-]?\d+)?%?/y;
const WORD_RE = /[A-Za-zЀ-ӿ_][A-Za-z0-9Ѐ-ӿ_]*/y;
const SPACE_RE = /\s+/y;

function matchName(text: string, at: number, name: string): number | null {
	if (at > 0 && ID_CHAR.test(text[at - 1])) return null;
	let i = at;
	for (const [w, word] of name.split(" ").entries()) {
		if (w > 0) {
			const start = i;
			while (text[i] === " " || text[i] === "\t") i++;
			if (i === start) return null;
		}
		if (text.slice(i, i + word.length) !== word) return null;
		i += word.length;
	}
	if (i < text.length && ID_CHAR.test(text[i])) return null;
	return i;
}

/**
 * Разбивает строку на токены для подсветки. Имена переменных (в том числе из нескольких слов)
 * передаются снаружи — их знает только движок.
 */
export function tokenizeLine(text: string, names: string[]): Token[] {
	const sortedNames = [...names].sort((a, b) => b.length - a.length);
	const tokens: Token[] = [];
	let i = 0;
	while (i < text.length) {
		if (text[i] === "#") {
			tokens.push({ from: i, to: text.length, kind: "comment" });
			break;
		}
		SPACE_RE.lastIndex = i;
		const space = SPACE_RE.exec(text);
		if (space) {
			i += space[0].length;
			continue;
		}
		let named = false;
		for (const name of sortedNames) {
			const end = matchName(text, i, name);
			if (end !== null) {
				tokens.push({ from: i, to: end, kind: "variable", name });
				i = end;
				named = true;
				break;
			}
		}
		if (named) continue;

		NUMBER_RE.lastIndex = i;
		const num = NUMBER_RE.exec(text);
		if (num && !(i > 0 && ID_CHAR.test(text[i - 1]))) {
			tokens.push({ from: i, to: i + num[0].length, kind: "number" });
			i += num[0].length;
			continue;
		}
		WORD_RE.lastIndex = i;
		const word = WORD_RE.exec(text);
		if (word) {
			tokens.push({ from: i, to: i + word[0].length, kind: WORDS.has(word[0]) ? "function" : "text" });
			i += word[0].length;
			continue;
		}
		tokens.push({ from: i, to: i + 1, kind: "operator" });
		i++;
	}
	return tokens;
}
