import { Command } from "cmdk";
import { Copy, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { type KeyboardEvent, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { NOTE_NS, type Note, noteTitle, useNotesStore } from "@/entities/note";
import { formatRelativeDate } from "@/shared/lib/format-date";
import { localeOf } from "@/shared/lib/i18n";
import { cn } from "@/shared/lib/utils";
import { TRANS_NS } from "..";
import { type Highlighted, searchNotes } from "../lib/search";

interface NoteSearchListProps {
	/** Заметка выбрана — открыть её */
	onOpen: (id: string) => void;
	onCreate: (name?: string) => void;
	onDelete: (id: string) => void;
	/** Телефон: без подсказок клавиш, крупные строки, действия в отдельном меню */
	touch?: boolean;
	onMore?: (note: Note) => void;
	autoFocus?: boolean;
	className?: string;
}

function Mark({ text }: { text: Highlighted }) {
	return (
		<>
			{text.before}
			{text.match && <mark className="rounded-[2px] bg-mark px-px text-inherit">{text.match}</mark>}
			{text.after}
		</>
	);
}

export function NoteSearchList({
	onOpen,
	onCreate,
	onDelete,
	touch,
	onMore,
	autoFocus,
	className,
}: NoteSearchListProps) {
	const { t, i18n } = useTranslation([TRANS_NS, NOTE_NS, "common"]);
	const notes = useNotesStore((s) => s.notes);
	const activeId = useNotesStore((s) => s.activeNoteId);
	const duplicateNote = useNotesStore((s) => s.duplicateNote);
	const renameNote = useNotesStore((s) => s.renameNote);
	const [query, setQuery] = useState("");
	const [selected, setSelected] = useState(activeId ?? "");
	const [editing, setEditing] = useState<string | null>(null);
	const [draft, setDraft] = useState("");

	const untitled = t("common:untitled");
	const titleOf = (n: Note) => noteTitle(n, untitled);
	const hits = useMemo(() => searchNotes(notes, query, (n) => noteTitle(n, untitled)), [notes, query, untitled]);
	const dateLabels = { today: (time: string) => t(`${NOTE_NS}:today`, { time }), yesterday: t(`${NOTE_NS}:yesterday`) };

	const startRename = (n: Note) => {
		setEditing(n.id);
		setDraft(n.name || titleOf(n));
	};
	const saveRename = () => {
		if (editing && draft.trim()) renameNote(editing, draft.trim());
		setEditing(null);
	};

	const onKeyDown = (e: KeyboardEvent) => {
		if (editing) return;
		const note = notes.find((n) => n.id === selected);
		if (!note) return;
		if (e.key === "F2") {
			e.preventDefault();
			startRename(note);
		} else if (e.key === "Delete" && !query) {
			e.preventDefault();
			onDelete(note.id);
		}
	};

	const iconButton =
		"inline-flex size-[30px] items-center justify-center rounded-sm text-muted-foreground hover:bg-card hover:text-foreground";

	return (
		<Command
			shouldFilter={false}
			value={selected}
			onValueChange={setSelected}
			onKeyDown={onKeyDown}
			className={cn("flex min-h-0 flex-col", className)}
			label={t("title")}
		>
			<div className="flex h-[52px] shrink-0 items-center gap-2.5 border-b px-4 text-muted-foreground">
				<Search className="size-[18px]" aria-hidden />
				<label htmlFor="note-search" className="sr-only">
					{t("search")}
				</label>
				<Command.Input
					id="note-search"
					autoFocus={autoFocus}
					value={query}
					onValueChange={setQuery}
					placeholder={touch ? t("searchShort") : t("search")}
					className="min-w-0 flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-placeholder"
				/>
				<span className="text-xs">{t("count", { count: hits.length })}</span>
			</div>

			<Command.List className="min-h-0 flex-1 overflow-y-auto p-1.5 sm:max-h-[470px]">
				{hits.length === 0 && (
					<div className="px-4 py-7 text-center text-sm text-muted-foreground">
						{t("nothingFound", { q: query.trim() })}
						<button
							type="button"
							onClick={() => onCreate(query.trim())}
							className="mx-auto mt-3 block h-[34px] rounded-md border border-input bg-card px-3 text-[13px] text-foreground hover:bg-accent"
						>
							{t("createNamed", { q: query.trim() })}
						</button>
					</div>
				)}
				{hits.map(({ note, title, preview, inText }) =>
					editing === note.id ? (
						<div key={note.id} className="flex items-center gap-2 rounded-md bg-selection px-2 py-1.5">
							<label htmlFor="rename-note" className="sr-only">
								{t("renameLabel")}
							</label>
							<input
								id="rename-note"
								// biome-ignore lint/a11y/noAutofocus: поле появляется по команде пользователя
								autoFocus
								value={draft}
								onChange={(e) => setDraft(e.target.value)}
								onKeyDown={(e) => {
									e.stopPropagation();
									if (e.key === "Enter") saveRename();
									if (e.key === "Escape") setEditing(null);
								}}
								className="h-[34px] min-w-0 flex-1 rounded-sm border border-primary bg-card px-2.5 text-sm outline-none"
							/>
							<button
								type="button"
								onClick={saveRename}
								className="h-[34px] rounded-sm bg-foreground px-3 text-[13px] text-card"
							>
								{t("common:save")}
							</button>
							<button
								type="button"
								onClick={() => setEditing(null)}
								className="h-[34px] rounded-sm border border-input bg-card px-2.5 text-[13px]"
							>
								{t("common:cancel")}
							</button>
						</div>
					) : (
						<Command.Item
							key={note.id}
							value={note.id}
							onSelect={() => onOpen(note.id)}
							className={cn(
								"group/row flex cursor-pointer items-center gap-3 rounded-md py-2 pr-2 pl-2.5 data-[selected=true]:bg-accent",
								note.id === activeId && "bg-selection data-[selected=true]:bg-selection",
								touch && "min-h-14",
							)}
						>
							<div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] gap-x-3">
								<span className="truncate text-sm font-medium">
									<Mark text={title} />
								</span>
								<span className="text-xs text-muted-foreground">
									{formatRelativeDate(note.updatedAt, dateLabels, localeOf(i18n.language))}
								</span>
								<span className="col-span-2 truncate text-[13px] text-muted-foreground">
									<Mark text={preview} />
									{inText && ` — ${t("inText")}`}
								</span>
							</div>
							{touch && onMore ? (
								<button
									type="button"
									aria-label={t("rename", { name: titleOf(note) })}
									onClick={(e) => {
										e.stopPropagation();
										onMore(note);
									}}
									className="inline-flex size-11 items-center justify-center rounded-md text-muted-foreground"
								>
									<span aria-hidden>⋯</span>
								</button>
							) : (
								<div className="flex shrink-0 gap-0.5 opacity-0 group-hover/row:opacity-100 group-focus-within/row:opacity-100 group-data-[selected=true]/row:opacity-100">
									<button
										type="button"
										className={iconButton}
										aria-label={t("rename", { name: titleOf(note) })}
										title="F2"
										onClick={(e) => {
											e.stopPropagation();
											startRename(note);
										}}
									>
										<Pencil className="size-[15px]" aria-hidden />
									</button>
									<button
										type="button"
										className={iconButton}
										aria-label={t("duplicate", { name: titleOf(note) })}
										onClick={(e) => {
											e.stopPropagation();
											duplicateNote(note.id);
										}}
									>
										<Copy className="size-[15px]" aria-hidden />
									</button>
									<button
										type="button"
										className={cn(iconButton, "hover:text-destructive")}
										aria-label={t("delete", { name: titleOf(note) })}
										title="Del"
										onClick={(e) => {
											e.stopPropagation();
											onDelete(note.id);
										}}
									>
										<Trash2 className="size-[15px]" aria-hidden />
									</button>
								</div>
							)}
						</Command.Item>
					),
				)}
			</Command.List>

			<div className="flex shrink-0 flex-wrap items-center gap-3.5 border-t px-4 py-2.5 text-xs text-muted-foreground">
				{!touch && (
					<>
						<span>{t("hintSelect")}</span>
						<span>{t("hintOpen")}</span>
						<span>{t("hintRename")}</span>
						<span>{t("hintDelete")}</span>
					</>
				)}
				<div className="flex-1" />
				<button
					type="button"
					onClick={() => onCreate()}
					className={cn(
						"inline-flex items-center gap-1.5 rounded-sm bg-foreground px-2.5 text-[13px] text-card",
						touch ? "h-11 px-4 text-sm" : "h-[30px]",
					)}
				>
					<Plus className="size-3.5" aria-hidden />
					{t("newNote")}
				</button>
			</div>
		</Command>
	);
}
