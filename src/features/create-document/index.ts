import { injectTranslation } from "@/shared/lib/i18n";
import { createDocumentTranslations } from "./translations";

export const TRANS_NS = "create-document";

injectTranslation(TRANS_NS, createDocumentTranslations as Record<string, Record<string, string>>);

export { CreateDocumentButton } from "./ui/CreateDocumentButton";
