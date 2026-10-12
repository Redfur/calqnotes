import { injectTranslation } from "@/shared/lib/i18n";
import { noteTranslations } from "./translations";

export const NOTE_NS = "note";

injectTranslation(NOTE_NS, noteTranslations);

export { notePreview, noteTitle, titleFromContent } from "./lib/title";
export { useActiveNote, useNotesStore } from "./model/store";
export type { Note, NotePrecision, NoteSeed, SaveStatus as SaveStatusValue } from "./model/types";
export { SaveStatus } from "./ui/SaveStatus";
