<script lang="ts">
    import type { TelemetryResult } from "./telemetry.worker";

    interface Props {
        words: number;
        characters: number;
        readingTimeMinutes: number;
    }

    let { words, characters, readingTimeMinutes }: Props = $props();

    let readingLabel = $derived(
        readingTimeMinutes <= 1
            ? "1 min read"
            : `${readingTimeMinutes} min read`,
    );
</script>

<footer class="status-bar" id="status-bar">
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
        justify-content: flex-end;
        height: 24px;
        padding: 0 12px;
        background: var(--color-bg-secondary);
        border-top: 1px solid var(--color-border-subtle);
        flex-shrink: 0;
        transition: background-color 0.2s ease;
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
