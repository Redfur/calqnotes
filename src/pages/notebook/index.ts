import { injectTranslation } from "@/shared/lib/i18n";
import { notebookPageTranslations } from "./translations";

export const TRANS_NS = "notebook-page";

injectTranslation(TRANS_NS, notebookPageTranslations);

export { NotebookPage } from "./ui/NotebookPage";
