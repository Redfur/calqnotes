import { injectTranslation } from "@/shared/lib/i18n";
import { installAppTranslations } from "./translations";

export const TRANS_NS = "install-app";

injectTranslation(TRANS_NS, installAppTranslations);

export { useInstallStore } from "./model/install";
export { InstallButton } from "./ui/InstallButton";
export { InstallSection } from "./ui/InstallSection";
export { UpdateNotifier } from "./ui/UpdateNotifier";
