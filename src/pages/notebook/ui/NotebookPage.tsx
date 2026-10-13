import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useActiveNote, useNotesStore } from "@/entities/note";
import { effectiveFormat, useSettingsStore } from "@/entities/settings";
import { TRANS_NS as ACTIONS_NS, useNoteActions } from "@/features/note-actions";
import { TRANS_NS as PRECISION_NS, usePrecision } from "@/features/precision-picker";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/shared/lib/utils";
import { AppHeader, MobileEditorHeader, MobileListHeader, MobileNoteMenu } from "@/widgets/app-header";
import { HelpPanel } from "@/widgets/help-panel";
import { NoteEditor } from "@/widgets/note-editor";
import { NotePalette, NoteSearchList } from "@/widgets/note-palette";
import { SettingsDialog } from "@/widgets/settings-dialog";
import { TRANS_NS } from "..";
import { EmptyTips } from "./EmptyTips";
import { SymbolBar } from "./SymbolBar";
import { WelcomeBanner } from "./WelcomeBanner";

function isTextInput(target: EventTarget | null): boolean {
	return target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA"].includes(target.tagName));
}

export function NotebookPage() {
	const { t } = useTranslation([TRANS_NS, PRECISION_NS, ACTIONS_NS]);
	const isMobile = useIsMobile();
	const initialize = useNotesStore((s) => s.initialize);
	const initialized = useNotesStore((s) => s.initialized);
	const setContent = useNotesStore((s) => s.setContent);
	const createNote = useNotesStore((s) => s.createNote);
	const openNote = useNotesStore((s) => s.openNote);
	const saveNow = useNotesStore((s) => s.saveNow);
	const note = useActiveNote();
	const settings = useSettingsStore();
	const { remove } = useNoteActions();
	const precision = usePrecision();

	const [paletteOpen, setPaletteOpen] = useState(false);
	const [settingsOpen, setSettingsOpen] = useState(false);
	const [helpOpen, setHelpOpen] = useState(false);
	const [mobileView, setMobileView] = useState<"list" | "editor">("editor");
	const [mobileMenu, setMobileMenu] = useState<{ open: boolean; mode: "precision" | "actions" }>({
		open: false,
		mode: "actions",
	});
	const titleRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		void initialize(() => ({ name: t("welcomeTitle"), content: t("welcomeContent"), example: true }));
	}, [initialize, t]);

	// Предупреждение при закрытии, пока изменения не записаны
	useEffect(() => {
		const handler = (e: BeforeUnloadEvent) => {
			const { dirtyIds, saveStatus } = useNotesStore.getState();
			if (dirtyIds.length || saveStatus === "saving") e.preventDefault();
		};
		window.addEventListener("beforeunload", handler);
		return () => window.removeEventListener("beforeunload", handler);
	}, []);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			const mod = e.ctrlKey || e.metaKey;
			if (mod && e.key.toLowerCase() === "k") {
				e.preventDefault();
				setPaletteOpen((o) => !o);
			} else if (mod && e.key.toLowerCase() === "s") {
				e.preventDefault();
				void saveNow();
			} else if (e.key === "F2" && !paletteOpen) {
				e.preventDefault();
				titleRef.current?.focus();
				titleRef.current?.select();
			} else if (mod && e.key === "Delete" && !isTextInput(e.target)) {
				e.preventDefault();
				remove();
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [saveNow, remove, paletteOpen]);

	if (!initialized || !note) {
		return <div className="flex h-svh items-center justify-center text-muted-foreground">{t("loading")}</div>;
	}

	const format = effectiveFormat(settings.numberFormat, note.precision);
	const showBanner = note.example && !settings.welcomeDismissed;
	const isEmpty = note.content.trim() === "";
	const precisionLabel = (p: string) => t(`${PRECISION_NS}:option.${p}`);
	const openExample = () => {
		createNote({ name: t("welcomeTitle"), content: t("welcomeContent"), example: true });
		settings.update({ welcomeDismissed: false });
		setHelpOpen(false);
		setMobileView("editor");
	};

	const editor = (
		<div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
			{showBanner && <WelcomeBanner onHide={() => settings.update({ welcomeDismissed: true })} />}
			<NoteEditor
				noteId={note.id}
				content={note.content}
				onChange={(text) => setContent(note.id, text)}
				format={format}
				editor={settings.editor}
				className={cn(isEmpty ? "flex-none" : "flex-1")}
			/>
			{isEmpty && <EmptyTips onOpenHelp={() => setHelpOpen(true)} />}
		</div>
	);

	const dialogs = (
		<>
			<NotePalette open={paletteOpen} onOpenChange={setPaletteOpen} onDelete={(id) => remove(id)} />
			<SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
		</>
	);

	if (isMobile) {
		if (helpOpen) {
			return (
				<div className="flex h-svh flex-col">
					<HelpPanel
						format={format}
						onClose={() => setHelpOpen(false)}
						onOpenExample={openExample}
						className="flex-1"
					/>
					{dialogs}
				</div>
			);
		}
		if (mobileView === "list") {
			return (
				<div className="flex h-svh flex-col">
					<MobileListHeader onOpenHelp={() => setHelpOpen(true)} onOpenSettings={() => setSettingsOpen(true)} />
					<NoteSearchList
						touch
						className="flex-1"
						onOpen={(id) => {
							openNote(id);
							setMobileView("editor");
						}}
						onCreate={(name) => {
							createNote(name ? { name } : undefined);
							setMobileView("editor");
						}}
						onDelete={(id) => remove(id)}
						onMore={(n) => {
							openNote(n.id);
							setMobileMenu({ open: true, mode: "actions" });
						}}
					/>
					<MobileNoteMenu
						open={mobileMenu.open}
						mode={mobileMenu.mode}
						onOpenChange={(open) => setMobileMenu((m) => ({ ...m, open }))}
						onOpenSettings={() => setSettingsOpen(true)}
					/>
					{dialogs}
				</div>
			);
		}
		return (
			<div className="flex h-svh flex-col">
				<MobileEditorHeader
					autosave={settings.editor.autosave}
					precisionShort={precision.shortLabel}
					precisionLabel={precision.label}
					onBack={() => setMobileView("list")}
					onOpenMenu={(mode) => setMobileMenu({ open: true, mode })}
				/>
				{editor}
				<SymbolBar />
				<MobileNoteMenu
					open={mobileMenu.open}
					mode={mobileMenu.mode}
					onOpenChange={(open) => setMobileMenu((m) => ({ ...m, open }))}
					onOpenSettings={() => setSettingsOpen(true)}
				/>
				{dialogs}
			</div>
		);
	}

	return (
		<div className="flex h-svh flex-col">
			<AppHeader
				titleRef={titleRef}
				autosave={settings.editor.autosave}
				helpOpen={helpOpen}
				onOpenNotes={() => setPaletteOpen(true)}
				onToggleHelp={() => setHelpOpen((o) => !o)}
				onOpenSettings={() => setSettingsOpen(true)}
				precisionLabel={precisionLabel}
			/>
			<div className="flex min-h-0 flex-1">
				{editor}
				{helpOpen && (
					<HelpPanel
						format={format}
						onClose={() => setHelpOpen(false)}
						onOpenExample={openExample}
						className="w-[380px] shrink-0 border-l"
					/>
				)}
			</div>
			{dialogs}
		</div>
	);
}
