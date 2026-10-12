import { injectTranslation } from "@/shared/lib/i18n";
import { noteActionsTranslations } from "./translations";

export const TRANS_NS = "note-actions";

injectTranslation(TRANS_NS, noteActionsTranslations);

export { useNoteActions } from "./model/use-note-actions";
export { NoteActionsMenu } from "./ui/NoteActionsMenu";
