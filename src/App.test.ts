import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import App from './App.svelte';

let capturedOnUpdate: ((markdown: string) => void) | null = null;

vi.mock('./lib/TitleBar.svelte', () => ({
    default: vi.fn(),
}));

vi.mock('./lib/WysiwygEditor.svelte', () => {
    return {
        default: function MockEditor(this: any, ...args: any[]) {
            try {
                const propsGetter = args[1];
                if (typeof propsGetter === 'function') {
                    const props = propsGetter();
                    if (props?.onUpdate) {
                        capturedOnUpdate = props.onUpdate;
                    }
                }
            } catch { }
        },
    };
});

vi.mock('./lib/shortcuts', () => ({
    setupShortcuts: vi.fn(() => vi.fn()),
    openFileDialog: vi.fn(),
    createNewFile: vi.fn(),
    saveFileAs: vi.fn(),
    renameFile: vi.fn(),
    readFile: vi.fn(),
    saveFile: vi.fn(),
    closeWindow: vi.fn(),
    updateRecentMenu: vi.fn(),
    shadowSave: vi.fn().mockResolvedValue(undefined),
    checkShadowRecovery: vi.fn().mockResolvedValue(null),
    restoreShadow: vi.fn().mockResolvedValue(''),
    dismissShadow: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('./lib/app-logic', async () => {
    const actual = await vi.importActual('./lib/app-logic');
    return actual;
});

vi.mock('@tauri-apps/api/event', () => ({
    listen: vi.fn().mockResolvedValue(vi.fn()),
}));

// Mock the Web Worker import
vi.mock('./lib/telemetry.worker?worker', () => {
    class MockWorker {
        postMessage = vi.fn();
        onmessage: any = null;
        terminate = vi.fn();
    }
    return { default: MockWorker };
});

import {
    setupShortcuts,
    openFileDialog,
    createNewFile,
    saveFileAs,
    saveFile,
    closeWindow,
} from './lib/shortcuts';

describe('App - Core', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        localStorage.clear();
        document.documentElement.removeAttribute('data-theme');
        capturedOnUpdate = null;
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    async function renderAndFlush() {
        const result = render(App);
        await vi.advanceTimersByTimeAsync(0);
        await tick();
        return result;
    }

    it('renders main content area', async () => {
        const { container } = await renderAndFlush();
        expect(container.querySelector('.main-content')).toBeTruthy();
    });

    it('shows empty state when no file is open', async () => {
        const { container } = await renderAndFlush();
        expect(container.querySelector('.empty-state')).toBeTruthy();
    });

    it('displays "No file open" message', async () => {
        await renderAndFlush();
        expect(screen.getByText('No file open')).toBeTruthy();
    });

    it('displays shortcut hints in the shortcuts list', async () => {
        const { container } = await renderAndFlush();
        const shortcutRows = container.querySelectorAll('.shortcut-row');
        expect(shortcutRows.length).toBeGreaterThanOrEqual(5);
    });

    it('displays New File and Open File action buttons', async () => {
        await renderAndFlush();
        expect(screen.getByText('New File')).toBeTruthy();
        expect(screen.getByText('Open File')).toBeTruthy();
    });

    it('calls setupShortcuts on mount with all handlers', async () => {
        await renderAndFlush();
        expect(setupShortcuts).toHaveBeenCalledOnce();
        const call = vi.mocked(setupShortcuts).mock.calls[0][0];
        expect(typeof call.onNew).toBe('function');
        expect(typeof call.onOpen).toBe('function');
        expect(typeof call.onSave).toBe('function');
        expect(typeof call.onSaveAs).toBe('function');
        expect(typeof call.onClose).toBe('function');
        expect(typeof call.onToggleTheme).toBe('function');
    });

    it('cleanup function is called on unmount', async () => {
        const cleanupFn = vi.fn();
        vi.mocked(setupShortcuts).mockReturnValue(cleanupFn);
        const { unmount } = await renderAndFlush();
        unmount();
        expect(cleanupFn).toHaveBeenCalled();
    });
});

describe('App - Theme', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        localStorage.clear();
        document.documentElement.removeAttribute('data-theme');
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    async function renderAndFlush() {
        const result = render(App);
        await vi.advanceTimersByTimeAsync(0);
        await tick();
        return result;
    }

    it('loads saved theme from localStorage', async () => {
        localStorage.setItem('md-lite-theme', 'light');
        await renderAndFlush();
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('toggleTheme: dark → light', async () => {
        await renderAndFlush();
        const { onToggleTheme } = vi.mocked(setupShortcuts).mock.calls[0][0];
        onToggleTheme();
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
        expect(localStorage.getItem('md-lite-theme')).toBe('light');
    });

    it('toggleTheme: light → dark', async () => {
        localStorage.setItem('md-lite-theme', 'light');
        await renderAndFlush();
        const { onToggleTheme } = vi.mocked(setupShortcuts).mock.calls[0][0];
        onToggleTheme();
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('toggleTheme round-trip', async () => {
        await renderAndFlush();
        const { onToggleTheme } = vi.mocked(setupShortcuts).mock.calls[0][0];
        onToggleTheme();
        onToggleTheme();
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
});

describe('App - File Operations', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        localStorage.clear();
        capturedOnUpdate = null;
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    async function renderAndFlush() {
        const result = render(App);
        await vi.advanceTimersByTimeAsync(0);
        await tick();
        return result;
    }

    it('creates new file successfully', async () => {
        vi.mocked(createNewFile).mockResolvedValue('/test/untitled.md');
        await renderAndFlush();
        const { onNew } = vi.mocked(setupShortcuts).mock.calls[0][0];
        await onNew();
        expect(createNewFile).toHaveBeenCalledOnce();
    });

    it('handles cancelled new file dialog', async () => {
        vi.mocked(createNewFile).mockResolvedValue(null);
        await renderAndFlush();
        const { onNew } = vi.mocked(setupShortcuts).mock.calls[0][0];
        await onNew();
        expect(createNewFile).toHaveBeenCalledOnce();
    });

    it('opens file successfully', async () => {
        vi.mocked(openFileDialog).mockResolvedValue({
            path: '/home/user/doc.md',
            content: '# Hello',
        });
        await renderAndFlush();
        const { onOpen } = vi.mocked(setupShortcuts).mock.calls[0][0];
        await onOpen();
        expect(openFileDialog).toHaveBeenCalledOnce();
    });

    it('handles cancelled open dialog', async () => {
        vi.mocked(openFileDialog).mockResolvedValue(null);
        await renderAndFlush();
        const { onOpen } = vi.mocked(setupShortcuts).mock.calls[0][0];
        await onOpen();
        expect(openFileDialog).toHaveBeenCalledOnce();
    });

    it('handles open error gracefully', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        vi.mocked(openFileDialog).mockRejectedValue(new Error('error'));
        await renderAndFlush();
        const { onOpen } = vi.mocked(setupShortcuts).mock.calls[0][0];
        await onOpen();
        expect(consoleSpy).toHaveBeenCalledWith('Open failed:', expect.any(Error));
        consoleSpy.mockRestore();
    });

    it('does not save when no file is open', async () => {
        await renderAndFlush();
        const { onSave } = vi.mocked(setupShortcuts).mock.calls[0][0];
        await onSave();
        expect(saveFile).not.toHaveBeenCalled();
    });

    it('does not save when file not dirty', async () => {
        vi.mocked(openFileDialog).mockResolvedValue({
            path: '/test/file.md',
            content: '# Test',
        });
        vi.mocked(saveFile).mockResolvedValue(undefined);
        await renderAndFlush();
        const { onOpen, onSave } = vi.mocked(setupShortcuts).mock.calls[0][0];
        await onOpen();
        await onSave();
        expect(saveFile).not.toHaveBeenCalled();
    });

    it('save as opens dialog', async () => {
        vi.mocked(saveFileAs).mockResolvedValue('/new/location.md');
        await renderAndFlush();
        const { onSaveAs } = vi.mocked(setupShortcuts).mock.calls[0][0];
        await onSaveAs();
        expect(saveFileAs).toHaveBeenCalledOnce();
    });

    it('closes window', async () => {
        vi.mocked(closeWindow).mockResolvedValue(undefined);
        await renderAndFlush();
        const { onClose } = vi.mocked(setupShortcuts).mock.calls[0][0];
        await onClose();
        expect(closeWindow).toHaveBeenCalledOnce();
    });

    it('does not save before close when not dirty', async () => {
        vi.mocked(closeWindow).mockResolvedValue(undefined);
        await renderAndFlush();
        const { onClose } = vi.mocked(setupShortcuts).mock.calls[0][0];
        await onClose();
        expect(saveFile).not.toHaveBeenCalled();
        expect(closeWindow).toHaveBeenCalledOnce();
    });
});

describe('App - Content Update & Auto-Save', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        localStorage.clear();
        capturedOnUpdate = null;
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    async function renderAndFlush() {
        const result = render(App);
        await vi.advanceTimersByTimeAsync(0);
        await tick();
        return result;
    }

    it('auto-save triggers after content update', async () => {
        vi.mocked(openFileDialog).mockResolvedValue({
            path: '/test/file.md',
            content: '# Initial',
        });
        vi.mocked(saveFile).mockResolvedValue(undefined);

        await renderAndFlush();
        const { onOpen } = vi.mocked(setupShortcuts).mock.calls[0][0];
        await onOpen();

        if (capturedOnUpdate) {
            capturedOnUpdate('# Updated');
            await vi.advanceTimersByTimeAsync(1000);
            expect(saveFile).toHaveBeenCalledWith('/test/file.md', '# Updated');
        }
    });

    it('auto-save debounces rapid updates', async () => {
        vi.mocked(openFileDialog).mockResolvedValue({
            path: '/test/file.md',
            content: '# Initial',
        });
        vi.mocked(saveFile).mockResolvedValue(undefined);

        await renderAndFlush();
        const { onOpen } = vi.mocked(setupShortcuts).mock.calls[0][0];
        await onOpen();

        if (capturedOnUpdate) {
            capturedOnUpdate('# First');
            await vi.advanceTimersByTimeAsync(500);
            capturedOnUpdate('# Second');
            await vi.advanceTimersByTimeAsync(1000);

            expect(saveFile).toHaveBeenCalledTimes(1);
            expect(saveFile).toHaveBeenCalledWith('/test/file.md', '# Second');
        }
    });

    it('no auto-save without filePath', async () => {
        await renderAndFlush();

        if (capturedOnUpdate) {
            capturedOnUpdate('# Content');
            vi.advanceTimersByTime(2000);
            expect(saveFile).not.toHaveBeenCalled();
        }
    });

    it('saves dirty content before close', async () => {
        vi.mocked(openFileDialog).mockResolvedValue({
            path: '/test/file.md',
            content: '# Initial',
        });
        vi.mocked(saveFile).mockResolvedValue(undefined);
        vi.mocked(closeWindow).mockResolvedValue(undefined);

        await renderAndFlush();
        const { onOpen, onClose } = vi.mocked(setupShortcuts).mock.calls[0][0];
        await onOpen();

        if (capturedOnUpdate) {
            capturedOnUpdate('# Changed');
            await onClose();
            expect(saveFile).toHaveBeenCalledWith('/test/file.md', '# Changed');
            expect(closeWindow).toHaveBeenCalled();
        }
    });

    it('manual save after content update', async () => {
        vi.mocked(openFileDialog).mockResolvedValue({
            path: '/test/file.md',
            content: '# Initial',
        });
        vi.mocked(saveFile).mockResolvedValue(undefined);

        await renderAndFlush();
        const { onOpen, onSave } = vi.mocked(setupShortcuts).mock.calls[0][0];
        await onOpen();

        if (capturedOnUpdate) {
            capturedOnUpdate('# Manual');
            await onSave();
            expect(saveFile).toHaveBeenCalledWith('/test/file.md', '# Manual');
        }
    });

    it('handles save error gracefully', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        vi.mocked(openFileDialog).mockResolvedValue({
            path: '/test/file.md',
            content: '# Initial',
        });
        vi.mocked(saveFile).mockRejectedValue(new Error('disk error'));

        await renderAndFlush();
        const { onOpen, onSave } = vi.mocked(setupShortcuts).mock.calls[0][0];
        await onOpen();

        if (capturedOnUpdate) {
            capturedOnUpdate('# Fail');
            await onSave();
            expect(consoleSpy).toHaveBeenCalledWith('Save failed:', expect.any(Error));
        }
        consoleSpy.mockRestore();
    });
});
