import { Copy, Download, Ellipsis, Files, Pencil, SlidersHorizontal, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotesStore } from "@/entities/note";
import { PRECISION_OPTIONS } from "@/entities/settings";
import { TRANS_NS } from "..";
import { useNoteActions } from "../model/use-note-actions";

interface NoteActionsMenuProps {
	onRename: () => void;
	precisionLabel: (p: string) => string;
}

export function NoteActionsMenu({ onRename, precisionLabel }: NoteActionsMenuProps) {
	const { t } = useTranslation([TRANS_NS, "common"]);
	const { note, duplicate, copyWithResults, remove } = useNoteActions();
	const setPrecision = useNotesStore((s) => s.setPrecision);
	if (!note) return null;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type="button"
					aria-label={t("menu")}
					className="inline-flex size-[34px] items-center justify-center rounded-md text-subtle hover:bg-accent data-[state=open]:bg-accent"
				>
					<Ellipsis className="size-[18px]" aria-hidden />
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-64 rounded-lg p-1.5">
				<DropdownMenuItem onSelect={onRename}>
					<Pencil />
					{t("rename")}
					<DropdownMenuShortcut>F2</DropdownMenuShortcut>
				</DropdownMenuItem>
				<DropdownMenuItem onSelect={duplicate}>
					<Files />
					{t("duplicate")}
				</DropdownMenuItem>
				<DropdownMenuItem onSelect={copyWithResults}>
					<Copy />
					{t("copyWithResults")}
				</DropdownMenuItem>
				<DropdownMenuItem disabled>
					<Download />
					{t("downloadTxt")}
					<span className="ml-auto rounded-sm bg-muted px-1.5 text-[11px] text-muted-foreground">
						{t("common:soon")}
					</span>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuSub>
					<DropdownMenuSubTrigger>
						<SlidersHorizontal />
						{t("precisionInNote")}
					</DropdownMenuSubTrigger>
					<DropdownMenuSubContent className="rounded-lg p-1.5">
						<DropdownMenuRadioGroup
							value={String(note.precision ?? "")}
							onValueChange={(v) => setPrecision(note.id, v === "auto" ? "auto" : Number(v))}
						>
							{PRECISION_OPTIONS.map((p) => (
								<DropdownMenuRadioItem key={String(p)} value={String(p)}>
									{precisionLabel(String(p))}
								</DropdownMenuRadioItem>
							))}
						</DropdownMenuRadioGroup>
					</DropdownMenuSubContent>
				</DropdownMenuSub>
				<DropdownMenuSeparator />
				<DropdownMenuItem variant="destructive" onSelect={() => remove()}>
					<Trash2 />
					{t("delete")}
					<DropdownMenuShortcut>Ctrl Del</DropdownMenuShortcut>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
