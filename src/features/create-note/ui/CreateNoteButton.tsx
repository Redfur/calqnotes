import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { TRANS_NS } from "..";

interface CreateNoteButtonProps {
	onCreate: () => void;
}

export function CreateNoteButton({ onCreate }: CreateNoteButtonProps) {
	const { t } = useTranslation(TRANS_NS);
	return (
		<Button onClick={onCreate} variant="ghost" size="sm">
			<Plus className="size-4" />
			{t("newNote")}
		</Button>
	);
}
