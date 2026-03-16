import { injectTranslation } from "@/shared/lib/i18n";
import { saveDocumentTranslations } from "./translations";

export const TRANS_NS = "save-document";

injectTranslation(TRANS_NS, saveDocumentTranslations as Record<string, Record<string, string>>);

export { SaveButton } from "./ui/SaveButton";
