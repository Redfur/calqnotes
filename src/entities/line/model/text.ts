import type { Line } from "./types";

export function textToLines(text: string): Line[] {
	return text.split("\n").map((input, i) => ({ id: `line-${i}`, input }));
}

export function linesToText(lines: Line[]): string {
	return lines.map((l) => l.input).join("\n");
}
