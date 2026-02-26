<script lang="ts">
    import type { Editor } from "@tiptap/core";
    import { onMount } from "svelte";

    interface Props {
        editor: Editor | null;
        visible: boolean;
        onClose: () => void;
    }

    let { editor, visible, onClose }: Props = $props();

    let findInput: HTMLInputElement;
    let replaceInput: HTMLInputElement;
    let searchTerm: string = $state("");
    let replaceTerm: string = $state("");
    let caseSensitive: boolean = $state(false);

    // Reactive getters from editor storage
    let resultCount = $derived(
        editor?.storage?.searchReplace?.results?.length ?? 0,
    );
    let currentIndex = $derived(
        editor?.storage?.searchReplace?.currentIndex ?? -1,
    );
    let displayIndex = $derived(
        resultCount > 0 && currentIndex >= 0 ? currentIndex + 1 : 0,
    );

    // Auto-focus when visible
    $effect(() => {
        if (visible && findInput) {
            // Small delay to let the animation start
            requestAnimationFrame(() => findInput?.focus());
        }
    });

    // Sync search term to editor
    $effect(() => {
        if (editor && visible) {
            (editor.commands as any).setSearchTerm(searchTerm);
        }
    });

    // Sync replace term to editor
    $effect(() => {
        if (editor && visible) {
            (editor.commands as any).setReplaceTerm(replaceTerm);
        }
    });

    function toggleCaseSensitive() {
        caseSensitive = !caseSensitive;
        if (editor) {
            (editor.commands as any).setCaseSensitive(caseSensitive);
        }
    }

    function goNext() {
        if (editor) (editor.commands as any).goToNextMatch();
    }

    function goPrev() {
        if (editor) (editor.commands as any).goToPreviousMatch();
    }

    function replaceCurrent() {
        if (editor) (editor.commands as any).replaceCurrentMatch();
    }

    function replaceAll() {
        if (editor) (editor.commands as any).replaceAllMatches();
    }

    function handleClose() {
        if (editor) (editor.commands as any).clearSearch();
        searchTerm = "";
        replaceTerm = "";
        caseSensitive = false;
        onClose();
        // Return focus to editor
        editor?.commands.focus();
    }

    function handleFindKeydown(e: KeyboardEvent) {
        if (e.key === "Escape") {
            e.preventDefault();
            handleClose();
        } else if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            goNext();
        } else if (e.key === "Enter" && e.shiftKey) {
            e.preventDefault();
            goPrev();
        } else if (e.key === "Tab" && !e.shiftKey) {
            e.preventDefault();
            replaceInput?.focus();
        }
    }

    function handleReplaceKeydown(e: KeyboardEvent) {
        if (e.key === "Escape") {
            e.preventDefault();
            handleClose();
        } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            replaceAll();
        } else if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            replaceCurrent();
        } else if (e.key === "Tab" && e.shiftKey) {
            e.preventDefault();
            findInput?.focus();
        } else if (e.key === "Tab" && !e.shiftKey) {
            e.preventDefault();
            findInput?.focus();
        }
    }
</script>

{#if visible}
    <div class="search-bar" id="search-bar">
        <div class="search-row">
            <div class="input-group">
                <input
                    bind:this={findInput}
                    bind:value={searchTerm}
                    onkeydown={handleFindKeydown}
                    class="search-input"
                    placeholder="Find…"
                    spellcheck="false"
                    autocomplete="off"
                />
                <button
                    class="icon-btn case-btn"
                    class:active={caseSensitive}
                    onclick={toggleCaseSensitive}
                    title="Match Case"
                >
                    Aa
                </button>
            </div>

            <span class="match-counter">
                {#if resultCount > 0}
                    {displayIndex} / {resultCount}
                {:else if searchTerm}
                    0 results
                {/if}
            </span>

            <div class="nav-btns">
                <button
                    class="icon-btn"
                    onclick={goPrev}
                    disabled={resultCount === 0}
                    title="Previous Match (Shift+Enter)"
                >
                    <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <polyline points="18 15 12 9 6 15" />
                    </svg>
                </button>
                <button
                    class="icon-btn"
                    onclick={goNext}
                    disabled={resultCount === 0}
                    title="Next Match (Enter)"
                >
                    <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </button>
            </div>

            <button
                class="icon-btn close-btn"
                onclick={handleClose}
                title="Close (Esc)"
            >
                <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            </button>
        </div>

        <div class="replace-row">
            <input
                bind:this={replaceInput}
                bind:value={replaceTerm}
                onkeydown={handleReplaceKeydown}
                class="search-input"
                placeholder="Replace…"
                spellcheck="false"
                autocomplete="off"
            />
            <button
                class="action-btn"
                onclick={replaceCurrent}
                disabled={resultCount === 0}
                title="Replace"
            >
                Replace
            </button>
            <button
                class="action-btn"
                onclick={replaceAll}
                disabled={resultCount === 0}
                title="Replace All (⌘+Enter)"
            >
                All
            </button>
        </div>
    </div>
{/if}

<style>
    .search-bar {
        position: absolute;
        top: 8px;
        right: 16px;
        z-index: 50;
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 8px;
        background: var(--color-bg-secondary);
        border: 1px solid var(--color-border);
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        animation: slideIn 0.15s ease-out;
        min-width: 320px;
    }

    @keyframes slideIn {
        from {
            transform: translateY(-8px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }

    .search-row,
    .replace-row {
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .input-group {
        position: relative;
        flex: 1;
        display: flex;
        align-items: center;
    }

    .search-input {
        flex: 1;
        padding: 5px 8px;
        font-size: 12px;
        font-family: var(--font-sans);
        background: var(--color-bg-primary);
        color: var(--color-text-primary);
        border: 1px solid var(--color-border-subtle);
        border-radius: 4px;
        outline: none;
        transition: border-color 0.15s ease;
    }

    .search-input:focus {
        border-color: var(--color-accent);
    }

    .search-input::placeholder {
        color: var(--color-text-muted);
    }

    .input-group .search-input {
        padding-right: 28px;
    }

    .case-btn {
        position: absolute;
        right: 2px;
        font-size: 10px;
        font-weight: 700;
        font-family: var(--font-sans);
        letter-spacing: -0.02em;
        width: 24px;
        height: 22px;
    }

    .case-btn.active {
        color: var(--color-accent);
        background: color-mix(in srgb, var(--color-accent) 15%, transparent);
    }

    .match-counter {
        font-size: 11px;
        font-family: var(--font-sans);
        color: var(--color-text-muted);
        min-width: 52px;
        text-align: center;
        white-space: nowrap;
        flex-shrink: 0;
    }

    .nav-btns {
        display: flex;
        gap: 1px;
    }

    .icon-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        padding: 0;
        background: none;
        border: none;
        border-radius: 4px;
        color: var(--color-text-secondary);
        cursor: pointer;
        transition: all 0.1s ease;
    }

    .icon-btn:hover:not(:disabled) {
        background: var(--color-bg-elevated);
        color: var(--color-text-primary);
    }

    .icon-btn:disabled {
        opacity: 0.3;
        cursor: default;
    }

    .close-btn {
        margin-left: 2px;
    }

    .action-btn {
        padding: 4px 8px;
        font-size: 11px;
        font-weight: 500;
        font-family: var(--font-sans);
        background: var(--color-bg-elevated);
        color: var(--color-text-secondary);
        border: 1px solid var(--color-border-subtle);
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.1s ease;
        white-space: nowrap;
    }

    .action-btn:hover:not(:disabled) {
        background: var(--color-accent);
        color: #fff;
        border-color: var(--color-accent);
    }

    .action-btn:disabled {
        opacity: 0.3;
        cursor: default;
    }

    .replace-row .search-input {
        flex: 1;
    }
</style>
