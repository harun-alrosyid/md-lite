import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    createInitialState,
    deriveFileName,
    toggleTheme,
    performSave,
    handleContentUpdate,
    scheduleAutoSave,
    type AppState,
} from './app-logic';

// Mock the shortcuts module so saveFile is a vi.fn()
vi.mock('./shortcuts', () => ({
    saveFile: vi.fn(),
}));

import { saveFile } from './shortcuts';

describe('createInitialState', () => {
    it('returns default state', () => {
        const state = createInitialState();
        expect(state.content).toBe('');
        expect(state.filePath).toBe('');
        expect(state.isDirty).toBe(false);
        expect(state.isSaving).toBe(false);
        expect(state.theme).toBe('dark');
        expect(state.saveTimer).toBeNull();
    });
});

describe('deriveFileName', () => {
    it('returns "Untitled" for empty path', () => {
        expect(deriveFileName('')).toBe('Untitled');
    });

    it('extracts filename from full path', () => {
        expect(deriveFileName('/Users/test/Documents/readme.md')).toBe(
            'readme.md',
        );
    });

    it('extracts filename from simple path', () => {
        expect(deriveFileName('/file.md')).toBe('file.md');
    });

    it('returns "Untitled" for path ending with /', () => {
        expect(deriveFileName('/folder/')).toBe('Untitled');
    });

    it('handles path with multiple segments', () => {
        expect(deriveFileName('/a/b/c/d/test.md')).toBe('test.md');
    });
});

describe('toggleTheme', () => {
    it('switches dark to light', () => {
        const state = createInitialState();
        const result = toggleTheme(state);
        expect(result.theme).toBe('light');
    });

    it('switches light to dark', () => {
        const state: AppState = { ...createInitialState(), theme: 'light' };
        const result = toggleTheme(state);
        expect(result.theme).toBe('dark');
    });

    it('round-trip returns original theme', () => {
        const state = createInitialState();
        const result = toggleTheme(toggleTheme(state));
        expect(result.theme).toBe('dark');
    });

    it('does not mutate original state', () => {
        const state = createInitialState();
        const result = toggleTheme(state);
        expect(state.theme).toBe('dark');
        expect(result.theme).toBe('light');
    });
});

describe('handleContentUpdate', () => {
    it('sets content and isDirty', () => {
        const state = createInitialState();
        const result = handleContentUpdate(state, '# Hello');
        expect(result.content).toBe('# Hello');
        expect(result.isDirty).toBe(true);
    });

    it('preserves other state fields', () => {
        const state: AppState = {
            ...createInitialState(),
            filePath: '/test.md',
            theme: 'light',
        };
        const result = handleContentUpdate(state, 'new content');
        expect(result.filePath).toBe('/test.md');
        expect(result.theme).toBe('light');
    });

    it('does not mutate original state', () => {
        const state = createInitialState();
        handleContentUpdate(state, 'changed');
        expect(state.content).toBe('');
        expect(state.isDirty).toBe(false);
    });
});

describe('performSave', () => {
    beforeEach(() => {
        vi.mocked(saveFile).mockReset();
    });

    it('skips save when no filePath', async () => {
        const state = createInitialState();
        const result = await performSave(state);
        expect(result).toBe(state);
        expect(saveFile).not.toHaveBeenCalled();
    });

    it('skips save when not dirty', async () => {
        const state: AppState = { ...createInitialState(), filePath: '/test.md' };
        const result = await performSave(state);
        expect(result).toBe(state);
        expect(saveFile).not.toHaveBeenCalled();
    });

    it('saves successfully and clears dirty', async () => {
        vi.mocked(saveFile).mockResolvedValue(undefined);
        const state: AppState = {
            ...createInitialState(),
            filePath: '/test.md',
            content: '# Hello',
            isDirty: true,
        };

        const result = await performSave(state);

        expect(saveFile).toHaveBeenCalledWith('/test.md', '# Hello');
        expect(result.isDirty).toBe(false);
        expect(result.isSaving).toBe(false);
    });

    it('handles save error gracefully', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        vi.mocked(saveFile).mockRejectedValue(new Error('disk full'));
        const state: AppState = {
            ...createInitialState(),
            filePath: '/test.md',
            content: '# Hello',
            isDirty: true,
        };

        const result = await performSave(state);

        expect(consoleSpy).toHaveBeenCalledWith(
            'Save failed:',
            expect.any(Error),
        );
        expect(result.isSaving).toBe(false);
        consoleSpy.mockRestore();
    });

    it('does not mutate original state', async () => {
        vi.mocked(saveFile).mockResolvedValue(undefined);
        const state: AppState = {
            ...createInitialState(),
            filePath: '/test.md',
            content: '# Hello',
            isDirty: true,
        };

        await performSave(state);
        expect(state.isDirty).toBe(true);
        expect(state.isSaving).toBe(false);
    });
});

describe('scheduleAutoSave', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('does nothing without filePath', () => {
        const doSave = vi.fn();
        const state = createInitialState();
        const result = scheduleAutoSave(state, doSave);
        expect(result.saveTimer).toBeNull();
    });

    it('schedules save after delay', () => {
        const doSave = vi.fn();
        const state: AppState = { ...createInitialState(), filePath: '/test.md' };
        const result = scheduleAutoSave(state, doSave, 1000);

        expect(result.saveTimer).not.toBeNull();
        expect(doSave).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1000);
        expect(doSave).toHaveBeenCalledOnce();
    });

    it('clears previous timer before scheduling new one', () => {
        const doSave1 = vi.fn();
        const doSave2 = vi.fn();
        const state: AppState = { ...createInitialState(), filePath: '/test.md' };

        const result1 = scheduleAutoSave(state, doSave1, 1000);
        const result2 = scheduleAutoSave(result1, doSave2, 1000);

        vi.advanceTimersByTime(1000);

        // doSave1 should have been cleared, only doSave2 should fire
        expect(doSave2).toHaveBeenCalledOnce();
        // doSave1 timer was cleared
        expect(doSave1).not.toHaveBeenCalled();
    });

    it('uses custom delay', () => {
        const doSave = vi.fn();
        const state: AppState = { ...createInitialState(), filePath: '/test.md' };
        scheduleAutoSave(state, doSave, 500);

        vi.advanceTimersByTime(499);
        expect(doSave).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1);
        expect(doSave).toHaveBeenCalledOnce();
    });
});
