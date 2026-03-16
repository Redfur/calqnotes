import { useCallback, useEffect, useRef, useState } from "react";
import type { EvaluatedLine } from "@/entities/line";
import { SaveButton } from "@/features/save-document";
import { cn } from "@/shared/lib/utils";
import { tokenize } from "../lib/syntax-highlight";

interface NotebookEditorProps {
	value: string;
	onChange: (value: string) => void;
	evaluatedLines: EvaluatedLine[];
	activeDocumentId: string | null;
	activeDocumentDirty: boolean;
	onSave: () => void;
}

const LINE_HEIGHT_EM = 1.4;
const PADDING = 16;

function HighlightedInput({ text }: { text: string }) {
	const tokens = tokenize(text);
	return (
		<>
			{tokens.map((token) => (
				<span
					key={token.id}
					className={cn(
						token.type === "variable" && "text-chart-2",
						token.type === "number" && "text-chart-1",
						token.type === "operator" && "text-foreground/80",
						token.type === "function" && "text-chart-3",
						token.type === "comment" && "text-muted-foreground italic",
					)}
				>
					{token.text}
				</span>
			))}
		</>
	);
}

export function NotebookEditor({
	value,
	onChange,
	evaluatedLines,
	activeDocumentId,
	activeDocumentDirty,
	onSave,
}: NotebookEditorProps) {
	const editorRef = useRef<HTMLTextAreaElement>(null);
	const [cursorLine, setCursorLine] = useState(0);

	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key === "s") {
				e.preventDefault();
				onSave();
			}
		},
		[onSave],
	);

	const updateCursorLine = useCallback(() => {
		const el = editorRef.current;
		if (!el) return;
		const line = value.slice(0, el.selectionStart).split("\n").length - 1;
		setCursorLine(Math.max(0, line));
	}, [value]);

	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [handleKeyDown]);

	useEffect(() => {
		updateCursorLine();
	}, [value, updateCursorLine]);

	if (!activeDocumentId) {
		return (
			<div className="flex flex-1 items-center justify-center text-muted-foreground">
				Выберите или создайте документ
			</div>
		);
	}

	const lines = value.split("\n");
	const minLines = Math.max(lines.length, 1);

	return (
		<div className="flex min-h-0 flex-1 flex-col">
			<div className="flex shrink-0 items-center justify-end border-b border-border p-2">
				<SaveButton onSave={onSave} isDirty={activeDocumentDirty} />
			</div>
			<div className="flex min-h-0 flex-1 flex-col overflow-auto">
				<div
					className="relative min-h-full font-mono text-sm"
					style={{
						minHeight: `max(calc(${minLines}em * ${LINE_HEIGHT_EM} + ${PADDING * 2}px), 100%)`,
						lineHeight: LINE_HEIGHT_EM,
					}}
				>
					{/* Overlay: подсветка + результаты inline */}
					<div
						className="pointer-events-none absolute inset-0 flex flex-col"
						style={{
							padding: PADDING,
							lineHeight: LINE_HEIGHT_EM,
						}}
					>
						{evaluatedLines.map((line, index) => (
							<div
								key={line.id}
								className={cn(
									"flex min-w-0 gap-4 px-1 -mx-1 rounded-sm",
									index % 2 === 1 && "bg-muted/30",
									cursorLine === index && "bg-accent/20 ring-1 ring-inset ring-accent/30",
								)}
								style={{ minHeight: `${LINE_HEIGHT_EM}em` }}
							>
								<span className="min-w-0 flex-1 overflow-hidden whitespace-pre">
									<HighlightedInput text={line.input || "\u00A0"} />
								</span>
								<span
									className={cn("shrink-0 text-right font-medium", line.error ? "text-destructive" : "text-chart-2")}
								>
									{line.error ?? (line.result !== null ? String(line.result) : "")}
								</span>
							</div>
						))}
					</div>
					{/* Textarea */}
					<textarea
						ref={editorRef}
						value={value}
						onChange={(e) => onChange(e.target.value)}
						onSelect={updateCursorLine}
						onKeyUp={updateCursorLine}
						onClick={updateCursorLine}
						placeholder=""
						className={cn(
							"absolute inset-0 w-full resize-none border-0 bg-transparent font-mono text-sm outline-none",
							"caret-foreground text-transparent selection:bg-primary/20",
						)}
						style={{
							padding: PADDING,
							lineHeight: LINE_HEIGHT_EM,
						}}
						spellCheck={false}
					/>
				</div>
			</div>
		</div>
	);
}
