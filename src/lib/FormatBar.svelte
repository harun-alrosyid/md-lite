<script lang="ts">
    import type { Editor } from "@tiptap/core";

    type Props = {
        editor: Editor | null;
    };

    let { editor }: Props = $props();

    let showHeadingMenu = $state(false);
    let headingMenuRef: HTMLElement | null = $state(null);

    function toggleFormat(action: () => void) {
        if (editor) action();
        showHeadingMenu = false; // Always close menu after acting
    }

    function promptLink() {
        if (!editor) return;

        const { from, to } = editor.state.selection;
        const text = editor.state.doc.textBetween(from, to, " ");

        // If it's already a link, we remove the link format to allow editing
        if (editor.isActive("link")) {
            editor.chain().focus().unsetLink().run();
            return;
        }

        // Insert raw markdown syntax for a link
        if (from === to) {
            editor
                .chain()
                .focus()
                .insertContent({ type: "text", text: "[](url)" })
                // Place cursor inside the brackets
                .setTextSelection(from + 1)
                .run();
        } else {
            editor
                .chain()
                .focus()
                .insertContent({ type: "text", text: `[${text}](url)` })
                // Highlight the "url" placeholder for quick editing
                .setTextSelection({
                    from: from + text.length + 3,
                    to: from + text.length + 6,
                })
                .run();
        }
    }

    function promptImage() {
        if (!editor) return;

        const { from, to } = editor.state.selection;
        const text = editor.state.doc.textBetween(from, to, " ");

        // Insert raw markdown syntax for an image
        if (from === to) {
            editor
                .chain()
                .focus()
                .insertContent({ type: "text", text: "![alt text](image.jpg)" })
                // Place cursor inside the brackets for alt text
                .setTextSelection(from + 2)
                .run();
        } else {
            editor
                .chain()
                .focus()
                .insertContent({ type: "text", text: `![${text}](image.jpg)` })
                // Highlight the "image.jpg" placeholder for quick editing
                .setTextSelection({
                    from: from + text.length + 4,
                    to: from + text.length + 13,
                })
                .run();
        }
    }
</script>

<svelte:window
    onclick={(e) => {
        if (
            showHeadingMenu &&
            headingMenuRef &&
            !headingMenuRef.contains(e.target as Node)
        ) {
            showHeadingMenu = false;
        }
    }}
/>

{#if editor}
    <div class="format-bar">
        <!-- Headers -->
        <div class="heading-wrapper" bind:this={headingMenuRef}>
            <button
                class="format-btn"
                class:active={editor.isActive("heading")}
                onmousedown={(e) => e.preventDefault()}
                onclick={() => (showHeadingMenu = !showHeadingMenu)}
                title="Headers"
            >
                H
            </button>

            {#if showHeadingMenu}
                <div class="heading-dropdown">
                    <button
                        class="dropdown-item"
                        class:active={editor.isActive("paragraph")}
                        onmousedown={(e) => e.preventDefault()}
                        onclick={() =>
                            toggleFormat(() =>
                                editor?.chain().focus().setParagraph().run(),
                            )}
                    >
                        Normal Text
                    </button>
                    {#each [1, 2, 3, 4, 5, 6] as level}
                        <button
                            class="dropdown-item"
                            class:active={editor.isActive("heading", { level })}
                            onmousedown={(e) => e.preventDefault()}
                            onclick={() =>
                                toggleFormat(() =>
                                    editor
                                        ?.chain()
                                        .focus()
                                        .toggleHeading({ level: level as any })
                                        .run(),
                                )}
                        >
                            <span class={`h${level}`}>Heading {level}</span>
                        </button>
                    {/each}
                </div>
            {/if}
        </div>
        <div class="divider"></div>

        <!-- Marks -->
        <button
            class="format-btn"
            class:active={editor.isActive("bold")}
            onmousedown={(e) => e.preventDefault()}
            onclick={() =>
                toggleFormat(() => editor?.chain().focus().toggleBold().run())}
            title="Bold"
        >
            B
        </button>
        <button
            class="format-btn format-italic"
            class:active={editor.isActive("italic")}
            onmousedown={(e) => e.preventDefault()}
            onclick={() =>
                toggleFormat(() =>
                    editor?.chain().focus().toggleItalic().run(),
                )}
            title="Italic"
        >
            I
        </button>
        <button
            class="format-btn format-strike"
            class:active={editor.isActive("strike")}
            onmousedown={(e) => e.preventDefault()}
            onclick={() =>
                toggleFormat(() =>
                    editor?.chain().focus().toggleStrike().run(),
                )}
            title="Strikethrough"
        >
            <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
            >
                <line x1="4" y1="12" x2="20" y2="12"></line>
                <path d="M10.5 8c0-1.5 1-2.5 2.5-2.5 1.5 0 2.5 1 2.5 2.5"
                ></path>
                <path d="M13.5 16c0 1.5-1 2.5-2.5 2.5-1.5 0-2.5-1-2.5-2.5"
                ></path>
            </svg>
        </button>
        <button
            class="format-btn"
            class:active={editor.isActive("code")}
            onmousedown={(e) => e.preventDefault()}
            onclick={() =>
                toggleFormat(() => editor?.chain().focus().toggleCode().run())}
            title="Inline Code"
        >
            &lt;&gt;
        </button>
        <button
            class="format-btn"
            class:active={editor.isActive("link")}
            onmousedown={(e) => e.preventDefault()}
            onclick={promptLink}
            title="Link"
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
                <path
                    d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
                ></path>
                <path
                    d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
                ></path>
            </svg>
        </button>
        <button
            class="format-btn"
            // class:active={editor.isActive("image")}
            onmousedown={(e) => e.preventDefault()}
            onclick={promptImage}
            title="Image"
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
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
        </button>
        <div class="divider"></div>

        <!-- Lists -->
        <button
            class="format-btn"
            class:active={editor.isActive("orderedList")}
            onmousedown={(e) => e.preventDefault()}
            onclick={() =>
                toggleFormat(() =>
                    editor?.chain().focus().toggleOrderedList().run(),
                )}
            title="Ordered List"
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
                <line x1="10" y1="6" x2="21" y2="6"></line>
                <line x1="10" y1="12" x2="21" y2="12"></line>
                <line x1="10" y1="18" x2="21" y2="18"></line>
                <path d="M4 6h1v4"></path>
                <path d="M4 10h2"></path>
                <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path>
            </svg>
        </button>
        <button
            class="format-btn"
            class:active={editor.isActive("bulletList")}
            onmousedown={(e) => e.preventDefault()}
            onclick={() =>
                toggleFormat(() =>
                    editor?.chain().focus().toggleBulletList().run(),
                )}
            title="Bullet List"
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
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
        </button>
        <button
            class="format-btn"
            class:active={editor.isActive("taskList")}
            onmousedown={(e) => e.preventDefault()}
            onclick={() =>
                toggleFormat(() =>
                    editor?.chain().focus().toggleTaskList().run(),
                )}
            title="Task List"
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
                <polyline points="9 11 12 14 22 4"></polyline>
                <path
                    d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
                ></path>
            </svg>
        </button>
        <div class="divider"></div>

        <!-- Table Master -->
        <!-- <button
            class="format-btn"
            class:active={editor.isActive("table")}
            onmousedown={(e) => e.preventDefault()}
            onclick={() =>
                toggleFormat(() => {
                    if (!editor?.isActive("table")) {
                        editor
                            ?.chain()
                            .focus()
                            .insertTable({
                                rows: 3,
                                cols: 3,
                                withHeaderRow: true,
                            })
                            .run();
                    }
                })}
            title="Table"
        >
            <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                transform="translate(0, 1)"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="3" y1="15" x2="21" y2="15"></line>
                <line x1="9" y1="3" x2="9" y2="21"></line>
                <line x1="15" y1="3" x2="15" y2="21"></line>
            </svg>
        </button>

        {#if editor.isActive("table")}
            <div class="divider table-controls-divider"></div>
            <button
                class="format-btn format-table-action"
                onmousedown={(e) => e.preventDefault()}
                onclick={() => editor?.chain().focus().addColumnBefore().run()}
                title="Add Column Before">+Col</button
            >
            <button
                class="format-btn format-table-action"
                onmousedown={(e) => e.preventDefault()}
                onclick={() => editor?.chain().focus().addColumnAfter().run()}
                title="Add Column After">Col+</button
            >
            <button
                class="format-btn format-table-action format-delete"
                onmousedown={(e) => e.preventDefault()}
                onclick={() => editor?.chain().focus().deleteColumn().run()}
                title="Delete Column">-Col</button
            >
            <button
                class="format-btn format-table-action"
                onmousedown={(e) => e.preventDefault()}
                onclick={() => editor?.chain().focus().addRowBefore().run()}
                title="Add Row Before">+Row</button
            >
            <button
                class="format-btn format-table-action"
                onmousedown={(e) => e.preventDefault()}
                onclick={() => editor?.chain().focus().addRowAfter().run()}
                title="Add Row After">Row+</button
            >
            <button
                class="format-btn format-table-action format-delete"
                onmousedown={(e) => e.preventDefault()}
                onclick={() => editor?.chain().focus().deleteRow().run()}
                title="Delete Row">-Row</button
            >
            <button
                class="format-btn format-table-action format-delete"
                onmousedown={(e) => e.preventDefault()}
                onclick={() => editor?.chain().focus().deleteTable().run()}
                title="Delete Table">Drop</button
            >
        {/if} -->
    </div>
{/if}

<style>
    .format-bar {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 16px;
        background-color: var(--titlebar-bg, #1a1a1a);
        border-bottom: 1px solid var(--border-color, #333);
        flex-wrap: wrap;
        overflow: visible;
        /* Prevent shrinking vertically */
        flex-shrink: 0;
    }

    /* Light Theme */
    :global(:root[data-theme="light"]) .format-bar {
        background-color: #f8f9fa;
        border-bottom-color: #e5e5e5;
    }
    :global(:root[data-theme="light"]) .format-btn {
        color: #444;
    }
    :global(:root[data-theme="light"]) .format-btn:hover {
        background-color: #e2e8f0;
        color: #000;
    }
    :global(:root[data-theme="light"]) .format-btn.active {
        background-color: #2563eb;
        color: #fff;
    }
    :global(:root[data-theme="light"]) .divider {
        background-color: #cbd5e1;
    }

    .format-btn {
        background: transparent;
        border: none;
        color: #94a3b8;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: 500;
        width: 28px;
        height: 28px;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.15s ease;
    }

    .format-btn:hover {
        color: #fff;
        background-color: rgba(255, 255, 255, 0.1);
    }

    .format-btn.active {
        background-color: var(--accent-color, #3b82f6);
        color: #fff;
    }

    .format-italic {
        font-style: italic;
        font-family: serif;
    }

    .format-strike {
        text-decoration: line-through;
    }

    .divider {
        width: 1px;
        height: 16px;
        background-color: #334155;
        margin: 0 4px;
    }

    .table-controls-divider {
        margin-left: 8px;
    }

    .format-table-action {
        width: auto;
        padding: 0 8px;
        font-size: 12px;
        color: #7dd3fc;
    }

    .format-table-action:hover {
        background-color: rgba(125, 211, 252, 0.15);
        color: #bae6fd;
    }

    .format-delete {
        color: #fca5a5;
    }

    .format-delete:hover {
        background-color: rgba(248, 113, 113, 0.15);
        color: #fecaca;
    }

    :global(:root[data-theme="light"]) .format-table-action {
        color: #0284c7;
    }
    :global(:root[data-theme="light"]) .format-delete {
        color: #e11d48;
    }

    /* Heading Dropdown */
    .heading-wrapper {
        position: relative;
        display: inline-block;
    }

    .heading-dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        margin-top: 4px;
        background-color: var(--titlebar-bg, #1a1a1a);
        border: 1px solid var(--border-color, #333);
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
        min-width: 140px;
        z-index: 100;
        padding: 4px;
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    /* Light Theme */
    :global(:root[data-theme="light"]) .heading-dropdown {
        background-color: #ffffff;
        border-color: #e5e5e5;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .dropdown-item {
        background: transparent;
        border: none;
        color: #e2e8f0;
        display: flex;
        align-items: center;
        padding: 6px 12px;
        font-size: 13px;
        border-radius: 4px;
        cursor: pointer;
        text-align: left;
        width: 100%;
        transition: all 0.15s ease;
    }

    .dropdown-item:hover {
        background-color: rgba(255, 255, 255, 0.1);
        color: #fff;
    }

    .dropdown-item.active {
        background-color: rgba(59, 130, 246, 0.2);
        color: #93c5fd;
    }

    :global(:root[data-theme="light"]) .dropdown-item {
        color: #333;
    }
    :global(:root[data-theme="light"]) .dropdown-item:hover {
        background-color: #f1f5f9;
        color: #000;
    }
    :global(:root[data-theme="light"]) .dropdown-item.active {
        background-color: #eff6ff;
        color: #1d4ed8;
    }

    /* Styling internal spans to look like actual headings somewhat */
    .h1 {
        font-size: 16px;
        font-weight: bold;
    }
    .h2 {
        font-size: 15px;
        font-weight: bold;
    }
    .h3 {
        font-size: 14px;
        font-weight: bold;
    }
    .h4 {
        font-size: 13px;
        font-weight: bold;
    }
    .h5 {
        font-size: 12px;
        font-weight: bold;
    }
    .h6 {
        font-size: 11px;
        font-weight: bold;
    }
</style>
