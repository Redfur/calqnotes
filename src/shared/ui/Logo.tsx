import { cn } from "@/shared/lib/utils";

export function Logo({ className }: { className?: string }) {
	return (
		<svg
			className={cn("size-5 shrink-0 text-primary", className)}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			aria-hidden="true"
		>
			<rect x="3" y="3" width="18" height="18" rx="4" />
			<path d="M8 10h8" />
			<path d="M8 14h8" />
		</svg>
	);
}
