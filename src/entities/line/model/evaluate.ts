import { type EvalFunction, type MathNode, parse } from "mathjs";
import type { EvaluatedLine, Line } from "./types";

const parseCache = new Map<string, { parsed: MathNode; compiled: EvalFunction }>();

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
			let cached = parseCache.get(toEval);
			if (!cached) {
				const parsed = parse(toEval);
				const compiled = parsed.compile();
				cached = { parsed, compiled };
				parseCache.set(toEval, cached);
			}
			const value = cached.compiled.evaluate(scope);

			if (typeof value === "number" && Number.isFinite(value)) {
				evaluated.result = value;
			} else if (typeof value === "number") {
				evaluated.result = value;
			} else {
				evaluated.result = Number(value);
			}
			if (evaluated.result !== null) {
				scope.last = evaluated.result;
			}
		} catch (err) {
			evaluated.error = err instanceof Error ? err.message : String(err);
		}

		results.push(evaluated);
	}

	return results;
}
