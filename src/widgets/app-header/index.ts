import { injectTranslation } from "@/shared/lib/i18n";
import { appHeaderTranslations } from "./translations";

export const TRANS_NS = "app-header";

injectTranslation(TRANS_NS, appHeaderTranslations);

export { AppHeader } from "./ui/AppHeader";
export { MobileEditorHeader } from "./ui/MobileEditorHeader";
export { MobileListHeader } from "./ui/MobileListHeader";
export { MobileNoteMenu } from "./ui/MobileNoteMenu";
