import { injectTranslation } from "@/shared/lib/i18n";
import { precisionPickerTranslations } from "./translations";

export const TRANS_NS = "precision-picker";

injectTranslation(TRANS_NS, precisionPickerTranslations);

export { usePrecision } from "./model/use-precision";
export { PrecisionOptions } from "./ui/PrecisionOptions";
export { PrecisionPicker } from "./ui/PrecisionPicker";
