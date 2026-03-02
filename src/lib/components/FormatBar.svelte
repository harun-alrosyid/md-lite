<script lang="ts">
    import type { Editor } from "@tiptap/core";
    import HeadingSelector from "./format-bar/HeadingSelector.svelte";
    import MarkButtons from "./format-bar/MarkButtons.svelte";
    import MediaButtons from "./format-bar/MediaButtons.svelte";
    import ListButtons from "./format-bar/ListButtons.svelte";
    import "./format-bar/format-bar.css";

    type Props = {
        editor: Editor | null;
    };

    let { editor }: Props = $props();
</script>

{#if editor}
    <div class="format-bar">
        <!-- Headers -->
        <HeadingSelector {editor} />
        <div class="divider"></div>

        <!-- Marks (Bold, Italic, Strike, Code) -->
        <MarkButtons {editor} />

        <!-- Media (Links, Images) -->
        <MediaButtons {editor} />
        <div class="divider"></div>

        <!-- Lists (Bulleted, Ordered, Tasks) -->
        <ListButtons {editor} />
    </div>
{/if}
