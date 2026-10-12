/** Точность для заметки: "auto", число знаков после запятой или null — как во всех заметках */
export type NotePrecision = "auto" | number | null;

export interface Note {
	id: string;
	/** Пустое имя — заметка без названия, заголовок берётся из первой строки */
	name: string;
	content: string;
	createdAt: number;
	updatedAt: number;
	precision: NotePrecision;
	/** Заметка-пример, созданная при первом запуске */
	example: boolean;
}

export type SaveStatus = "saved" | "dirty" | "saving" | "error";

export interface NoteSeed {
	name: string;
	content: string;
	example?: boolean;
}
