import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    deriveFileName,
    toggleTheme,
    performSave,
    handleContentUpdate,
    scheduleAutoSave,
    scheduleShadowSave,
} from './app-logic';
import { fileState } from './stores/file.svelte';
import { uiState } from './stores/ui.svelte';

// Mock the shortcuts module so saveFile is a vi.fn()
vi.mock('./shortcuts', () => ({
    saveFile: vi.fn(),
}));

import { saveFile } from './shortcuts';

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
    beforeEach(() => {
        uiState.theme = 'dark';
    });

    it('switches dark to light', () => {
        toggleTheme();
        expect(uiState.theme).toBe('light');
    });

    it('switches light to dark', () => {
        uiState.theme = 'light';
        toggleTheme();
        expect(uiState.theme).toBe('dark');
    });

    it('round-trip returns original theme', () => {
        toggleTheme();
        toggleTheme();
        expect(uiState.theme).toBe('dark');
    });
});

describe('handleContentUpdate', () => {
    beforeEach(() => {
        fileState.content = '';
        fileState.isDirty = false;
    });

    it('sets content and isDirty on global store', () => {
        handleContentUpdate('# Hello');
        expect(fileState.content).toBe('# Hello');
        expect(fileState.isDirty).toBe(true);
    });
});

describe('performSave', () => {
    beforeEach(() => {
        vi.mocked(saveFile).mockReset();
        fileState.filePath = '';
        fileState.content = '';
        fileState.isDirty = false;
        fileState.isSaving = false;
    });

    it('skips save when no filePath', async () => {
        await performSave();
        expect(saveFile).not.toHaveBeenCalled();
    });

    it('skips save when not dirty', async () => {
        fileState.filePath = '/test.md';
        await performSave();
        expect(saveFile).not.toHaveBeenCalled();
    });

    it('saves successfully and clears dirty flag', async () => {
        vi.mocked(saveFile).mockResolvedValue(undefined);
        fileState.filePath = '/test.md';
        fileState.content = '# Hello';
        fileState.isDirty = true;

        await performSave();

        expect(saveFile).toHaveBeenCalledWith('/test.md', '# Hello');
        expect(fileState.isDirty).toBe(false);
        expect(fileState.isSaving).toBe(false);
    });

    it('handles save error gracefully', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        vi.mocked(saveFile).mockRejectedValue(new Error('disk full'));

        fileState.filePath = '/test.md';
        fileState.content = '# Hello';
        fileState.isDirty = true;

        await performSave();

        expect(consoleSpy).toHaveBeenCalledWith(
            'Save failed:',
            expect.any(Error),
        );
        expect(fileState.isSaving).toBe(false);
        consoleSpy.mockRestore();
    });
});

describe('scheduleAutoSave', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        if (fileState.saveTimer) clearTimeout(fileState.saveTimer);
        fileState.saveTimer = null;
        fileState.filePath = '';
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('does nothing without filePath', () => {
        const doSave = vi.fn();
        scheduleAutoSave(doSave);
        expect(fileState.saveTimer).toBeNull();
    });

    it('schedules save after delay', () => {
        const doSave = vi.fn();
        fileState.filePath = '/test.md';

        scheduleAutoSave(doSave, 1000);

        expect(fileState.saveTimer).not.toBeNull();
        expect(doSave).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1000);
        expect(doSave).toHaveBeenCalledOnce();
    });

    it('clears previous timer before scheduling new one', () => {
        const doSave1 = vi.fn();
        const doSave2 = vi.fn();
        fileState.filePath = '/test.md';

        scheduleAutoSave(doSave1, 1000);
        scheduleAutoSave(doSave2, 1000);

        vi.advanceTimersByTime(1000);

        // doSave1 should have been cleared, only doSave2 should fire
        expect(doSave2).toHaveBeenCalledOnce();
        expect(doSave1).not.toHaveBeenCalled();
    });

    it('uses custom delay', () => {
        const doSave = vi.fn();
        fileState.filePath = '/test.md';
        scheduleAutoSave(doSave, 500);

        vi.advanceTimersByTime(499);
        expect(doSave).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1);
        expect(doSave).toHaveBeenCalledOnce();
    });
});
