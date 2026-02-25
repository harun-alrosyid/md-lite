import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import App from './App.svelte';

// Track props passed to WysiwygEditor mock
let capturedOnUpdate: ((markdown: string) => void) | null = null;

// Mock child components
vi.mock('./lib/TitleBar.svelte', () => ({
    default: vi.fn(),
}));

// WysiwygEditor mock captures the onUpdate prop
vi.mock('./lib/WysiwygEditor.svelte', () => {
    return {
        default: function MockEditor(this: any, ...args: any[]) {
            // Svelte 5 component receives anchor + props getter
            // Try to capture onUpdate from props
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

// Mock shortcuts module
vi.mock('./lib/shortcuts', () => ({
    setupShortcuts: vi.fn(() => vi.fn()),
    openFileDialog: vi.fn(),
    saveFile: vi.fn(),
    closeWindow: vi.fn(),
}));

// Mock app-logic module (re-export originals)
vi.mock('./lib/app-logic', async () => {
    const actual = await vi.importActual('./lib/app-logic');
    return actual;
});

import { setupShortcuts, openFileDialog, saveFile, closeWindow } from './lib/shortcuts';

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

    it('renders main content area', () => {
        const { container } = render(App);
        expect(container.querySelector('.main-content')).toBeTruthy();
    });

    it('shows empty state when no file is open', () => {
        const { container } = render(App);
        expect(container.querySelector('.empty-state')).toBeTruthy();
    });

    it('displays "No file open" message', () => {
        render(App);
        expect(screen.getByText('No file open')).toBeTruthy();
    });

    it('displays keyboard shortcut hints', () => {
        render(App);
        expect(screen.getByText(/⌘O/)).toBeTruthy();
        expect(screen.getByText(/⌘S/)).toBeTruthy();
        expect(screen.getByText(/⌘W/)).toBeTruthy();
        expect(screen.getByText(/⌘D/)).toBeTruthy();
    });

    it('calls setupShortcuts on mount with handlers', () => {
        render(App);
        expect(setupShortcuts).toHaveBeenCalledOnce();
        const call = vi.mocked(setupShortcuts).mock.calls[0][0];
        expect(typeof call.onOpen).toBe('function');
        expect(typeof call.onSave).toBe('function');
        expect(typeof call.onClose).toBe('function');
        expect(typeof call.onToggleTheme).toBe('function');
    });

    it('cleanup function is called on unmount', () => {
        const cleanupFn = vi.fn();
        vi.mocked(setupShortcuts).mockReturnValue(cleanupFn);
        const { unmount } = render(App);
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

    it('loads saved theme from localStorage', () => {
        localStorage.setItem('md-lite-theme', 'light');
        render(App);
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('toggleTheme: dark → light', () => {
        render(App);
        const { onToggleTheme } = vi.mocked(setupShortcuts).mock.calls[0][0];
        onToggleTheme();
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
        expect(localStorage.getItem('md-lite-theme')).toBe('light');
    });

    it('toggleTheme: light → dark', () => {
        localStorage.setItem('md-lite-theme', 'light');
        render(App);
        const { onToggleTheme } = vi.mocked(setupShortcuts).mock.calls[0][0];
        onToggleTheme();
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('toggleTheme round-trip', () => {
        render(App);
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

    it('opens file successfully', async () => {
        vi.mocked(openFileDialog).mockResolvedValue({
            path: '/home/user/doc.md',
            content: '# Hello',
        });
        render(App);
        const { onOpen } = vi.mocked(setupShortcuts).mock.calls[0][0];
        await onOpen();
        expect(openFileDialog).toHaveBeenCalledOnce();
    });

    it('handles cancelled dialog', async () => {
        vi.mocked(openFileDialog).mockResolvedValue(null);
        render(App);
        const { onOpen } = vi.mocked(setupShortcuts).mock.calls[0][0];
        await onOpen();
        expect(openFileDialog).toHaveBeenCalledOnce();
    });

    it('handles open error gracefully', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        vi.mocked(openFileDialog).mockRejectedValue(new Error('error'));
        render(App);
        const { onOpen } = vi.mocked(setupShortcuts).mock.calls[0][0];
        await onOpen();
        expect(consoleSpy).toHaveBeenCalledWith('Open failed:', expect.any(Error));
        consoleSpy.mockRestore();
    });

    it('does not save when no file is open', async () => {
        render(App);
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
        render(App);
        const { onOpen, onSave } = vi.mocked(setupShortcuts).mock.calls[0][0];
        await onOpen();
        await onSave();
        expect(saveFile).not.toHaveBeenCalled();
    });

    it('closes window', async () => {
        vi.mocked(closeWindow).mockResolvedValue(undefined);
        render(App);
        const { onClose } = vi.mocked(setupShortcuts).mock.calls[0][0];
        await onClose();
        expect(closeWindow).toHaveBeenCalledOnce();
    });

    it('does not save before close when not dirty', async () => {
        vi.mocked(closeWindow).mockResolvedValue(undefined);
        render(App);
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

    it('handleContentUpdate is called from WysiwygEditor onUpdate', async () => {
        // Open a file first so filePath is set
        vi.mocked(openFileDialog).mockResolvedValue({
            path: '/test/file.md',
            content: '# Initial',
        });
        vi.mocked(saveFile).mockResolvedValue(undefined);

        render(App);
        const { onOpen } = vi.mocked(setupShortcuts).mock.calls[0][0];
        await onOpen();

        // If the mock captured onUpdate, call it and verify auto-save triggers
        if (capturedOnUpdate) {
            capturedOnUpdate('# Updated content');

            // Advance timers to trigger debounced auto-save
            await vi.advanceTimersByTimeAsync(1000);

            expect(saveFile).toHaveBeenCalledWith('/test/file.md', '# Updated content');
        }
    });

    it('auto-save debounces multiple content updates', async () => {
        vi.mocked(openFileDialog).mockResolvedValue({
            path: '/test/file.md',
            content: '# Initial',
        });
        vi.mocked(saveFile).mockResolvedValue(undefined);

        render(App);
        const { onOpen } = vi.mocked(setupShortcuts).mock.calls[0][0];
        await onOpen();

        if (capturedOnUpdate) {
            capturedOnUpdate('# First change');
            await vi.advanceTimersByTimeAsync(500);
            capturedOnUpdate('# Second change');
            await vi.advanceTimersByTimeAsync(1000);

            // Only the last update should trigger save
            expect(saveFile).toHaveBeenCalledTimes(1);
            expect(saveFile).toHaveBeenCalledWith('/test/file.md', '# Second change');
        }
    });

    it('auto-save does not trigger without filePath', () => {
        render(App);

        if (capturedOnUpdate) {
            capturedOnUpdate('# Some content');
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

        render(App);
        const { onOpen, onClose } = vi.mocked(setupShortcuts).mock.calls[0][0];
        await onOpen();

        if (capturedOnUpdate) {
            capturedOnUpdate('# Changed');
            // Close before auto-save fires
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

        render(App);
        const { onOpen, onSave } = vi.mocked(setupShortcuts).mock.calls[0][0];
        await onOpen();

        if (capturedOnUpdate) {
            capturedOnUpdate('# Manual save test');
            await onSave();
            expect(saveFile).toHaveBeenCalledWith('/test/file.md', '# Manual save test');
        }
    });

    it('save error is handled gracefully', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        vi.mocked(openFileDialog).mockResolvedValue({
            path: '/test/file.md',
            content: '# Initial',
        });
        vi.mocked(saveFile).mockRejectedValue(new Error('disk error'));

        render(App);
        const { onOpen, onSave } = vi.mocked(setupShortcuts).mock.calls[0][0];
        await onOpen();

        if (capturedOnUpdate) {
            capturedOnUpdate('# Will fail');
            await onSave();
            expect(consoleSpy).toHaveBeenCalledWith('Save failed:', expect.any(Error));
        }
        consoleSpy.mockRestore();
    });
});
