<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { listen, type UnlistenFn } from "@tauri-apps/api/event";
  import TitleBar from "./lib/components/TitleBar.svelte";
  import WysiwygEditor from "./lib/components/WysiwygEditor.svelte";
  import StatusBar from "./lib/components/StatusBar.svelte";
  import SearchBar from "./lib/components/SearchBar.svelte";
  import CommandPalette from "./lib/components/CommandPalette.svelte";
  import ShortcutConfigModal from "./lib/components/ShortcutConfigModal.svelte";
  import OutlinePanel from "./lib/components/OutlinePanel.svelte";
  import FormatBar from "./lib/components/FormatBar.svelte";
  import type { OutlineHeading } from "./lib/core/outline";
  import { scrollToHeading } from "./lib/core/outline";
  import type { CommandHandlers } from "./lib/core/commands";
  import {
    setupShortcuts,
    openFileDialog,
    createNewFile,
    saveFileAs,
    renameFile,
    readFile,
    closeWindow,
    updateRecentMenu,
    shadowSave,
    checkShadowRecovery,
    dismissShadow,
  } from "./lib/core/shortcuts";
  import {
    loadShortcuts,
    formatShortcutForDisplay,
  } from "./lib/core/shortcutStore";
  import { isTauri } from "./lib/core/env";
  import {
    deriveFileName,
    toggleTheme,
    performSave,
    handleContentUpdate,
    scheduleAutoSave,
    scheduleShadowSave,
    getRecentFiles,
    addRecentFile,
    removeRecentFile,
  } from "./lib/core/app-logic";
  import type { TelemetryResult } from "./lib/workers/telemetry.worker";
  import TelemetryWorker from "./lib/workers/telemetry.worker?worker";

  import { fileState } from "./lib/stores/file.svelte";
  import { uiState } from "./lib/stores/ui.svelte";

  let cleanupShortcuts: (() => void) | null = null;
  let unlistenMenu: UnlistenFn[] = [];

  // Telemetry state
  let telemetryWorker: Worker | null = null;
  let telemetry: TelemetryResult = $state({
    words: 0,
    characters: 0,
    readingTimeMinutes: 0,
  });

  let editorRef: import("@tiptap/core").Editor | null = $state(null);
  let outlineHeadings: OutlineHeading[] = $state([]);
  let outlineActiveId: string | null = $state(null);
  let currentShortcuts = $state(loadShortcuts());

  let fileName = $derived(deriveFileName(fileState.filePath));

  // Command palette handlers
  let commandHandlers: CommandHandlers = $derived({
    onNew: handleNew,
    onOpen: handleOpen,
    onSave: handleSave,
    onSaveAs: handleSaveAs,
    onClose: handleClose,
    onToggleTheme: () => {
      toggleTheme();
      document.documentElement.setAttribute("data-theme", uiState.theme);
      localStorage.setItem("md-lite-theme", uiState.theme);
    },
    onToggleFocusMode: () => {
      uiState.focusMode = !uiState.focusMode;
      localStorage.setItem("md-lite-focus", String(uiState.focusMode));
    },
    onGoHome: handleGoHome,
    onCommandPalette: () => {
      uiState.showCommandPalette = true;
    },
    onOpenShortcutConfig: () => {
      uiState.showCommandPalette = false;
      uiState.showShortcutModal = true;
    },
    onFind: () => {
      uiState.showCommandPalette = false;
      uiState.showSearchBar = !uiState.showSearchBar;
    },
    onToggleOutline: () => {
      const hasFile = !!fileState.filePath || fileState.content !== "";
      if (!hasFile) return;
      uiState.showCommandPalette = false;
      uiState.showOutline = !uiState.showOutline;
    },
    onSetHeading: (level: number) => {
      if (!editorRef) return;
      const l = level as 1 | 2 | 3 | 4 | 5 | 6;
      if (editorRef.isActive("heading", { level: l })) {
        editorRef.chain().focus().setParagraph().run();
      } else {
        editorRef.chain().focus().setHeading({ level: l }).run();
      }
    },
    onSetParagraph: () => editorRef?.chain().focus().setParagraph().run(),
    onToggleBold: () => editorRef?.chain().focus().toggleBold().run(),
    onToggleItalic: () => editorRef?.chain().focus().toggleItalic().run(),
    onToggleStrikethrough: () =>
      editorRef?.chain().focus().toggleStrike().run(),
    onToggleBlockquote: () =>
      editorRef?.chain().focus().toggleBlockquote().run(),
    onToggleBulletList: () =>
      editorRef?.chain().focus().toggleBulletList().run(),
    onToggleOrderedList: () =>
      editorRef?.chain().focus().toggleOrderedList().run(),
    onToggleCodeBlock: () => editorRef?.chain().focus().toggleCodeBlock().run(),
    onInsertHorizontalRule: () =>
      editorRef?.chain().focus().setHorizontalRule().run(),
    onToggleHighlight: () => editorRef?.chain().focus().toggleHighlight().run(),
  });

  async function refreshRecents() {
    fileState.recentFiles = getRecentFiles();
    const paths = fileState.recentFiles.map((r) => r.path);
    const names = fileState.recentFiles.map((r) => r.name);
    try {
      await updateRecentMenu(paths, names);
    } catch (err) {
      console.error("Failed to update native recent files menu", err);
    }
  }

  function doScheduleAutoSave() {
    scheduleAutoSave(performSave);
  }

  function doScheduleShadowSave() {
    scheduleShadowSave(async () => {
      try {
        await shadowSave(fileState.filePath, fileState.content);
      } catch (err) {
        console.error("Shadow save failed:", err);
      }
    });
  }

  function updateTelemetry(text: string) {
    telemetryWorker?.postMessage({ text });
  }

  function onContentUpdateWrapper(markdown: string) {
    handleContentUpdate(markdown);
    doScheduleAutoSave();
    doScheduleShadowSave();
    updateTelemetry(markdown);
  }

  async function handleNew() {
    try {
      const path = await createNewFile();
      if (!path) return;

      if (fileState.saveTimer) clearTimeout(fileState.saveTimer);
      if (fileState.shadowTimer) clearTimeout(fileState.shadowTimer);
      fileState.filePath = path;
      fileState.content = "";
      fileState.isDirty = false;
      addRecentFile(path);
      refreshRecents();
      dismissShadow().catch(() => {});
      updateTelemetry("");
    } catch (err) {
      console.error("New file failed:", err);
    }
  }

  async function handleOpen() {
    try {
      const result = await openFileDialog();
      if (!result) return;

      if (fileState.saveTimer) clearTimeout(fileState.saveTimer);
      if (fileState.shadowTimer) clearTimeout(fileState.shadowTimer);
      fileState.filePath = result.path;
      fileState.content = result.content;
      fileState.isDirty = false;
      addRecentFile(result.path);
      refreshRecents();
      dismissShadow().catch(() => {});
      updateTelemetry(result.content);
    } catch (err) {
      console.error("Open failed:", err);
    }
  }

  async function handleOpenRecent(path: string) {
    try {
      const fileContent = await readFile(path);
      if (fileState.saveTimer) clearTimeout(fileState.saveTimer);
      if (fileState.shadowTimer) clearTimeout(fileState.shadowTimer);
      fileState.filePath = path;
      fileState.content = fileContent;
      fileState.isDirty = false;
      addRecentFile(path);
      refreshRecents();
      dismissShadow().catch(() => {});
      updateTelemetry(fileContent);
    } catch (err) {
      console.error("Open recent failed:", err);
      removeRecentFile(path);
      refreshRecents();
    }
  }

  async function handleSave() {
    if (fileState.saveTimer) clearTimeout(fileState.saveTimer);
    if (fileState.shadowTimer) clearTimeout(fileState.shadowTimer);

    if (!fileState.filePath && fileState.content) {
      const path = await saveFileAs(fileState.content);
      if (path) {
        fileState.filePath = path;
        fileState.isDirty = false;
        addRecentFile(path);
        refreshRecents();
        dismissShadow().catch(() => {});
      }
      return;
    }

    await performSave();
    dismissShadow().catch(() => {});
  }

  async function handleSaveAs() {
    try {
      const name = deriveFileName(fileState.filePath);
      const path = await saveFileAs(fileState.content, name);
      if (!path) return;

      fileState.filePath = path;
      fileState.isDirty = false;
      addRecentFile(path);
      refreshRecents();
    } catch (err) {
      console.error("Save As failed:", err);
    }
  }

  async function handleRename(newName: string) {
    if (!fileState.filePath) {
      try {
        const path = await saveFileAs(fileState.content, newName);
        if (path) {
          fileState.filePath = path;
          fileState.isDirty = false;
          addRecentFile(path);
          refreshRecents();
          dismissShadow().catch(() => {});
        }
      } catch (err) {
        console.error("Save As from rename failed:", err);
      }
      return;
    }

    try {
      const newPath = await renameFile(fileState.filePath, newName);
      const oldPath = fileState.filePath;
      fileState.filePath = newPath;
      removeRecentFile(oldPath);
      addRecentFile(newPath);
      refreshRecents();
    } catch (err) {
      console.error("Rename failed:", err);
    }
  }

  async function handleClose() {
    if (fileState.isDirty && fileState.filePath) await performSave();
    await closeWindow();
  }

  async function handleGoHome() {
    if (fileState.isDirty && fileState.filePath) {
      await performSave();
    }
    fileState.filePath = "";
    fileState.content = "";
    fileState.isDirty = false;
    dismissShadow().catch(() => {});
    updateTelemetry("");
  }

  async function handleRestore() {
    if (!fileState.recoveryData) return;
    try {
      fileState.filePath = fileState.recoveryData.original_path;
      fileState.content = fileState.recoveryData.shadow_content;
      fileState.isDirty = true;
      fileState.recoveryData = null;
      await dismissShadow();
      updateTelemetry(fileState.content);
      if (fileState.filePath) {
        addRecentFile(fileState.filePath);
        refreshRecents();
      }
    } catch (err) {
      console.error("Restore failed:", err);
    }
  }

  async function handleDismiss() {
    fileState.recoveryData = null;
    try {
      await dismissShadow();
    } catch (err) {
      console.error("Dismiss failed:", err);
    }
  }

  function reloadShortcuts() {
    currentShortcuts = loadShortcuts();
    cleanupShortcuts?.();
    cleanupShortcuts = setupShortcuts(commandHandlers);
  }

  onMount(async () => {
    const saved = localStorage.getItem("md-lite-theme") as
      | "dark"
      | "light"
      | null;
    if (saved) {
      uiState.theme = saved;
      document.documentElement.setAttribute("data-theme", uiState.theme);
    }

    const savedFocus = localStorage.getItem("md-lite-focus");
    if (savedFocus === "true") {
      uiState.focusMode = true;
    }

    refreshRecents();

    telemetryWorker = new TelemetryWorker();
    telemetryWorker.onmessage = (event: MessageEvent<TelemetryResult>) => {
      telemetry = event.data;
    };

    try {
      const recovery = await checkShadowRecovery();
      if (recovery) {
        fileState.recoveryData = recovery;
      }
    } catch (err) {
      console.error("Recovery check failed:", err);
    }

    reloadShortcuts();

    if (isTauri) {
      listen("menu-new-file", handleNew)?.then((f) => unlistenMenu?.push(f));
      listen("menu-open-file", handleOpen)?.then((f) => unlistenMenu?.push(f));
      listen("menu-save-file", handleSave)?.then((f) => unlistenMenu?.push(f));
      listen("menu-save-as", handleSaveAs)?.then((f) => unlistenMenu?.push(f));
      listen("open-recent", (evt: any) => handleOpenRecent(evt.payload))?.then(
        (f) => unlistenMenu?.push(f),
      );
    }
  });

  onDestroy(() => {
    cleanupShortcuts?.();
    unlistenMenu.forEach((u) => u());
    if (fileState.saveTimer) clearTimeout(fileState.saveTimer);
    if (fileState.shadowTimer) clearTimeout(fileState.shadowTimer);
    telemetryWorker?.terminate();
  });
</script>

<TitleBar
  {fileName}
  isDirty={fileState.isDirty}
  isSaving={fileState.isSaving}
  theme={uiState.theme}
  hasFile={!!fileState.filePath || fileState.content !== ""}
  onToggleTheme={toggleTheme}
  onRename={handleRename}
  onToggleOutline={commandHandlers.onToggleOutline}
/>

{#if fileState.recoveryData}
  <div class="recovery-banner" id="recovery-banner">
    <div class="recovery-content">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <span class="recovery-text">
        Unsaved session detected{fileState.recoveryData.original_path
          ? ` from ${deriveFileName(fileState.recoveryData.original_path)}`
          : ""}
      </span>
    </div>
    <div class="recovery-actions">
      <button class="recovery-btn restore" onclick={handleRestore}
        >Restore</button
      >
      <button class="recovery-btn dismiss" onclick={handleDismiss}
        >Dismiss</button
      >
    </div>
  </div>
{/if}

{#if !!fileState.filePath || fileState.content !== ""}
  <FormatBar editor={editorRef} />
{/if}

<main class="main-content">
  <SearchBar
    editor={editorRef}
    visible={uiState.showSearchBar}
    onClose={() => (uiState.showSearchBar = false)}
  />
  <WysiwygEditor
    content={fileState.content}
    filePath={fileState.filePath}
    focusMode={uiState.focusMode}
    onUpdate={onContentUpdateWrapper}
    onEditorReady={(e) => (editorRef = e)}
    onOutlineChange={(headings, activeId) => {
      outlineHeadings = headings;
      outlineActiveId = activeId;
    }}
  />

  <OutlinePanel
    visible={uiState.showOutline}
    headings={outlineHeadings}
    activeId={outlineActiveId}
    onJump={(pos) => {
      if (editorRef) {
        scrollToHeading(editorRef, pos);
      }
    }}
    onClose={() => (uiState.showOutline = false)}
  />

  {#if !fileState.filePath && fileState.content === ""}
    <div class="empty-state">
      <div class="empty-icon">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
          />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      </div>

      <p class="empty-title">No file open</p>

      <div class="empty-actions">
        <button class="action-pill" onclick={handleNew}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New File
          <kbd>{formatShortcutForDisplay(currentShortcuts.onNew)}</kbd>
        </button>
        <button class="action-pill" onclick={handleOpen}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
            />
          </svg>
          Open File
          <kbd>{formatShortcutForDisplay(currentShortcuts.onOpen)}</kbd>
        </button>
      </div>

      {#if fileState.recentFiles.length > 0}
        <div class="recent-section">
          <p class="recent-heading">Recent</p>
          <ul class="recent-list">
            {#each fileState.recentFiles as file}
              <li>
                <button
                  class="recent-item"
                  onclick={() => handleOpenRecent(file.path)}
                >
                  <span class="recent-name">{file.name}</span>
                  <span class="recent-folder">{file.folder}</span>
                </button>
              </li>
            {/each}
          </ul>
        </div>
      {/if}

      <div class="shortcuts-list">
        <div class="shortcut-row">
          <kbd>{formatShortcutForDisplay(currentShortcuts.onNew)}</kbd><span
            >New file</span
          >
        </div>
        <div class="shortcut-row">
          <kbd>{formatShortcutForDisplay(currentShortcuts.onOpen)}</kbd><span
            >Open file</span
          >
        </div>
        <div class="shortcut-row">
          <kbd>{formatShortcutForDisplay(currentShortcuts.onSave)}</kbd><span
            >Save</span
          >
        </div>
        <div class="shortcut-row">
          <kbd>{formatShortcutForDisplay(currentShortcuts.onSaveAs)}</kbd><span
            >Save As</span
          >
        </div>
        <div class="shortcut-row">
          <kbd>⌘1-6</kbd><span>Set heading level</span>
        </div>
        <div class="shortcut-row">
          <kbd>{formatShortcutForDisplay(currentShortcuts.onToggleTheme)}</kbd
          ><span>Toggle dark/light</span>
        </div>
        <div class="shortcut-row">
          <kbd
            >{formatShortcutForDisplay(currentShortcuts.onToggleFocusMode)}</kbd
          ><span>Focus mode</span>
        </div>
        <div class="shortcut-row">
          <kbd
            >{formatShortcutForDisplay(currentShortcuts.onCommandPalette)}</kbd
          ><span>Command palette</span>
        </div>
        <div class="shortcut-row">
          <kbd>{formatShortcutForDisplay(currentShortcuts.onClose)}</kbd><span
            >Close</span
          >
        </div>
      </div>
    </div>
  {/if}
</main>

<StatusBar
  words={telemetry.words}
  characters={telemetry.characters}
  readingTimeMinutes={telemetry.readingTimeMinutes}
  focusMode={uiState.focusMode}
/>

<CommandPalette
  visible={uiState.showCommandPalette}
  handlers={commandHandlers}
  config={currentShortcuts}
  onClose={() => (uiState.showCommandPalette = false)}
/>

<ShortcutConfigModal
  visible={uiState.showShortcutModal}
  onClose={() => (uiState.showShortcutModal = false)}
  onSave={reloadShortcuts}
/>

<style>
  /* Recovery banner */
  .recovery-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px;
    background: color-mix(
      in srgb,
      var(--color-warning) 12%,
      var(--color-bg-secondary)
    );
    border-bottom: 1px solid
      color-mix(in srgb, var(--color-warning) 25%, var(--color-border));
    flex-shrink: 0;
    animation: slideDown 0.25s ease-out;
  }

  @keyframes slideDown {
    from {
      transform: translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .recovery-content {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--color-warning);
  }

  .recovery-text {
    font-size: 12px;
    font-weight: 500;
    color: var(--color-text-primary);
  }

  .recovery-actions {
    display: flex;
    gap: 6px;
  }

  .recovery-btn {
    padding: 4px 12px;
    font-size: 11px;
    font-weight: 600;
    font-family: var(--font-sans);
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .recovery-btn.restore {
    background: var(--color-accent);
    color: #fff;
  }

  .recovery-btn.restore:hover {
    background: var(--color-accent-hover);
  }

  .recovery-btn.dismiss {
    background: var(--color-bg-elevated);
    color: var(--color-text-secondary);
  }

  .recovery-btn.dismiss:hover {
    background: var(--color-border);
  }

  .main-content {
    flex: 1;
    display: flex;
    position: relative;
    overflow: hidden;
    min-height: 0;
  }

  .empty-state {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    pointer-events: none;
    z-index: 10;
  }

  .empty-state > * {
    pointer-events: auto;
  }

  .empty-icon {
    color: var(--color-text-muted);
    opacity: 0.4;
    margin-bottom: 4px;
    pointer-events: none;
  }

  .empty-title {
    font-size: 18px;
    font-weight: 500;
    color: var(--color-text-muted);
    pointer-events: none;
  }

  /* Action pills (New / Open) */
  .empty-actions {
    display: flex;
    gap: 10px;
    margin-top: 8px;
  }

  .action-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    font-size: 13px;
    font-weight: 500;
    font-family: var(--font-sans);
    color: var(--color-text-secondary);
    background: var(--color-bg-elevated);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .action-pill:hover {
    background: var(--color-accent);
    color: #fff;
    border-color: var(--color-accent);
  }

  .action-pill kbd {
    font-size: 10px;
    opacity: 0.6;
  }

  /* Recent files */
  .recent-section {
    margin-top: 16px;
    width: 260px;
  }

  .recent-heading {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-muted);
    margin-bottom: 6px;
  }

  .recent-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .recent-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 6px 10px;
    font-size: 13px;
    font-family: var(--font-sans);
    color: var(--color-text-secondary);
    background: none;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    text-align: left;
    transition: background 0.12s ease;
  }

  .recent-item:hover {
    background: var(--color-bg-elevated);
    color: var(--color-text-primary);
  }

  .recent-name {
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .recent-folder {
    font-size: 11px;
    color: var(--color-text-muted);
    flex-shrink: 0;
    margin-left: 12px;
  }

  /* Shortcuts */
  .shortcuts-list {
    margin-top: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .shortcut-row {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 12px;
    color: var(--color-text-muted);
  }

  :global(kbd) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 2px 6px;
    font-family: var(--font-sans);
    font-size: 11px;
    font-weight: 500;
    background: var(--color-bg-elevated);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    color: var(--color-text-secondary);
    min-width: 24px;
  }
</style>
