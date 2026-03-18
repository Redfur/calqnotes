import Editor from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { EvaluatedLine } from "@/entities/line";
import { SaveButton } from "@/features/save-note";
import { ThemeToggle } from "@/features/theme-toggle";
import { getTheme, THEME_CHANGE_EVENT, type Theme } from "@/shared/lib/theme";
import { cn } from "@/shared/lib/utils";
import { TRANS_NS } from "..";
import { registerCalqLanguage } from "../lib/monaco-math-language";

const LINE_HEIGHT = 22;
const MONACO_THEME_LIGHT = "calq-light";
const MONACO_THEME_DARK = "calq-dark";

interface NotebookEditorProps {
	value: string;
	onChange: (value: string) => void;
	evaluatedLines: EvaluatedLine[];
	activeNoteId: string | null;
	activeNoteDirty: boolean;
	onSave: () => void;
}

function defineMonacoThemes(monaco: typeof import("monaco-editor")) {
	monaco.editor.defineTheme(MONACO_THEME_LIGHT, {
		base: "vs",
		inherit: true,
		rules: [
			{ token: "comment", foreground: "6b7280", fontStyle: "italic" },
			{ token: "number", foreground: "2563eb" },
			{ token: "variable", foreground: "7c3aed" },
			{ token: "function", foreground: "4f46e5" },
			{ token: "operator", foreground: "6b6375" },
		],
		colors: {
			"editor.background": "#f4f3ec",
			"editor.foreground": "#6b6375",
		},
	});
	monaco.editor.defineTheme(MONACO_THEME_DARK, {
		base: "vs-dark",
		inherit: true,
		rules: [
			{ token: "comment", foreground: "9ca3af", fontStyle: "italic" },
			{ token: "number", foreground: "60a5fa" },
			{ token: "variable", foreground: "a78bfa" },
			{ token: "function", foreground: "818cf8" },
			{ token: "operator", foreground: "9ca3af" },
		],
		colors: {
			"editor.background": "#1f2028",
			"editor.foreground": "#9ca3af",
		},
	});
}

export function NotebookEditor({
	value,
	onChange,
	evaluatedLines,
	activeNoteId,
	activeNoteDirty,
	onSave,
}: NotebookEditorProps) {
	const { t } = useTranslation(TRANS_NS);
	const resultsRef = useRef<HTMLDivElement>(null);
	const [theme, setTheme] = useState<Theme>(() => getTheme());

	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key === "s") {
				e.preventDefault();
				onSave();
			}
		},
		[onSave],
	);

	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [handleKeyDown]);

	useEffect(() => {
		const updateTheme = () => setTheme(getTheme());
		updateTheme();
		window.addEventListener(THEME_CHANGE_EVENT, updateTheme);
		const media = window.matchMedia("(prefers-color-scheme: dark)");
		media.addEventListener("change", updateTheme);
		return () => {
			window.removeEventListener(THEME_CHANGE_EVENT, updateTheme);
			media.removeEventListener("change", updateTheme);
		};
	}, []);

	const handleBeforeMount = useCallback((monaco: typeof import("monaco-editor")) => {
		registerCalqLanguage(monaco);
		defineMonacoThemes(monaco);
	}, []);

	const handleMount = useCallback((editor: editor.IStandaloneCodeEditor, _monaco: typeof import("monaco-editor")) => {
		const model = editor.getModel();
		if (!model) return;

		const syncScroll = () => {
			const scrollTop = editor.getScrollTop();
			if (resultsRef.current) {
				resultsRef.current.scrollTop = scrollTop;
			}
		};

		editor.onDidScrollChange(syncScroll);
	}, []);

	const monacoTheme = theme === "dark" ? MONACO_THEME_DARK : MONACO_THEME_LIGHT;

	return (
		<div className="flex min-h-0 flex-1 flex-col bg-sidebar">
			<header className="flex h-16 shrink-0 items-center gap-2 border-b">
				<div className="flex justify-between w-full items-center gap-2 px-3">
					<SidebarTrigger size="icon" />
					<div className="flex items-center gap-1">
						<ThemeToggle />
						<SaveButton onSave={onSave} isDirty={activeNoteDirty} />
					</div>
				</div>
			</header>
			{!activeNoteId ? (
				<div className="flex flex-1 items-center justify-center text-muted-foreground">{t("selectOrCreate")}</div>
			) : (
				<div className="flex min-h-0 flex-1 min-w-0">
					<div className="min-h-0 min-w-0 flex-1">
						<Editor
							height="100%"
							language="calq"
							theme={monacoTheme}
							value={value}
							onChange={(v) => onChange(v ?? "")}
							beforeMount={handleBeforeMount}
							onMount={handleMount}
							options={{
								minimap: { enabled: false },
								fontSize: 14,
								lineHeight: LINE_HEIGHT,
								lineNumbers: "on",
								folding: false,
								scrollBeyondLastLine: false,
								automaticLayout: true,
								padding: { top: 16, bottom: 16 },
								renderLineHighlight: "line",
								bracketPairColorization: { enabled: true },
								scrollbar: { alwaysConsumeMouseWheel: false },
								quickSuggestions: { other: true, comments: false, strings: false },
								suggestOnTriggerCharacters: true,
								wordBasedSuggestions: "off",
							}}
							loading={
								<div className="flex h-full w-full items-center justify-center bg-(--code-bg)">
									<span className="text-muted-foreground">{t("loading")}</span>
								</div>
							}
						/>
					</div>
					<div
						ref={resultsRef}
						className="flex shrink-0 flex-col overflow-y-auto overflow-x-hidden border-l border-border bg-(--code-bg)"
						style={{ width: 120, lineHeight: LINE_HEIGHT }}
					>
						<div style={{ paddingTop: 16, paddingBottom: 16 }}>
							{evaluatedLines.map((line, index) => (
								<div
									key={line.id}
									className={cn(
										"flex items-center justify-end px-3 py-0 text-sm font-medium",
										index % 2 === 1 && "bg-black/5 dark:bg-white/5",
									)}
									style={{ minHeight: LINE_HEIGHT }}
								>
									<span
										className={cn("truncate", line.error ? "text-destructive" : "text-chart-2")}
										title={line.error ?? (line.result !== null ? String(line.result) : "")}
									>
										{line.error ?? (line.result !== null ? String(line.result) : "\u00A0")}
									</span>
								</div>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
