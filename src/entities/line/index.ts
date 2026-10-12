import { injectTranslation } from "@/shared/lib/i18n";
import { lineTranslations } from "./translations";

export const LINE_NS = "line";

injectTranslation(LINE_NS, lineTranslations);

export { type FormattedResult, formatLineResult } from "./lib/format-result";
export { FUNCTIONS, type FunctionInfo, KEYWORDS, UNITS } from "./model/catalog";
export { evaluateNotebook } from "./model/evaluate";
export { linesToText, textToLines } from "./model/text";
export type { EvaluatedLine, Line, LineError, LineErrorCode, LineKind, LineResult } from "./model/types";
