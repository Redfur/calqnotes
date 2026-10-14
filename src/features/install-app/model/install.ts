import { create } from "zustand";

/** Событие Chrome/Edge перед показом системного окна установки — в стандартных типах DOM его нет */
interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export type InstallState =
	/** Уже открыто как установленное приложение */
	| "installed"
	/** Браузер готов показать окно установки */
	| "available"
	/** iPhone / iPad: установка только через «Поделиться → На экран «Домой»» */
	| "ios"
	/** Браузер не умеет устанавливать сайты или условия ещё не выполнены */
	| "unsupported";

function isStandalone(): boolean {
	const nav = navigator as Navigator & { standalone?: boolean };
	return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

function isIos(): boolean {
	const ua = navigator.userAgent;
	// iPadOS выдаёт себя за Mac, но у него есть тач
	return /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
}

interface InstallStore {
	state: InstallState;
	justInstalled: boolean;
	install: () => Promise<void>;
}

let deferred: BeforeInstallPromptEvent | null = null;

function initialState(): InstallState {
	if (typeof window === "undefined") return "unsupported";
	if (isStandalone()) return "installed";
	if (isIos()) return "ios";
	return "unsupported";
}

export const useInstallStore = create<InstallStore>((set) => ({
	state: initialState(),
	justInstalled: false,
	install: async () => {
		if (!deferred) return;
		await deferred.prompt();
		const { outcome } = await deferred.userChoice;
		deferred = null;
		if (outcome === "dismissed") set({ state: "unsupported" });
	},
}));

// Слушаем с загрузки модуля: событие приходит рано, до того как React что-то отрисует
if (typeof window !== "undefined") {
	window.addEventListener("beforeinstallprompt", (e) => {
		e.preventDefault();
		deferred = e as BeforeInstallPromptEvent;
		if (useInstallStore.getState().state !== "installed") useInstallStore.setState({ state: "available" });
	});
	window.addEventListener("appinstalled", () => {
		deferred = null;
		useInstallStore.setState({ state: "installed", justInstalled: true });
	});
}
