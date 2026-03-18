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
	SidebarGroupAction,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	SidebarRail,
	useSidebar,
} from "@/components/ui/sidebar";
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
	const { isMobile, setOpenMobile } = useSidebar();

	const canDelete = documents.length > 1;

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
				<img src="/favicon.svg" alt="Calqnotes" className="size-10 shrink-0 rounded-md" />
				<span className="truncate font-semibold group-data-[collapsible=icon]:hidden">Calqnotes</span>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarMenu>
						<Collapsible defaultOpen asChild className="group/collapsible">
							<SidebarMenuItem>
								<CollapsibleTrigger asChild>
									<SidebarMenuButton tooltip={t("documents")} isActive>
										<FileText className="size-4" />
										{t("documents")}
										<ChevronRight className="ml-auto group-data-[state=open]/collapsible:hidden" />
										<ChevronDown className="ml-auto group-data-[state=closed]/collapsible:hidden" />
									</SidebarMenuButton>
								</CollapsibleTrigger>
								<CollapsibleContent>
									<SidebarMenuSub>
										{documents.map((doc) => {
											const isActive = doc.id === activeDocumentId;

											return (
												<DropdownMenu key={doc.id}>
													<SidebarMenuSubItem>
														<SidebarMenuSubButton onClick={() => handleSelect(doc.id)} isActive={isActive} asChild>
															{/* <FileText className="size-4" /> */}
															<SidebarMenuButton>
																{doc.isDirty && <span className="size-1.5 shrink-0 rounded-full bg-destructive" />}
																<span className="truncate">{doc.name}</span>
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
															<DropdownMenuItem onClick={() => handleRename(doc.id, doc.name)}>
																<Pencil className="size-4" />
																{t("rename")}
															</DropdownMenuItem>
															<DropdownMenuItem
																variant="destructive"
																disabled={!canDelete}
																onClick={() => canDelete && onDelete(doc.id)}
															>
																<Trash2 className="size-4" />
																{t("delete")}
															</DropdownMenuItem>
														</DropdownMenuContent>
													</SidebarMenuSubItem>
												</DropdownMenu>
											);
										})}
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
