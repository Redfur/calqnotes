import { Copy, Download, Files, Pencil, Share2, Trash2 } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer";
import { noteTitle, useNotesStore } from "@/entities/note";
import { TRANS_NS as ACTIONS_NS, useNoteActions } from "@/features/note-actions";
import { TRANS_NS as PRECISION_NS, PrecisionOptions } from "@/features/precision-picker";
import { cn } from "@/shared/lib/utils";

interface MobileNoteMenuProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** Только точность (кнопка в шапке) или всё меню */
	mode: "precision" | "actions";
	onOpenSettings: () => void;
}

function Item({
	icon,
	children,
	onClick,
	danger,
	disabled,
	extra,
}: {
	icon: ReactNode;
	children: ReactNode;
	onClick?: () => void;
	danger?: boolean;
	disabled?: boolean;
	extra?: ReactNode;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			className={cn(
				"flex min-h-12 w-full items-center gap-3 rounded-lg px-3 text-left text-[15px] active:bg-accent disabled:opacity-60 [&_svg]:size-5 [&_svg]:text-muted-foreground",
				danger && "text-destructive [&_svg]:text-destructive",
			)}
		>
			{icon}
			<span className="flex-1">{children}</span>
			{extra}
		</button>
	);
}

export function MobileNoteMenu({ open, onOpenChange, mode, onOpenSettings }: MobileNoteMenuProps) {
	const { t } = useTranslation([ACTIONS_NS, PRECISION_NS, "common"]);
	const { note, duplicate, share, copyWithResults, remove } = useNoteActions();
	const renameNote = useNotesStore((s) => s.renameNote);
	const [renaming, setRenaming] = useState(false);
	const [draft, setDraft] = useState("");

	useEffect(() => {
		if (!open) setRenaming(false);
	}, [open]);

	if (!note) return null;
	const close = () => onOpenChange(false);
	const title = noteTitle(note, t("common:untitled"));

	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent className="rounded-t-2xl px-3 pb-[max(16px,env(safe-area-inset-bottom))]">
				<DrawerTitle className="px-3 pt-3 pb-1 text-base font-semibold">
					{mode === "precision" ? t(`${PRECISION_NS}:precision`) : title}
				</DrawerTitle>
				<DrawerDescription className="sr-only">{t("menu")}</DrawerDescription>
				{renaming ? (
					<form
						className="flex flex-col gap-3 p-3"
						onSubmit={(e) => {
							e.preventDefault();
							if (draft.trim()) renameNote(note.id, draft.trim());
							close();
						}}
					>
						<label className="text-sm font-medium" htmlFor="mobile-rename">
							{t("renameLabel")}
						</label>
						<input
							id="mobile-rename"
							// biome-ignore lint/a11y/noAutofocus: поле появляется по команде пользователя
							autoFocus
							value={draft}
							onChange={(e) => setDraft(e.target.value)}
							className="h-11 rounded-md border border-primary bg-card px-3 text-base outline-none"
						/>
						<div className="flex gap-2">
							<button
								type="button"
								onClick={() => setRenaming(false)}
								className="h-11 flex-1 rounded-md border border-input"
							>
								{t("common:cancel")}
							</button>
							<button type="submit" className="h-11 flex-1 rounded-md bg-foreground text-card">
								{t("common:save")}
							</button>
						</div>
					</form>
				) : (
					<div className="flex flex-col gap-1 pt-1">
						<div className={cn("rounded-xl bg-background p-1.5", mode === "actions" && "mb-1")}>
							<PrecisionOptions
								touch
								onOpenSettings={() => {
									close();
									onOpenSettings();
								}}
							/>
						</div>
						{mode === "actions" && (
							<>
								<Item
									icon={<Pencil />}
									onClick={() => {
										setDraft(note.name || title);
										setRenaming(true);
									}}
								>
									{t("rename")}
								</Item>
								<Item
									icon={<Files />}
									onClick={() => {
										duplicate();
										close();
									}}
								>
									{t("duplicate")}
								</Item>
								<Item
									icon={<Share2 />}
									onClick={() => {
										void share();
										close();
									}}
								>
									{t("share")}
								</Item>
								<Item
									icon={<Copy />}
									onClick={() => {
										copyWithResults();
										close();
									}}
								>
									{t("copyWithResults")}
								</Item>
								<Item
									icon={<Download />}
									disabled
									extra={
										<span className="rounded-sm bg-muted px-1.5 text-[11px] text-muted-foreground">
											{t("common:soon")}
										</span>
									}
								>
									{t("downloadTxt")}
								</Item>
								<Item
									icon={<Trash2 />}
									danger
									onClick={() => {
										close();
										remove();
									}}
								>
									{t("delete")}
								</Item>
							</>
						)}
					</div>
				)}
			</DrawerContent>
		</Drawer>
	);
}
