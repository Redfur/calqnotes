import { Moon, Sun } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getTheme, initTheme, setTheme, type Theme } from "@/shared/lib/theme";

export function ThemeToggle() {
	const [theme, setThemeState] = useState<Theme>(() => getTheme());

	useEffect(() => {
		initTheme();
		setThemeState(getTheme());
	}, []);

	const toggle = useCallback(() => {
		const next: Theme = theme === "dark" ? "light" : "dark";
		setTheme(next);
		setThemeState(next);
	}, [theme]);

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={toggle}
			title={theme === "dark" ? "Светлая тема" : "Тёмная тема"}
			aria-label={theme === "dark" ? "Светлая тема" : "Тёмная тема"}
		>
			{theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
		</Button>
	);
}
