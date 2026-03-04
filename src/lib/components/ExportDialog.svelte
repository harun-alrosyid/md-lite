<script lang="ts">
  import {
    EXPORT_FORMATS,
    exportWithDialog,
    type ExportFormat,
    type FormatOption,
  } from "../core/converter";

  interface Props {
    visible: boolean;
    content: string;
    htmlContent: string;
    currentFileName: string;
    onClose: () => void;
  }

  let { visible, content, htmlContent, currentFileName, onClose }: Props =
    $props();

  let selectedFormat: ExportFormat = $state("pdf");
  let isExporting: boolean = $state(false);
  let errorMsg: string = $state("");
  let successMsg: string = $state("");

  async function handleExport() {
    isExporting = true;
    errorMsg = "";
    successMsg = "";

    try {
      const result = await exportWithDialog(
        content,
        selectedFormat,
        currentFileName,
        htmlContent,
      );
      if (result) {
        successMsg = `Exported successfully!`;
        setTimeout(() => {
          successMsg = "";
          onClose();
        }, 1500);
      } else {
        // User cancelled the dialog
        isExporting = false;
      }
    } catch (err: any) {
      errorMsg = err?.message || String(err);
    } finally {
      isExporting = false;
    }
  }

  function handleBackdropClick(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains("export-backdrop")) {
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
    class="export-backdrop"
    id="export-dialog-backdrop"
    onclick={handleBackdropClick}
    onkeydown={handleKeydown}
  >
    <div class="export-container" id="export-dialog">
      <div class="export-header">
        <h2 class="export-title">Export As</h2>
        <button
          class="export-close-btn"
          onclick={onClose}
          aria-label="Close export dialog"
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

      <div class="export-body">
        <span class="export-label">Format</span>
        <div class="export-format-grid">
          {#each EXPORT_FORMATS as fmt}
            <button
              class="export-format-card"
              class:selected={selectedFormat === fmt.value}
              onclick={() => (selectedFormat = fmt.value as ExportFormat)}
            >
              <span class="format-ext">.{fmt.extension}</span>
              <span class="format-name">{fmt.label}</span>
              <span class="format-desc">{fmt.description}</span>
            </button>
          {/each}
        </div>

        {#if errorMsg}
          <div class="export-error">{errorMsg}</div>
        {/if}
        {#if successMsg}
          <div class="export-success">{successMsg}</div>
        {/if}
      </div>

      <div class="export-footer">
        <button class="export-btn-cancel" onclick={onClose}>Cancel</button>
        <button
          class="export-btn-primary"
          onclick={handleExport}
          disabled={isExporting}
        >
          {#if isExporting}
            Exporting…
          {:else}
            Export
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .export-backdrop {
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

  .export-container {
    width: 520px;
    max-height: 500px;
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

  .export-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--color-border-subtle);
  }

  .export-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--color-text-primary);
    font-family: var(--font-sans);
  }

  .export-close-btn {
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

  .export-close-btn:hover {
    color: var(--color-text-primary);
    background: var(--color-bg-elevated);
  }

  .export-body {
    padding: 16px 20px;
    flex: 1;
    overflow-y: auto;
  }

  .export-label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--color-text-muted);
    margin-bottom: 10px;
    font-family: var(--font-sans);
  }

  .export-format-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 8px;
  }

  .export-format-card {
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

  .export-format-card:hover {
    border-color: var(--color-border);
    background: var(--color-bg-elevated);
  }

  .export-format-card.selected {
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

  .export-error {
    margin-top: 12px;
    padding: 10px 12px;
    background: rgba(255, 59, 48, 0.1);
    border: 1px solid rgba(255, 59, 48, 0.2);
    border-radius: 6px;
    color: #ff453a;
    font-size: 12px;
    font-family: var(--font-sans);
  }

  .export-success {
    margin-top: 12px;
    padding: 10px 12px;
    background: rgba(48, 209, 88, 0.1);
    border: 1px solid rgba(48, 209, 88, 0.2);
    border-radius: 6px;
    color: var(--color-success);
    font-size: 12px;
    font-family: var(--font-sans);
  }

  .export-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 12px 20px;
    border-top: 1px solid var(--color-border-subtle);
  }

  .export-btn-cancel {
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

  .export-btn-cancel:hover {
    background: var(--color-bg-elevated);
    color: var(--color-text-primary);
  }

  .export-btn-primary {
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

  .export-btn-primary:hover {
    background: var(--color-accent-hover);
  }

  .export-btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
