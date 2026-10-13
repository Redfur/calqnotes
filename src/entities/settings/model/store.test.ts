import { beforeEach, describe, expect, it } from "vitest";
import { useSettingsStore } from "./store";

describe("setLanguage", () => {
	beforeEach(() => {
		useSettingsStore.setState({
			language: "ru",
			numberFormat: { ...useSettingsStore.getState().numberFormat, group: "space", decimal: "comma", mode: "auto" },
		});
	});

	it("меняет разделители вместе с языком, если их не трогали", () => {
		useSettingsStore.getState().setLanguage("en");
		const s = useSettingsStore.getState();
		expect(s.language).toBe("en");
		expect([s.numberFormat.group, s.numberFormat.decimal]).toEqual(["comma", "dot"]);
		useSettingsStore.getState().setLanguage("ru");
		expect(useSettingsStore.getState().numberFormat.decimal).toBe("comma");
	});

	it("оставляет разделители, выбранные пользователем", () => {
		useSettingsStore.getState().updateNumberFormat({ group: "none" });
		useSettingsStore.getState().setLanguage("en");
		const s = useSettingsStore.getState();
		expect([s.numberFormat.group, s.numberFormat.decimal]).toEqual(["none", "comma"]);
	});
});
