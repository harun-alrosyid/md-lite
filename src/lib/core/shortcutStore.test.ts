import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { loadShortcuts, saveShortcuts, defaultShortcuts, matchShortcut, formatShortcutForDisplay, STORAGE_KEY } from './shortcutStore';

describe('shortcutStore', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('loadShortcuts', () => {
        it('returns default shortcuts when localStorage is empty', () => {
            const shortcuts = loadShortcuts();
            expect(shortcuts).toEqual(defaultShortcuts);
        });

        it('merges stored shortcuts with defaults', () => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ onNew: 'Ctrl+N' }));
            const shortcuts = loadShortcuts();
            expect(shortcuts.onNew).toBe('Ctrl+N');
            expect(shortcuts.onOpen).toBe(defaultShortcuts.onOpen);
        });

        it('returns defaults if JSON parsing fails', () => {
            localStorage.setItem(STORAGE_KEY, 'invalid json');
            const shortcuts = loadShortcuts();
            expect(shortcuts).toEqual(defaultShortcuts);
            expect(console.error).toHaveBeenCalled();
        });
    });

    describe('saveShortcuts', () => {
        it('saves configuration to localStorage', () => {
            const custom = { ...defaultShortcuts, onNew: 'Alt+N' };
            saveShortcuts(custom);
            const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            expect(stored.onNew).toBe('Alt+N');
        });

        it('handles save errors gracefully', () => {
            const originalSetItem = window.localStorage.setItem;
            vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => { throw new Error('Quota exceeded'); });
            const errorSpy = vi.spyOn(console, 'error');

            expect(() => saveShortcuts(defaultShortcuts)).not.toThrow();
            expect(errorSpy).toHaveBeenCalled();

            window.localStorage.setItem = originalSetItem;
            errorSpy.mockRestore();
        });
    });

    describe('formatShortcutForDisplay', () => {
        it('formats modifier keys to symbols', () => {
            expect(formatShortcutForDisplay('CmdOrCtrl+N')).toBe('⌘+N');
            expect(formatShortcutForDisplay('CmdOrCtrl+Shift+S')).toBe('⌘+⇧+S');
            expect(formatShortcutForDisplay('Alt+Space')).toBe('⌥+Space');
        });
    });

    describe('matchShortcut', () => {
        function makeKeyEvent(key: string, mods: { ctrl?: boolean; meta?: boolean; shift?: boolean; alt?: boolean } = {}) {
            return new KeyboardEvent('keydown', {
                key,
                ctrlKey: mods.ctrl || false,
                metaKey: mods.meta || false,
                shiftKey: mods.shift || false,
                altKey: mods.alt || false,
            });
        }

        it('matches Cmd/Ctrl', () => {
            expect(matchShortcut(makeKeyEvent('n', { meta: true }), 'CmdOrCtrl+N')).toBe(true);
            expect(matchShortcut(makeKeyEvent('n', { ctrl: true }), 'CmdOrCtrl+N')).toBe(true);
            expect(matchShortcut(makeKeyEvent('n'), 'CmdOrCtrl+N')).toBe(false);
            expect(matchShortcut(makeKeyEvent('x', { meta: true }), 'CmdOrCtrl+N')).toBe(false);
        });

        it('matches Shift', () => {
            expect(matchShortcut(makeKeyEvent('S', { meta: true, shift: true }), 'CmdOrCtrl+Shift+S')).toBe(true);
            expect(matchShortcut(makeKeyEvent('s', { meta: true }), 'CmdOrCtrl+Shift+S')).toBe(false);
        });

        it('matches Alt', () => {
            expect(matchShortcut(makeKeyEvent('Space', { alt: true }), 'Alt+Space')).toBe(true);
            expect(matchShortcut(makeKeyEvent('Space'), 'Alt+Space')).toBe(false);
        });

        it('is resilient to logical key casing', () => {
            // Browsers might emit 's' or 'S' depending on caps lock or shift
            // It just compares lowercase under the hood.
            expect(matchShortcut(makeKeyEvent('S', { meta: true, shift: true }), 'CmdOrCtrl+Shift+s')).toBe(true);
            expect(matchShortcut(makeKeyEvent('s', { meta: true, shift: true }), 'CmdOrCtrl+Shift+S')).toBe(true);
        });

        it('requires exact modifiers', () => {
            // Pattern has CmdOrCtrl, but event has Cmd+Alt
            expect(matchShortcut(makeKeyEvent('n', { meta: true, alt: true }), 'CmdOrCtrl+N')).toBe(false);
        });
    });
});
