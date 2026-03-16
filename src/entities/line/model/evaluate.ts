import { parse } from "mathjs";
import type { EvaluatedLine, Line } from "./types";

export function evaluateNotebook(lines: Line[]): EvaluatedLine[] {
	const scope: Record<string, number> = {};
	const results: EvaluatedLine[] = [];

	for (const line of lines) {
		const evaluated: EvaluatedLine = {
			...line,
			result: null,
			error: null,
		};

		const trimmed = line.input.trim();
		if (!trimmed || trimmed.startsWith("#")) {
			results.push(evaluated);
			continue;
		}
		const toEval = trimmed.includes("#") ? trimmed.split("#")[0].trim() : trimmed;
		if (!toEval) {
			results.push(evaluated);
			continue;
		}

		try {
			const node = parse(toEval);
			const compiled = node.compile();
			const value = compiled.evaluate(scope);

			if (typeof value === "number" && Number.isFinite(value)) {
				evaluated.result = value;
			} else if (typeof value === "number") {
				evaluated.result = value;
			} else {
				evaluated.result = Number(value);
			}
		} catch (err) {
			evaluated.error = err instanceof Error ? err.message : String(err);
		}

		results.push(evaluated);
	}

	return results;
}
