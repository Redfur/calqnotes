import { useRegisterSW } from "virtual:pwa-register/react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useNotesStore } from "@/entities/note";
import { TRANS_NS } from "..";
import { useInstallStore } from "../model/install";
import { useOfflineStore } from "../model/offline";

const UPDATE_CHECK_MS = 60 * 60 * 1000;

/** Регистрирует service worker и сообщает об офлайн-готовности, новой версии и установке */
export function UpdateNotifier() {
	const { t } = useTranslation(TRANS_NS);
	const justInstalled = useInstallStore((s) => s.justInstalled);
	const {
		needRefresh: [needRefresh],
		offlineReady: [offlineReady, setOfflineReady],
		updateServiceWorker,
	} = useRegisterSW({
		onRegisteredSW(_url, registration) {
			useOfflineStore.setState({ supported: true });
			if (registration?.active) useOfflineStore.setState({ ready: true });
			// Открытое неделями приложение тоже должно узнать о новой версии
			if (registration) setInterval(() => void registration.update(), UPDATE_CHECK_MS);
		},
	});

	useEffect(() => {
		if (!offlineReady) return;
		useOfflineStore.setState({ ready: true });
		toast(t("offlineReady"));
		setOfflineReady(false);
	}, [offlineReady, setOfflineReady, t]);

	useEffect(() => {
		if (!needRefresh) return;
		toast(t("updateAvailable"), {
			id: "pwa-update",
			duration: Number.POSITIVE_INFINITY,
			action: {
				label: t("update"),
				onClick: async () => {
					// Сначала дописываем несохранённое — обновление перезагрузит страницу
					await useNotesStore.getState().saveNow();
					await updateServiceWorker(true);
				},
			},
		});
	}, [needRefresh, t, updateServiceWorker]);

	useEffect(() => {
		if (justInstalled) toast(t("justInstalled"));
	}, [justInstalled, t]);

	return null;
}
