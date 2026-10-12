import { create } from "zustand";
import { deleteNote as deleteStored, loadNotes, type NoteRecord, putNote } from "@/shared/api/storage";
import { i18n } from "@/shared/lib/i18n";
import { generateId } from "@/shared/lib/id";
import type { Note, NotePrecision, NoteSeed, SaveStatus } from "./types";

// Ключ localStorage оставлен для совместимости с существующими данными
const LAST_ACTIVE_NOTE_KEY = "calqnotes-last-active-doc";
const AUTOSAVE_DELAY = 1000;
const UNDO_WINDOW = 6000;

function fromRecord(r: NoteRecord): Note {
	const now = Date.now();
	return {
		id: r.id,
		name: r.name ?? "",
		content: (r.lines ?? []).map((l) => l.input).join("\n"),
		createdAt: r.createdAt ?? r.sortOrder ?? now,
		updatedAt: r.updatedAt ?? now,
		precision: r.precision ?? null,
		example: r.example ?? false,
	};
}

function toRecord(n: Note): NoteRecord {
	return {
		id: n.id,
		name: n.name,
		lines: n.content.split("\n").map((input, i) => ({ id: `line-${i}`, input })),
		sortOrder: n.createdAt,
		createdAt: n.createdAt,
		updatedAt: n.updatedAt,
		precision: n.precision,
		example: n.example,
	};
}

function newNote(seed: Partial<NoteSeed> = {}): Note {
	const now = Date.now();
	return {
		id: generateId(),
		name: seed.name ?? "",
		content: seed.content ?? "",
		createdAt: now,
		updatedAt: now,
		precision: null,
		example: seed.example ?? false,
	};
}

function remember(id: string | null) {
	try {
		if (id) localStorage.setItem(LAST_ACTIVE_NOTE_KEY, id);
		else localStorage.removeItem(LAST_ACTIVE_NOTE_KEY);
	} catch {
		/* ignore */
	}
}

/** Сначала недавно изменённые */
function sorted(notes: Note[]): Note[] {
	return [...notes].sort((a, b) => b.updatedAt - a.updatedAt);
}

interface NotesState {
	notes: Note[];
	activeNoteId: string | null;
	dirtyIds: string[];
	saveStatus: SaveStatus;
	autosave: boolean;
	/** Последняя удалённая заметка — для «Отменить» */
	deleted: Note | null;
	initialized: boolean;
}

interface NotesActions {
	initialize: (firstRunSeed: () => NoteSeed) => Promise<void>;
	openNote: (id: string) => void;
	setContent: (id: string, content: string) => void;
	renameNote: (id: string, name: string) => void;
	setPrecision: (id: string, precision: NotePrecision) => void;
	createNote: (seed?: Partial<NoteSeed>) => string;
	duplicateNote: (id: string) => string | null;
	deleteNote: (id: string) => void;
	undoDelete: () => void;
	setAutosave: (enabled: boolean) => void;
	saveNow: () => Promise<void>;
}

let initPromise: Promise<void> | null = null;
let autosaveTimer: ReturnType<typeof setTimeout> | undefined;
let undoTimer: ReturnType<typeof setTimeout> | undefined;

export const useNotesStore = create<NotesState & NotesActions>((set, get) => {
	const markDirty = (id: string, patch: Partial<Note>, touch = true) => {
		const now = Date.now();
		set((s) => ({
			notes: s.notes.map((n) => (n.id === id ? { ...n, ...patch, ...(touch ? { updatedAt: now } : {}) } : n)),
			dirtyIds: s.dirtyIds.includes(id) ? s.dirtyIds : [...s.dirtyIds, id],
			saveStatus: "dirty",
		}));
		if (get().autosave) {
			clearTimeout(autosaveTimer);
			autosaveTimer = setTimeout(() => void get().saveNow(), AUTOSAVE_DELAY);
		}
	};

	const persistNew = (note: Note) => {
		putNote(toRecord(note)).catch(() => set({ saveStatus: "error" }));
	};

	return {
		notes: [],
		activeNoteId: null,
		dirtyIds: [],
		saveStatus: "saved",
		autosave: true,
		deleted: null,
		initialized: false,

		initialize: async (firstRunSeed) => {
			if (get().initialized) return;
			if (!initPromise) {
				initPromise = (async () => {
					const records = await loadNotes();
					if (records.length === 0) {
						const note = newNote(firstRunSeed());
						await putNote(toRecord(note));
						set({ notes: [note], activeNoteId: note.id, initialized: true });
						remember(note.id);
						return;
					}
					const notes = sorted(records.map(fromRecord));
					let activeId = notes[0].id;
					try {
						const lastId = localStorage.getItem(LAST_ACTIVE_NOTE_KEY);
						if (lastId && notes.some((n) => n.id === lastId)) activeId = lastId;
					} catch {
						/* ignore */
					}
					set({ notes, activeNoteId: activeId, initialized: true });
				})();
			}
			await initPromise;
		},

		openNote: (id) => {
			if (!get().notes.some((n) => n.id === id)) return;
			set({ activeNoteId: id });
			remember(id);
		},

		setContent: (id, content) => {
			const note = get().notes.find((n) => n.id === id);
			if (!note || note.content === content) return;
			markDirty(id, { content });
		},

		renameNote: (id, name) => {
			markDirty(id, { name: name.trim() });
		},

		setPrecision: (id, precision) => {
			markDirty(id, { precision }, false);
		},

		createNote: (seed) => {
			const note = newNote(seed);
			set((s) => ({ notes: [note, ...s.notes], activeNoteId: note.id }));
			remember(note.id);
			persistNew(note);
			return note.id;
		},

		duplicateNote: (id) => {
			const source = get().notes.find((n) => n.id === id);
			if (!source) return null;
			const title = source.name || i18n.t("common:untitled");
			const copy = {
				...newNote({ name: i18n.t("common:copyOf", { name: title }), content: source.content }),
				precision: source.precision,
			};
			set((s) => ({ notes: [copy, ...s.notes], activeNoteId: copy.id }));
			remember(copy.id);
			persistNew(copy);
			return copy.id;
		},

		deleteNote: (id) => {
			const { notes, activeNoteId, dirtyIds } = get();
			const note = notes.find((n) => n.id === id);
			if (!note) return;
			let rest = notes.filter((n) => n.id !== id);
			let nextActive = activeNoteId;
			if (activeNoteId === id) {
				if (rest.length === 0) {
					const empty = newNote();
					persistNew(empty);
					rest = [empty];
				}
				nextActive = rest[0].id;
				remember(nextActive);
			}
			set({
				notes: rest,
				activeNoteId: nextActive,
				deleted: note,
				dirtyIds: dirtyIds.filter((d) => d !== id),
			});
			deleteStored(id).catch(() => set({ saveStatus: "error" }));
			clearTimeout(undoTimer);
			undoTimer = setTimeout(() => set({ deleted: null }), UNDO_WINDOW);
		},

		undoDelete: () => {
			const { deleted } = get();
			if (!deleted) return;
			clearTimeout(undoTimer);
			set((s) => ({ notes: sorted([deleted, ...s.notes]), activeNoteId: deleted.id, deleted: null }));
			remember(deleted.id);
			persistNew(deleted);
		},

		setAutosave: (enabled) => {
			set({ autosave: enabled });
			if (enabled && get().dirtyIds.length) void get().saveNow();
		},

		saveNow: async () => {
			clearTimeout(autosaveTimer);
			const { dirtyIds, notes } = get();
			if (dirtyIds.length === 0) return;
			set({ saveStatus: "saving", dirtyIds: [] });
			try {
				await Promise.all(
					dirtyIds
						.map((id) => notes.find((n) => n.id === id))
						.filter((n): n is Note => Boolean(n))
						.map((n) => putNote(toRecord(n))),
				);
				set((s) => ({ saveStatus: s.dirtyIds.length ? "dirty" : "saved" }));
			} catch {
				set((s) => ({ saveStatus: "error", dirtyIds: [...new Set([...s.dirtyIds, ...dirtyIds])] }));
			}
		},
	};
});

export function useActiveNote(): Note | null {
	return useNotesStore((s) => s.notes.find((n) => n.id === s.activeNoteId) ?? null);
}
