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
    class:active={editor?.isActive("bold")}
    onmousedown={(e) => e.preventDefault()}
    onclick={() =>
        toggleFormat(() => editor?.chain().focus().toggleBold().run())}
    title="Bold"
>
    B
</button>
<button
    class="format-btn format-italic"
    class:active={editor?.isActive("italic")}
    onmousedown={(e) => e.preventDefault()}
    onclick={() =>
        toggleFormat(() => editor?.chain().focus().toggleItalic().run())}
    title="Italic"
>
    I
</button>
<button
    class="format-btn format-strike"
    class:active={editor?.isActive("strike")}
    onmousedown={(e) => e.preventDefault()}
    onclick={() =>
        toggleFormat(() => editor?.chain().focus().toggleStrike().run())}
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
        <path d="M10.5 8c0-1.5 1-2.5 2.5-2.5 1.5 0 2.5 1 2.5 2.5"></path>
        <path d="M13.5 16c0 1.5-1 2.5-2.5 2.5-1.5 0-2.5-1-2.5-2.5"></path>
    </svg>
</button>
<button
    class="format-btn"
    class:active={editor?.isActive("code")}
    onmousedown={(e) => e.preventDefault()}
    onclick={() =>
        toggleFormat(() => editor?.chain().focus().toggleCode().run())}
    title="Inline Code"
>
    &lt;&gt;
</button>
