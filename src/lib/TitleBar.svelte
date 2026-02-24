<script lang="ts">
  type Props = {
    fileName: string;
    isDirty: boolean;
    isSaving: boolean;
    theme: "dark" | "light";
    onToggleTheme: () => void;
  };

  let { fileName, isDirty, isSaving, theme, onToggleTheme }: Props = $props();
</script>

<div class="titlebar" data-tauri-drag-region>
  <!-- Left spacer for native macOS traffic lights -->
  <div class="titlebar-traffic-spacer"></div>

  <!-- Centered title -->
  <div class="titlebar-center" data-tauri-drag-region>
    <span class="titlebar-filename" data-tauri-drag-region>
      {fileName || "Untitled"}
    </span>
    {#if isDirty}
      <span class="titlebar-dot" title="Unsaved changes"></span>
    {/if}
    {#if isSaving}
      <span class="titlebar-saving">Saving…</span>
    {/if}
  </div>

  <!-- Right actions -->
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

  /* Space reserved for native macOS traffic light buttons */
  .titlebar-traffic-spacer {
    width: 70px;
    flex-shrink: 0;
  }

  /* Centered Title */
  .titlebar-center {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-width: 0;
  }

  .titlebar-filename {
    font-size: 13px;
    font-weight: 500;
    color: var(--color-text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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

  /* Right Actions */
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
