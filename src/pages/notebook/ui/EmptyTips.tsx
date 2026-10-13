import { useTranslation } from "react-i18next";
import { editorBridge } from "@/shared/lib/editor-bridge";
import { TRANS_NS } from "..";

export function EmptyTips({ onOpenHelp }: { onOpenHelp: () => void }) {
	const { t } = useTranslation(TRANS_NS);
	const tips = [
		{ src: "1250 * 12 - 15%", label: t("tip.percent") },
		{ src: "20% of 500", label: t("tip.share") },
		{ src: t("tipVariable"), label: t("tip.variable") },
		{ src: "2 inch to cm", label: t("tip.units") },
		{ src: "sqrt(144)", label: t("tip.function") },
	];
	return (
		<div className="mx-auto w-full max-w-[760px] px-6 pb-10 max-md:px-4">
			<p className="mb-2.5 text-sm text-muted-foreground">{t("tipsTitle")}</p>
			<div className="flex flex-wrap gap-2">
				{tips.map((tip) => (
					<button
						key={tip.src}
						type="button"
						onClick={() => editorBridge.appendLine(tip.src)}
						className="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-card px-3 text-sm hover:bg-accent max-md:h-11"
					>
						<code className="font-sans">{tip.src}</code>
						<span className="text-xs text-muted-foreground">{tip.label}</span>
					</button>
				))}
			</div>
			<p className="mt-4 text-[13px] text-muted-foreground">
				{t("tipsFooterBefore")}{" "}
				<button type="button" onClick={onOpenHelp} className="text-link underline-offset-2 hover:underline">
					{t("tipsFooterLink")}
				</button>
				{t("tipsFooterAfter")}
			</p>
		</div>
	);
}
