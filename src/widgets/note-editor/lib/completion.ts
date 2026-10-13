import {
	autocompletion,
	type Completion,
	type CompletionContext,
	type CompletionResult,
} from "@codemirror/autocomplete";
import type { Extension } from "@codemirror/state";
import { FUNCTIONS, formatLineResult } from "@/entities/line";
import { calqConfig, evaluationField } from "./calq-extension";

export interface CompletionLabels {
	functionDescription: (name: string) => string;
	lastDescription: string;
	variableFrom: (line: number, source: string) => string;
}

const WORD_BEFORE = /[A-Za-zЀ-ӿ_][A-Za-z0-9Ѐ-ӿ_ ]*$/;

function badge(kind: "variable" | "function"): HTMLElement {
	const span = document.createElement("span");
	span.className = `cm-calq-badge cm-calq-badge-${kind}`;
	span.textContent = kind === "variable" ? "x" : "ƒ";
	return span;
}

export function calqCompletion(labels: CompletionLabels): Extension {
	function source(context: CompletionContext): CompletionResult | null {
		const line = context.state.doc.lineAt(context.pos);
		const before = line.text.slice(0, context.pos - line.from);
		if (before.includes("#")) return null;
		const match = before.match(WORD_BEFORE);
		// Имя из нескольких слов: берём хвост после последнего оператора, без ведущих пробелов
		const typedRaw = match ? match[0] : "";
		const typed = typedRaw.replace(/^\s+/, "");
		if (!typed && !context.explicit) return null;
		const from = context.pos - typed.length;
		const lastWord = typed.split(" ").pop() ?? "";
		if (!context.explicit && lastWord.length === 0) return null;

		const { lines } = context.state.field(evaluationField);
		const { format } = context.state.facet(calqConfig);
		const currentLine = line.number;
		const options: Completion[] = [];
		const seen = new Set<string>();

		lines.forEach((l, i) => {
			if (!l.assigns || seen.has(l.assigns) || i + 1 >= currentLine) return;
			seen.add(l.assigns);
			const value = l.result ? formatLineResult(l.result, format).text : "";
			const sourceText = l.input.slice(l.input.indexOf("=") + 1).trim();
			options.push({
				label: l.assigns,
				type: "variable",
				detail: value,
				info: labels.variableFrom(i + 1, `${l.assigns} = ${sourceText}`),
				boost: 2,
			});
		});
		options.push({ label: "last", type: "variable", detail: "", info: labels.lastDescription, boost: 1 });
		for (const f of FUNCTIONS) {
			options.push({
				label: f.name,
				type: "function",
				detail: labels.functionDescription(f.name),
				info: `${f.name}${f.args} — ${labels.functionDescription(f.name)}`,
				apply: `${f.name}(`,
			});
		}

		const lower = typed.toLowerCase();
		const filtered = options.filter((o) => o.label.toLowerCase().startsWith(lower) && o.label !== typed);
		if (!filtered.length) return null;
		return { from, options: filtered, filter: false };
	}

	return autocompletion({
		override: [source],
		icons: false,
		addToOptions: [
			{
				render: (completion) => badge(completion.type === "function" ? "function" : "variable"),
				position: 20,
			},
		],
		closeOnBlur: true,
	});
}
