import { injectTranslation } from "@/shared/lib/i18n";
import { createNoteTranslations } from "./translations";

export const TRANS_NS = "create-note";

injectTranslation(TRANS_NS, createNoteTranslations as Record<string, Record<string, string>>);

export { CreateNoteButton } from "./ui/CreateNoteButton";
