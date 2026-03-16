export type TokenType = "variable" | "number" | "operator" | "function" | "comment" | "text";

export interface Token {
	type: TokenType;
	text: string;
	id: number;
}

const MATH_FUNCTIONS = new Set([
	"sin",
	"cos",
	"tan",
	"asin",
	"acos",
	"atan",
	"atan2",
	"sinh",
	"cosh",
	"tanh",
	"asinh",
	"acosh",
	"atanh",
	"sqrt",
	"cbrt",
	"abs",
	"sign",
	"exp",
	"log",
	"log10",
	"log2",
	"min",
	"max",
	"floor",
	"ceil",
	"round",
	"random",
]);

let tokenId = 0;

export function tokenize(text: string): Token[] {
	tokenId = 0;
	const tokens: Token[] = [];
	let remaining = text;

	const push = (type: TokenType, text: string) => {
		tokens.push({ type, text, id: tokenId++ });
	};

	while (remaining.length > 0) {
		const patterns: { type: TokenType; regex: RegExp }[] = [
			{ type: "comment", regex: /^#.*/ },
			{ type: "number", regex: /^\d+\.?\d*(?:e[+-]?\d+)?/i },
			{ type: "operator", regex: /^[+\-*/^=()[\]{},!<>=]|^\./ },
			{ type: "text", regex: /^[a-zA-Z_][a-zA-Z0-9_]*/ },
			{ type: "text", regex: /^\s+/ },
			{ type: "text", regex: /^./ },
		];

		let matched = false;
		for (const { type, regex } of patterns) {
			const m = remaining.match(regex);
			if (m) {
				const t = m[0];
				if (type === "text" && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(t)) {
					push(MATH_FUNCTIONS.has(t.toLowerCase()) ? "function" : "variable", t);
				} else if (type === "text" && /^\s+$/.test(t)) {
					push("text", t);
				} else if (type !== "text") {
					push(type, t);
				} else {
					push("text", t);
				}
				remaining = remaining.slice(t.length);
				matched = true;
				break;
			}
		}
		if (!matched) {
			push("text", remaining[0]);
			remaining = remaining.slice(1);
		}
	}
	return tokens;
}
