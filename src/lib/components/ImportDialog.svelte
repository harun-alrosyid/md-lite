<script lang="ts">
  import {
    IMPORT_FORMATS,
    importWithDialog,
    type ImportFormat,
  } from "../core/converter";

  interface Props {
    visible: boolean;
    onClose: () => void;
    onImported: (content: string, sourcePath: string) => void;
  }

  let { visible, onClose, onImported }: Props = $props();

  let selectedFormat: ImportFormat = $state("docx");
  let isImporting: boolean = $state(false);
  let errorMsg: string = $state("");

  async function handleImport() {
    isImporting = true;
    errorMsg = "";

    try {
      const result = await importWithDialog(selectedFormat);
      if (result) {
        onImported(result.content, result.path);
        onClose();
      }
    } catch (err: any) {
      errorMsg = err?.message || String(err);
    } finally {
      isImporting = false;
    }
  }

  function handleBackdropClick(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains("import-backdrop")) {
      onClose();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  }
</script>

{#if visible}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="import-backdrop"
    id="import-dialog-backdrop"
    onclick={handleBackdropClick}
    onkeydown={handleKeydown}
  >
    <div class="import-container" id="import-dialog">
      <div class="import-header">
        <h2 class="import-title">Import Document</h2>
        <button
          class="import-close-btn"
          onclick={onClose}
          aria-label="Close import dialog"
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
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div class="import-body">
        <div class="import-notice">
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
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>This will replace the current content in the editor.</span>
        </div>

        <span class="import-label">Source Format</span>
        <div class="import-format-grid">
          {#each IMPORT_FORMATS as fmt}
            <button
              class="import-format-card"
              class:selected={selectedFormat === fmt.value}
              onclick={() => (selectedFormat = fmt.value as ImportFormat)}
            >
              <span class="format-ext">.{fmt.extension}</span>
              <span class="format-name">{fmt.label}</span>
              <span class="format-desc">{fmt.description}</span>
            </button>
          {/each}
        </div>

        {#if errorMsg}
          <div class="import-error">{errorMsg}</div>
        {/if}
      </div>

      <div class="import-footer">
        <button class="import-btn-cancel" onclick={onClose}>Cancel</button>
        <button
          class="import-btn-primary"
          onclick={handleImport}
          disabled={isImporting}
        >
          {#if isImporting}
            Importing…
          {:else}
            Choose File & Import
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .import-backdrop {
    position: fixed;
    inset: 0;
    z-index: 100;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    display: flex;
    justify-content: center;
    padding-top: 12vh;
    animation: fadeIn 0.12s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .import-container {
    width: 520px;
    max-height: 520px;
    display: flex;
    flex-direction: column;
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    box-shadow:
      0 16px 48px rgba(0, 0, 0, 0.3),
      0 0 0 1px rgba(255, 255, 255, 0.05) inset;
    overflow: hidden;
    animation: slideDown 0.15s ease-out;
    align-self: flex-start;
  }

  @keyframes slideDown {
    from {
      transform: translateY(-12px) scale(0.98);
      opacity: 0;
    }
    to {
      transform: translateY(0) scale(1);
      opacity: 1;
    }
  }

  .import-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--color-border-subtle);
  }

  .import-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--color-text-primary);
    font-family: var(--font-sans);
  }

  .import-close-btn {
    background: none;
    border: none;
    color: var(--color-text-muted);
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition:
      color 0.1s,
      background 0.1s;
  }

  .import-close-btn:hover {
    color: var(--color-text-primary);
    background: var(--color-bg-elevated);
  }

  .import-body {
    padding: 16px 20px;
    flex: 1;
    overflow-y: auto;
  }

  .import-notice {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    background: rgba(255, 214, 10, 0.08);
    border: 1px solid rgba(255, 214, 10, 0.15);
    border-radius: 6px;
    color: var(--color-warning);
    font-size: 12px;
    font-family: var(--font-sans);
    margin-bottom: 16px;
  }

  .import-label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--color-text-muted);
    margin-bottom: 10px;
    font-family: var(--font-sans);
  }

  .import-format-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 8px;
  }

  .import-format-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 14px 8px;
    background: var(--color-bg-primary);
    border: 1px solid var(--color-border-subtle);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.12s ease;
    font-family: var(--font-sans);
    text-align: center;
  }

  .import-format-card:hover {
    border-color: var(--color-border);
    background: var(--color-bg-elevated);
  }

  .import-format-card.selected {
    border-color: var(--color-accent);
    background: color-mix(
      in srgb,
      var(--color-accent) 10%,
      var(--color-bg-primary)
    );
  }

  .format-ext {
    font-size: 12px;
    font-weight: 700;
    font-family: var(--font-mono);
    color: var(--color-accent);
    text-transform: uppercase;
  }

  .format-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .format-desc {
    font-size: 10px;
    color: var(--color-text-muted);
    line-height: 1.3;
  }

  .import-error {
    margin-top: 12px;
    padding: 10px 12px;
    background: rgba(255, 59, 48, 0.1);
    border: 1px solid rgba(255, 59, 48, 0.2);
    border-radius: 6px;
    color: #ff453a;
    font-size: 12px;
    font-family: var(--font-sans);
  }

  .import-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 12px 20px;
    border-top: 1px solid var(--color-border-subtle);
  }

  .import-btn-cancel {
    padding: 7px 16px;
    font-size: 13px;
    font-weight: 500;
    font-family: var(--font-sans);
    background: none;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: all 0.1s;
  }

  .import-btn-cancel:hover {
    background: var(--color-bg-elevated);
    color: var(--color-text-primary);
  }

  .import-btn-primary {
    padding: 7px 20px;
    font-size: 13px;
    font-weight: 600;
    font-family: var(--font-sans);
    background: var(--color-accent);
    border: none;
    border-radius: 6px;
    color: #fff;
    cursor: pointer;
    transition: background 0.1s;
  }

  .import-btn-primary:hover {
    background: var(--color-accent-hover);
  }

  .import-btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
