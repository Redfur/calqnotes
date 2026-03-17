import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { TRANS_NS } from "..";

interface SaveButtonProps {
	onSave: () => void;
	disabled?: boolean;
	isDirty?: boolean;
}

export function SaveButton({ onSave, disabled, isDirty }: SaveButtonProps) {
	const { t } = useTranslation(TRANS_NS);
	return (
		<Button onClick={onSave} disabled={disabled || !isDirty} variant="ghost" size="sm">
			{t("save")}
		</Button>
	);
}
