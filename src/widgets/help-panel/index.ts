import { injectTranslation } from "@/shared/lib/i18n";
import { helpPanelTranslations } from "./translations";

export const TRANS_NS = "help-panel";

injectTranslation(TRANS_NS, helpPanelTranslations);

export { HelpPanel } from "./ui/HelpPanel";
