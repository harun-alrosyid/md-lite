<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { listen, type UnlistenFn } from "@tauri-apps/api/event";
  import TitleBar from "./lib/TitleBar.svelte";
  import WysiwygEditor from "./lib/WysiwygEditor.svelte";
  import {
    setupShortcuts,
    openFileDialog,
    createNewFile,
    saveFileAs,
    renameFile,
    readFile,
    closeWindow,
    updateRecentMenu,
  } from "./lib/shortcuts";
  import {
    deriveFileName,
    toggleTheme as toggleThemeLogic,
    performSave,
    handleContentUpdate as handleContentUpdateLogic,
    scheduleAutoSave,
    getRecentFiles,
    addRecentFile,
    removeRecentFile,
    type RecentFile,
  } from "./lib/app-logic";

  // State
  let content: string = $state("");
  let filePath: string = $state("");
  let isDirty: boolean = $state(false);
  let isSaving: boolean = $state(false);
  let theme: "dark" | "light" = $state("dark");
  let saveTimer: ReturnType<typeof setTimeout> | null = null;
  let cleanupShortcuts: (() => void) | null = null;
  let recentFiles: RecentFile[] = $state([]);
  let unlistenMenu: UnlistenFn[] = [];

  // Derived
  let fileName = $derived(deriveFileName(filePath));

  async function refreshRecents() {
    recentFiles = getRecentFiles();

    const paths = recentFiles.map((r) => r.path);
    const names = recentFiles.map((r) => r.name);
    try {
      await updateRecentMenu(paths, names);
    } catch (err) {
      console.error("Failed to update native recent files menu", err);
    }
  }

  // Theme
  function toggleTheme() {
    const result = toggleThemeLogic({
      content,
      filePath,
      isDirty,
      isSaving,
      theme,
      saveTimer,
    });
    theme = result.theme;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("md-lite-theme", theme);
  }

  // Save helpers
  async function doPerformSave() {
    const state = { content, filePath, isDirty, isSaving, theme, saveTimer };
    const result = await performSave(state);
    isDirty = result.isDirty;
    isSaving = result.isSaving;
  }

  function doScheduleAutoSave() {
    const state = { content, filePath, isDirty, isSaving, theme, saveTimer };
    const result = scheduleAutoSave(state, doPerformSave);
    saveTimer = result.saveTimer;
  }

  function handleContentUpdate(markdown: string) {
    const state = { content, filePath, isDirty, isSaving, theme, saveTimer };
    const result = handleContentUpdateLogic(state, markdown);
    content = result.content;
    isDirty = result.isDirty;
    doScheduleAutoSave();
  }

  // --- Handlers ---

  async function handleNew() {
    try {
      const path = await createNewFile();
      if (!path) return;

      if (saveTimer) clearTimeout(saveTimer);
      filePath = path;
      content = "";
      isDirty = false;
      addRecentFile(path);
      refreshRecents();
    } catch (err) {
      console.error("New file failed:", err);
    }
  }

  async function handleOpen() {
    try {
      const result = await openFileDialog();
      if (!result) return;

      if (saveTimer) clearTimeout(saveTimer);
      filePath = result.path;
      content = result.content;
      isDirty = false;
      addRecentFile(result.path);
      refreshRecents();
    } catch (err) {
      console.error("Open failed:", err);
    }
  }

  async function handleOpenRecent(path: string) {
    try {
      const fileContent = await readFile(path);
      if (saveTimer) clearTimeout(saveTimer);
      filePath = path;
      content = fileContent;
      isDirty = false;
      addRecentFile(path);
      refreshRecents();
    } catch (err) {
      console.error("Open recent failed:", err);
      removeRecentFile(path);
      refreshRecents();
    }
  }

  async function handleSave() {
    if (saveTimer) clearTimeout(saveTimer);

    // no path yet → prompt where to save
    if (!filePath && content) {
      const path = await saveFileAs(content);
      if (path) {
        filePath = path;
        isDirty = false;
        addRecentFile(path);
        refreshRecents();
      }
      return;
    }

    await doPerformSave();
  }

  async function handleSaveAs() {
    try {
      const name = deriveFileName(filePath);
      const path = await saveFileAs(content, name);
      if (!path) return;

      filePath = path;
      isDirty = false;
      addRecentFile(path);
      refreshRecents();
    } catch (err) {
      console.error("Save As failed:", err);
    }
  }

  async function handleRename(newName: string) {
    if (!filePath) return;

    try {
      const newPath = await renameFile(filePath, newName);
      const oldPath = filePath;
      filePath = newPath;
      removeRecentFile(oldPath);
      addRecentFile(newPath);
      refreshRecents();
    } catch (err) {
      console.error("Rename failed:", err);
    }
  }

  async function handleClose() {
    if (isDirty && filePath) await doPerformSave();
    await closeWindow();
  }

  onMount(() => {
    const saved = localStorage.getItem("md-lite-theme") as
      | "dark"
      | "light"
      | null;
    if (saved) {
      theme = saved;
      document.documentElement.setAttribute("data-theme", theme);
    }

    refreshRecents();

    cleanupShortcuts = setupShortcuts({
      onNew: handleNew,
      onOpen: handleOpen,
      onSave: handleSave,
      onSaveAs: handleSaveAs,
      onClose: handleClose,
      onToggleTheme: toggleTheme,
    });

    listen("menu-new-file", handleNew).then((f) => unlistenMenu.push(f));
    listen("menu-open-file", handleOpen).then((f) => unlistenMenu.push(f));
    listen("menu-save-file", handleSave).then((f) => unlistenMenu.push(f));
    listen("menu-save-as", handleSaveAs).then((f) => unlistenMenu.push(f));
    listen("open-recent", (evt: any) => handleOpenRecent(evt.payload)).then(
      (f) => unlistenMenu.push(f),
    );
  });

  onDestroy(() => {
    cleanupShortcuts?.();
    unlistenMenu.forEach((u) => u());
    if (saveTimer) clearTimeout(saveTimer);
  });
</script>

<TitleBar
  {fileName}
  {isDirty}
  {isSaving}
  {theme}
  onToggleTheme={toggleTheme}
  onRename={handleRename}
/>

<main class="main-content">
  <WysiwygEditor {content} onUpdate={handleContentUpdate} />

  {#if !filePath && content === ""}
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
          <kbd>⌘N</kbd>
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
          <kbd>⌘O</kbd>
        </button>
      </div>

      {#if recentFiles.length > 0}
        <div class="recent-section">
          <p class="recent-heading">Recent</p>
          <ul class="recent-list">
            {#each recentFiles as file}
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
        <div class="shortcut-row"><kbd>⌘N</kbd><span>New file</span></div>
        <div class="shortcut-row"><kbd>⌘O</kbd><span>Open file</span></div>
        <div class="shortcut-row"><kbd>⌘S</kbd><span>Save</span></div>
        <div class="shortcut-row"><kbd>⌘⇧S</kbd><span>Save As</span></div>
        <div class="shortcut-row">
          <kbd>⌘1-6</kbd><span>Set heading level</span>
        </div>
        <div class="shortcut-row">
          <kbd>⌘D</kbd><span>Toggle dark/light</span>
        </div>
        <div class="shortcut-row"><kbd>⌘W</kbd><span>Close</span></div>
      </div>
    </div>
  {/if}
</main>

<style>
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
