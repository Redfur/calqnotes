export interface DateLabels {
	today: (time: string) => string;
	yesterday: string;
}

const DAY = 24 * 60 * 60 * 1000;

function startOfDay(ts: number): number {
	const d = new Date(ts);
	d.setHours(0, 0, 0, 0);
	return d.getTime();
}

/** «сегодня, 14:32», «вчера», «11 окт», «11 окт 2025» */
export function formatRelativeDate(ts: number, labels: DateLabels, locale = "ru-RU", now = Date.now()): string {
	const today = startOfDay(now);
	const day = startOfDay(ts);
	if (day === today) {
		return labels.today(new Date(ts).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" }));
	}
	if (day === today - DAY) return labels.yesterday;
	const sameYear = new Date(ts).getFullYear() === new Date(now).getFullYear();
	return new Date(ts)
		.toLocaleDateString(locale, { day: "numeric", month: "short", year: sameYear ? undefined : "numeric" })
		.replace(".", "")
		.replace(/\s?г\.?$/, "");
}
