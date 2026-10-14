import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { InstallSection } from "@/features/install-app";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/shared/lib/utils";
import { TRANS_NS } from "..";
import { DataSection, EditorSection, FormatSection, LookSection } from "./sections";

type Tab = "format" | "look" | "editor" | "app" | "data";
const TABS: Tab[] = ["format", "look", "editor", "app", "data"];

interface SettingsDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

function Section({ tab, touch }: { tab: Tab; touch?: boolean }) {
	if (tab === "format") return <FormatSection touch={touch} />;
	if (tab === "look") return <LookSection touch={touch} />;
	if (tab === "editor") return <EditorSection />;
	if (tab === "app") return <InstallSection touch={touch} />;
	return <DataSection />;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
	const { t } = useTranslation(TRANS_NS);
	const isMobile = useIsMobile();
	const [tab, setTab] = useState<Tab>("format");

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				showCloseButton={!isMobile}
				className={cn(
					"gap-0 overflow-hidden p-0",
					isMobile
						? "inset-0 top-0 left-0 h-dvh max-w-none translate-x-0 translate-y-0 rounded-none pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] sm:max-w-none"
						: "rounded-xl sm:max-w-[760px]",
				)}
			>
				<DialogDescription className="sr-only">{t("description")}</DialogDescription>
				{isMobile ? (
					<div className="flex h-full min-h-0 flex-col">
						<div className="flex h-14 shrink-0 items-center gap-2 border-b px-2">
							<DialogClose asChild>
								<button
									type="button"
									aria-label={t("back")}
									className="inline-flex size-11 items-center justify-center rounded-md"
								>
									<ArrowLeft className="size-5" aria-hidden />
								</button>
							</DialogClose>
							<DialogTitle className="text-[17px] font-semibold">{t("title")}</DialogTitle>
						</div>
						<div className="min-h-0 flex-1 overflow-y-auto px-4 pb-10">
							{TABS.map((tb) => (
								<section key={tb} className="border-b py-5 last:border-0">
									<h2 className="mb-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
										{t(`tab.${tb}`)}
									</h2>
									<Section tab={tb} touch />
								</section>
							))}
						</div>
					</div>
				) : (
					<div className="grid h-[min(640px,calc(100svh-64px))] grid-cols-[200px_minmax(0,1fr)]">
						<nav aria-label={t("title")} className="flex flex-col gap-0.5 border-r bg-background p-3">
							<DialogTitle className="px-2.5 pt-1 pb-3 text-[17px] font-semibold">{t("title")}</DialogTitle>
							{TABS.map((tb) => (
								<button
									key={tb}
									type="button"
									aria-current={tab === tb ? "page" : undefined}
									onClick={() => setTab(tb)}
									className={cn(
										"h-9 rounded-md px-2.5 text-left text-sm hover:bg-accent",
										tab === tb && "bg-selection font-medium hover:bg-selection",
									)}
								>
									{t(`tab.${tb}`)}
								</button>
							))}
						</nav>
						<div className="min-h-0 overflow-y-auto p-6">
							<h2 className="mb-5 text-[17px] font-semibold">{t(`tab.${tab}`)}</h2>
							<Section tab={tab} />
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
