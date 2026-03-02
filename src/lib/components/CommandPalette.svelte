<script lang="ts">
    import {
        createCommands,
        filterCommands,
        type CommandHandlers,
        type Command,
    } from "../core/commands";

    import type { ShortcutConfig } from "../core/shortcutStore";

    interface Props {
        visible: boolean;
        handlers: CommandHandlers;
        config: ShortcutConfig;
        onClose: () => void;
    }

    let { visible, handlers, config, onClose }: Props = $props();

    let inputEl: HTMLInputElement | undefined = $state(undefined);
    let query: string = $state("");
    let selectedIndex: number = $state(0);
    let listEl: HTMLDivElement | undefined = $state(undefined);

    let allCommands = $derived(createCommands(handlers, config));
    let filtered = $derived(filterCommands(allCommands, query));

    // Auto-focus and reset when opened
    $effect(() => {
        if (visible) {
            query = "";
            selectedIndex = 0;
            requestAnimationFrame(() => inputEl?.focus());
        }
    });

    // Clamp selectedIndex when filtered list changes
    $effect(() => {
        if (selectedIndex >= filtered.length) {
            selectedIndex = Math.max(0, filtered.length - 1);
        }
    });

    function execute(cmd: Command) {
        onClose();
        // Defer so the palette closes before the action runs
        requestAnimationFrame(() => cmd.action());
    }

    function handleKeydown(e: KeyboardEvent) {
        switch (e.key) {
            case "Escape":
                e.preventDefault();
                onClose();
                break;
            case "ArrowDown":
                e.preventDefault();
                selectedIndex = (selectedIndex + 1) % filtered.length;
                scrollToSelected();
                break;
            case "ArrowUp":
                e.preventDefault();
                selectedIndex =
                    (selectedIndex - 1 + filtered.length) % filtered.length;
                scrollToSelected();
                break;
            case "Enter":
                e.preventDefault();
                if (filtered[selectedIndex]) {
                    execute(filtered[selectedIndex]);
                }
                break;
        }
    }

    function scrollToSelected() {
        requestAnimationFrame(() => {
            const item = listEl?.querySelector(
                `[data-index="${selectedIndex}"]`,
            );
            item?.scrollIntoView({ block: "nearest" });
        });
    }

    function handleBackdropClick(e: MouseEvent) {
        if ((e.target as HTMLElement).classList.contains("palette-backdrop")) {
            onClose();
        }
    }
</script>

{#if visible}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        class="palette-backdrop"
        id="command-palette-backdrop"
        onclick={handleBackdropClick}
    >
        <div class="palette-container" id="command-palette">
            <div class="palette-input-row">
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="palette-icon"
                >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                    bind:this={inputEl}
                    bind:value={query}
                    onkeydown={handleKeydown}
                    class="palette-input"
                    placeholder="Type a command…"
                    spellcheck="false"
                    autocomplete="off"
                />
            </div>

            <div class="palette-list" bind:this={listEl}>
                {#if filtered.length === 0}
                    <div class="palette-empty">No matching commands</div>
                {:else}
                    {#each filtered as cmd, i}
                        <button
                            class="palette-item"
                            class:selected={i === selectedIndex}
                            data-index={i}
                            onclick={() => execute(cmd)}
                            onmouseenter={() => (selectedIndex = i)}
                        >
                            <span class="palette-category">{cmd.category}</span>
                            <span class="palette-label">{cmd.label}</span>
                            {#if cmd.id === "custom-shortcuts"}
                                <svg
                                    class="palette-setting-icon"
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                >
                                    <circle cx="12" cy="12" r="3"></circle>
                                    <path
                                        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
                                    ></path>
                                </svg>
                            {/if}
                            {#if cmd.shortcut}
                                <kbd class="palette-shortcut"
                                    >{cmd.shortcut}</kbd
                                >
                            {/if}
                        </button>
                    {/each}
                {/if}
            </div>
        </div>
    </div>
{/if}

<style>
    .palette-backdrop {
        position: fixed;
        inset: 0;
        z-index: 100;
        background: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        display: flex;
        justify-content: center;
        padding-top: 15vh;
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

    .palette-container {
        width: 480px;
        max-height: 380px;
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

    .palette-input-row {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        border-bottom: 1px solid var(--color-border-subtle);
    }

    .palette-icon {
        color: var(--color-text-muted);
        flex-shrink: 0;
    }

    .palette-input {
        flex: 1;
        background: none;
        border: none;
        outline: none;
        font-size: 14px;
        font-family: var(--font-sans);
        color: var(--color-text-primary);
        caret-color: var(--color-accent);
    }

    .palette-input::placeholder {
        color: var(--color-text-muted);
    }

    .palette-list {
        flex: 1;
        overflow-y: auto;
        padding: 4px;
    }

    .palette-empty {
        padding: 24px 16px;
        text-align: center;
        font-size: 13px;
        color: var(--color-text-muted);
    }

    .palette-item {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        padding: 8px 12px;
        font-size: 13px;
        font-family: var(--font-sans);
        background: none;
        border: none;
        border-radius: 6px;
        color: var(--color-text-primary);
        cursor: pointer;
        text-align: left;
        transition: background 0.08s ease;
    }

    .palette-item:hover,
    .palette-item.selected {
        background: var(--color-bg-elevated);
    }

    .palette-item.selected {
        background: color-mix(
            in srgb,
            var(--color-accent) 15%,
            var(--color-bg-elevated)
        );
    }

    .palette-category {
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--color-text-muted);
        min-width: 44px;
        flex-shrink: 0;
    }

    .palette-label {
        flex: 1;
        font-weight: 500;
    }

    .palette-shortcut {
        font-size: 10px;
        font-weight: 500;
        font-family: var(--font-sans);
        padding: 2px 6px;
        background: var(--color-bg-primary);
        border: 1px solid var(--color-border-subtle);
        border-radius: 4px;
        color: var(--color-text-muted);
        flex-shrink: 0;
    }

    .palette-setting-icon {
        color: var(--color-text-muted);
        flex-shrink: 0;
        margin-left: auto;
    }
</style>
