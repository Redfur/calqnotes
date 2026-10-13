import { Check, LoaderCircle, TriangleAlert } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/shared/lib/utils";
import { NOTE_NS } from "..";
import type { SaveStatus as Status } from "../model/types";

interface SaveStatusProps {
	status: Status;
	autosave: boolean;
	onRetry: () => void;
	className?: string;
}

export function SaveStatus({ status, autosave, onRetry, className }: SaveStatusProps) {
	const { t } = useTranslation(NOTE_NS);
	const base = cn("inline-flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground", className);

	if (status === "error") {
		return (
			<span role="status" className={cn(base, "font-medium text-destructive")}>
				<TriangleAlert className="size-3.5" aria-hidden />
				{t("saveFailed")}
				<button
					type="button"
					onClick={onRetry}
					className="h-[22px] rounded-sm border border-input bg-card px-2 text-xs font-normal text-foreground hover:bg-accent"
				>
					{t("retry")}
				</button>
			</span>
		);
	}
	if (status === "saving" || (status === "dirty" && autosave)) {
		return (
			<span role="status" className={base}>
				<LoaderCircle className="size-3 animate-spin" aria-hidden />
				{t("saving")}
			</span>
		);
	}
	if (status === "dirty") {
		return (
			<span role="status" className={base}>
				{t("unsaved")}
				<Kbd>Ctrl S</Kbd>
			</span>
		);
	}
	return (
		<span role="status" className={base}>
			<Check className="size-3 text-ok" strokeWidth={3} aria-hidden />
			{t("saved")}
		</span>
	);
}
