import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TRANS_NS } from "..";

export function WelcomeBanner({ onHide }: { onHide: () => void }) {
	const { t } = useTranslation(TRANS_NS);
	return (
		<div className="mx-auto w-full max-w-[760px] px-6 pt-5 max-md:px-4">
			<div role="note" className="flex items-start gap-3 rounded-lg border bg-card py-3 pr-3 pl-4 text-sm leading-5">
				<span className="flex-1">{t("welcomeBanner")}</span>
				<button
					type="button"
					aria-label={t("hideBanner")}
					onClick={onHide}
					className="inline-flex size-7 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:bg-accent"
				>
					<X className="size-4" aria-hidden />
				</button>
			</div>
		</div>
	);
}
