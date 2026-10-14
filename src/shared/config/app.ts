// Подставляются при сборке (vite.config.ts → define)
declare const __BUILD_COMMIT__: string;
declare const __BUILD_TIME__: string;

export const REPO_URL = "https://github.com/Redfur/calqnotes";
export const ISSUES_URL = `${REPO_URL}/issues/new`;
export const LICENSE_URL = `${REPO_URL}/blob/main/LICENSE`;
export const CALQUE_URL = "https://github.com/grimalschi/calque";

export const BUILD = {
	commit: __BUILD_COMMIT__,
	shortCommit: __BUILD_COMMIT__.slice(0, 7),
	commitUrl: __BUILD_COMMIT__ ? `${REPO_URL}/commit/${__BUILD_COMMIT__}` : REPO_URL,
	time: __BUILD_TIME__,
};
