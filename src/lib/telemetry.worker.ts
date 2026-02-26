/// <reference lib="webworker" />

export interface TelemetryInput {
    text: string;
}

export interface TelemetryResult {
    words: number;
    characters: number;
    readingTimeMinutes: number;
}

const WORDS_PER_MINUTE = 225;

function computeTelemetry(text: string): TelemetryResult {
    const trimmed = text.trim();

    if (!trimmed) {
        return { words: 0, characters: 0, readingTimeMinutes: 0 };
    }

    // Word count: split on whitespace/newlines, filter empty strings
    const words = trimmed.split(/\s+/).filter((w) => w.length > 0).length;

    // Character count (excluding leading/trailing whitespace)
    const characters = text.length;

    // Reading time: industry standard 225 WPM
    const readingTimeMinutes = Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));

    return { words, characters, readingTimeMinutes };
}

// Web Worker message handler
self.onmessage = (event: MessageEvent<TelemetryInput>) => {
    const result = computeTelemetry(event.data.text);
    self.postMessage(result);
};
