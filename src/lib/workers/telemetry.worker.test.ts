import { describe, it, expect } from 'vitest';
import { computeTelemetry } from './telemetry.worker';

describe('telemetry.worker', () => {
    describe('computeTelemetry', () => {
        it('handles empty string gracefully', () => {
            const result = computeTelemetry('');
            expect(result).toEqual({ words: 0, characters: 0, readingTimeMinutes: 0 });
        });

        it('handles whitespace-only string', () => {
            const result = computeTelemetry('   \n  \t ');
            expect(result).toEqual({ words: 0, characters: 0, readingTimeMinutes: 0 });
        });

        it('counts single word correctly', () => {
            const result = computeTelemetry('Hello');
            expect(result.words).toBe(1);
            expect(result.characters).toBe(5);
            expect(result.readingTimeMinutes).toBe(1);
        });

        it('counts multiple words split by spaces and lines correctly', () => {
            const result = computeTelemetry('The quick brown\nfox jumps.');
            expect(result.words).toBe(5);
            expect(result.characters).toBe(26);
            expect(result.readingTimeMinutes).toBe(1);
        });

        it('calculates reading time rounding up minimally', () => {
            // 225 words per minute. So 230 words should take 2 mins.
            const text = new Array(230).fill('word').join(' ');
            const result = computeTelemetry(text);
            expect(result.words).toBe(230);
            expect(result.readingTimeMinutes).toBe(2);
        });

        it('calculates exactly 1 min for small word counts', () => {
            const text = new Array(225).fill('word').join(' ');
            const result = computeTelemetry(text);
            expect(result.words).toBe(225);
            expect(result.readingTimeMinutes).toBe(1);
        });
    });

    // We skip testing self.onmessage natively and simply assert that 
    // computeTelemetry works properly for our logic paths.
});
