import { injectTranslation } from "@/shared/lib/i18n";
import { notePaletteTranslations } from "./translations";

export const TRANS_NS = "note-palette";

injectTranslation(TRANS_NS, notePaletteTranslations);

export { NotePalette } from "./ui/NotePalette";
export { NoteSearchList } from "./ui/NoteSearchList";
