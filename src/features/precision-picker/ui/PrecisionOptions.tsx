import { useTranslation } from "react-i18next";
import { effectiveFormat, PRECISION_OPTIONS } from "@/entities/settings";
import { formatNumber } from "@/shared/lib/format-number";
import { cn } from "@/shared/lib/utils";
import { TRANS_NS } from "..";
import { usePrecision } from "../model/use-precision";

interface PrecisionOptionsProps {
	onOpenSettings?: () => void;
	/** На телефоне — крупнее, под палец */
	touch?: boolean;
}

export function PrecisionOptions({ onOpenSettings, touch }: PrecisionOptionsProps) {
	const { t } = useTranslation(TRANS_NS);
	const { current, scope, globalFormat, pick, setScope } = usePrecision();

	return (
		<div className="flex flex-col">
			<div className="px-2 py-1.5 text-xs text-muted-foreground">{t("title")}</div>
			{PRECISION_OPTIONS.map((p) => {
				const on = p === current;
				const sample = formatNumber(2500 / 3, effectiveFormat(globalFormat, p)).text;
				return (
					<button
						key={String(p)}
						type="button"
						aria-pressed={on}
						onClick={() => pick(p, scope)}
						className={cn(
							"flex w-full items-baseline justify-between gap-3 rounded-md px-2.5 text-left text-sm hover:bg-accent",
							touch ? "min-h-11 py-2.5 text-[15px]" : "py-[7px]",
							on && "bg-selection hover:bg-selection",
						)}
					>
						<span>{t(`option.${p}`)}</span>
						<span className="text-[13px] text-muted-foreground tabular-nums">{t("sample", { value: sample })}</span>
					</button>
				);
			})}
			<div className="mx-0.5 mt-1.5 mb-1 flex gap-0.5 rounded-[9px] bg-muted p-[3px]">
				{(["note", "all"] as const).map((s) => (
					<button
						key={s}
						type="button"
						aria-pressed={scope === s}
						onClick={() => setScope(s)}
						className={cn(
							"flex-1 rounded-sm text-[13px]",
							touch ? "h-10" : "h-7",
							scope === s && "bg-card font-semibold shadow-[0_0_0_1px_var(--input)]",
						)}
					>
						{s === "note" ? t("thisNote") : t("allNotes")}
					</button>
				))}
			</div>
			{onOpenSettings && (
				<button
					type="button"
					onClick={onOpenSettings}
					className="px-2.5 pt-1.5 pb-1 text-left text-[13px] text-link underline-offset-2 hover:underline"
				>
					{t("moreSettings")}
				</button>
			)}
		</div>
	);
}
