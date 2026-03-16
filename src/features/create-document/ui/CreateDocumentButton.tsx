import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { TRANS_NS } from "..";

interface CreateDocumentButtonProps {
	onCreate: () => void;
}

export function CreateDocumentButton({ onCreate }: CreateDocumentButtonProps) {
	const { t } = useTranslation(TRANS_NS);
	return (
		<Button onClick={onCreate} variant="outline" size="sm">
			<Plus className="size-4" />
			{t("newDocument")}
		</Button>
	);
}
