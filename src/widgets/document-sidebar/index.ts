import { injectTranslation } from "@/shared/lib/i18n";
import { documentSidebarTranslations } from "./translations";

export const TRANS_NS = "document-sidebar";

injectTranslation(TRANS_NS, documentSidebarTranslations as Record<string, Record<string, string>>);

export { DocumentSidebar } from "./ui/DocumentSidebar";
