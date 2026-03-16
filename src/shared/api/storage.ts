import { type DBSchema, openDB } from "idb";
import type { Line } from "@/entities/line";

const DB_NAME = "calqnotes";
const DB_VERSION = 2;

export interface DocumentRecord {
	id: string;
	name: string;
	lines: Line[];
	sortOrder?: number;
}

interface CalqnotesDB extends DBSchema {
	documents: {
		key: string;
		value: DocumentRecord;
	};
}

async function getDB() {
	return openDB<CalqnotesDB>(DB_NAME, DB_VERSION, {
		upgrade(db, oldVersion, _newVersion) {
			if (oldVersion < 1) {
				db.createObjectStore("documents", { keyPath: "id" });
			}
			// v2: add sortOrder - migration handled by put with new field
		},
	});
}

export async function loadDocuments(): Promise<DocumentRecord[]> {
	const db = await getDB();
	const docs = await db.getAll("documents");
	db.close();
	// Сортировка по sortOrder, затем по имени
	return docs.sort((a, b) => {
		const orderA = a.sortOrder ?? 0;
		const orderB = b.sortOrder ?? 0;
		if (orderA !== orderB) return orderA - orderB;
		return (a.name ?? "").localeCompare(b.name ?? "");
	});
}

export async function loadDocument(id: string): Promise<DocumentRecord | undefined> {
	const db = await getDB();
	const doc = await db.get("documents", id);
	db.close();
	return doc;
}

export async function saveDocument(id: string, name: string, lines: Line[], sortOrder: number): Promise<void> {
	const db = await getDB();
	await db.put("documents", { id, name, lines, sortOrder });
	db.close();
}

export async function createDocument(id: string, name: string, lines: Line[], sortOrder: number): Promise<void> {
	const db = await getDB();
	await db.add("documents", { id, name, lines, sortOrder });
	db.close();
}

export async function deleteDocument(id: string): Promise<void> {
	const db = await getDB();
	await db.delete("documents", id);
	db.close();
}
