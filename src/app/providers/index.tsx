import { I18nextProvider } from "react-i18next";
import { TooltipProvider } from "@/components/ui/tooltip";
import { i18n } from "@/shared/lib/i18n";
import "@/shared/i18n";

export function AppProviders({ children }: { children: React.ReactNode }) {
	return (
		<I18nextProvider i18n={i18n}>
			<TooltipProvider>{children}</TooltipProvider>
		</I18nextProvider>
	);
}
