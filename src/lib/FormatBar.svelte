<script lang="ts">
    import type { Editor } from "@tiptap/core";

    type Props = {
        editor: Editor | null;
    };

    let { editor }: Props = $props();

    function toggleFormat(action: () => void) {
        if (editor) action();
    }

    function promptLink() {
        if (!editor) return;
        const attrs = editor.getAttributes("link");
        const previousUrl = attrs ? attrs.href || "" : "";
        const { from, to } = editor.state.selection;

        const url = window.prompt("URL", previousUrl);

        // Cancelled
        if (url === null) return;

        editor.commands.focus();
        editor.commands.setTextSelection({ from, to });

        // Empty URL prevents creation or removes existing
        if (url === "") {
            if (editor.isActive("link")) {
                editor
                    .chain()
                    .focus()
                    .extendMarkRange("link")
                    .unsetLink()
                    .run();
            }
            return;
        }

        // Set valid URL
        if (editor.isActive("link")) {
            editor
                .chain()
                .focus()
                .extendMarkRange("link")
                .setLink({ href: url })
                .run();
        } else if (from === to) {
            editor
                .chain()
                .focus()
                .insertContent(`<a href="${url}">${url}</a>`)
                .run();
        } else {
            editor.chain().focus().setLink({ href: url }).run();
        }
    }
</script>

{#if editor}
    <div class="format-bar">
        <!-- Headers -->
        <button
            class="format-btn"
            class:active={editor.isActive("heading")}
            onmousedown={(e) => e.preventDefault()}
            onclick={() =>
                toggleFormat(() =>
                    editor?.chain().focus().toggleHeading({ level: 1 }).run(),
                )}
            title="Header (H1)"
        >
            H
        </button>
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
        <button
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
        {/if}
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
        overflow-x: auto;
        /* Prevent shrinking vertically */
        flex-shrink: 0;
    }

    /* Light Theme */
    :global(.theme-light) .format-bar {
        background-color: #f8f9fa;
        border-bottom-color: #e5e5e5;
    }
    :global(.theme-light) .format-btn {
        color: #444;
    }
    :global(.theme-light) .format-btn:hover {
        background-color: #e2e8f0;
        color: #000;
    }
    :global(.theme-light) .format-btn.active {
        background-color: #2563eb;
        color: #fff;
    }
    :global(.theme-light) .divider {
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

    :global(.theme-light) .format-table-action {
        color: #0284c7;
    }
    :global(.theme-light) .format-delete {
        color: #e11d48;
    }
</style>
