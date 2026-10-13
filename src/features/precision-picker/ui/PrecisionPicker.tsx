import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TRANS_NS } from "..";
import { usePrecision } from "../model/use-precision";
import { PrecisionOptions } from "./PrecisionOptions";

interface PrecisionPickerProps {
	onOpenSettings: () => void;
}

export function PrecisionPicker({ onOpenSettings }: PrecisionPickerProps) {
	const { t } = useTranslation(TRANS_NS);
	const { label, isCustom } = usePrecision();
	const [open, setOpen] = useState(false);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					type="button"
					aria-label={t("ariaLabel", { value: label })}
					className="inline-flex h-[34px] items-center gap-1.5 rounded-md px-2.5 text-[13px] tabular-nums hover:bg-accent data-[state=open]:bg-accent"
				>
					<span className="text-muted-foreground max-lg:hidden">{t("precision")}</span>
					{label}
					{isCustom && (
						<>
							<span aria-hidden className="size-1.5 rounded-full bg-primary" title={t("noteOwn")} />
							<span className="sr-only">{t("noteOwn")}</span>
						</>
					)}
					<ChevronDown className="size-3.5 text-muted-foreground" aria-hidden />
				</button>
			</PopoverTrigger>
			<PopoverContent align="end" className="w-[290px] rounded-lg p-1.5">
				<PrecisionOptions
					onOpenSettings={() => {
						setOpen(false);
						onOpenSettings();
					}}
				/>
			</PopoverContent>
		</Popover>
	);
}
