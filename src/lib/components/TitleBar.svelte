<script lang="ts">
  type Props = {
    fileName: string;
    isDirty: boolean;
    isSaving: boolean;
    theme: "dark" | "light";
    hasFile: boolean;
    onToggleTheme: () => void;
    onRename: (newName: string) => void;
    onToggleOutline: () => void;
  };

  let {
    fileName,
    isDirty,
    isSaving,
    theme,
    hasFile,
    onToggleTheme,
    onRename,
    onToggleOutline,
  }: Props = $props();

  // Inline rename state
  let editing = $state(false);
  let draft = $state("");

  function startEditing() {
    draft = fileName;
    editing = true;
  }

  function commit() {
    if (!editing) return;
    editing = false;
    const trimmed = draft.trim();
    if (!trimmed || trimmed === fileName) return;
    const finalName = trimmed.endsWith(".md") ? trimmed : trimmed + ".md";
    onRename(finalName);
  }

  function cancel() {
    editing = false;
  }

  function handleRenameKey(e: KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
    } else if (e.key === "Escape") {
      cancel();
    }
  }
</script>

<div class="titlebar" data-tauri-drag-region>
  <!-- Left: traffic spacer and Outline button -->
  <div class="titlebar-left">
    <div class="titlebar-traffic-spacer"></div>
    {#if hasFile}
      <button
        class="action-btn"
        onclick={onToggleOutline}
        title="Toggle Outline (⌘⇧O)"
        aria-label="Toggle Outline"
      >
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
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      </button>
    {/if}
  </div>

  <!-- Center: filename -->
  <div class="titlebar-center" data-tauri-drag-region>
    {#if editing}
      <input
        class="titlebar-input"
        type="text"
        bind:value={draft}
        onkeydown={handleRenameKey}
        onblur={commit}
      />
    {:else}
      <button
        class="titlebar-name-btn"
        ondblclick={startEditing}
        title="Double-click to rename"
      >
        {fileName || "Untitled"}
      </button>
    {/if}
    {#if isDirty}
      <span class="titlebar-dot" title="Unsaved changes"></span>
    {/if}
    {#if isSaving}
      <span class="titlebar-saving">Saving…</span>
    {/if}
  </div>

  <!-- Right: actions -->
  <div class="titlebar-actions">
    <button
      class="action-btn"
      onclick={onToggleTheme}
      title="Toggle theme (⌘D)"
      aria-label="Toggle theme"
    >
      {#if theme === "dark"}
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
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      {:else}
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
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      {/if}
    </button>
  </div>
</div>

<style>
  .titlebar {
    display: flex;
    align-items: center;
    height: 38px;
    padding: 0 12px;
    background: var(--color-bg-titlebar);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--color-border-subtle);
    flex-shrink: 0;
    -webkit-app-region: drag;
    gap: 8px;
  }

  .titlebar-left {
    display: flex;
    align-items: center;
    gap: 0;
    flex-shrink: 0;
  }

  .titlebar-traffic-spacer {
    width: 70px;
    flex-shrink: 0;
  }

  /* --- Center title --- */
  .titlebar-center {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-width: 0;
  }

  .titlebar-name-btn {
    font-size: 13px;
    font-weight: 500;
    color: var(--color-text-secondary);
    background: none;
    border: none;
    cursor: default;
    padding: 2px 8px;
    border-radius: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    transition: background 0.15s ease;
    -webkit-app-region: no-drag;
  }

  .titlebar-name-btn:hover {
    background: var(--color-bg-elevated);
  }

  .titlebar-input {
    font-size: 13px;
    font-weight: 500;
    color: var(--color-text-primary);
    background: var(--color-bg-elevated);
    border: 1px solid var(--color-accent);
    border-radius: 4px;
    padding: 2px 8px;
    outline: none;
    text-align: center;
    max-width: 240px;
    font-family: var(--font-sans);
    -webkit-app-region: no-drag;
  }

  .titlebar-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--color-warning);
    flex-shrink: 0;
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.4;
    }
  }

  .titlebar-saving {
    font-size: 11px;
    color: var(--color-text-muted);
    font-style: italic;
  }

  /* --- Right actions --- */
  .titlebar-actions {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
    -webkit-app-region: no-drag;
  }

  .action-btn {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    border: none;
    background: transparent;
    color: var(--color-text-secondary);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
  }

  .action-btn:hover {
    background: var(--color-bg-elevated);
    color: var(--color-text-primary);
  }
</style>
