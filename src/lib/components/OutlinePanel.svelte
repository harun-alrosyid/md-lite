<script lang="ts">
    import { onMount, tick } from "svelte";
    import { fly } from "svelte/transition";
    import { cubicOut } from "svelte/easing";
    import type { OutlineHeading } from "../core/outline";

    type Props = {
        visible: boolean;
        headings: OutlineHeading[];
        activeId: string | null;
        onJump: (pos: number) => void;
        onClose: () => void;
    };

    let { visible, headings, activeId, onJump, onClose }: Props = $props();

    let panelEl: HTMLDivElement | undefined = $state();
    let focusedIndex = $state(-1);
    let internalHeadings = $derived(headings);

    $effect(() => {
        if (visible && internalHeadings.length > 0) {
            if (activeId) {
                const idx = internalHeadings.findIndex(
                    (h) => h.id === activeId,
                );
                focusedIndex = idx >= 0 ? idx : 0;
            } else {
                focusedIndex = 0;
            }
            tick().then(() => {
                scrollToFocusedItem();
            });
        } else {
            focusedIndex = -1;
        }
    });

    function scrollToFocusedItem() {
        if (!panelEl || focusedIndex < 0) return;
        const items = panelEl.querySelectorAll(".outline-item");
        const activeItem = items[focusedIndex] as HTMLElement;
        if (activeItem) {
            activeItem.scrollIntoView({ block: "nearest" });
        }
    }

    function handleKeydown(e: KeyboardEvent) {
        if (!visible) return;

        if (e.key === "Escape") {
            e.preventDefault();
            onClose();
            return;
        }

        if (internalHeadings.length === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            focusedIndex = (focusedIndex + 1) % internalHeadings.length;
            scrollToFocusedItem();
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            focusedIndex =
                (focusedIndex - 1 + internalHeadings.length) %
                internalHeadings.length;
            scrollToFocusedItem();
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (focusedIndex >= 0 && focusedIndex < internalHeadings.length) {
                onJump(internalHeadings[focusedIndex].pos);
                onClose();
            }
        }
    }

    function handleClick(heading: OutlineHeading, index: number) {
        focusedIndex = index;
        onJump(heading.pos);
        // don't always auto-close on mouse click if they want to use it as a persistent TOC,
        // but the spec says "Instantly teleports the editor's cursor".
    }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if visible}
    <div
        class="outline-panel"
        bind:this={panelEl}
        role="dialog"
        aria-label="Document Outline"
        tabindex="-1"
        transition:fly={{ x: -280, duration: 250, easing: cubicOut }}
    >
        <div class="outline-header">
            <h3>Outline</h3>
            <button class="close-btn" onclick={onClose} title="Close (Esc)">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                    />
                </svg>
            </button>
        </div>

        <div class="outline-list">
            {#if internalHeadings.length === 0}
                <div class="outline-empty">No headings found</div>
            {:else}
                {#each internalHeadings as heading, i}
                    <button
                        class="outline-item"
                        class:is-active={heading.id === activeId}
                        class:is-focused={i === focusedIndex}
                        style="padding-left: {(heading.level - 1) * 12 + 16}px;"
                        onclick={() => handleClick(heading, i)}
                        onmousemove={() => (focusedIndex = i)}
                        title={heading.text}
                    >
                        <span class="heading-text">{heading.text}</span>
                    </button>
                {/each}
            {/if}
        </div>
    </div>
{/if}

<style>
    .outline-panel {
        position: absolute;
        top: 0; /* Below title bar */
        left: 0;
        bottom: 0; /* Full height down to the bottom */
        width: 280px;
        background: var(--color-bg-secondary);
        border-left: 1px solid var(--color-border);
        box-shadow: -4px 0 16px rgba(0, 0, 0, 0.05);
        z-index: 100;
        display: flex;
        flex-direction: column;
        outline: none;
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        background: color-mix(
            in srgb,
            var(--color-bg-secondary) 85%,
            transparent
        );
    }

    .outline-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        border-bottom: 1px solid var(--color-border-subtle);
        flex-shrink: 0;
    }

    .outline-header h3 {
        font-size: 13px;
        font-weight: 600;
        color: var(--color-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin: 0;
    }

    .close-btn {
        width: 24px;
        height: 24px;
        padding: 4px;
        border-radius: 4px;
        border: none;
        background: transparent;
        color: var(--color-text-muted);
        cursor: pointer;
        transition: all 0.15s ease;
    }

    .close-btn:hover {
        background: var(--color-bg-elevated);
        color: var(--color-text-primary);
    }

    .outline-list {
        flex: 1;
        overflow-y: auto;
        padding: 8px 0;
    }

    .outline-empty {
        padding: 16px;
        text-align: center;
        font-size: 13px;
        color: var(--color-text-muted);
        font-style: italic;
    }

    .outline-item {
        display: block;
        width: 100%;
        text-align: left;
        padding: 6px 16px 6px 0; /* Left padding set inline for indents */
        background: transparent;
        border: none;
        color: var(--color-text-secondary);
        font-size: 13.5px;
        font-family: var(--font-sans);
        line-height: 1.4;
        cursor: pointer;
        border-left: 3px solid transparent;
        transition: all 0.1s ease;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .outline-item .heading-text {
        opacity: 0.85;
    }

    .outline-item.is-focused {
        background: var(--color-bg-elevated);
        color: var(--color-text-primary);
    }

    .outline-item.is-active {
        color: var(--color-accent);
        border-left-color: var(--color-accent);
        font-weight: 500;
        background: color-mix(in srgb, var(--color-accent) 10%, transparent);
    }

    .outline-item.is-active .heading-text {
        opacity: 1;
    }
</style>
