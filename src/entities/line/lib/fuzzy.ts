export function levenshtein(a: string, b: string): number {
	if (a === b) return 0;
	let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
	for (let i = 1; i <= a.length; i++) {
		const cur = [i];
		for (let j = 1; j <= b.length; j++) {
			cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
		}
		prev = cur;
	}
	return prev[b.length];
}

/** Сколько опечаток допускаем: 1 на каждые 4 символа, но не меньше одной */
function allowedDistance(word: string): number {
	return Math.max(1, Math.floor(word.length / 4));
}

/** Похоже ли `typed` на `candidate` настолько, чтобы предложить исправление; 0 — совпадение, не опечатка */
export function typoDistance(typed: string, candidate: string): number | null {
	const d = levenshtein(typed.toLowerCase(), candidate.toLowerCase());
	return d > 0 && d <= allowedDistance(typed) ? d : null;
}

/** Ближайшее к `typed` имя из списка или null, если ничего не похоже */
export function closest(typed: string, candidates: string[]): string | null {
	let best: { name: string; d: number } | null = null;
	for (const name of candidates) {
		const d = typoDistance(typed, name);
		if (d !== null && (!best || d < best.d)) best = { name, d };
	}
	return best?.name ?? null;
}
