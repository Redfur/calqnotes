import { acceptCompletion } from "@codemirror/autocomplete";
import { copyLineDown } from "@codemirror/commands";
import type { Command, KeyBinding } from "@codemirror/view";

/** Ctrl+/ — сделать строки комментарием через `#` или убрать его */
const toggleHashComment: Command = (view) => {
	const { state } = view;
	const lines = new Set<number>();
	for (const r of state.selection.ranges) {
		for (let n = state.doc.lineAt(r.from).number; n <= state.doc.lineAt(r.to).number; n++) lines.add(n);
	}
	const targets = [...lines].map((n) => state.doc.line(n));
	const allCommented = targets.every((l) => /^\s*#/.test(l.text) || !l.text.trim());
	const changes = targets
		.filter((l) => l.text.trim())
		.map((l) => {
			const indent = l.text.match(/^\s*/)?.[0].length ?? 0;
			if (allCommented) {
				const m = l.text.slice(indent).match(/^#\s?/);
				return { from: l.from + indent, to: l.from + indent + (m?.[0].length ?? 0), insert: "" };
			}
			return { from: l.from + indent, insert: "# " };
		});
	view.dispatch({ changes, userEvent: "input" });
	return true;
};

export const calqKeymap: KeyBinding[] = [
	{ key: "Tab", run: acceptCompletion },
	{ key: "Mod-d", run: copyLineDown, preventDefault: true },
	{ key: "Mod-/", run: toggleHashComment, preventDefault: true },
];
