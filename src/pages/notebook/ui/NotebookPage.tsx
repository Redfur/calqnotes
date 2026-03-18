import { useEffect } from "react";
import { useEvaluatedLines, useNotebookStore } from "@/app/store/notebook-store";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { NoteSidebar } from "@/widgets/note-sidebar";
import { NotebookEditor } from "@/widgets/notebook-editor";

export function NotebookPage() {
	const initialize = useNotebookStore((s) => s.initialize);
	const notes = useNotebookStore((s) => s.notes);
	const activeNoteId = useNotebookStore((s) => s.activeNoteId);
	const content = useNotebookStore((s) => s.content);
	const setActiveNote = useNotebookStore((s) => s.setActiveNote);
	const setContent = useNotebookStore((s) => s.setContent);
	const createNote = useNotebookStore((s) => s.createNote);
	const deleteNote = useNotebookStore((s) => s.deleteNote);
	const renameNote = useNotebookStore((s) => s.renameNote);
	const saveNote = useNotebookStore((s) => s.saveNote);

	const evaluatedLines = useEvaluatedLines();
	const activeNote = notes.find((d) => d.id === activeNoteId);
	const currentContent = activeNoteId ? (content[activeNoteId] ?? "") : "";

	useEffect(() => {
		initialize();
	}, [initialize]);

	// Предупреждение при закрытии с несохранёнными изменениями
	useEffect(() => {
		const hasDirty = notes.some((d) => d.isDirty);
		const handler = (e: BeforeUnloadEvent) => {
			if (hasDirty) {
				e.preventDefault();
			}
		};
		window.addEventListener("beforeunload", handler);
		return () => window.removeEventListener("beforeunload", handler);
	}, [notes]);

	const handleSave = async () => {
		if (activeNoteId) {
			await saveNote(activeNoteId);
		}
	};

	return (
		<SidebarProvider>
			<NoteSidebar
				notes={notes}
				activeNoteId={activeNoteId}
				onSelect={(id) => setActiveNote(id)}
				onCreate={createNote}
				onDelete={deleteNote}
				onRename={renameNote}
			/>
			<SidebarInset>
				<NotebookEditor
					value={currentContent}
					onChange={(text) => activeNoteId && setContent(activeNoteId, text)}
					evaluatedLines={evaluatedLines}
					activeNoteId={activeNoteId}
					activeNoteDirty={activeNote?.isDirty ?? false}
					onSave={handleSave}
				/>
			</SidebarInset>
		</SidebarProvider>
	);
}
