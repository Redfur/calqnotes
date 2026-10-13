import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { noteTitle, useActiveNote, useNotesStore } from "@/entities/note";
import { effectiveFormat, useSettingsStore } from "@/entities/settings";
import { TRANS_NS } from "..";
import { textWithResults } from "../lib/copy-with-results";

export function useNoteActions() {
	const { t } = useTranslation([TRANS_NS, "common"]);
	const note = useActiveNote();
	const duplicateNote = useNotesStore((s) => s.duplicateNote);
	const deleteNote = useNotesStore((s) => s.deleteNote);
	const undoDelete = useNotesStore((s) => s.undoDelete);
	const globalFormat = useSettingsStore((s) => s.numberFormat);

	const title = note ? noteTitle(note, t("common:untitled")) : "";

	return {
		note,
		duplicate: () => {
			if (!note) return;
			const id = duplicateNote(note.id);
			const copy = useNotesStore.getState().notes.find((n) => n.id === id);
			if (copy) toast(t("duplicated", { name: noteTitle(copy, t("common:untitled")) }));
		},
		copyWithResults: () => {
			if (!note) return;
			const { text, count } = textWithResults(note.content, effectiveFormat(globalFormat, note.precision));
			navigator.clipboard?.writeText(text).catch(() => {});
			toast(t("copied", { count }));
		},
		share: async () => {
			if (!note) return;
			const { text, count } = textWithResults(note.content, effectiveFormat(globalFormat, note.precision));
			if (navigator.share) {
				await navigator.share({ title, text }).catch(() => {});
				return;
			}
			navigator.clipboard?.writeText(text).catch(() => {});
			toast(t("copied", { count }));
		},
		remove: (id = note?.id) => {
			const target = useNotesStore.getState().notes.find((n) => n.id === id);
			if (!target) return;
			deleteNote(target.id);
			toast(t("deleted", { name: noteTitle(target, t("common:untitled")) }), {
				action: { label: t("common:undo"), onClick: undoDelete },
				duration: 6000,
			});
		},
		title,
	};
}
