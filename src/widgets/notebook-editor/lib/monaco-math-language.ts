import type { Monaco } from "@monaco-editor/react";
import type { editor, IPosition } from "monaco-editor";
import { i18n } from "@/shared/lib/i18n";

/** Кириллица + латиница для идентификаторов */
const IDENT = "[a-zA-Z_\\u0400-\\u04FF][a-zA-Z0-9_\\u0400-\\u04FF]*";

const MATH_FUNCTIONS = [
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
];

interface FunctionDef {
	name: string;
	insertText: string;
	detail: string;
	documentation: string;
	params: { label: string; documentation: string }[];
}

/** Monaco snippet placeholder: $ + {1:x} = ${1:x} */
const snip = (s: string) => "$" + "{" + s + "}";

const MATH_FUNCTIONS_DEF: FunctionDef[] = [
	{
		name: "sin",
		insertText: "sin(" + snip("1:x") + ")",
		detail: "sin(x)",
		documentation: "Синус угла в радианах",
		params: [{ label: "x", documentation: "Угол в радианах" }],
	},
	{
		name: "cos",
		insertText: "cos(" + snip("1:x") + ")",
		detail: "cos(x)",
		documentation: "Косинус угла в радианах",
		params: [{ label: "x", documentation: "Угол в радианах" }],
	},
	{
		name: "tan",
		insertText: "tan(" + snip("1:x") + ")",
		detail: "tan(x)",
		documentation: "Тангенс угла в радианах",
		params: [{ label: "x", documentation: "Угол в радианах" }],
	},
	{
		name: "asin",
		insertText: "asin(" + snip("1:x") + ")",
		detail: "asin(x)",
		documentation: "Арксинус, результат в радианах",
		params: [{ label: "x", documentation: "Значение от -1 до 1" }],
	},
	{
		name: "acos",
		insertText: "acos(" + snip("1:x") + ")",
		detail: "acos(x)",
		documentation: "Арккосинус, результат в радианах",
		params: [{ label: "x", documentation: "Значение от -1 до 1" }],
	},
	{
		name: "atan",
		insertText: "atan(" + snip("1:x") + ")",
		detail: "atan(x)",
		documentation: "Арктангенс, результат в радианах",
		params: [{ label: "x", documentation: "Число" }],
	},
	{
		name: "atan2",
		insertText: "atan2(" + snip("1:y") + ", " + snip("2:x") + ")",
		detail: "atan2(y, x)",
		documentation: "Арктангенс y/x с учётом квадранта",
		params: [
			{ label: "y", documentation: "Координата Y" },
			{ label: "x", documentation: "Координата X" },
		],
	},
	{
		name: "sinh",
		insertText: "sinh(" + snip("1:x") + ")",
		detail: "sinh(x)",
		documentation: "Гиперболический синус",
		params: [{ label: "x", documentation: "Число" }],
	},
	{
		name: "cosh",
		insertText: "cosh(" + snip("1:x") + ")",
		detail: "cosh(x)",
		documentation: "Гиперболический косинус",
		params: [{ label: "x", documentation: "Число" }],
	},
	{
		name: "tanh",
		insertText: "tanh(" + snip("1:x") + ")",
		detail: "tanh(x)",
		documentation: "Гиперболический тангенс",
		params: [{ label: "x", documentation: "Число" }],
	},
	{
		name: "asinh",
		insertText: "asinh(" + snip("1:x") + ")",
		detail: "asinh(x)",
		documentation: "Гиперболический арксинус",
		params: [{ label: "x", documentation: "Число" }],
	},
	{
		name: "acosh",
		insertText: "acosh(" + snip("1:x") + ")",
		detail: "acosh(x)",
		documentation: "Гиперболический арккосинус",
		params: [{ label: "x", documentation: "Число ≥ 1" }],
	},
	{
		name: "atanh",
		insertText: "atanh(" + snip("1:x") + ")",
		detail: "atanh(x)",
		documentation: "Гиперболический арктангенс",
		params: [{ label: "x", documentation: "Значение от -1 до 1" }],
	},
	{
		name: "sqrt",
		insertText: "sqrt(" + snip("1:x") + ")",
		detail: "sqrt(x)",
		documentation: "Квадратный корень",
		params: [{ label: "x", documentation: "Неотрицательное число" }],
	},
	{
		name: "cbrt",
		insertText: "cbrt(" + snip("1:x") + ")",
		detail: "cbrt(x)",
		documentation: "Кубический корень",
		params: [{ label: "x", documentation: "Число" }],
	},
	{
		name: "abs",
		insertText: "abs(" + snip("1:x") + ")",
		detail: "abs(x)",
		documentation: "Модуль числа",
		params: [{ label: "x", documentation: "Число" }],
	},
	{
		name: "sign",
		insertText: "sign(" + snip("1:x") + ")",
		detail: "sign(x)",
		documentation: "Знак числа: -1, 0 или 1",
		params: [{ label: "x", documentation: "Число" }],
	},
	{
		name: "exp",
		insertText: "exp(" + snip("1:x") + ")",
		detail: "exp(x)",
		documentation: "e в степени x",
		params: [{ label: "x", documentation: "Показатель степени" }],
	},
	{
		name: "log",
		insertText: "log(" + snip("1:x") + ")",
		detail: "log(x)",
		documentation: "Натуральный логарифм",
		params: [{ label: "x", documentation: "Положительное число" }],
	},
	{
		name: "log10",
		insertText: "log10(" + snip("1:x") + ")",
		detail: "log10(x)",
		documentation: "Логарифм по основанию 10",
		params: [{ label: "x", documentation: "Положительное число" }],
	},
	{
		name: "log2",
		insertText: "log2(" + snip("1:x") + ")",
		detail: "log2(x)",
		documentation: "Логарифм по основанию 2",
		params: [{ label: "x", documentation: "Положительное число" }],
	},
	{
		name: "min",
		insertText: "min(" + snip("1:a") + ", " + snip("2:b") + ")",
		detail: "min(a, b, ...)",
		documentation: "Минимум из аргументов",
		params: [
			{ label: "a", documentation: "Первое число" },
			{ label: "b", documentation: "Второе число" },
		],
	},
	{
		name: "max",
		insertText: "max(" + snip("1:a") + ", " + snip("2:b") + ")",
		detail: "max(a, b, ...)",
		documentation: "Максимум из аргументов",
		params: [
			{ label: "a", documentation: "Первое число" },
			{ label: "b", documentation: "Второе число" },
		],
	},
	{
		name: "floor",
		insertText: "floor(" + snip("1:x") + ")",
		detail: "floor(x)",
		documentation: "Округление вниз",
		params: [{ label: "x", documentation: "Число" }],
	},
	{
		name: "ceil",
		insertText: "ceil(" + snip("1:x") + ")",
		detail: "ceil(x)",
		documentation: "Округление вверх",
		params: [{ label: "x", documentation: "Число" }],
	},
	{
		name: "round",
		insertText: "round(" + snip("1:x") + ")",
		detail: "round(x)",
		documentation: "Округление до ближайшего целого",
		params: [{ label: "x", documentation: "Число" }],
	},
	{
		name: "random",
		insertText: "random()",
		detail: "random()",
		documentation: "Случайное число от 0 до 1",
		params: [],
	},
];

/** Извлекает переменные, определённые пользователем до указанной позиции */
function extractUserVariables(model: editor.ITextModel, position: IPosition): { name: string; value: string }[] {
	const seen = new Set<string>();
	const variables: { name: string; value: string }[] = [];
	for (let lineNum = 1; lineNum <= position.lineNumber; lineNum++) {
		let line = model.getLineContent(lineNum);
		const isCurrentLine = lineNum === position.lineNumber;
		if (isCurrentLine) {
			line = line.slice(0, position.column - 1);
		}
		line = line.split("#")[0].trim();
		const match = line.match(new RegExp("^(" + IDENT + ")\\s*=\\s*(.*)$"));
		if (match) {
			const name = match[1];
			const value = match[2].trim();
			if (!seen.has(name)) {
				seen.add(name);
				variables.push({ name, value });
			}
		}
	}
	return variables;
}

const IDENT_CHAR = /[a-zA-Z0-9_\u0400-\u04FF]/;

function getWordAtPosition(model: editor.ITextModel, position: IPosition): string {
	const lineContent = model.getLineContent(position.lineNumber);
	const column = position.column - 1;
	let start = column;
	while (start > 0 && IDENT_CHAR.test(lineContent[start - 1])) start--;
	let end = column;
	while (end < lineContent.length && IDENT_CHAR.test(lineContent[end])) end++;
	return lineContent.slice(start, end);
}

function getFunctionNameBeforeParen(model: editor.ITextModel, position: IPosition): string | null {
	const lineContent = model.getLineContent(position.lineNumber);
	const column = position.column - 1;
	let parenPos = column - 1;
	// Ищем открывающую скобку текущего вызова (при триггере "," курсор после запятой)
	if (parenPos >= 0 && lineContent[parenPos] === ",") {
		let depth = 0;
		for (let i = parenPos - 1; i >= 0; i--) {
			if (lineContent[i] === ")") depth++;
			else if (lineContent[i] === "(") {
				if (depth === 0) {
					parenPos = i;
					break;
				}
				depth--;
			}
		}
	} else if (parenPos < 0 || lineContent[parenPos] !== "(") {
		return null;
	}
	let start = parenPos - 1;
	while (start >= 0 && IDENT_CHAR.test(lineContent[start])) start--;
	return lineContent.slice(start + 1, parenPos) || null;
}

export function registerCalqLanguage(monaco: Monaco): void {
	monaco.languages.register({ id: "calq" });

	monaco.languages.setMonarchTokensProvider("calq", {
		ignoreCase: true,
		defaultToken: "",
		keywords: MATH_FUNCTIONS,
		tokenizer: {
			root: [
				[/#.*$/, "comment"],
				[/\d+\.?\d*(?:e[+-]?\d+)?/i, "number"],
				[/[+\-*/^=()[\]{},!<>=]|\./, "operator"],
				[/[a-zA-Z_\u0400-\u04FF][a-zA-Z0-9_\u0400-\u04FF]*/, { cases: { "@keywords": "function", "@default": "variable" } }],
				[/\s+/, ""],
			],
		},
	});

	monaco.languages.registerCompletionItemProvider("calq", {
		triggerCharacters: [],
		provideCompletionItems(model: editor.ITextModel, position: IPosition) {
			const word = getWordAtPosition(model, position);
			const prefix = word.toLowerCase();
			const range = {
				startLineNumber: position.lineNumber,
				endLineNumber: position.lineNumber,
				startColumn: position.column - word.length,
				endColumn: position.column,
			};

			const functionSuggestions = MATH_FUNCTIONS_DEF.filter((f) => f.name.startsWith(prefix) || prefix === "").map((f) => ({
				label: f.name,
				kind: monaco.languages.CompletionItemKind.Function,
				insertText: f.insertText,
				insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
				detail: f.detail,
				documentation: f.documentation,
				range,
			}));

			const userVars = extractUserVariables(model, position);
			const variableSuggestions = userVars
				.filter((v) => v.name.toLowerCase().startsWith(prefix) || prefix === "")
				.map((v) => ({
					label: v.name,
					kind: monaco.languages.CompletionItemKind.Variable,
					insertText: v.name,
					detail: i18n.t("notebook-editor:yourVariableValue", { value: v.value }),
					range,
				}));

			return { suggestions: [...variableSuggestions, ...functionSuggestions] };
		},
	});

	monaco.languages.registerSignatureHelpProvider("calq", {
		signatureHelpTriggerCharacters: ["(", ","],
		signatureHelpRetriggerCharacters: [","],
		provideSignatureHelp(model: editor.ITextModel, position: IPosition) {
			const funcName = getFunctionNameBeforeParen(model, position);
			if (!funcName) return null;
			const def = MATH_FUNCTIONS_DEF.find((f) => f.name.toLowerCase() === funcName.toLowerCase());
			if (!def) return null;

			const lineContent = model.getLineContent(position.lineNumber);
			const beforeParen = lineContent.slice(0, position.column - 1);
			const openCount = (beforeParen.match(/\(/g) || []).length;
			const closeCount = (beforeParen.match(/\)/g) || []).length;
			const activeParameter = Math.max(0, openCount - closeCount - 1);

			return {
				value: {
					activeParameter: Math.min(activeParameter, def.params.length),
					activeSignature: 0,
					signatures: [
						{
							label: def.detail,
							documentation: def.documentation,
							parameters: def.params.map((p) => ({
								label: p.label,
								documentation: p.documentation,
							})),
						},
					],
				},
				dispose: () => {},
			};
		},
	});
}
