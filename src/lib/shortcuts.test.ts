import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { invoke } from '@tauri-apps/api/core';
import { open, save } from '@tauri-apps/plugin-dialog';
import { getCurrentWindow } from '@tauri-apps/api/window';
import * as env from './env';

import {
    setupShortcuts,
    openFileDialog,
    createNewFile,
    saveFileAs,
    saveFile,
    renameFile,
    readFile,
    updateRecentMenu,
    shadowSave,
    checkShadowRecovery,
    restoreShadow,
    dismissShadow,
    closeWindow,
    type ShortcutHandlers,
} from './shortcuts';

// Helper to manipulate the isTauri mock dynamically
vi.mock('./env', () => ({
    get isTauri() { return true; },
}));

const MD_FILTERS = [{ name: 'Markdown', extensions: ['md', 'markdown'] }];

describe('shortcuts', () => {
    let handlers: ShortcutHandlers;

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();

        // Ensure default environment is Tauri for backward compatibility
        vi.spyOn(env, 'isTauri', 'get').mockReturnValue(true);

        handlers = {
            onNew: vi.fn(),
            onOpen: vi.fn(),
            onSave: vi.fn(),
            onSaveAs: vi.fn(),
            onClose: vi.fn(),
            onToggleTheme: vi.fn(),
            onFind: vi.fn(),
            onToggleFocusMode: vi.fn(),
            onCommandPalette: vi.fn(),
            onGoHome: vi.fn(),
            onToggleOutline: vi.fn(),
            onSetHeading1: vi.fn(),
        };
    });

    afterEach(() => {
        vi.restoreAllMocks();
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

    describe('setupShortcuts', () => {
        it('registers and invokes correct shortcuts', () => {
            const cleanup = setupShortcuts(handlers);

            dispatchKey('n', { shiftKey: true });
            expect(handlers.onNew).toHaveBeenCalledOnce();

            dispatchKey('o');
            expect(handlers.onOpen).toHaveBeenCalledOnce();

            dispatchKey('s');
            expect(handlers.onSave).toHaveBeenCalledOnce();

            dispatchKey('s', { shiftKey: true });
            expect(handlers.onSaveAs).toHaveBeenCalledOnce();

            dispatchKey('q', { shiftKey: true });
            expect(handlers.onClose).toHaveBeenCalledOnce();

            dispatchKey('d');
            expect(handlers.onToggleTheme).toHaveBeenCalledOnce();

            cleanup();
            dispatchKey('o');
            // Shouldn't increase call count
            expect(handlers.onOpen).toHaveBeenCalledOnce();
        });
    });

    describe('openFileDialog', () => {
        it('Tauri: returns path and content on selection', async () => {
            vi.mocked(open).mockResolvedValue('/test/file.md');
            vi.mocked(invoke).mockResolvedValue('# Hello');

            const result = await openFileDialog();
            expect(result).toEqual({ path: '/test/file.md', content: '# Hello' });
            expect(open).toHaveBeenCalledWith({ multiple: false, filters: MD_FILTERS });
            expect(invoke).toHaveBeenCalledWith('read_file', { path: '/test/file.md' });
        });

        it('Tauri: returns null when dialog cancelled', async () => {
            vi.mocked(open).mockResolvedValue(null);
            const result = await openFileDialog();
            expect(result).toBeNull();
        });

        it('Web: opens virtual file through input element', async () => {
            vi.spyOn(env, 'isTauri', 'get').mockReturnValue(false);

            // Mock document.createElement logic for 'input'
            const mockInput = document.createElement('input');
            const clickSpy = vi.spyOn(mockInput, 'click').mockImplementation(function (this: any) {
                // Simulate onchange handler invoked by the browser
                if (this.onchange) {
                    const mockFile = new File(['# Web Content'], 'webfile.md', { type: 'text/markdown' });
                    Object.defineProperty(this, 'files', { value: [mockFile] });
                    this.onchange({ target: this } as unknown as Event);
                }
            });
            vi.spyOn(document, 'createElement').mockReturnValue(mockInput);

            const result = await openFileDialog();
            expect(clickSpy).toHaveBeenCalled();
            expect(result).toEqual({ path: 'web-import:webfile.md', content: '# Web Content' });
        });

        it('Web: handles cancellation', async () => {
            vi.spyOn(env, 'isTauri', 'get').mockReturnValue(false);
            const mockInput = document.createElement('input');
            const clickSpy = vi.spyOn(mockInput, 'click').mockImplementation(function (this: any) {
                if (this.oncancel) this.oncancel(new Event('cancel'));
            });
            vi.spyOn(document, 'createElement').mockReturnValue(mockInput);

            const result = await openFileDialog();
            expect(result).toBeNull();
        });
    });

    describe('createNewFile', () => {
        it('Tauri: creates and writes empty file', async () => {
            vi.mocked(save).mockResolvedValue('/test/untitled.md');
            const result = await createNewFile();
            expect(result).toBe('/test/untitled.md');
            expect(save).toHaveBeenCalledWith({ filters: MD_FILTERS, defaultPath: 'untitled.md' });
            expect(invoke).toHaveBeenCalledWith('save_file', { path: '/test/untitled.md', content: '' });
        });

        it('Tauri: returns null if dialog cancelled', async () => {
            vi.mocked(save).mockResolvedValue(null);
            const result = await createNewFile();
            expect(result).toBeNull();
        });

        it('Web: creates local storage mock file', async () => {
            vi.spyOn(env, 'isTauri', 'get').mockReturnValue(false);
            vi.spyOn(Date, 'now').mockReturnValue(123456);

            const result = await createNewFile();
            expect(result).toBe('web:123456-untitled.md');
            expect(localStorage.getItem('md-lite-file-web:123456-untitled.md')).toBe('');
        });
    });

    describe('saveFileAs', () => {
        it('Tauri: saves content to new path', async () => {
            vi.mocked(save).mockResolvedValue('/test/saved.md');
            const result = await saveFileAs('# New Data', 'old.md');
            expect(result).toBe('/test/saved.md');
            expect(save).toHaveBeenCalledWith({ filters: MD_FILTERS, defaultPath: 'old.md' });
            expect(invoke).toHaveBeenCalledWith('save_file', { path: '/test/saved.md', content: '# New Data' });
        });

        it('Web: triggers HTML download', async () => {
            vi.spyOn(env, 'isTauri', 'get').mockReturnValue(false);

            const mockAnchor = document.createElement('a');
            const clickSpy = vi.spyOn(mockAnchor, 'click').mockImplementation(() => { });
            vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor);
            globalThis.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock');
            globalThis.URL.revokeObjectURL = vi.fn();

            const result = await saveFileAs('# Web Save', 'web-import:doc.md');

            expect(result).toBe('web:doc.md');
            expect(mockAnchor.download).toBe('doc.md');
            expect(mockAnchor.href).toBe('blob:mock');
            expect(clickSpy).toHaveBeenCalled();
            expect(localStorage.getItem('md-lite-file-web:doc.md')).toBe('# Web Save');
        });
    });

    describe('saveFile', () => {
        it('Tauri: invokes save_file command', async () => {
            await saveFile('/test.md', '# Data');
            expect(invoke).toHaveBeenCalledWith('save_file', { path: '/test.md', content: '# Data' });
        });

        it('Web: saves to localStorage', async () => {
            vi.spyOn(env, 'isTauri', 'get').mockReturnValue(false);
            await saveFile('web:doc.md', '# Data');
            expect(localStorage.getItem('md-lite-file-web:doc.md')).toBe('# Data');
        });
    });

    describe('renameFile', () => {
        it('Tauri: invokes rename command and returns new path', async () => {
            const result = await renameFile('/docs/old.md', 'new.md');
            expect(result).toBe('/docs/new.md');
            expect(invoke).toHaveBeenCalledWith('rename_file', { oldPath: '/docs/old.md', newPath: '/docs/new.md' });
        });

        it('Web: migrates data to new localStorage key', async () => {
            vi.spyOn(env, 'isTauri', 'get').mockReturnValue(false);
            localStorage.setItem('md-lite-file-web:old.md', '# Data');

            const result = await renameFile('web:old.md', 'new.md');
            expect(result).toBe('web:new.md');
            expect(localStorage.getItem('md-lite-file-web:new.md')).toBe('# Data');
            expect(localStorage.getItem('md-lite-file-web:old.md')).toBeNull();
        });
    });

    describe('readFile', () => {
        it('Tauri: invokes read_file command', async () => {
            vi.mocked(invoke).mockResolvedValue('# File Data');
            const result = await readFile('/test.md');
            expect(result).toBe('# File Data');
        });

        it('Web: reads from localStorage', async () => {
            vi.spyOn(env, 'isTauri', 'get').mockReturnValue(false);
            localStorage.setItem('md-lite-file-web:test.md', '# Local');
            const result = await readFile('web:test.md');
            expect(result).toBe('# Local');
        });
    });

    describe('updateRecentMenu', () => {
        it('Tauri: passes paths to native rust bridge', async () => {
            await updateRecentMenu(['/test.md'], ['test.md']);
            expect(invoke).toHaveBeenCalledWith('update_recent_menu', { paths: ['/test.md'], names: ['test.md'] });
        });

        it('Web: bypasses gracefully', async () => {
            vi.spyOn(env, 'isTauri', 'get').mockReturnValue(false);
            await updateRecentMenu(['/test.md'], ['test.md']);
            expect(invoke).not.toHaveBeenCalled();
        });
    });

    describe('shadow saves', () => {
        it('Tauri: shadowSave writes to native buffer', async () => {
            await shadowSave('/path.md', 'draft');
            expect(invoke).toHaveBeenCalledWith('shadow_save', { path: '/path.md', content: 'draft' });
        });

        it('Web: shadowSave writes to localStorage', async () => {
            vi.spyOn(env, 'isTauri', 'get').mockReturnValue(false);
            await shadowSave('web:path.md', 'draft');

            const shadow = JSON.parse(localStorage.getItem('md-lite-shadow-recovery')!);
            expect(shadow.original_path).toBe('web:path.md');
            expect(shadow.shadow_content).toBe('draft');
            expect(shadow.shadow_modified).toBeGreaterThan(0);
        });

        it('Tauri: checkShadowRecovery retrieves native buffer', async () => {
            vi.mocked(invoke).mockResolvedValue({ original_path: '/path.md', shadow_content: 'draft' });
            const result = await checkShadowRecovery();
            expect(result).toEqual({ original_path: '/path.md', shadow_content: 'draft' });
        });

        it('Web: checkShadowRecovery reads from localStorage', async () => {
            vi.spyOn(env, 'isTauri', 'get').mockReturnValue(false);
            localStorage.setItem('md-lite-shadow-recovery', JSON.stringify({ original_path: 'p', shadow_content: 'c' }));

            const result = await checkShadowRecovery();
            expect(result?.original_path).toBe('p');
        });

        it('Tauri: restoreShadow delegates to native', async () => {
            vi.mocked(invoke).mockResolvedValue('restored content');
            const result = await restoreShadow('/path.md');
            expect(result).toBe('restored content');
            expect(invoke).toHaveBeenCalledWith('restore_shadow', { targetPath: '/path.md' });
        });

        it('Web: restoreShadow restores from localStorage map and cleans up', async () => {
            vi.spyOn(env, 'isTauri', 'get').mockReturnValue(false);
            localStorage.setItem('md-lite-shadow-recovery', JSON.stringify({ original_path: 'web:path.md', shadow_content: 'draft' }));

            const result = await restoreShadow('web:path.md');

            expect(result).toBe('draft');
            expect(localStorage.getItem('md-lite-file-web:path.md')).toBe('draft');
            expect(localStorage.getItem('md-lite-shadow-recovery')).toBeNull();
        });

        it('Tauri: dismissShadow drops native', async () => {
            await dismissShadow();
            expect(invoke).toHaveBeenCalledWith('dismiss_shadow');
        });

        it('Web: dismissShadow drops local buffer', async () => {
            vi.spyOn(env, 'isTauri', 'get').mockReturnValue(false);
            localStorage.setItem('md-lite-shadow-recovery', 'junk');
            await dismissShadow();
            expect(localStorage.getItem('md-lite-shadow-recovery')).toBeNull();
        });
    });

    describe('closeWindow', () => {
        it('Tauri: gets current window and invokes close', async () => {
            await closeWindow();
            expect(getCurrentWindow).toHaveBeenCalled();
            const mockWin = getCurrentWindow();
            expect(mockWin.close).toHaveBeenCalled();
        });

        it('Web: no-ops', async () => {
            vi.spyOn(env, 'isTauri', 'get').mockReturnValue(false);
            await closeWindow();
            expect(getCurrentWindow).not.toHaveBeenCalled();
        });
    });
});
