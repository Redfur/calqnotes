import { injectTranslation } from "@/shared/lib/i18n";
import { noteSidebarTranslations } from "./translations";

export const TRANS_NS = "note-sidebar";

injectTranslation(TRANS_NS, noteSidebarTranslations as Record<string, Record<string, string>>);

export { NoteSidebar } from "./ui/NoteSidebar";
