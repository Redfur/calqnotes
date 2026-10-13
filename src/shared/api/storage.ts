import { type DBSchema, type IDBPDatabase, openDB } from "idb";

const DB_NAME = "calqnotes";
const DB_VERSION = 3;

export interface StoredLine {
	id: string;
	input: string;
}

export interface NoteRecord {
	id: string;
	name: string;
	lines: StoredLine[];
	sortOrder?: number;
	/** v3 */
	createdAt?: number;
	updatedAt?: number;
	/** v3: точность для этой заметки — "auto" или число знаков, null — как во всех заметках */
	precision?: "auto" | number | null;
	/** v3: заметка-пример, созданная при первом запуске */
	example?: boolean;
}

interface CalqnotesDB extends DBSchema {
	documents: {
		key: string;
		value: NoteRecord;
	};
}

let dbPromise: Promise<IDBPDatabase<CalqnotesDB>> | null = null;

function getDB() {
	if (!dbPromise) {
		dbPromise = openDB<CalqnotesDB>(DB_NAME, DB_VERSION, {
			// Другая вкладка с новой версией приложения хочет обновить схему — отпускаем базу
			blocking(_current, _blocked, event) {
				(event.target as IDBDatabase).close();
				dbPromise = null;
			},
			async upgrade(db, oldVersion, _newVersion, tx) {
				if (oldVersion < 1) {
					db.createObjectStore("documents", { keyPath: "id" });
				}
				// v2: sortOrder — добавлялся при сохранении
				if (oldVersion >= 1 && oldVersion < 3) {
					const now = Date.now();
					let cursor = await tx.objectStore("documents").openCursor();
					while (cursor) {
						const note = cursor.value;
						await cursor.update({
							...note,
							createdAt: note.createdAt ?? note.sortOrder ?? now,
							updatedAt: note.updatedAt ?? now,
							precision: note.precision ?? null,
						});
						cursor = await cursor.continue();
					}
				}
			},
		});
	}
	return dbPromise;
}

export async function loadNotes(): Promise<NoteRecord[]> {
	const db = await getDB();
	return db.getAll("documents");
}

export async function putNote(note: NoteRecord): Promise<void> {
	const db = await getDB();
	await db.put("documents", note);
}

export async function deleteNote(id: string): Promise<void> {
	const db = await getDB();
	await db.delete("documents", id);
}
