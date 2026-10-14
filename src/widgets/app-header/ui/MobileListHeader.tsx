import { CircleHelp, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { InstallButton } from "@/features/install-app";
import { Logo } from "@/shared/ui/Logo";
import { TRANS_NS } from "..";

interface MobileListHeaderProps {
	onOpenHelp: () => void;
	onOpenSettings: () => void;
}

export function MobileListHeader({ onOpenHelp, onOpenSettings }: MobileListHeaderProps) {
	const { t } = useTranslation(TRANS_NS);
	const touch = "inline-flex size-11 items-center justify-center rounded-lg text-subtle active:bg-accent";
	return (
		<header className="flex h-14 shrink-0 items-center gap-2 border-b pr-1 pl-4">
			<Logo />
			<h1 className="flex-1 text-[17px] font-semibold">{t("notes")}</h1>
			<InstallButton className={touch} />
			<button type="button" aria-label={t("help")} onClick={onOpenHelp} className={touch}>
				<CircleHelp className="size-5" aria-hidden />
			</button>
			<button type="button" aria-label={t("settings")} onClick={onOpenSettings} className={touch}>
				<Settings className="size-5" aria-hidden />
			</button>
		</header>
	);
}
