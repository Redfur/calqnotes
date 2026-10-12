import type { Note } from "../model/types";

const MAX_TITLE = 40;

/** Заголовок из первой непустой строки: без `#` и лишних пробелов */
export function titleFromContent(content: string): string {
	const first = content
		.split("\n")
		.map((l) => l.replace(/^\s*#+\s*/, "").trim())
		.find(Boolean);
	if (!first) return "";
	return first.length > MAX_TITLE ? `${first.slice(0, MAX_TITLE - 1)}…` : first;
}

export function noteTitle(note: Pick<Note, "name" | "content">, untitled: string): string {
	return note.name || titleFromContent(note.content) || untitled;
}

/** Первая строка с расчётом — для превью в списке заметок */
export function notePreview(note: Pick<Note, "content">): string {
	return (
		note.content
			.split("\n")
			.map((l) => l.trim())
			.find((l) => l && !l.startsWith("#")) ?? ""
	);
}
