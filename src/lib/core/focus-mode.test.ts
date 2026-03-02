import { describe, it, expect, vi } from 'vitest';

// Mock ProseMirror dependencies
vi.mock('@tiptap/core', () => ({
    Extension: {
        create: vi.fn((config) => {
            // Return a mock extension that exposes storage and commands for testing
            const storage = config.addStorage ? config.addStorage() : {};
            const commands = config.addCommands
                ? config.addCommands.call({ storage })
                : {};
            return {
                ...config,
                storage,
                commands,
            };
        }),
    },
}));

vi.mock('@tiptap/pm/state', () => ({
    Plugin: vi.fn(),
    PluginKey: vi.fn(),
}));

vi.mock('@tiptap/pm/view', () => ({
    Decoration: {
        node: vi.fn(),
    },
    DecorationSet: {
        create: vi.fn(),
        empty: {},
    },
}));

// Import after mocks
import { FocusMode } from './focus-mode';

describe('FocusMode extension', () => {
    it('exports a FocusMode extension', () => {
        expect(FocusMode).toBeDefined();
    });

    it('has the correct name', () => {
        expect(FocusMode.name).toBe('focusMode');
    });

    it('has default storage with enabled = false', () => {
        expect(FocusMode.storage).toBeDefined();
        expect(FocusMode.storage.enabled).toBe(false);
    });

    it('setFocusMode command updates storage', () => {
        const ext = FocusMode as any;
        const setFocusModeCmd = ext.commands.setFocusMode;
        expect(setFocusModeCmd).toBeDefined();

        // Simulate calling the command
        const mockEditor = {
            state: {
                tr: {
                    setMeta: vi.fn().mockReturnThis(),
                },
            },
        };
        const dispatch = vi.fn();

        // Enable focus mode
        const handler = setFocusModeCmd(true);
        handler({ editor: mockEditor, dispatch });
        expect(ext.storage.enabled).toBe(true);

        // Disable focus mode
        const handler2 = setFocusModeCmd(false);
        handler2({ editor: mockEditor, dispatch });
        expect(ext.storage.enabled).toBe(false);
    });

    it('toggleFocusMode command toggles storage', () => {
        const ext = FocusMode as any;
        const toggleCmd = ext.commands.toggleFocusMode;
        expect(toggleCmd).toBeDefined();

        const mockEditor = {
            state: {
                tr: {
                    setMeta: vi.fn().mockReturnThis(),
                },
            },
        };
        const dispatch = vi.fn();

        // Start: enabled = false (from previous test or default)
        ext.storage.enabled = false;

        // Toggle on
        const handler = toggleCmd();
        handler({ editor: mockEditor, dispatch });
        expect(ext.storage.enabled).toBe(true);

        // Toggle off
        const handler2 = toggleCmd();
        handler2({ editor: mockEditor, dispatch });
        expect(ext.storage.enabled).toBe(false);
    });

    it('commands dispatch transaction with meta', () => {
        const ext = FocusMode as any;
        const setTr = vi.fn().mockReturnThis();
        const mockEditor = {
            state: { tr: { setMeta: setTr } },
        };
        const dispatch = vi.fn();

        const handler = ext.commands.setFocusMode(true);
        handler({ editor: mockEditor, dispatch });

        expect(dispatch).toHaveBeenCalledOnce();
        expect(setTr).toHaveBeenCalled();
    });

    it('commands return true on success', () => {
        const ext = FocusMode as any;
        const mockEditor = {
            state: { tr: { setMeta: vi.fn().mockReturnThis() } },
        };
        const dispatch = vi.fn();

        const result = ext.commands.setFocusMode(true)({ editor: mockEditor, dispatch });
        expect(result).toBe(true);

        const result2 = ext.commands.toggleFocusMode()({ editor: mockEditor, dispatch });
        expect(result2).toBe(true);
    });
});
