import { describe, it, expect, vi } from 'vitest';
import { createCommands, filterCommands, type CommandHandlers, type Command } from './commands';

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
        onToggleHighlight: vi.fn(),
    };
}

describe('commands - createCommands', () => {
    it('returns a non-empty array of commands', () => {
        const cmds = createCommands(makeHandlers());
        expect(cmds.length).toBeGreaterThan(0);
    });

    it('every command has required fields', () => {
        const cmds = createCommands(makeHandlers());
        for (const cmd of cmds) {
            expect(cmd.id).toBeTruthy();
            expect(cmd.label).toBeTruthy();
            expect(cmd.category).toBeTruthy();
            expect(typeof cmd.action).toBe('function');
        }
    });

    it('all command IDs are unique', () => {
        const cmds = createCommands(makeHandlers());
        const ids = cmds.map((c) => c.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('categories are valid', () => {
        const validCategories = new Set(['File', 'View', 'Format', 'Edit']);
        const cmds = createCommands(makeHandlers());
        for (const cmd of cmds) {
            expect(validCategories.has(cmd.category)).toBe(true);
        }
    });

    it('new-file command calls onNew handler', () => {
        const handlers = makeHandlers();
        const cmds = createCommands(handlers);
        const cmd = cmds.find((c) => c.id === 'new-file');
        expect(cmd).toBeDefined();
        cmd!.action();
        expect(handlers.onNew).toHaveBeenCalledOnce();
    });

    it('toggle-focus-mode command calls onToggleFocusMode', () => {
        const handlers = makeHandlers();
        const cmds = createCommands(handlers);
        const cmd = cmds.find((c) => c.id === 'toggle-focus-mode');
        expect(cmd).toBeDefined();
        cmd!.action();
        expect(handlers.onToggleFocusMode).toHaveBeenCalledOnce();
    });

    it('heading commands pass correct level', () => {
        const handlers = makeHandlers();
        const cmds = createCommands(handlers);

        for (let level = 1; level <= 6; level++) {
            const cmd = cmds.find((c) => c.id === `heading-${level}`);
            expect(cmd).toBeDefined();
            cmd!.action();
            expect(handlers.onSetHeading).toHaveBeenCalledWith(level);
        }
    });

    it('includes commands with shortcut hints', () => {
        const cmds = createCommands(makeHandlers());
        const withShortcuts = cmds.filter((c) => c.shortcut);
        expect(withShortcuts.length).toBeGreaterThan(5);
    });
});

describe('commands - filterCommands', () => {
    let cmds: Command[];

    beforeEach(() => {
        cmds = createCommands(makeHandlers());
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
        for (const cmd of result) {
            expect(cmd.id).toMatch(/^heading-/);
        }
    });

    it('filters by category', () => {
        const result = filterCommands(cmds, 'file');
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
});
