import { injectTranslation } from "@/shared/lib/i18n";
import { notebookEditorTranslations } from "./translations";

export const TRANS_NS = "notebook-editor";

injectTranslation(TRANS_NS, notebookEditorTranslations as Record<string, Record<string, string>>);

export { NotebookEditor } from "./ui/NotebookEditor";
