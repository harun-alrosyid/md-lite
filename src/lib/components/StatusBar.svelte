<script lang="ts">
    import type { TelemetryResult } from "./telemetry.worker";

    interface Props {
        words: number;
        characters: number;
        readingTimeMinutes: number;
        focusMode?: boolean;
    }

    let {
        words,
        characters,
        readingTimeMinutes,
        focusMode = false,
    }: Props = $props();

    let readingLabel = $derived(
        readingTimeMinutes <= 1
            ? "1 min read"
            : `${readingTimeMinutes} min read`,
    );
</script>

<footer class="status-bar" id="status-bar">
    <div class="status-left">
        {#if focusMode}
            <span class="focus-pill" id="focus-indicator">
                <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    stroke="none"
                >
                    <circle cx="12" cy="12" r="6" />
                </svg>
                Focus
            </span>
        {/if}
    </div>
    <div class="telemetry">
        <span class="metric">{words.toLocaleString()} words</span>
        <span class="separator">·</span>
        <span class="metric">{characters.toLocaleString()} chars</span>
        <span class="separator">·</span>
        <span class="metric">{readingLabel}</span>
    </div>
</footer>

<style>
    .status-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 24px;
        padding: 0 12px;
        background: var(--color-bg-secondary);
        border-top: 1px solid var(--color-border-subtle);
        flex-shrink: 0;
        transition: background-color 0.2s ease;
    }

    .status-left {
        display: flex;
        align-items: center;
    }

    .focus-pill {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-family: var(--font-sans);
        font-size: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--color-accent);
        background: color-mix(in srgb, var(--color-accent) 12%, transparent);
        padding: 1px 8px 1px 6px;
        border-radius: 10px;
        animation: pillFadeIn 0.2s ease-out;
    }

    @keyframes pillFadeIn {
        from {
            opacity: 0;
            transform: scale(0.9);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }

    .telemetry {
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .metric {
        font-family: var(--font-sans);
        font-size: 11px;
        font-weight: 400;
        color: var(--color-text-muted);
        opacity: 0.7;
        letter-spacing: 0.01em;
        transition: opacity 0.2s ease;
    }

    .separator {
        font-size: 10px;
        color: var(--color-text-muted);
        opacity: 0.4;
    }

    .status-bar:hover .metric {
        opacity: 1;
    }

    .status-bar:hover .separator {
        opacity: 0.7;
    }
</style>
