import { create } from "zustand";
import type { Document } from "@/entities/document";
import type { EvaluatedLine, Line } from "@/entities/line";
import { evaluateNotebook } from "@/entities/line";
import {
	createDocument as createDocInStorage,
	deleteDocument as deleteDocFromStorage,
	loadDocument,
	loadDocuments,
	saveDocument as saveDocToStorage,
} from "@/shared/api/storage";
import { generateId } from "@/shared/lib/id";

const LAST_ACTIVE_DOC_KEY = "calqnotes-last-active-doc";

function textToLines(text: string): Line[] {
	return text.split("\n").map((input, i) => ({ id: `line-${i}`, input }));
}

function linesToText(lines: Line[]): string {
	return lines.map((l) => l.input).join("\n");
}

interface NotebookState {
	documents: Document[];
	activeDocumentId: string | null;
	content: Record<string, string>;
	sortOrder: Record<string, number>;
	initialized: boolean;
}

interface NotebookActions {
	initialize: () => Promise<void>;
	setActiveDocument: (id: string | null) => Promise<void>;
	setContent: (docId: string, text: string) => void;
	createDocument: () => Promise<void>;
	deleteDocument: (id: string) => Promise<void>;
	renameDocument: (id: string, name: string) => void;
	saveDocument: (id: string) => Promise<void>;
}

export const useNotebookStore = create<NotebookState & NotebookActions>((set, get) => ({
	documents: [],
	activeDocumentId: null,
	content: {},
	sortOrder: {},
	initialized: false,

	initialize: async () => {
		if (get().initialized) return;
		const docs = await loadDocuments();
		if (docs.length === 0) {
			const id = generateId();
			const name = "Без названия 1";
			const sortOrder = Date.now();
			await createDocInStorage(id, name, [], sortOrder);
			set({
				documents: [{ id, name, isDirty: false }],
				activeDocumentId: id,
				content: { [id]: "" },
				sortOrder: { [id]: sortOrder },
				initialized: true,
			});
		} else {
			const docList: Document[] = docs.map((d) => ({
				id: d.id,
				name: d.name,
				isDirty: false,
			}));
			const content: Record<string, string> = {};
			const sortOrderMap: Record<string, number> = {};
			docs.forEach((d, idx) => {
				content[d.id] = linesToText(d.lines);
				sortOrderMap[d.id] = d.sortOrder ?? idx * 1000;
			});
			let activeId = docList[0]?.id ?? null;
			try {
				const lastId = localStorage.getItem(LAST_ACTIVE_DOC_KEY);
				if (lastId && docList.some((d) => d.id === lastId)) {
					activeId = lastId;
				}
			} catch {
				/* ignore */
			}
			set({
				documents: docList,
				activeDocumentId: activeId,
				content,
				sortOrder: sortOrderMap,
				initialized: true,
			});
		}
	},

	setActiveDocument: async (id: string | null) => {
		if (!id) {
			set({ activeDocumentId: null });
			try {
				localStorage.removeItem(LAST_ACTIVE_DOC_KEY);
			} catch {
				/* ignore */
			}
			return;
		}
		const { content } = get();
		if (!(id in content)) {
			const doc = await loadDocument(id);
			if (doc) {
				set({
					content: { ...content, [id]: linesToText(doc.lines) },
					activeDocumentId: id,
				});
				try {
					localStorage.setItem(LAST_ACTIVE_DOC_KEY, id);
				} catch {
					/* ignore */
				}
				return;
			}
		}
		set({ activeDocumentId: id });
		try {
			localStorage.setItem(LAST_ACTIVE_DOC_KEY, id);
		} catch {
			/* ignore */
		}
	},

	setContent: (docId: string, text: string) => {
		const { content, documents } = get();
		const prevText = content[docId] ?? "";
		if (prevText === text) return;
		set({
			content: { ...content, [docId]: text },
			documents: documents.map((d) => (d.id === docId ? { ...d, isDirty: true } : d)),
		});
	},

	createDocument: async () => {
		const { documents, content, sortOrder } = get();
		const used = new Set(documents.map((d) => d.name));
		let n = 1;
		while (used.has(`Без названия ${n}`)) n++;
		const name = `Без названия ${n}`;
		const id = generateId();
		const order = Date.now();
		await createDocInStorage(id, name, [], order);
		set({
			documents: [...documents, { id, name, isDirty: false }],
			content: { ...content, [id]: "" },
			sortOrder: { ...sortOrder, [id]: order },
			activeDocumentId: id,
		});
	},

	deleteDocument: async (id: string) => {
		const { documents, content, sortOrder, activeDocumentId } = get();
		const doc = documents.find((d) => d.id === id);
		if (!doc) return;
		await deleteDocFromStorage(id);
		const nextDocs = documents.filter((d) => d.id !== id);
		const nextContent = { ...content };
		delete nextContent[id];
		const nextSortOrder = { ...sortOrder };
		delete nextSortOrder[id];
		set({
			documents: nextDocs,
			content: nextContent,
			sortOrder: nextSortOrder,
			activeDocumentId: activeDocumentId === id ? (nextDocs[0]?.id ?? null) : activeDocumentId,
		});
	},

	renameDocument: (id: string, name: string) => {
		const { documents } = get();
		const existing = documents.find((d) => d.name === name && d.id !== id);
		if (existing) return;
		set({
			documents: documents.map((d) => (d.id === id ? { ...d, name, isDirty: true } : d)),
		});
	},

	saveDocument: async (id: string) => {
		const { documents, content, sortOrder } = get();
		const doc = documents.find((d) => d.id === id);
		if (!doc) return;
		const text = content[id] ?? "";
		const lines = textToLines(text);
		await saveDocToStorage(id, doc.name, lines, sortOrder[id] ?? 0);
		set({
			documents: documents.map((d) => (d.id === id ? { ...d, isDirty: false } : d)),
		});
	},
}));

export function useEvaluatedLines(): EvaluatedLine[] {
	const activeDocumentId = useNotebookStore((s) => s.activeDocumentId);
	const content = useNotebookStore((s) => s.content);
	const text = activeDocumentId ? (content[activeDocumentId] ?? "") : "";
	const lines = textToLines(text);
	return evaluateNotebook(lines);
}
