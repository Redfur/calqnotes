import { cn } from "@/shared/lib/utils";

export interface SegmentedOption<T> {
	value: T;
	label: string;
}

interface SegmentedProps<T> {
	label: string;
	value: T;
	options: SegmentedOption<T>[];
	onChange: (value: T) => void;
	className?: string;
	touch?: boolean;
}

/** Переключатель из нескольких вариантов: плашка-подложка и выбранный вариант на карточке */
export function Segmented<T extends string | number>({
	label,
	value,
	options,
	onChange,
	className,
	touch,
}: SegmentedProps<T>) {
	return (
		<fieldset
			aria-label={label}
			className={cn("m-0 flex min-w-0 border-0 gap-0.5 rounded-[9px] bg-muted p-[3px]", className)}
		>
			{options.map((o) => {
				const on = o.value === value;
				return (
					<button
						key={String(o.value)}
						type="button"
						aria-pressed={on}
						onClick={() => onChange(o.value)}
						className={cn(
							"flex-1 rounded-sm px-2.5 text-[13px] whitespace-nowrap focus-visible:outline-2 focus-visible:outline-primary",
							touch ? "h-10" : "h-7",
							on ? "bg-card font-semibold shadow-[0_0_0_1px_var(--input)]" : "hover:text-foreground",
						)}
					>
						{o.label}
					</button>
				);
			})}
		</fieldset>
	);
}
