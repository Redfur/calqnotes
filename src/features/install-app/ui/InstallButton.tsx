import { Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/shared/lib/utils";
import { TRANS_NS } from "..";
import { useInstallStore } from "../model/install";

/** Кнопка-иконка установки: видна, только пока браузер готов установить приложение */
export function InstallButton({ className }: { className?: string }) {
	const { t } = useTranslation(TRANS_NS);
	const state = useInstallStore((s) => s.state);
	const install = useInstallStore((s) => s.install);
	if (state !== "available") return null;
	return (
		<button
			type="button"
			aria-label={t("install")}
			title={t("install")}
			onClick={() => void install()}
			className={cn(className)}
		>
			<Download className="size-5" aria-hidden />
		</button>
	);
}
