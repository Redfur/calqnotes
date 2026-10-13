import { type Note, notePreview } from "@/entities/note";

export interface Highlighted {
	before: string;
	match: string;
	after: string;
}

export interface NoteHit {
	note: Note;
	title: Highlighted;
	preview: Highlighted;
	/** Совпадение найдено в тексте, а не в названии */
	inText: boolean;
}

function split(s: string, q: string): Highlighted | null {
	const i = q ? s.toLowerCase().indexOf(q) : -1;
	if (i < 0) return null;
	return { before: s.slice(0, i), match: s.slice(i, i + q.length), after: s.slice(i + q.length) };
}

const plain = (s: string): Highlighted => ({ before: s, match: "", after: "" });
const CONTEXT = 18;

export function searchNotes(notes: Note[], query: string, titleOf: (n: Note) => string): NoteHit[] {
	const q = query.trim().toLowerCase();
	const hits: NoteHit[] = [];
	for (const note of notes) {
		const title = titleOf(note);
		const preview = notePreview(note);
		if (!q) {
			hits.push({ note, title: plain(title), preview: plain(preview), inText: false });
			continue;
		}
		const inTitle = split(title, q);
		if (inTitle) {
			hits.push({ note, title: inTitle, preview: plain(preview), inText: false });
			continue;
		}
		const line = note.content.split("\n").find((l) => l.toLowerCase().includes(q));
		const inContent = line ? split(line.trim(), q) : null;
		if (inContent) {
			const before = inContent.before.length > CONTEXT ? `…${inContent.before.slice(-CONTEXT)}` : inContent.before;
			hits.push({ note, title: plain(title), preview: { ...inContent, before }, inText: true });
		}
	}
	return hits;
}
