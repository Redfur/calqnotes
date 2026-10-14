import { CircleCheck, Download, Share, WifiOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TRANS_NS } from "..";
import { useInstallStore } from "../model/install";
import { useOfflineStore } from "../model/offline";

/** Блок «Приложение» в настройках: установка и работа без интернета */
export function InstallSection({ touch }: { touch?: boolean }) {
	const { t } = useTranslation(TRANS_NS);
	const state = useInstallStore((s) => s.state);
	const install = useInstallStore((s) => s.install);
	const offline = useOfflineStore();

	return (
		<div className="flex flex-col gap-4">
			{state === "installed" ? (
				<p className="flex items-start gap-2.5 text-sm">
					<CircleCheck className="mt-0.5 size-4 shrink-0 text-ok" aria-hidden />
					<span>
						<span className="block font-medium">{t("installed")}</span>
						<span className="text-[13px] text-muted-foreground">{t("installedHint")}</span>
					</span>
				</p>
			) : state === "available" ? (
				<div className="flex flex-col items-start gap-2">
					<button
						type="button"
						onClick={() => void install()}
						className={`inline-flex items-center gap-2 rounded-md bg-foreground px-3.5 text-sm text-card ${touch ? "h-11" : "h-9"}`}
					>
						<Download className="size-4" aria-hidden />
						{t("install")}
					</button>
					<p className="text-[13px] text-muted-foreground">{t("installHint")}</p>
				</div>
			) : state === "ios" ? (
				<p className="flex items-start gap-2.5 text-sm">
					<Share className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
					{t("iosHint")}
				</p>
			) : (
				<p className="text-[13px] text-muted-foreground">{t("unsupportedHint")}</p>
			)}

			{offline.supported && (
				<p className="flex items-start gap-2.5 text-sm">
					<WifiOff className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
					{offline.ready ? (
						<span>
							<span className="block font-medium">{t("offline")}</span>
							<span className="text-[13px] text-muted-foreground">{t("offlineHint")}</span>
						</span>
					) : (
						<span className="text-muted-foreground">{t("offlinePending")}</span>
					)}
				</p>
			)}
		</div>
	);
}
