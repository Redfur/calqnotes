import { create } from "zustand";
import type { EvaluatedLine, Line } from "@/entities/line";
import { evaluateNotebook } from "@/entities/line";
import type { Note } from "@/entities/note";
import {
	createNote as createNoteInStorage,
	deleteNote as deleteNoteFromStorage,
	loadNote,
	loadNotes,
	saveNote as saveNoteToStorage,
} from "@/shared/api/storage";
import { i18n } from "@/shared/lib/i18n";
import { generateId } from "@/shared/lib/id";

// Ключ localStorage оставлен для совместимости с существующими данными
const LAST_ACTIVE_NOTE_KEY = "calqnotes-last-active-doc";

let initPromise: Promise<void> | null = null;

function textToLines(text: string): Line[] {
	return text.split("\n").map((input, i) => ({ id: `line-${i}`, input }));
}

function linesToText(lines: Line[]): string {
	return lines.map((l) => l.input).join("\n");
}

interface NotebookState {
	notes: Note[];
	activeNoteId: string | null;
	content: Record<string, string>;
	sortOrder: Record<string, number>;
	initialized: boolean;
}

interface NotebookActions {
	initialize: () => Promise<void>;
	setActiveNote: (id: string | null) => Promise<void>;
	setContent: (noteId: string, text: string) => void;
	createNote: () => Promise<void>;
	deleteNote: (id: string) => Promise<void>;
	renameNote: (id: string, name: string) => void;
	saveNote: (id: string) => Promise<void>;
}

export const useNotebookStore = create<NotebookState & NotebookActions>((set, get) => ({
	notes: [],
	activeNoteId: null,
	content: {},
	sortOrder: {},
	initialized: false,

	initialize: async () => {
		if (get().initialized) return;
		if (!initPromise) {
			initPromise = (async () => {
				const loadedNotes = await loadNotes();
				if (loadedNotes.length === 0) {
					const id = generateId();
					const name = i18n.t("common:untitledN", { n: 1 });
					const sortOrder = Date.now();
					await createNoteInStorage(id, name, [], sortOrder);
					set({
						notes: [{ id, name, isDirty: false }],
						activeNoteId: id,
						content: { [id]: "" },
						sortOrder: { [id]: sortOrder },
						initialized: true,
					});
				} else {
					const noteList: Note[] = loadedNotes.map((d) => ({
						id: d.id,
						name: d.name,
						isDirty: false,
					}));
					const content: Record<string, string> = {};
					const sortOrderMap: Record<string, number> = {};
					loadedNotes.forEach((d, idx) => {
						content[d.id] = linesToText(d.lines);
						sortOrderMap[d.id] = d.sortOrder ?? idx * 1000;
					});
					let activeId = noteList[0]?.id ?? null;
					try {
						const lastId = localStorage.getItem(LAST_ACTIVE_NOTE_KEY);
						if (lastId && noteList.some((d) => d.id === lastId)) {
							activeId = lastId;
						}
					} catch {
						/* ignore */
					}
					set({
						notes: noteList,
						activeNoteId: activeId,
						content,
						sortOrder: sortOrderMap,
						initialized: true,
					});
				}
			})();
		}
		await initPromise;
	},

	setActiveNote: async (id: string | null) => {
		if (!id) {
			set({ activeNoteId: null });
			try {
				localStorage.removeItem(LAST_ACTIVE_NOTE_KEY);
			} catch {
				/* ignore */
			}
			return;
		}
		const { content } = get();
		if (!(id in content)) {
			const note = await loadNote(id);
			if (note) {
				set({
					content: { ...content, [id]: linesToText(note.lines) },
					activeNoteId: id,
				});
				try {
					localStorage.setItem(LAST_ACTIVE_NOTE_KEY, id);
				} catch {
					/* ignore */
				}
				return;
			}
		}
		set({ activeNoteId: id });
		try {
			localStorage.setItem(LAST_ACTIVE_NOTE_KEY, id);
		} catch {
			/* ignore */
		}
	},

	setContent: (noteId: string, text: string) => {
		const { content, notes } = get();
		const prevText = content[noteId] ?? "";
		if (prevText === text) return;
		set({
			content: { ...content, [noteId]: text },
			notes: notes.map((d) => (d.id === noteId ? { ...d, isDirty: true } : d)),
		});
	},

	createNote: async () => {
		const { notes, content, sortOrder } = get();
		const used = new Set(notes.map((d) => d.name));
		let n = 1;
		while (used.has(i18n.t("common:untitledN", { n }))) n++;
		const name = i18n.t("common:untitledN", { n });
		const id = generateId();
		const order = Date.now();
		await createNoteInStorage(id, name, [], order);
		set({
			notes: [...notes, { id, name, isDirty: false }],
			content: { ...content, [id]: "" },
			sortOrder: { ...sortOrder, [id]: order },
			activeNoteId: id,
		});
	},

	deleteNote: async (id: string) => {
		const { notes, content, sortOrder, activeNoteId } = get();
		const note = notes.find((d) => d.id === id);
		if (!note) return;
		await deleteNoteFromStorage(id);
		const nextNotes = notes.filter((d) => d.id !== id);
		const nextContent = { ...content };
		delete nextContent[id];
		const nextSortOrder = { ...sortOrder };
		delete nextSortOrder[id];
		set({
			notes: nextNotes,
			content: nextContent,
			sortOrder: nextSortOrder,
			activeNoteId: activeNoteId === id ? (nextNotes[0]?.id ?? null) : activeNoteId,
		});
	},

	renameNote: (id: string, name: string) => {
		const { notes } = get();
		const existing = notes.find((d) => d.name === name && d.id !== id);
		if (existing) return;
		set({
			notes: notes.map((d) => (d.id === id ? { ...d, name, isDirty: true } : d)),
		});
	},

	saveNote: async (id: string) => {
		const { notes, content, sortOrder } = get();
		const note = notes.find((d) => d.id === id);
		if (!note) return;
		const text = content[id] ?? "";
		const lines = textToLines(text);
		await saveNoteToStorage(id, note.name, lines, sortOrder[id] ?? 0);
		set({
			notes: notes.map((d) => (d.id === id ? { ...d, isDirty: false } : d)),
		});
	},
}));

export function useEvaluatedLines(): EvaluatedLine[] {
	const activeNoteId = useNotebookStore((s) => s.activeNoteId);
	const content = useNotebookStore((s) => s.content);
	const text = activeNoteId ? (content[activeNoteId] ?? "") : "";
	const lines = textToLines(text);
	return evaluateNotebook(lines);
}
