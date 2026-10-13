import { type EditorState, type Extension, Facet, type Range, StateEffect, StateField } from "@codemirror/state";
import { Decoration, type DecorationSet, EditorView, ViewPlugin, type ViewUpdate, WidgetType } from "@codemirror/view";
import { type EvaluatedLine, evaluateNotebook, formatLineResult, textToLines } from "@/entities/line";
import { DEFAULT_NUMBER_FORMAT, type NumberFormat, toClipboardText } from "@/shared/lib/format-number";
import { tokenizeLine } from "./tokenize";

export interface CalqLabels {
	copy: string;
	copied: string;
	exact: (value: string) => string;
	resultLabel: (value: string) => string;
	error: (line: EvaluatedLine) => string;
	suggestionBefore: string;
	suggestionAfter: string;
	newLine: string;
}

export interface CalqConfig {
	format: NumberFormat;
	highlightVariable: boolean;
	labels: CalqLabels;
	onCopy: (text: string) => void;
}

const DEFAULT_CONFIG: CalqConfig = {
	format: DEFAULT_NUMBER_FORMAT,
	highlightVariable: true,
	labels: {
		copy: "",
		copied: "",
		exact: (v) => v,
		resultLabel: (v) => v,
		error: (l) => l.error?.code ?? "",
		suggestionBefore: "",
		suggestionAfter: "",
		newLine: "",
	},
	onCopy: () => {},
};

export const calqConfig = Facet.define<CalqConfig, CalqConfig>({
	combine: (values) => values[values.length - 1] ?? DEFAULT_CONFIG,
});

/** Пауза после ввода, пока ошибка в редактируемой строке не показывается */
const PENDING_MS = 900;
const FLASH_MS = 1000;
const COPIED_MS = 1500;

// --- Вычисления -------------------------------------------------------------

interface Evaluation {
	lines: EvaluatedLine[];
	names: string[];
}

function evaluate(state: EditorState): Evaluation {
	const lines = evaluateNotebook(textToLines(state.doc.toString()));
	const names = [...new Set(lines.map((l) => l.assigns).filter((n): n is string => Boolean(n)))];
	return { lines, names };
}

export const evaluationField = StateField.define<Evaluation>({
	create: evaluate,
	update: (value, tr) => (tr.docChanged ? evaluate(tr.state) : value),
});

// --- Состояние интерфейса: наведение, вспышка, ввод -------------------------

const setHoverVar = StateEffect.define<string | null>();
const setFlash = StateEffect.define<number[]>();
const refreshPending = StateEffect.define<null>();

interface UiState {
	hoverVar: string | null;
	/** Номера строк (с 1), результат которых только что пересчитался */
	flash: number[];
	/** Строка, которую сейчас набирают, и время последнего ввода */
	editedLine: number | null;
	editedAt: number;
}

const uiField = StateField.define<UiState>({
	create: () => ({ hoverVar: null, flash: [], editedLine: null, editedAt: 0 }),
	update(value, tr) {
		let next = value;
		if (tr.docChanged && (tr.isUserEvent("input") || tr.isUserEvent("delete"))) {
			next = { ...next, editedLine: tr.state.doc.lineAt(tr.state.selection.main.head).number, editedAt: Date.now() };
		}
		for (const e of tr.effects) {
			if (e.is(setHoverVar)) next = { ...next, hoverVar: e.value };
			if (e.is(setFlash)) next = { ...next, flash: e.value };
		}
		return next;
	},
});

function isPending(ui: UiState, lineNumber: number): boolean {
	return ui.editedLine === lineNumber && Date.now() - ui.editedAt < PENDING_MS;
}

// --- Виджеты ----------------------------------------------------------------

const ICONS = {
	copy: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>',
	check:
		'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg>',
	alert:
		'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v4"></path><path d="M12 16h.01"></path></svg>',
};

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text?: string): HTMLElementTagNameMap[K] {
	const node = document.createElement(tag);
	node.className = className;
	if (text !== undefined) node.textContent = text;
	return node;
}

function icon(svg: string): HTMLElement {
	const span = el("span", "cm-calq-icon");
	span.innerHTML = svg;
	return span;
}

class ResultWidget extends WidgetType {
	readonly text: string;
	readonly rounded: boolean;
	readonly exact: string;
	readonly flash: boolean;
	readonly config: CalqConfig;

	constructor(text: string, rounded: boolean, exact: string, flash: boolean, config: CalqConfig) {
		super();
		this.text = text;
		this.rounded = rounded;
		this.exact = exact;
		this.flash = flash;
		this.config = config;
	}

	eq(other: ResultWidget) {
		return (
			other.text === this.text &&
			other.rounded === this.rounded &&
			other.exact === this.exact &&
			other.flash === this.flash &&
			other.config === this.config
		);
	}

	private fill(button: HTMLElement) {
		const { labels } = this.config;
		button.replaceChildren();
		if (this.rounded) button.append(el("span", "cm-calq-approx", "≈"));
		button.append(el("span", "cm-calq-value", this.text), icon(ICONS.copy));
		const tip = this.rounded ? `${labels.exact(this.exact)} · ${labels.copy}` : labels.copy;
		button.append(el("span", "cm-calq-tip", tip));
	}

	toDOM() {
		const { labels, onCopy } = this.config;
		const button = el("button", `cm-calq-chip${this.flash ? " cm-calq-flash" : ""}`);
		button.type = "button";
		button.setAttribute("aria-label", labels.resultLabel(this.text));
		this.fill(button);
		let timer: ReturnType<typeof setTimeout> | undefined;
		button.addEventListener("mousedown", (e) => e.preventDefault());
		button.addEventListener("click", (e) => {
			e.preventDefault();
			const text = toClipboardText(this.text);
			navigator.clipboard?.writeText(text).catch(() => {});
			onCopy(text);
			button.classList.add("cm-calq-copied");
			button.replaceChildren(icon(ICONS.check), el("span", "cm-calq-value", labels.copied));
			clearTimeout(timer);
			timer = setTimeout(() => {
				button.classList.remove("cm-calq-copied");
				this.fill(button);
			}, COPIED_MS);
		});
		return button;
	}

	ignoreEvent() {
		return true;
	}
}

class ErrorWidget extends WidgetType {
	readonly message: string;
	readonly suggestion: { text: string; from: number; to: number } | null;
	readonly config: CalqConfig;

	constructor(message: string, suggestion: { text: string; from: number; to: number } | null, config: CalqConfig) {
		super();
		this.message = message;
		this.suggestion = suggestion;
		this.config = config;
	}

	eq(other: ErrorWidget) {
		return (
			other.message === this.message &&
			other.suggestion?.text === this.suggestion?.text &&
			other.suggestion?.from === this.suggestion?.from &&
			other.config === this.config
		);
	}

	toDOM(view: EditorView) {
		const wrap = el("span", "cm-calq-errors");
		const badge = el("span", "cm-calq-error");
		badge.append(icon(ICONS.alert), el("span", "", this.message));
		wrap.append(badge);
		const s = this.suggestion;
		if (s) {
			const { labels } = this.config;
			const button = el("button", "cm-calq-suggest");
			button.type = "button";
			button.append(`${labels.suggestionBefore}\u00A0`, el("b", "cm-calq-var", s.text), labels.suggestionAfter);
			button.addEventListener("mousedown", (e) => e.preventDefault());
			button.addEventListener("click", (e) => {
				e.preventDefault();
				view.dispatch({
					changes: { from: s.from, to: s.to, insert: s.text },
					selection: { anchor: s.from + s.text.length },
					userEvent: "input.complete",
				});
				view.focus();
			});
			wrap.append(button);
		}
		return wrap;
	}

	ignoreEvent() {
		return true;
	}
}

class TextWidget extends WidgetType {
	readonly text: string;
	readonly className: string;

	constructor(text: string, className: string) {
		super();
		this.text = text;
		this.className = className;
	}
	eq(other: TextWidget) {
		return other.text === this.text && other.className === this.className;
	}
	toDOM() {
		return el("span", this.className, this.text);
	}
}

// --- Декорации --------------------------------------------------------------

const TOKEN_CLASS = {
	number: "cm-calq-num",
	variable: "cm-calq-var",
	function: "cm-calq-fn",
	operator: "cm-calq-op",
	comment: "cm-calq-comment",
	text: "cm-calq-text",
} as const;

function buildDecorations(state: EditorState): DecorationSet {
	const { lines, names } = state.field(evaluationField);
	const ui = state.field(uiField);
	const config = state.facet(calqConfig);
	const cursorLine = state.doc.lineAt(state.selection.main.head).number;
	const hover = config.highlightVariable ? ui.hoverVar : null;
	const ranges: Range<Decoration>[] = [];
	const widget = (pos: number, w: WidgetType) => ranges.push(Decoration.widget({ widget: w, side: 1 }).range(pos));

	for (let n = 1; n <= state.doc.lines; n++) {
		const line = state.doc.line(n);
		const ev = lines[n - 1];
		if (!ev) continue;

		let lineClass = ev.kind === "comment" ? "cm-calq-comment-line" : "";
		if (hover && ev.assigns === hover) lineClass = "cm-calq-def";
		else if (hover && ev.uses.includes(hover)) lineClass = "cm-calq-use";
		if (lineClass) ranges.push(Decoration.line({ class: lineClass }).range(line.from));

		if (ev.kind === "comment") {
			const hash = line.text.indexOf("#");
			if (hash >= 0) ranges.push(Decoration.mark({ class: TOKEN_CLASS.comment }).range(line.from + hash, line.to));
			continue;
		}
		if (ev.kind !== "expression") {
			if (n === cursorLine && state.doc.length > 0 && config.labels.newLine) {
				widget(line.to, new TextWidget(config.labels.newLine, "cm-calq-placeholder"));
			}
			continue;
		}

		for (const t of tokenizeLine(line.text, names)) {
			if (t.from === t.to) continue;
			const attributes = t.name ? { "data-var": t.name } : undefined;
			ranges.push(
				Decoration.mark({ class: TOKEN_CLASS[t.kind], attributes }).range(line.from + t.from, line.from + t.to),
			);
		}

		const pending = isPending(ui, n);
		const e = ev.error;
		if (e && pending) {
			widget(line.to, new TextWidget("…", "cm-calq-pending"));
		} else if (e) {
			const at =
				e.from !== null && e.to !== null && e.to > e.from ? { from: line.from + e.from, to: line.from + e.to } : null;
			if (at) ranges.push(Decoration.mark({ class: "cm-calq-bad" }).range(at.from, at.to));
			const suggestion = e.suggestion && at ? { text: e.suggestion, ...at } : null;
			widget(line.to, new ErrorWidget(config.labels.error(ev), suggestion, config));
		} else if (ev.result && !ev.inputOnly) {
			const f = formatLineResult(ev.result, config.format);
			widget(line.to, new ResultWidget(f.text, f.rounded, f.exact, ui.flash.includes(n), config));
		}
	}
	return Decoration.set(ranges, true);
}

const decorationsField = StateField.define<DecorationSet>({
	create: buildDecorations,
	update: (value, tr) =>
		tr.docChanged || tr.selection || tr.effects.length || tr.reconfigured ? buildDecorations(tr.state) : value,
	provide: (f) => EditorView.decorations.from(f),
});

// --- Поведение: вспышка, пауза при вводе, наведение ---------------------------

function resultKey(l: EvaluatedLine | undefined): string {
	if (!l?.result) return "";
	return `${l.result.value}|${l.result.unit ?? ""}`;
}

const behaviour = ViewPlugin.fromClass(
	class {
		pendingTimer: ReturnType<typeof setTimeout> | undefined;
		flashTimer: ReturnType<typeof setTimeout> | undefined;

		readonly view: EditorView;

		constructor(view: EditorView) {
			this.view = view;
		}

		update(u: ViewUpdate) {
			if (!u.docChanged) return;
			const before = u.startState.field(evaluationField).lines;
			const after = u.state.field(evaluationField).lines;
			const edited = u.state.field(uiField).editedLine;
			const changed: number[] = [];
			if (before.length === after.length) {
				after.forEach((l, i) => {
					const n = i + 1;
					if (n !== edited && l.result && resultKey(l) !== resultKey(before[i])) changed.push(n);
				});
			}

			clearTimeout(this.pendingTimer);
			this.pendingTimer = setTimeout(() => this.view.dispatch({ effects: refreshPending.of(null) }), PENDING_MS + 20);

			if (changed.length) {
				queueMicrotask(() => this.view.dispatch({ effects: setFlash.of(changed) }));
				clearTimeout(this.flashTimer);
				this.flashTimer = setTimeout(() => this.view.dispatch({ effects: setFlash.of([]) }), FLASH_MS);
			}
		}

		destroy() {
			clearTimeout(this.pendingTimer);
			clearTimeout(this.flashTimer);
		}
	},
	{
		eventHandlers: {
			mouseover(e, view) {
				const target = e.target instanceof HTMLElement ? e.target.closest<HTMLElement>("[data-var]") : null;
				const name = target?.dataset.var ?? null;
				if (name !== view.state.field(uiField).hoverVar) view.dispatch({ effects: setHoverVar.of(name) });
			},
			mouseleave(_e, view) {
				if (view.state.field(uiField).hoverVar) view.dispatch({ effects: setHoverVar.of(null) });
			},
		},
	},
);

export function calqExtension(): Extension {
	return [evaluationField, uiField, decorationsField, behaviour];
}
