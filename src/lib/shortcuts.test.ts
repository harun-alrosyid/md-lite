import { describe, it, expect, vi, beforeEach } from 'vitest';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import { getCurrentWindow } from '@tauri-apps/api/window';
import {
    setupShortcuts,
    openFileDialog,
    saveFile,
    closeWindow,
    type ShortcutHandlers,
} from './shortcuts';

describe('setupShortcuts', () => {
    let handlers: ShortcutHandlers;

    beforeEach(() => {
        handlers = {
            onNew: vi.fn(),
            onOpen: vi.fn(),
            onSave: vi.fn(),
            onSaveAs: vi.fn(),
            onClose: vi.fn(),
            onToggleTheme: vi.fn(),
        };
    });

    function dispatchKey(key: string, opts: Partial<KeyboardEvent> = {}) {
        const event = new KeyboardEvent('keydown', {
            key,
            metaKey: true,
            bubbles: true,
            cancelable: true,
            ...opts,
        });
        window.dispatchEvent(event);
        return event;
    }

    it('calls onNew on Cmd+N', () => {
        const cleanup = setupShortcuts(handlers);
        dispatchKey('n');
        expect(handlers.onNew).toHaveBeenCalledOnce();
        cleanup();
    });

    it('calls onOpen on Cmd+O', () => {
        const cleanup = setupShortcuts(handlers);
        dispatchKey('o');
        expect(handlers.onOpen).toHaveBeenCalledOnce();
        cleanup();
    });

    it('calls onSave on Cmd+S', () => {
        const cleanup = setupShortcuts(handlers);
        dispatchKey('s');
        expect(handlers.onSave).toHaveBeenCalledOnce();
        cleanup();
    });

    it('calls onSaveAs on Cmd+Shift+S', () => {
        const cleanup = setupShortcuts(handlers);
        dispatchKey('s', { shiftKey: true });
        expect(handlers.onSaveAs).toHaveBeenCalledOnce();
        expect(handlers.onSave).not.toHaveBeenCalled();
        cleanup();
    });

    it('calls onClose on Cmd+W', () => {
        const cleanup = setupShortcuts(handlers);
        dispatchKey('w');
        expect(handlers.onClose).toHaveBeenCalledOnce();
        cleanup();
    });

    it('calls onToggleTheme on Cmd+D', () => {
        const cleanup = setupShortcuts(handlers);
        dispatchKey('d');
        expect(handlers.onToggleTheme).toHaveBeenCalledOnce();
        cleanup();
    });

    it('calls onOpen on Ctrl+O', () => {
        const cleanup = setupShortcuts(handlers);
        dispatchKey('o', { metaKey: false, ctrlKey: true });
        expect(handlers.onOpen).toHaveBeenCalledOnce();
        cleanup();
    });

    it('does nothing without modifier key', () => {
        const cleanup = setupShortcuts(handlers);
        dispatchKey('o', { metaKey: false, ctrlKey: false });
        expect(handlers.onOpen).not.toHaveBeenCalled();
        cleanup();
    });

    it('does nothing for unrecognized mod+key', () => {
        const cleanup = setupShortcuts(handlers);
        dispatchKey('x');
        expect(handlers.onOpen).not.toHaveBeenCalled();
        expect(handlers.onSave).not.toHaveBeenCalled();
        expect(handlers.onClose).not.toHaveBeenCalled();
        expect(handlers.onToggleTheme).not.toHaveBeenCalled();
        cleanup();
    });

    it('handles uppercase key input', () => {
        const cleanup = setupShortcuts(handlers);
        dispatchKey('O');
        expect(handlers.onOpen).toHaveBeenCalledOnce();
        cleanup();
    });

    it('cleanup removes listener', () => {
        const cleanup = setupShortcuts(handlers);
        cleanup();
        dispatchKey('o');
        expect(handlers.onOpen).not.toHaveBeenCalled();
    });
});

describe('openFileDialog', () => {
    beforeEach(() => {
        vi.mocked(open).mockReset();
        vi.mocked(invoke).mockReset();
    });

    it('returns path and content on selection', async () => {
        vi.mocked(open).mockResolvedValue('/test/file.md');
        vi.mocked(invoke).mockResolvedValue('# Hello');

        const result = await openFileDialog();

        expect(result).toEqual({ path: '/test/file.md', content: '# Hello' });
        expect(invoke).toHaveBeenCalledWith('read_file', { path: '/test/file.md' });
    });

    it('returns null when user cancels', async () => {
        vi.mocked(open).mockResolvedValue(null);

        const result = await openFileDialog();

        expect(result).toBeNull();
        expect(invoke).not.toHaveBeenCalled();
    });

    it('passes correct filter options', async () => {
        vi.mocked(open).mockResolvedValue(null);

        await openFileDialog();

        expect(open).toHaveBeenCalledWith({
            multiple: false,
            filters: [
                {
                    name: 'Markdown',
                    extensions: ['md', 'markdown'],
                },
            ],
        });
    });
});

describe('saveFile', () => {
    beforeEach(() => {
        vi.mocked(invoke).mockReset();
    });

    it('calls invoke with save_file and correct args', async () => {
        vi.mocked(invoke).mockResolvedValue(undefined);

        await saveFile('/test/file.md', '# Content');

        expect(invoke).toHaveBeenCalledWith('save_file', {
            path: '/test/file.md',
            content: '# Content',
        });
    });
});

describe('closeWindow', () => {
    beforeEach(() => {
        vi.mocked(getCurrentWindow).mockClear();
        const mockWin = getCurrentWindow();
        vi.mocked(mockWin.close).mockClear();
    });

    it('gets current window and calls close', async () => {
        await closeWindow();

        expect(getCurrentWindow).toHaveBeenCalled();
        const mockWin = getCurrentWindow();
        expect(mockWin.close).toHaveBeenCalled();
    });
});
