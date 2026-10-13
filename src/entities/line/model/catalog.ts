/** Функции, которые предлагаются в автодополнении и шпаргалке. Описания — в translations.ts (`fn.<name>`). */
export interface FunctionInfo {
	name: string;
	args: string;
}

export const FUNCTIONS: FunctionInfo[] = [
	{ name: "sqrt", args: "(x)" },
	{ name: "cbrt", args: "(x)" },
	{ name: "abs", args: "(x)" },
	{ name: "round", args: "(x, n)" },
	{ name: "floor", args: "(x)" },
	{ name: "ceil", args: "(x)" },
	{ name: "min", args: "(a, b, …)" },
	{ name: "max", args: "(a, b, …)" },
	{ name: "sum", args: "(a, b, …)" },
	{ name: "mean", args: "(a, b, …)" },
	{ name: "pow", args: "(x, y)" },
	{ name: "exp", args: "(x)" },
	{ name: "log", args: "(x)" },
	{ name: "log10", args: "(x)" },
	{ name: "log2", args: "(x)" },
	{ name: "sin", args: "(x)" },
	{ name: "cos", args: "(x)" },
	{ name: "tan", args: "(x)" },
	{ name: "asin", args: "(x)" },
	{ name: "acos", args: "(x)" },
	{ name: "atan", args: "(x)" },
	{ name: "random", args: "()" },
];

export const FUNCTION_NAMES = FUNCTIONS.map((f) => f.name);

/** Слова языка: `20% of 500`, `2 inch to cm`, `17 mod 5`, `last` */
export const KEYWORDS = ["of", "to", "in", "mod", "last"];

/** Частые единицы — для подсказок «Возможно, kg?» и подсветки */
export const UNITS = [
	"mm",
	"cm",
	"m",
	"km",
	"inch",
	"ft",
	"yd",
	"mile",
	"mg",
	"g",
	"kg",
	"tonne",
	"lb",
	"oz",
	"ml",
	"l",
	"s",
	"min",
	"h",
	"day",
	"week",
	"deg",
	"rad",
	"celsius",
	"fahrenheit",
	"kelvin",
];
