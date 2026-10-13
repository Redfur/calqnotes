import { Minus, Plus } from "lucide-react";
import { type ReactNode, useId } from "react";
import { useTranslation } from "react-i18next";
import { Switch } from "@/components/ui/switch";
import { type EditorSettings, useSettingsStore } from "@/entities/settings";
import { formatNumber, MAX_DIGITS } from "@/shared/lib/format-number";
import { cn } from "@/shared/lib/utils";
import { Segmented } from "@/shared/ui/Segmented";
import { TRANS_NS } from "..";

const SAMPLES: [string, number][] = [
	["1234567.891", 1234567.891],
	["0.1 + 0.2", 0.1 + 0.2],
	["1 / 3", 1 / 3],
	["12.5", 12.5],
	["2^60", 2 ** 60],
];

export function Field({
	label,
	hint,
	children,
	id,
}: {
	label: string;
	hint?: string;
	children: ReactNode;
	id?: string;
}) {
	return (
		<div className="flex flex-col gap-2">
			<div>
				<div id={id} className="text-sm font-medium">
					{label}
				</div>
				{hint && <div className="text-[13px] text-muted-foreground">{hint}</div>}
			</div>
			{children}
		</div>
	);
}

export function FormatSection({ touch }: { touch?: boolean }) {
	const { t } = useTranslation(TRANS_NS);
	const format = useSettingsStore((s) => s.numberFormat);
	const update = useSettingsStore((s) => s.updateNumberFormat);
	const maxDigits = format.mode === "significant" ? 15 : MAX_DIGITS;
	const minDigits = format.mode === "significant" ? 1 : 0;

	return (
		<div className="flex flex-col gap-5">
			<div className="rounded-lg border bg-card p-3">
				<div className="mb-1.5 text-xs text-muted-foreground">{t("preview")}</div>
				<dl className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 text-sm">
					{SAMPLES.map(([src, value]) => (
						<div key={src} className="contents">
							<dt className="truncate text-muted-foreground">{src}</dt>
							<dd className="text-right font-medium tabular-nums">{formatNumber(value, format).text}</dd>
						</div>
					))}
				</dl>
			</div>

			<Field label={t("rounding")} hint={t("roundingNote")}>
				<Segmented
					touch={touch}
					label={t("rounding")}
					value={format.mode}
					onChange={(mode) =>
						update({ mode, digits: mode === "significant" ? Math.max(format.digits, 1) : format.digits })
					}
					options={(["auto", "fixed", "significant"] as const).map((m) => ({ value: m, label: t(`mode.${m}`) }))}
					className="max-sm:flex-col"
				/>
				{format.mode !== "auto" && (
					<div className="flex items-center gap-3">
						<span className="text-[13px] text-muted-foreground">{t(`digits.${format.mode}`)}</span>
						<div className="flex items-center rounded-md border border-input">
							<button
								type="button"
								aria-label={t("less")}
								disabled={format.digits <= minDigits}
								onClick={() => update({ digits: format.digits - 1 })}
								className={cn(
									"inline-flex items-center justify-center disabled:opacity-40",
									touch ? "size-11" : "size-8",
								)}
							>
								<Minus className="size-3.5" aria-hidden />
							</button>
							<output className="w-8 text-center text-sm tabular-nums">{format.digits}</output>
							<button
								type="button"
								aria-label={t("more")}
								disabled={format.digits >= maxDigits}
								onClick={() => update({ digits: format.digits + 1 })}
								className={cn(
									"inline-flex items-center justify-center disabled:opacity-40",
									touch ? "size-11" : "size-8",
								)}
							>
								<Plus className="size-3.5" aria-hidden />
							</button>
						</div>
					</div>
				)}
			</Field>

			<Field label={t("group")}>
				<Segmented
					touch={touch}
					label={t("group")}
					value={format.group}
					onChange={(group) => update({ group })}
					options={(["space", "comma", "none"] as const).map((g) => ({ value: g, label: t(`group.${g}`) }))}
				/>
			</Field>
			<Field label={t("decimal")}>
				<Segmented
					touch={touch}
					label={t("decimal")}
					value={format.decimal}
					onChange={(decimal) => update({ decimal })}
					options={(["comma", "dot"] as const).map((d) => ({ value: d, label: t(`decimal.${d}`) }))}
				/>
			</Field>
			<Field label={t("exp")}>
				<Segmented
					touch={touch}
					label={t("exp")}
					value={Number.isFinite(format.expThreshold) ? String(Math.log10(format.expThreshold)) : "never"}
					onChange={(v) => update({ expThreshold: v === "never" ? Number.POSITIVE_INFINITY : 10 ** Number(v) })}
					options={(["12", "15", "never"] as const).map((e) => ({ value: e, label: t(`exp.${e}`) }))}
				/>
			</Field>
			<SwitchRow
				label={t("zeros")}
				hint={t("zerosHint")}
				checked={format.trailingZeros}
				onChange={(trailingZeros) =>
					update({ trailingZeros, mode: trailingZeros && format.mode === "auto" ? "fixed" : format.mode })
				}
			/>
		</div>
	);
}

export function SwitchRow({
	label,
	hint,
	checked,
	onChange,
}: {
	label: string;
	hint?: string;
	checked: boolean;
	onChange: (v: boolean) => void;
}) {
	const id = useId();
	return (
		<div className="flex items-start justify-between gap-4 py-1">
			<label htmlFor={id} className="cursor-pointer">
				<span className="block text-sm font-medium">{label}</span>
				{hint && <span className="block text-[13px] text-muted-foreground">{hint}</span>}
			</label>
			<Switch id={id} checked={checked} onCheckedChange={onChange} className="mt-0.5" />
		</div>
	);
}

const THEME_PREVIEW = {
	system: { bg: "linear-gradient(135deg, #FBFAF8 50%, #161615 50%)", line: "#A3A19A", chip: "#C2410C" },
	light: { bg: "#FBFAF8", line: "#DAD8D1", chip: "#EFEDE7" },
	dark: { bg: "#161615", line: "#3D3C38", chip: "#2B2A27" },
} as const;

export function LookSection({ touch }: { touch?: boolean }) {
	const { t } = useTranslation(TRANS_NS);
	const theme = useSettingsStore((s) => s.theme);
	const font = useSettingsStore((s) => s.font);
	const fontSize = useSettingsStore((s) => s.fontSize);
	const update = useSettingsStore((s) => s.update);

	return (
		<div className="flex flex-col gap-5">
			<Field label={t("theme")}>
				<fieldset aria-label={t("theme")} className="m-0 grid min-w-0 border-0 p-0 grid-cols-3 gap-2.5">
					{(["system", "light", "dark"] as const).map((v) => {
						const p = THEME_PREVIEW[v];
						const on = theme === v;
						return (
							<button
								key={v}
								type="button"
								aria-pressed={on}
								onClick={() => update({ theme: v })}
								className="flex flex-col gap-1.5 text-left text-[13px]"
							>
								<span
									aria-hidden
									className={cn(
										"flex h-16 flex-col justify-center gap-1.5 rounded-md border-2 px-2.5",
										on ? "border-primary" : "border-border",
									)}
									style={{ background: p.bg }}
								>
									<span className="h-1.5 w-3/4 rounded-full" style={{ background: p.line }} />
									<span className="h-1.5 w-1/2 rounded-full" style={{ background: p.line }} />
									<span className="h-2.5 w-8 self-end rounded-sm" style={{ background: p.chip }} />
								</span>
								<span className={cn(on && "font-semibold")}>{t(`theme.${v}`)}</span>
							</button>
						);
					})}
				</fieldset>
			</Field>
			<Field label={t("font")}>
				<Segmented
					touch={touch}
					label={t("font")}
					value={font}
					onChange={(f) => update({ font: f })}
					options={(["geist", "system", "mono"] as const).map((f) => ({ value: f, label: t(`font.${f}`) }))}
				/>
			</Field>
			<Field label={t("fontSize")}>
				<Segmented
					touch={touch}
					label={t("fontSize")}
					value={fontSize}
					onChange={(s) => update({ fontSize: s })}
					options={([14, 15, 16, 18] as const).map((s) => ({ value: s, label: String(s) }))}
				/>
			</Field>
		</div>
	);
}

const EDITOR_KEYS: (keyof EditorSettings)[] = ["lineNumbers", "autosave", "highlightVariable", "autocomplete", "wrap"];

export function EditorSection() {
	const { t } = useTranslation(TRANS_NS);
	const editor = useSettingsStore((s) => s.editor);
	const updateEditor = useSettingsStore((s) => s.updateEditor);
	return (
		<div className="flex flex-col gap-3">
			{EDITOR_KEYS.map((key) => (
				<SwitchRow
					key={key}
					label={t(`editor.${key}`)}
					hint={t(`editor.${key}Hint`)}
					checked={editor[key]}
					onChange={(v) => updateEditor({ [key]: v })}
				/>
			))}
		</div>
	);
}

export function DataSection() {
	const { t } = useTranslation([TRANS_NS, "common"]);
	return (
		<div className="flex flex-col gap-3">
			<p className="text-[13px] text-muted-foreground">{t("dataNote")}</p>
			<button
				type="button"
				disabled
				className="inline-flex h-10 items-center justify-between gap-3 rounded-md border border-input bg-card px-3 text-sm opacity-70"
			>
				{t("exportAll")}
				<span className="rounded-sm bg-muted px-1.5 text-[11px] text-muted-foreground">{t("common:soon")}</span>
			</button>
		</div>
	);
}
