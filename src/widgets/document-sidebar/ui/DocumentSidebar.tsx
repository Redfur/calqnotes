import { Trash2 } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { CreateDocumentButton } from "@/features/create-document";
import { cn } from "@/shared/lib/utils";
import { TRANS_NS } from "..";

interface DocumentSidebarProps {
	documents: { id: string; name: string; isDirty: boolean }[];
	activeDocumentId: string | null;
	onSelect: (id: string) => void;
	onCreate: () => void;
	onDelete: (id: string) => void;
	onRename: (id: string, name: string) => void;
}

export function DocumentSidebar({
	documents,
	activeDocumentId,
	onSelect,
	onCreate,
	onDelete,
	onRename,
}: DocumentSidebarProps) {
	const { t } = useTranslation(TRANS_NS);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editName, setEditName] = useState("");

	const handleStartRename = useCallback((id: string, name: string) => {
		setEditingId(id);
		setEditName(name);
	}, []);

	const handleCommitRename = useCallback(() => {
		if (editingId && editName.trim()) {
			onRename(editingId, editName.trim());
		}
		setEditingId(null);
		setEditName("");
	}, [editingId, editName, onRename]);

	const canDelete = documents.length > 1;

	return (
		<aside className="flex w-56 shrink-0 flex-col border-r border-border bg-sidebar">
			<div className="flex flex-col gap-2 border-b border-border p-2">
				<span className="text-sm font-medium text-muted-foreground">{t("documents")}</span>
				<CreateDocumentButton onCreate={onCreate} />
			</div>
			<nav className="flex-1 overflow-auto p-2">
				<ul className="space-y-1">
					{documents.map((doc) => {
						const isActive = doc.id === activeDocumentId;

						return (
							<li key={doc.id} className="flex items-center gap-1 group">
								{editingId === doc.id ? (
									<input
										type="text"
										value={editName}
										onChange={(e) => setEditName(e.target.value)}
										onBlur={handleCommitRename}
										onKeyDown={(e) => {
											if (e.key === "Enter") handleCommitRename();
											if (e.key === "Escape") {
												setEditingId(null);
												setEditName("");
											}
										}}
										className="h-7 flex-1 rounded border border-input bg-background px-2 text-sm"
									/>
								) : (
									<button
										type="button"
										onClick={() => onSelect(doc.id)}
										onDoubleClick={() => handleStartRename(doc.id, doc.name)}
										className={cn(
											"flex flex-1 items-center gap-1 truncate rounded px-2 py-1.5 text-left text-sm",
											isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50",
										)}
									>
										{doc.isDirty && <span className="text-destructive">•</span>}
										<span className="truncate">{doc.name}</span>
									</button>
								)}
								<Button
									variant="ghost"
									size="icon-xs"
									className="opacity-0 group-hover:opacity-100"
									disabled={!canDelete}
									onClick={() => canDelete && onDelete(doc.id)}
									title={t("delete")}
									aria-label={t("delete")}
								>
									<Trash2 className="size-3.5" />
								</Button>
							</li>
						);
					})}
				</ul>
			</nav>
		</aside>
	);
}
