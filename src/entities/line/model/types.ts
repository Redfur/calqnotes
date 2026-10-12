export interface Line {
	id: string;
	input: string;
}

export type LineKind = "empty" | "comment" | "expression";

export interface LineResult {
	value: number;
	/** Единица измерения результата (`cm`, `km/h`), если она есть */
	unit: string | null;
}

export type LineErrorCode =
	| "undefinedVariable"
	| "unknownUnit"
	| "missingParen"
	| "incomplete"
	| "unitMismatch"
	| "divisionByZero"
	| "notANumber"
	| "unsupported"
	| "invalid";

export interface LineError {
	code: LineErrorCode;
	/** Неизвестное имя переменной или единицы — как написано в строке */
	name: string | null;
	/** Ближайшее известное имя для подсказки «Возможно, …?» */
	suggestion: string | null;
	/** Позиция `name` в `input` строки, чтобы подчеркнуть и заменить */
	from: number | null;
	to: number | null;
	/** Исходное сообщение math.js — для отладки */
	raw: string;
}

export interface EvaluatedLine extends Line {
	kind: LineKind;
	result: LineResult | null;
	error: LineError | null;
	/** Имя переменной, которую задаёт строка */
	assigns: string | null;
	/** Пользовательские переменные (и `last`), которые использует строка */
	uses: string[];
	/** Строка только задаёт число (`цена = 1500`) — результат не показываем */
	inputOnly: boolean;
}
