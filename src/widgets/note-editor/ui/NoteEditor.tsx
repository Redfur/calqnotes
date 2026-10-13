import { closeBrackets } from "@codemirror/autocomplete";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { Compartment, EditorState, type Extension } from "@codemirror/state";
import { EditorView, highlightActiveLine, keymap, lineNumbers, placeholder as placeholderExt } from "@codemirror/view";
import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { type EvaluatedLine, LINE_NS } from "@/entities/line";
import type { EditorSettings } from "@/entities/settings";
import { registerEditor } from "@/shared/lib/editor-bridge";
import type { NumberFormat } from "@/shared/lib/format-number";
import { cn } from "@/shared/lib/utils";
import { TRANS_NS } from "..";
import { type CalqConfig, calqConfig, calqExtension } from "../lib/calq-extension";
import { calqCompletion } from "../lib/completion";
import { calqKeymap } from "../lib/keymap";
import { calqTheme } from "../lib/theme";

interface NoteEditorProps {
	noteId: string;
	content: string;
	onChange: (content: string) => void;
	format: NumberFormat;
	editor: EditorSettings;
	className?: string;
}

export function NoteEditor({ noteId, content, onChange, format, editor, className }: NoteEditorProps) {
	const { t } = useTranslation([TRANS_NS, LINE_NS]);
	const hostRef = useRef<HTMLDivElement>(null);
	const viewRef = useRef<EditorView | null>(null);
	const onChangeRef = useRef(onChange);
	onChangeRef.current = onChange;

	const compartments = useMemo(
		() => ({
			config: new Compartment(),
			numbers: new Compartment(),
			wrap: new Compartment(),
			complete: new Compartment(),
			placeholder: new Compartment(),
		}),
		[],
	);

	const config = useMemo<CalqConfig>(
		() => ({
			format,
			highlightVariable: editor.highlightVariable,
			labels: {
				copy: t("copy"),
				copied: t("copied"),
				exact: (value) => t("exact", { value }),
				resultLabel: (value) => t("resultLabel", { value }),
				error: (line: EvaluatedLine) =>
					t(`${LINE_NS}:error.${line.error?.code ?? "invalid"}`, { name: line.error?.name }),
				suggestionBefore: t(`${LINE_NS}:suggestionBefore`),
				suggestionAfter: t(`${LINE_NS}:suggestionAfter`),
				newLine: t("newLine"),
			},
			onCopy: (value) => toast(t("copiedToast", { value })),
		}),
		[format, editor.highlightVariable, t],
	);

	const completion = useMemo(
		() =>
			calqCompletion({
				functionDescription: (name) => t(`${LINE_NS}:fn.${name}`),
				lastDescription: t(`${LINE_NS}:lastDescription`),
				variableFrom: (line, source) => t("variableFrom", { line, source }),
			}),
		[t],
	);

	const dynamic = (): Extension[] => [
		compartments.config.of(calqConfig.of(config)),
		compartments.numbers.of(editor.lineNumbers ? lineNumbers() : []),
		compartments.wrap.of(editor.wrap ? EditorView.lineWrapping : []),
		compartments.complete.of(editor.autocomplete ? completion : []),
		compartments.placeholder.of(placeholderExt(t("emptyPlaceholder"))),
	];

	const createState = (doc: string) =>
		EditorState.create({
			doc,
			extensions: [
				history(),
				closeBrackets(),
				highlightActiveLine(),
				keymap.of([...calqKeymap, ...defaultKeymap, ...historyKeymap]),
				calqTheme,
				calqExtension(),
				EditorView.contentAttributes.of({ "aria-label": t("editorLabel"), spellcheck: "false" }),
				EditorView.updateListener.of((u) => {
					if (u.docChanged) onChangeRef.current(u.state.doc.toString());
				}),
				...dynamic(),
			],
		});

	// Создаём редактор один раз
	// biome-ignore lint/correctness/useExhaustiveDependencies: состояние пересоздаётся при смене заметки ниже
	useEffect(() => {
		if (!hostRef.current) return;
		const view = new EditorView({ state: createState(content), parent: hostRef.current });
		viewRef.current = view;
		registerEditor({
			insert: (text) => {
				const { from, to } = view.state.selection.main;
				view.dispatch({
					changes: { from, to, insert: text },
					selection: { anchor: from + text.length },
					userEvent: "input",
				});
				view.focus();
			},
			appendLine: (text) => {
				const doc = view.state.doc;
				const lastEmpty = doc.line(doc.lines).text.trim() === "";
				const insert = doc.length === 0 || lastEmpty ? text : `\n${text}`;
				view.dispatch({
					changes: { from: doc.length, insert },
					selection: { anchor: doc.length + insert.length },
					scrollIntoView: true,
					userEvent: "input",
				});
			},
			focus: () => view.focus(),
		});
		return () => {
			registerEditor(null);
			view.destroy();
			viewRef.current = null;
		};
	}, []);

	// Другая заметка — новое состояние: своя история отмены и свой текст
	// biome-ignore lint/correctness/useExhaustiveDependencies: реагируем только на смену заметки
	useEffect(() => {
		const view = viewRef.current;
		if (!view) return;
		view.setState(createState(content));
	}, [noteId]);

	useEffect(() => {
		viewRef.current?.dispatch({
			effects: [
				compartments.config.reconfigure(calqConfig.of(config)),
				compartments.numbers.reconfigure(editor.lineNumbers ? lineNumbers() : []),
				compartments.wrap.reconfigure(editor.wrap ? EditorView.lineWrapping : []),
				compartments.complete.reconfigure(editor.autocomplete ? completion : []),
				compartments.placeholder.reconfigure(placeholderExt(t("emptyPlaceholder"))),
			],
		});
	}, [compartments, config, completion, editor.lineNumbers, editor.wrap, editor.autocomplete, t]);

	return <div ref={hostRef} className={cn("min-h-0 flex-1", className)} />;
}
