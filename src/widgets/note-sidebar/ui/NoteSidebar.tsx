import { ChevronDown, ChevronRight, FileText, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	SidebarRail,
	SidebarSeparator,
	useSidebar,
} from "@/components/ui/sidebar";
import { TRANS_NS } from "..";

interface NoteSidebarProps {
	notes: { id: string; name: string; isDirty: boolean }[];
	activeNoteId: string | null;
	onSelect: (id: string) => void;
	onCreate: () => void;
	onDelete: (id: string) => void;
	onRename: (id: string, name: string) => void;
}

export function NoteSidebar({ notes, activeNoteId, onSelect, onCreate, onDelete, onRename }: NoteSidebarProps) {
	const { t } = useTranslation(TRANS_NS);
	const { isMobile, setOpenMobile } = useSidebar();

	const canDelete = notes.length > 1;

	const handleSelect = (id: string) => {
		onSelect(id);
		if (isMobile) {
			setOpenMobile(false);
		}
	};

	const handleRename = (id: string, currentName: string) => {
		const newName = window.prompt(t("renamePrompt"), currentName);
		if (newName?.trim()) {
			onRename(id, newName.trim());
		}
	};

	return (
		<Sidebar collapsible="icon">
			<SidebarHeader className="flex flex-row items-center gap-3 border-b border-sidebar-border px-3 py-2 h-16">
				<img src="favicon.svg" alt="Calqnotes" className="size-10 shrink-0" />
				<span className="truncate font-semibold group-data-[collapsible=icon]:hidden">Calqnotes</span>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarMenu>
						<Collapsible defaultOpen asChild className="group/collapsible">
							<SidebarMenuItem>
								<CollapsibleTrigger asChild>
									<SidebarMenuButton tooltip={t("notes")} isActive>
										<FileText className="size-4" />
										{t("notes")}
										<ChevronRight className="ml-auto group-data-[state=open]/collapsible:hidden" />
										<ChevronDown className="ml-auto group-data-[state=closed]/collapsible:hidden" />
									</SidebarMenuButton>
								</CollapsibleTrigger>
								<CollapsibleContent>
									<SidebarMenuSub>
										{notes.map((note) => {
											const isActive = note.id === activeNoteId;

											return (
												<DropdownMenu key={note.id}>
													<SidebarMenuSubItem>
														<SidebarMenuSubButton onClick={() => handleSelect(note.id)} isActive={isActive} asChild>
															<SidebarMenuButton>
																{note.isDirty && <span className="size-1.5 shrink-0 rounded-full bg-destructive" />}
																<span className="truncate">{note.name}</span>
															</SidebarMenuButton>
														</SidebarMenuSubButton>
														<DropdownMenuTrigger asChild>
															<SidebarMenuAction aria-label={t("menu")} className="mr-0.5">
																<MoreHorizontal />
															</SidebarMenuAction>
														</DropdownMenuTrigger>
														<DropdownMenuContent
															align={isMobile ? "end" : "start"}
															side={isMobile ? "bottom" : "right"}
															className="min-w-40"
														>
															<DropdownMenuItem onClick={() => handleRename(note.id, note.name)}>
																<Pencil className="size-4" />
																{t("rename")}
															</DropdownMenuItem>
															<DropdownMenuItem
																variant="destructive"
																disabled={!canDelete}
																onClick={() => canDelete && onDelete(note.id)}
															>
																<Trash2 className="size-4" />
																{t("delete")}
															</DropdownMenuItem>
														</DropdownMenuContent>
													</SidebarMenuSubItem>
												</DropdownMenu>
											);
										})}
										<SidebarSeparator />
										<DropdownMenu>
											<SidebarMenuSubItem>
												<SidebarMenuSubButton onClick={onCreate} asChild>
													<SidebarMenuButton>
														<Plus className="size-4" />
														<span className="truncate">{t("newNote")}</span>
													</SidebarMenuButton>
												</SidebarMenuSubButton>
											</SidebarMenuSubItem>
										</DropdownMenu>
									</SidebarMenuSub>
								</CollapsibleContent>
							</SidebarMenuItem>
						</Collapsible>
					</SidebarMenu>
				</SidebarGroup>
			</SidebarContent>
			<SidebarRail />
		</Sidebar>
	);
}
