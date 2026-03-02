import { describe, it, expect, vi } from 'vitest';
import { createCommands, filterCommands, type CommandHandlers, type Command } from './commands';
import { defaultShortcuts } from './shortcutStore';

function makeHandlers(): CommandHandlers {
    return {
        onNew: vi.fn(),
        onOpen: vi.fn(),
        onSave: vi.fn(),
        onSaveAs: vi.fn(),
        onClose: vi.fn(),
        onToggleTheme: vi.fn(),
        onToggleFocusMode: vi.fn(),
        onFind: vi.fn(),
        onGoHome: vi.fn(),
        onSetHeading: vi.fn(),
        onSetParagraph: vi.fn(),
        onToggleBold: vi.fn(),
        onToggleItalic: vi.fn(),
        onToggleStrikethrough: vi.fn(),
        onToggleBlockquote: vi.fn(),
        onToggleBulletList: vi.fn(),
        onToggleOrderedList: vi.fn(),
        onToggleCodeBlock: vi.fn(),
        onInsertHorizontalRule: vi.fn(),
        onOpenShortcutConfig: vi.fn(),
        onCommandPalette: vi.fn(),
        onToggleOutline: vi.fn(),
        onToggleHighlight: vi.fn(),
    };
}

describe('commands - createCommands', () => {
    it('returns a non-empty array of commands', () => {
        const cmds = createCommands(makeHandlers(), defaultShortcuts);
        expect(cmds.length).toBeGreaterThan(0);
    });

    it('every command has required fields', () => {
        const cmds = createCommands(makeHandlers(), defaultShortcuts);
        for (const cmd of cmds) {
            expect(cmd.id).toBeTruthy();
            expect(cmd.label).toBeTruthy();
            expect(cmd.category).toBeTruthy();
            expect(typeof cmd.action).toBe('function');
        }
    });

    it('all command IDs are unique', () => {
        const cmds = createCommands(makeHandlers(), defaultShortcuts);
        const ids = cmds.map((c) => c.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('categories are valid', () => {
        const validCategories = new Set(['File', 'View', 'Format', 'Edit', 'Settings']);
        const cmds = createCommands(makeHandlers(), defaultShortcuts);
        for (const cmd of cmds) {
            expect(validCategories.has(cmd.category)).toBe(true);
        }
    });

    it('every command action calls the mapped handler', () => {
        const handlers = makeHandlers();
        const cmds = createCommands(handlers, defaultShortcuts);

        const handlerMap: Record<string, keyof CommandHandlers> = {
            'custom-shortcuts': 'onOpenShortcutConfig',
            'new-file': 'onNew',
            'open-file': 'onOpen',
            'save': 'onSave',
            'save-as': 'onSaveAs',
            'close': 'onClose',
            'go-home': 'onGoHome',
            'toggle-theme': 'onToggleTheme',
            'toggle-focus-mode': 'onToggleFocusMode',
            'toggle-outline': 'onToggleOutline',
            'find-replace': 'onFind',
            'paragraph': 'onSetParagraph',
            'bold': 'onToggleBold',
            'italic': 'onToggleItalic',
            'strikethrough': 'onToggleStrikethrough',
            'highlight': 'onToggleHighlight',
            'blockquote': 'onToggleBlockquote',
            'bullet-list': 'onToggleBulletList',
            'ordered-list': 'onToggleOrderedList',
            'code-block': 'onToggleCodeBlock',
            'horizontal-rule': 'onInsertHorizontalRule',
        };

        for (const cmd of cmds) {
            cmd.action();
            if (cmd.id.startsWith('heading-')) {
                const level = parseInt(cmd.id.replace('heading-', ''), 10);
                expect(handlers.onSetHeading).toHaveBeenCalledWith(level);
            } else {
                const handlerName = handlerMap[cmd.id];
                expect(handlers[handlerName]).toHaveBeenCalled();
            }
        }
    });

    it('includes commands with shortcut hints', () => {
        const cmds = createCommands(makeHandlers(), defaultShortcuts);
        const withShortcuts = cmds.filter((c) => c.shortcut);
        expect(withShortcuts.length).toBeGreaterThan(5);
    });
});

describe('commands - filterCommands', () => {
    let cmds: Command[];

    beforeEach(() => {
        cmds = createCommands(makeHandlers(), defaultShortcuts);
    });

    it('returns all commands when query is empty', () => {
        expect(filterCommands(cmds, '')).toEqual(cmds);
        expect(filterCommands(cmds, '   ')).toEqual(cmds);
    });

    it('filters by label (case insensitive)', () => {
        const result = filterCommands(cmds, 'bold');
        expect(result.length).toBe(1);
        expect(result[0].id).toBe('bold');
    });

    it('filters by partial match', () => {
        const result = filterCommands(cmds, 'head');
        expect(result.length).toBe(6); // heading-1 through heading-6
        for (let i = 0; i < result.length; i++) {
            expect(result[i].id).toMatch(/^heading-/);
        }
    });

    it('filters by category', () => {
        const result = filterCommands(cmds, 'file');
        expect(result[0].id).toBe('new-file'); // First file command
        const allFile = result.every(
            (c) => c.category === 'File' || c.label.toLowerCase().includes('file'),
        );
        expect(allFile).toBe(true);
    });

    it('supports multi-word fuzzy query', () => {
        const result = filterCommands(cmds, 'toggle dark');
        expect(result.length).toBe(1);
        expect(result[0].id).toBe('toggle-theme');
    });

    it('returns empty array when no match', () => {
        const result = filterCommands(cmds, 'xyznonexistent');
        expect(result.length).toBe(0);
    });

    it('always places custom-shortcuts at the top if it matches the query', () => {
        const result = filterCommands(cmds, 'shortcut');
        expect(result.length).toBe(1);
        expect(result[0].id).toBe('custom-shortcuts');
    });
});
