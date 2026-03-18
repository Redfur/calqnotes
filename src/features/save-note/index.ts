import { injectTranslation } from "@/shared/lib/i18n";
import { saveNoteTranslations } from "./translations";

export const TRANS_NS = "save-note";

injectTranslation(TRANS_NS, saveNoteTranslations as Record<string, Record<string, string>>);

export { SaveButton } from "./ui/SaveButton";
