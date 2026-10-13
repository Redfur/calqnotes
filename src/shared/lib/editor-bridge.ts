/** Команды открытого редактора для частей интерфейса вне него: шпаргалки, строки символов на телефоне */
export interface EditorCommands {
	/** Вставить текст в позицию курсора */
	insert: (text: string) => void;
	/** Добавить строку в конец заметки */
	appendLine: (text: string) => void;
	focus: () => void;
}

let current: EditorCommands | null = null;

export function registerEditor(commands: EditorCommands | null) {
	current = commands;
}

export const editorBridge: EditorCommands = {
	insert: (text) => current?.insert(text),
	appendLine: (text) => current?.appendLine(text),
	focus: () => current?.focus(),
};
