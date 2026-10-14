import { create } from "zustand";

interface OfflineStore {
	/** Service worker зарегистрирован (в dev-режиме и старых браузерах — нет) */
	supported: boolean;
	/** Всё нужное для работы без сети уже на устройстве */
	ready: boolean;
}

export const useOfflineStore = create<OfflineStore>(() => ({ supported: false, ready: false }));
