import { injectTranslation } from "@/shared/lib/i18n";
import { noteEditorTranslations } from "./translations";

export const TRANS_NS = "note-editor";

injectTranslation(TRANS_NS, noteEditorTranslations);

export { NoteEditor } from "./ui/NoteEditor";
