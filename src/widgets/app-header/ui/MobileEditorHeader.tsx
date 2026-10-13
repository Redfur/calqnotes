import { ChevronLeft, Ellipsis } from "lucide-react";
import { useTranslation } from "react-i18next";
import { noteTitle, SaveStatus, useActiveNote, useNotesStore } from "@/entities/note";
import { TRANS_NS } from "..";

interface MobileEditorHeaderProps {
	autosave: boolean;
	precisionShort: string;
	precisionLabel: string;
	onBack: () => void;
	onOpenMenu: (focus: "precision" | "actions") => void;
}

export function MobileEditorHeader({
	autosave,
	precisionShort,
	precisionLabel,
	onBack,
	onOpenMenu,
}: MobileEditorHeaderProps) {
	const { t } = useTranslation([TRANS_NS, "common"]);
	const note = useActiveNote();
	const status = useNotesStore((s) => s.saveStatus);
	const saveNow = useNotesStore((s) => s.saveNow);
	const touch = "inline-flex h-11 min-w-11 items-center justify-center rounded-lg text-subtle active:bg-accent";

	return (
		<header className="flex h-14 shrink-0 items-center gap-0.5 border-b px-1">
			<button type="button" aria-label={t("allNotes")} onClick={onBack} className={`${touch} text-foreground`}>
				<ChevronLeft className="size-6" aria-hidden />
			</button>
			<div className="min-w-0 flex-1">
				<div className="truncate text-base font-semibold">{note ? noteTitle(note, t("common:untitled")) : ""}</div>
				<SaveStatus status={status} autosave={autosave} onRetry={() => void saveNow()} />
			</div>
			<button
				type="button"
				aria-label={t("precisionAria", { value: precisionLabel })}
				onClick={() => onOpenMenu("precision")}
				className={`${touch} px-2.5 text-[13px] tabular-nums`}
			>
				{precisionShort}
			</button>
			<button type="button" aria-label={t("common:menu")} onClick={() => onOpenMenu("actions")} className={touch}>
				<Ellipsis className="size-5" aria-hidden />
			</button>
		</header>
	);
}
