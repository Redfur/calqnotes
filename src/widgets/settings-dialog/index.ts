import { injectTranslation } from "@/shared/lib/i18n";
import { settingsDialogTranslations } from "./translations";

export const TRANS_NS = "settings-dialog";

injectTranslation(TRANS_NS, settingsDialogTranslations);

export { SettingsDialog } from "./ui/SettingsDialog";
