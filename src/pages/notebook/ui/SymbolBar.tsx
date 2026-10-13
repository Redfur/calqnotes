import { useTranslation } from "react-i18next";
import { editorBridge } from "@/shared/lib/editor-bridge";
import { TRANS_NS } from "..";

const SYMBOLS = [
	["+", "+", "plus"],
	["−", "-", "minus"],
	["×", "*", "multiply"],
	["÷", "/", "divide"],
	["%", "%", "percent"],
	["(", "(", "open"],
	[")", ")", "close"],
	["=", "=", "equals"],
	["#", "#", "comment"],
] as const;

/** Строка символов над клавиатурой телефона: на цифровой раскладке их не найти */
export function SymbolBar() {
	const { t } = useTranslation(TRANS_NS);
	return (
		<div
			role="toolbar"
			aria-label={t("symbols")}
			className="flex shrink-0 gap-1 overflow-x-auto border-t bg-card px-2 py-1.5"
		>
			{SYMBOLS.map(([shown, insert, key]) => (
				<button
					key={key}
					type="button"
					aria-label={t(`symbol.${key}`)}
					onMouseDown={(e) => e.preventDefault()}
					onClick={() => editorBridge.insert(insert)}
					className="size-11 shrink-0 rounded-[10px] bg-muted text-lg active:bg-result-hover"
				>
					{shown}
				</button>
			))}
		</div>
	);
}
