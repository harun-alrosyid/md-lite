<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import TitleBar from "./lib/TitleBar.svelte";
  import WysiwygEditor from "./lib/WysiwygEditor.svelte";
  import { setupShortcuts, openFileDialog, closeWindow } from "./lib/shortcuts";
  import {
    createInitialState,
    deriveFileName,
    toggleTheme as toggleThemeLogic,
    performSave,
    handleContentUpdate as handleContentUpdateLogic,
    scheduleAutoSave,
  } from "./lib/app-logic";

  // State
  let content: string = $state("");
  let filePath: string = $state("");
  let isDirty: boolean = $state(false);
  let isSaving: boolean = $state(false);
  let theme: "dark" | "light" = $state("dark");
  let saveTimer: ReturnType<typeof setTimeout> | null = null;
  let cleanupShortcuts: (() => void) | null = null;

  // Derived
  let fileName = $derived(deriveFileName(filePath));

  // Theme management
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

  // Auto-save wrapper
  async function doPerformSave() {
    const state = { content, filePath, isDirty, isSaving, theme, saveTimer };
    const result = await performSave(state);
    isDirty = result.isDirty;
    isSaving = result.isSaving;
  }

  // Auto-save: debounced 1000ms
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

  async function handleOpen() {
    try {
      const result = await openFileDialog();
      if (result) {
        if (saveTimer) clearTimeout(saveTimer);
        filePath = result.path;
        content = result.content;
        isDirty = false;
      }
    } catch (err) {
      console.error("Open failed:", err);
    }
  }

  async function handleSave() {
    if (saveTimer) clearTimeout(saveTimer);
    await doPerformSave();
  }

  async function handleClose() {
    if (isDirty && filePath) await doPerformSave();
    await closeWindow();
  }

  onMount(() => {
    // Load saved theme preference
    const saved = localStorage.getItem("md-lite-theme") as
      | "dark"
      | "light"
      | null;
    if (saved) {
      theme = saved;
      document.documentElement.setAttribute("data-theme", theme);
    }

    cleanupShortcuts = setupShortcuts({
      onOpen: handleOpen,
      onSave: handleSave,
      onClose: handleClose,
      onToggleTheme: toggleTheme,
    });
  });

  onDestroy(() => {
    cleanupShortcuts?.();
    if (saveTimer) clearTimeout(saveTimer);
  });
</script>

<TitleBar {fileName} {isDirty} {isSaving} {theme} onToggleTheme={toggleTheme} />

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
      <p class="empty-hint">Press <kbd>⌘O</kbd> to open a file</p>
      <div class="shortcuts-list">
        <div class="shortcut-row">
          <kbd>⌘1-6</kbd><span>Set heading level</span>
        </div>
        <div class="shortcut-row">
          <kbd>⌘D</kbd><span>Toggle dark/light</span>
        </div>
        <div class="shortcut-row"><kbd>⌘S</kbd><span>Save</span></div>
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

  .empty-icon {
    color: var(--color-text-muted);
    opacity: 0.4;
    margin-bottom: 8px;
  }

  .empty-title {
    font-size: 18px;
    font-weight: 500;
    color: var(--color-text-muted);
  }

  .empty-hint {
    font-size: 13px;
    color: var(--color-text-muted);
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .shortcuts-list {
    margin-top: 16px;
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
