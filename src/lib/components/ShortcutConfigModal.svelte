<script lang="ts">
    import { onMount } from "svelte";
    import {
        defaultShortcuts,
        formatShortcutForDisplay,
        loadShortcuts,
        saveShortcuts,
        type ShortcutConfig,
    } from "../core/shortcutStore";

    export let visible: boolean;
    export let onClose: () => void;
    export let onSave: () => void; // callback so App can reload the config

    let shortcuts: ShortcutConfig = { ...defaultShortcuts };
    let listeningAction: string | null = null;
    let conflictMessage: string | null = null;
    let modalRef: HTMLDivElement;

    onMount(() => {
        shortcuts = loadShortcuts();
    });

    // Actions we allow configuring
    const groupedActions = [
        {
            category: "File & App",
            items: [
                { id: "onNew", label: "New File" },
                { id: "onOpen", label: "Open File" },
                { id: "onSave", label: "Save File" },
                { id: "onSaveAs", label: "Save As" },
                { id: "onClose", label: "Close File/Window" },
                { id: "onGoHome", label: "Go Home" },
            ],
        },
        {
            category: "View & Navigation",
            items: [
                { id: "onFind", label: "Find (Search)" },
                { id: "onToggleFocusMode", label: "Toggle Focus Mode" },
                { id: "onCommandPalette", label: "Command Palette" },
                { id: "onToggleTheme", label: "Toggle Theme" },
            ],
        },
        {
            category: "Formatting",
            items: [
                { id: "onSetParagraph", label: "Normal Text" },
                { id: "onSetHeading1", label: "Heading 1" },
                { id: "onSetHeading2", label: "Heading 2" },
                { id: "onSetHeading3", label: "Heading 3" },
                { id: "onSetHeading4", label: "Heading 4" },
                { id: "onSetHeading5", label: "Heading 5" },
                { id: "onSetHeading6", label: "Heading 6" },
                { id: "onToggleBold", label: "Bold" },
                { id: "onToggleItalic", label: "Italic" },
                { id: "onToggleStrikethrough", label: "Strikethrough" },
                { id: "onToggleHighlight", label: "Highlight" },
                { id: "onToggleBlockquote", label: "Blockquote" },
                { id: "onToggleBulletList", label: "Bullet List" },
                { id: "onToggleOrderedList", label: "Ordered List" },
                { id: "onToggleCodeBlock", label: "Code Block" },
                { id: "onInsertHorizontalRule", label: "Horizontal Rule" },
            ],
        },
    ];

    const configurableActions = groupedActions.flatMap((g) => g.items);

    function startListening(actionId: string) {
        listeningAction = actionId;
        conflictMessage = null;
    }

    function handleKeyDown(e: KeyboardEvent) {
        if (e.key === "Escape" && !listeningAction) {
            onClose();
            return;
        }

        if (!listeningAction) return;

        e.preventDefault();
        e.stopPropagation();

        // Ignore standalone modifier presses
        if (["Control", "Shift", "Alt", "Meta"].includes(e.key)) {
            return;
        }

        const mods: string[] = [];
        if (e.metaKey || e.ctrlKey) mods.push("CmdOrCtrl");
        if (e.shiftKey) mods.push("Shift");
        if (e.altKey) mods.push("Alt");

        // Require at least one modifier + a key to avoid breaking normal typing
        // (You might want to relax this if you allow single-key shortcuts,
        // but typically command shortcuts need a modifier)
        if (mods.length === 0 && e.key !== "Escape" && e.key !== "Enter") {
            conflictMessage =
                "Shortcut must include a modifier (Cmd, Ctrl, Alt, Shift)";
            return;
        }

        // Cancel binding if Escape is pressed with no modifiers
        if (e.key === "Escape" && mods.length === 0) {
            listeningAction = null;
            return;
        }

        let keyName = e.key;
        // Map blank space to "Space"
        if (keyName === " ") keyName = "Space";
        else if (keyName.length === 1) keyName = keyName.toUpperCase();

        const newShortcut = [...mods, keyName].join("+");

        // Check for conflicts
        const conflictAction = Object.keys(shortcuts).find(
            (a) => a !== listeningAction && shortcuts[a] === newShortcut,
        );

        if (conflictAction) {
            const label =
                configurableActions.find((a) => a.id === conflictAction)
                    ?.label || conflictAction;
            conflictMessage = `"${formatShortcutForDisplay(newShortcut)}" is already assigned to "${label}".`;
            return;
        }

        shortcuts[listeningAction] = newShortcut;
        listeningAction = null;
        conflictMessage = null;
    }

    function handleSave() {
        saveShortcuts(shortcuts);
        onSave();
        onClose();
    }

    function handleReset() {
        shortcuts = { ...defaultShortcuts };
        conflictMessage = null;
    }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
{#if visible}
    <div class="modal-backdrop" onmousedown={onClose}>
        <div
            class="modal-content"
            bind:this={modalRef}
            onmousedown={(e) => e.stopPropagation()}
            onkeydown={handleKeyDown}
            tabindex="-1"
        >
            <div class="modal-header">
                <h2>Custom Shortcuts</h2>
                <button
                    class="close-btn"
                    aria-label="Close settings"
                    onclick={onClose}
                >
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            <div class="modal-body">
                {#if conflictMessage}
                    <div class="conflict-alert">{conflictMessage}</div>
                {/if}
                <div class="shortcuts-grid">
                    {#each groupedActions as group}
                        <h3 class="category-header">{group.category}</h3>
                        {#each group.items as action}
                            <div class="shortcut-row">
                                <span class="shortcut-label"
                                    >{action.label}</span
                                >
                                <button
                                    class="shortcut-btn"
                                    class:listening={listeningAction ===
                                        action.id}
                                    onclick={() => startListening(action.id)}
                                >
                                    {#if listeningAction === action.id}
                                        Press keys... (Esc to cancel)
                                    {:else}
                                        <kbd
                                            >{formatShortcutForDisplay(
                                                shortcuts[action.id],
                                            )}</kbd
                                        >
                                    {/if}
                                </button>
                            </div>
                        {/each}
                    {/each}
                </div>
            </div>

            <div class="modal-footer">
                <button class="reset-btn" onclick={handleReset}
                    >Reset Defaults</button
                >
                <button class="save-btn" onclick={handleSave}
                    >Save Changes</button
                >
            </div>
        </div>
    </div>
{/if}

<style>
    .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .modal-content {
        background: var(--color-bg-primary);
        border: 1px solid var(--color-border);
        border-radius: 12px;
        width: 480px;
        max-width: 90vw;
        display: flex;
        flex-direction: column;
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.3);
        outline: none;
        animation: zoomIn 0.2s ease-out;
    }

    @keyframes zoomIn {
        from {
            opacity: 0;
            transform: scale(0.95);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }

    .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        border-bottom: 1px solid var(--color-border);
    }

    .modal-header h2 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
    }

    .close-btn {
        background: none;
        border: none;
        color: var(--color-text-secondary);
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .close-btn:hover {
        background: var(--color-bg-secondary);
        color: var(--color-text-primary);
    }

    .modal-body {
        padding: 20px;
        max-height: 50vh;
        overflow-y: auto;
    }

    .conflict-alert {
        background: color-mix(in srgb, var(--color-warning) 15%, transparent);
        color: var(--color-warning);
        padding: 10px 14px;
        border-radius: 6px;
        font-size: 13px;
        margin-bottom: 16px;
    }

    .shortcuts-grid {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .category-header {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-text-muted);
        margin: 16px 0 4px 4px;
    }

    .category-header:first-child {
        margin-top: 0;
    }

    .shortcut-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 12px;
        background: var(--color-bg-secondary);
        border-radius: 6px;
        border: 1px solid transparent;
    }

    .shortcut-label {
        font-size: 14px;
        font-weight: 500;
        color: var(--color-text-primary);
    }

    .shortcut-btn {
        background: var(--color-bg-elevated);
        border: 1px solid var(--color-border);
        color: var(--color-text-primary);
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 13px;
        cursor: pointer;
        min-width: 140px;
        text-align: right;
        transition: all 0.2s;
    }

    .shortcut-btn:hover {
        border-color: var(--color-text-secondary);
    }

    .shortcut-btn.listening {
        border-color: var(--color-accent);
        background: color-mix(in srgb, var(--color-accent) 10%, transparent);
        color: var(--color-accent);
        text-align: center;
    }

    .shortcut-btn kbd {
        font-family: var(--font-mono);
        font-size: 12px;
        letter-spacing: 0.5px;
    }

    .modal-footer {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 12px;
        padding: 16px 20px;
        border-top: 1px solid var(--color-border);
        background: var(--color-bg-secondary);
        border-radius: 0 0 12px 12px;
    }

    .reset-btn,
    .save-btn {
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        font-family: inherit;
    }

    .reset-btn {
        background: transparent;
        border: 1px solid var(--color-border);
        color: var(--color-text-secondary);
    }

    .reset-btn:hover {
        background: var(--color-bg-elevated);
        color: var(--color-text-primary);
    }

    .save-btn {
        background: var(--color-accent);
        border: none;
        color: #fff;
    }

    .save-btn:hover {
        background: var(--color-accent-hover);
    }
</style>
