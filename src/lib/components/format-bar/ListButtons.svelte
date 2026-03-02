<script lang="ts">
    import type { Editor } from "@tiptap/core";
    import "./format-bar.css";

    type Props = {
        editor: Editor | null;
    };

    let { editor }: Props = $props();

    function toggleFormat(action: () => void) {
        if (editor) action();
    }
</script>

<button
    class="format-btn"
    class:active={editor?.isActive("orderedList")}
    onmousedown={(e) => e.preventDefault()}
    onclick={() =>
        toggleFormat(() => editor?.chain().focus().toggleOrderedList().run())}
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
    class:active={editor?.isActive("bulletList")}
    onmousedown={(e) => e.preventDefault()}
    onclick={() =>
        toggleFormat(() => editor?.chain().focus().toggleBulletList().run())}
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
    class:active={editor?.isActive("taskList")}
    onmousedown={(e) => e.preventDefault()}
    onclick={() =>
        toggleFormat(() => editor?.chain().focus().toggleTaskList().run())}
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
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
        ></path>
    </svg>
</button>
