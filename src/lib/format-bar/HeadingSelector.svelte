<script lang="ts">
    import type { Editor } from "@tiptap/core";
    import "./format-bar.css";

    type Props = {
        editor: Editor | null;
    };

    let { editor }: Props = $props();

    let showHeadingMenu = $state(false);
    let headingMenuRef: HTMLElement | null = $state(null);

    function toggleFormat(action: () => void) {
        if (editor) action();
        showHeadingMenu = false;
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

<div class="heading-wrapper" bind:this={headingMenuRef}>
    <button
        class="format-btn"
        class:active={editor?.isActive("heading")}
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
                class:active={editor?.isActive("paragraph")}
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
                    class:active={editor?.isActive("heading", { level })}
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
