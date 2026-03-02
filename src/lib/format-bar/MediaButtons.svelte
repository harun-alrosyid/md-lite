<script lang="ts">
    import type { Editor } from "@tiptap/core";
    import "./format-bar.css";

    type Props = {
        editor: Editor | null;
    };

    let { editor }: Props = $props();

    function promptLink() {
        if (!editor) return;

        const { from, to } = editor.state.selection;
        const text = editor.state.doc.textBetween(from, to, " ");

        if (editor.isActive("link")) {
            editor.chain().focus().unsetLink().run();
            return;
        }

        if (from === to) {
            editor
                .chain()
                .focus()
                .insertContent({ type: "text", text: "[](url)" })
                .setTextSelection(from + 1)
                .run();
        } else {
            editor
                .chain()
                .focus()
                .insertContent({ type: "text", text: `[${text}](url)` })
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

        if (from === to) {
            editor
                .chain()
                .focus()
                .insertContent({ type: "text", text: "![alt text](image.jpg)" })
                .setTextSelection(from + 2)
                .run();
        } else {
            editor
                .chain()
                .focus()
                .insertContent({ type: "text", text: `![${text}](image.jpg)` })
                .setTextSelection({
                    from: from + text.length + 4,
                    to: from + text.length + 13,
                })
                .run();
        }
    }
</script>

<button
    class="format-btn"
    class:active={editor?.isActive("link")}
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
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
        ></path>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
        ></path>
    </svg>
</button>
<button
    class="format-btn"
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
