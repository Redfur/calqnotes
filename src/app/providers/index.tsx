import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useNotesStore } from "@/entities/note";
import { type EditorFont, useSettingsStore } from "@/entities/settings";
import { i18n } from "@/shared/lib/i18n";
import { applyTheme } from "@/shared/lib/theme";
import "@/shared/i18n";

const FONTS: Record<EditorFont, string> = {
	geist: '"Geist Variable", ui-sans-serif, system-ui, sans-serif',
	system: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
	mono: '"Geist Mono Variable", ui-monospace, monospace',
};

const LINE_HEIGHT: Record<number, number> = { 14: 26, 15: 28, 16: 30, 18: 32 };

/** Применяет настройки к документу: тема, шрифт редактора, автосохранение */
function SettingsEffects() {
	const theme = useSettingsStore((s) => s.theme);
	const font = useSettingsStore((s) => s.font);
	const fontSize = useSettingsStore((s) => s.fontSize);
	const autosave = useSettingsStore((s) => s.editor.autosave);
	const setAutosave = useNotesStore((s) => s.setAutosave);

	useEffect(() => applyTheme(theme), [theme]);

	useEffect(() => {
		const root = document.documentElement.style;
		root.setProperty("--editor-font", FONTS[font]);
		root.setProperty("--editor-font-size", `${fontSize}px`);
		root.setProperty("--editor-line-height", `${LINE_HEIGHT[fontSize] ?? 28}px`);
	}, [font, fontSize]);

	useEffect(() => setAutosave(autosave), [autosave, setAutosave]);

	return null;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
	return (
		<I18nextProvider i18n={i18n}>
			<TooltipProvider>
				<SettingsEffects />
				{children}
				<Toaster position="bottom-center" />
			</TooltipProvider>
		</I18nextProvider>
	);
}
