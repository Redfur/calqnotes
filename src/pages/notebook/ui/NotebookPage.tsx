import { useEffect } from "react";
import { useEvaluatedLines, useNotebookStore } from "@/app/store/notebook-store";
import { DocumentSidebar } from "@/widgets/document-sidebar";
import { NotebookEditor } from "@/widgets/notebook-editor";

export function NotebookPage() {
	const initialize = useNotebookStore((s) => s.initialize);
	const documents = useNotebookStore((s) => s.documents);
	const activeDocumentId = useNotebookStore((s) => s.activeDocumentId);
	const content = useNotebookStore((s) => s.content);
	const setActiveDocument = useNotebookStore((s) => s.setActiveDocument);
	const setContent = useNotebookStore((s) => s.setContent);
	const createDocument = useNotebookStore((s) => s.createDocument);
	const deleteDocument = useNotebookStore((s) => s.deleteDocument);
	const renameDocument = useNotebookStore((s) => s.renameDocument);
	const saveDocument = useNotebookStore((s) => s.saveDocument);

	const evaluatedLines = useEvaluatedLines();
	const activeDoc = documents.find((d) => d.id === activeDocumentId);
	const currentContent = activeDocumentId ? (content[activeDocumentId] ?? "") : "";

	useEffect(() => {
		initialize();
	}, [initialize]);

	// Предупреждение при закрытии с несохранёнными изменениями
	useEffect(() => {
		const hasDirty = documents.some((d) => d.isDirty);
		const handler = (e: BeforeUnloadEvent) => {
			if (hasDirty) {
				e.preventDefault();
			}
		};
		window.addEventListener("beforeunload", handler);
		return () => window.removeEventListener("beforeunload", handler);
	}, [documents]);

	const handleSave = async () => {
		if (activeDocumentId) {
			await saveDocument(activeDocumentId);
		}
	};

	return (
		<div className="flex h-svh min-h-0">
			<DocumentSidebar
				documents={documents}
				activeDocumentId={activeDocumentId}
				onSelect={(id) => setActiveDocument(id)}
				onCreate={createDocument}
				onDelete={deleteDocument}
				onRename={renameDocument}
			/>
			<NotebookEditor
				value={currentContent}
				onChange={(text) => activeDocumentId && setContent(activeDocumentId, text)}
				evaluatedLines={evaluatedLines}
				activeDocumentId={activeDocumentId}
				activeDocumentDirty={activeDoc?.isDirty ?? false}
				onSave={handleSave}
			/>
		</div>
	);
}
