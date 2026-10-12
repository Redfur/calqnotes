import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useNotesStore } from "@/entities/note";
import { TRANS_NS } from "..";
import { NoteSearchList } from "./NoteSearchList";

interface NotePaletteProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onDelete: (id: string) => void;
}

export function NotePalette({ open, onOpenChange, onDelete }: NotePaletteProps) {
	const { t } = useTranslation(TRANS_NS);
	const openNote = useNotesStore((s) => s.openNote);
	const createNote = useNotesStore((s) => s.createNote);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				showCloseButton={false}
				className="top-14 max-h-[calc(100svh-80px)] translate-y-0 gap-0 overflow-hidden rounded-[14px] p-0 sm:max-w-[640px]"
			>
				<DialogTitle className="sr-only">{t("title")}</DialogTitle>
				<DialogDescription className="sr-only">{t("search")}</DialogDescription>
				{open && (
					<NoteSearchList
						autoFocus
						onOpen={(id) => {
							openNote(id);
							onOpenChange(false);
						}}
						onCreate={(name) => {
							createNote(name ? { name } : undefined);
							onOpenChange(false);
						}}
						onDelete={onDelete}
					/>
				)}
			</DialogContent>
		</Dialog>
	);
}
