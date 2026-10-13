import { CircleHelp, Plus, Settings } from "lucide-react";
import type { RefObject } from "react";
import { useTranslation } from "react-i18next";
import { Kbd } from "@/components/ui/kbd";
import { SaveStatus, titleFromContent, useActiveNote, useNotesStore } from "@/entities/note";
import { NoteActionsMenu } from "@/features/note-actions";
import { PrecisionPicker } from "@/features/precision-picker";
import { cn } from "@/shared/lib/utils";
import { Logo } from "@/shared/ui/Logo";
import { TRANS_NS } from "..";

interface AppHeaderProps {
	titleRef: RefObject<HTMLInputElement | null>;
	autosave: boolean;
	helpOpen: boolean;
	onOpenNotes: () => void;
	onToggleHelp: () => void;
	onOpenSettings: () => void;
	precisionLabel: (p: string) => string;
}

const iconButton =
	"inline-flex size-[34px] shrink-0 items-center justify-center rounded-md text-subtle hover:bg-accent aria-pressed:bg-accent";

export function AppHeader({
	titleRef,
	autosave,
	helpOpen,
	onOpenNotes,
	onToggleHelp,
	onOpenSettings,
	precisionLabel,
}: AppHeaderProps) {
	const { t } = useTranslation([TRANS_NS, "common"]);
	const note = useActiveNote();
	const status = useNotesStore((s) => s.saveStatus);
	const saveNow = useNotesStore((s) => s.saveNow);
	const renameNote = useNotesStore((s) => s.renameNote);
	const createNote = useNotesStore((s) => s.createNote);
	const derived = note ? titleFromContent(note.content) : "";

	return (
		<header className="flex shrink-0 items-center gap-1.5 border-b px-4 py-2">
			<Logo />
			<button
				type="button"
				onClick={onOpenNotes}
				aria-haspopup="dialog"
				className="inline-flex h-[34px] items-center gap-2 rounded-md pr-2 pl-2.5 text-sm text-subtle hover:bg-accent"
			>
				{t("notes")}
				<Kbd className="h-[18px] border border-input bg-card px-1.5 text-[11px] font-normal">Ctrl K</Kbd>
			</button>
			<span aria-hidden className="text-input">
				/
			</span>
			{note && (
				<>
					<input
						ref={titleRef}
						type="text"
						aria-label={t("noteTitle")}
						value={note.name}
						placeholder={derived || t("common:untitled")}
						onChange={(e) => renameNote(note.id, e.target.value)}
						onBlur={(e) => {
							const trimmed = e.target.value.trim();
							if (trimmed !== note.name) renameNote(note.id, trimmed);
						}}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === "Escape") e.currentTarget.blur();
						}}
						className={cn(
							"h-8 max-w-[40ch] min-w-[6ch] rounded-sm bg-transparent px-2 text-sm font-semibold outline-none [field-sizing:content]",
							"hover:shadow-[inset_0_0_0_1px_var(--input)] focus:bg-card focus:shadow-[inset_0_0_0_1px_var(--primary)]",
							!note.name && derived && "placeholder:text-foreground",
						)}
					/>
					{!note.name && !derived && (
						<span className="truncate text-xs text-muted-foreground max-lg:hidden">· {t("titleHint")}</span>
					)}
					<SaveStatus
						status={status}
						autosave={autosave}
						onRetry={() => void saveNow()}
						className="ml-1 max-lg:hidden"
					/>
				</>
			)}
			<div className="flex-1" />
			<button
				type="button"
				aria-label={t("newNote")}
				title={t("newNote")}
				onClick={() => createNote()}
				className={iconButton}
			>
				<Plus className="size-[18px]" aria-hidden />
			</button>
			<PrecisionPicker onOpenSettings={onOpenSettings} />
			<button
				type="button"
				aria-label={t("help")}
				title={t("help")}
				aria-pressed={helpOpen}
				onClick={onToggleHelp}
				className={iconButton}
			>
				<CircleHelp className="size-[18px]" aria-hidden />
			</button>
			<button
				type="button"
				aria-label={t("settings")}
				title={t("settings")}
				onClick={onOpenSettings}
				className={iconButton}
			>
				<Settings className="size-[18px]" aria-hidden />
			</button>
			<NoteActionsMenu onRename={() => titleRef.current?.focus()} precisionLabel={precisionLabel} />
		</header>
	);
}
