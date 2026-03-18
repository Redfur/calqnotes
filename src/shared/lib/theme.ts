const THEME_KEY = "calqnotes-theme";

export type Theme = "light" | "dark";

function getSystemTheme(): Theme {
	if (typeof window === "undefined") return "light";
	return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function getTheme(): Theme {
	if (typeof document === "undefined") return "light";
	try {
		const stored = localStorage.getItem(THEME_KEY);
		if (stored === "dark" || stored === "light") return stored;
	} catch {
		/* ignore */
	}
	return getSystemTheme();
}

export const THEME_CHANGE_EVENT = "calqnotes-theme-change";

export function setTheme(theme: Theme): void {
	try {
		localStorage.setItem(THEME_KEY, theme);
	} catch {
		/* ignore */
	}
	document.documentElement.classList.toggle("dark", theme === "dark");
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: theme }));
	}
}

export function initTheme(): void {
	setTheme(getTheme());
}
