import { Github, Plus, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Kbd } from "@/components/ui/kbd";
import { evaluateNotebook, formatLineResult, textToLines } from "@/entities/line";
import { REPO_URL } from "@/shared/config/app";
import { editorBridge } from "@/shared/lib/editor-bridge";
import type { NumberFormat } from "@/shared/lib/format-number";
import { cn } from "@/shared/lib/utils";
import { TRANS_NS } from "..";

interface Example {
	src: string;
	note?: string;
	/** Строка задаёт контекст и не показывает результат */
	silent?: boolean;
}

interface HelpPanelProps {
	format: NumberFormat;
	onClose: () => void;
	onOpenExample: () => void;
	className?: string;
}

const kbd = "border border-input bg-card text-[11px]";

export function HelpPanel({ format, onClose, onOpenExample, className }: HelpPanelProps) {
	const { t } = useTranslation(TRANS_NS);
	const [query, setQuery] = useState("");
	const v = t("varName");

	const sections = useMemo(() => {
		const raw: { id: string; note?: string; items: Example[] }[] = [
			{ id: "basics", items: [{ src: "2 + 2 * 2" }, { src: "(2 + 2) * 2" }, { src: "2^10" }, { src: "17 mod 5" }] },
			{
				id: "percent",
				note: t("section.percentNote"),
				items: [{ src: "1250 - 15%" }, { src: "1250 + 20%" }, { src: "20% of 500" }],
			},
			{
				id: "vars",
				note: t("section.varsNote"),
				items: [
					{ src: `${v} = 1500`, note: t("setsNumber"), silent: true },
					{ src: `${v} * 3` },
					{ src: "last + 10%" },
				],
			},
			{
				id: "units",
				items: [{ src: "2 inch to cm" }, { src: "5 km to mile" }, { src: "100 kg to lb" }, { src: "2 h + 30 min" }],
			},
			{
				id: "functions",
				items: [
					{ src: "sqrt(16)" },
					{ src: "round(3.14159, 2)" },
					{ src: "min(3, 7, 1)" },
					{ src: "abs(-5)" },
					{ src: "sin(30 deg)" },
				],
			},
			{ id: "comments", items: [{ src: t("commentExample"), note: t("notCounted"), silent: true }] },
		];
		const q = query.trim().toLowerCase();
		return raw
			.map((s) => {
				const lines = evaluateNotebook(textToLines(s.items.map((i) => i.src).join("\n")));
				const items = s.items.map((item, i) => {
					const l = lines[i];
					const res = !item.silent && l?.result ? formatLineResult(l.result, format).text : "";
					return { ...item, res };
				});
				const title = t(`section.${s.id}`);
				const shown = items.filter((i) => !q || `${title} ${i.src} ${s.note ?? ""}`.toLowerCase().includes(q));
				return { ...s, title, items: shown };
			})
			.filter((s) => s.items.length > 0);
	}, [format, query, t, v]);

	const keys: [string[], string][] = [
		[["Ctrl", "K"], t("key.palette")],
		[["Ctrl", "D"], t("key.duplicateLine")],
		[["Ctrl", "/"], t("key.comment")],
		[["Ctrl", "Z"], t("key.undo")],
		[["Tab"], t("key.accept")],
	];

	return (
		<aside aria-label={t("title")} className={cn("flex min-h-0 flex-col bg-card", className)}>
			<div className="flex h-[50px] shrink-0 items-center gap-2 border-b px-4">
				<h2 className="flex-1 text-[15px] font-semibold">{t("title")}</h2>
				<button
					type="button"
					aria-label={t("close")}
					onClick={onClose}
					className="inline-flex size-[34px] items-center justify-center rounded-md text-subtle hover:bg-accent"
				>
					<X className="size-4" aria-hidden />
				</button>
			</div>
			<label className="mx-4 mt-3 flex h-9 shrink-0 items-center gap-2 rounded-md border border-input px-2.5 text-muted-foreground focus-within:border-primary">
				<Search className="size-4" aria-hidden />
				<span className="sr-only">{t("search")}</span>
				<input
					type="search"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder={t("search")}
					className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-placeholder"
				/>
			</label>
			<div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
				<div className="scroll-fill px-4 pt-2 pb-6">
					{sections.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">{t("nothing")}</p>}
					{sections.map((s) => (
						<section key={s.id} className="border-b py-3">
							<h3 className="text-sm font-semibold">{s.title}</h3>
							{s.note && <p className="mt-0.5 text-[13px] text-muted-foreground">{s.note}</p>}
							<ul className="mt-2 flex flex-col">
								{s.items.map((e) => (
									<li
										key={e.src}
										className="group/ex flex min-h-9 items-center gap-2 rounded-md px-1.5 hover:bg-accent"
									>
										<code className="min-w-0 flex-1 truncate font-sans text-sm">{e.src}</code>
										{e.res && (
											<span className="rounded-sm bg-muted px-2 text-[13px] leading-[22px] font-medium tabular-nums">
												{e.res}
											</span>
										)}
										{e.note && <span className="text-xs text-muted-foreground">{e.note}</span>}
										<button
											type="button"
											aria-label={t("insertExample", { src: e.src })}
											onClick={() => editorBridge.appendLine(e.src)}
											className="inline-flex h-7 items-center gap-1 rounded-sm px-2 text-xs text-link opacity-0 group-hover/ex:opacity-100 focus-visible:opacity-100 max-md:opacity-100 hover:bg-card"
										>
											<Plus className="size-3" aria-hidden />
											{t("insert")}
										</button>
									</li>
								))}
							</ul>
						</section>
					))}
					{!query && (
						<section className="py-3">
							<h3 className="text-sm font-semibold">{t("keys")}</h3>
							<dl className="mt-2 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2 text-[13px]">
								{keys.map(([combo, label]) => (
									<div key={label} className="contents">
										<dt className="flex gap-1">
											{combo.map((k) => (
												<Kbd key={k} className={kbd}>
													{k}
												</Kbd>
											))}
										</dt>
										<dd>{label}</dd>
									</div>
								))}
								<dt>
									<Kbd className={kbd}>{t("click")}</Kbd>
								</dt>
								<dd>{t("key.copy")}</dd>
							</dl>
							<button
								type="button"
								onClick={onOpenExample}
								className="mt-4 h-9 rounded-md border border-input bg-card px-3 text-[13px] hover:bg-accent"
							>
								{t("example")}
							</button>
						</section>
					)}
					<a
						href={REPO_URL}
						target="_blank"
						rel="noreferrer"
						className="mt-2 flex items-center gap-2 border-t pt-4 text-[13px] text-muted-foreground hover:text-foreground"
					>
						<Github className="size-4" aria-hidden />
						{t("repo")}
					</a>
				</div>
			</div>
		</aside>
	);
}
