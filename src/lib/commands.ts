/**
 * Command registry for MD-Lite Command Palette.
 *
 * Each command has an id, label, optional shortcut hint,
 * category, and the action callback.
 */

export interface Command {
    id: string;
    label: string;
    shortcut?: string;
    category: "File" | "View" | "Format" | "Edit" | "Settings";
    action: () => void;
}

export interface CommandHandlers {
    onNew: () => void;
    onOpen: () => void;
    onSave: () => void;
    onSaveAs: () => void;
    onClose: () => void;
    onToggleTheme: () => void;
    onToggleFocusMode: () => void;
    onFind: () => void;
    onGoHome: () => void;
    onCommandPalette: () => void;
    onOpenShortcutConfig: () => void;
    onSetHeading: (level: number) => void;
    onSetParagraph: () => void;
    onToggleBold: () => void;
    onToggleItalic: () => void;
    onToggleStrikethrough: () => void;
    onToggleBlockquote: () => void;
    onToggleBulletList: () => void;
    onToggleOrderedList: () => void;
    onToggleCodeBlock: () => void;
    onInsertHorizontalRule: () => void;
    onToggleHighlight: () => void;
}

import type { ShortcutConfig } from "./shortcutStore";
import { formatShortcutForDisplay } from "./shortcutStore";

/**
 * Create the full command list from handler callbacks.
 */
export function createCommands(handlers: CommandHandlers, config: ShortcutConfig): Command[] {
    const format = (key: string) => config[key] ? formatShortcutForDisplay(config[key]) : undefined;

    return [
        // --- Settings/Pinned ---
        {
            id: "custom-shortcuts",
            label: "Custom Your Shortcuts",
            category: "Settings",
            action: handlers.onOpenShortcutConfig,
        },
        // --- File ---
        {
            id: "new-file",
            label: "New File",
            shortcut: format("onNew"),
            category: "File",
            action: handlers.onNew,
        },
        {
            id: "open-file",
            label: "Open File",
            shortcut: format("onOpen"),
            category: "File",
            action: handlers.onOpen,
        },
        {
            id: "save",
            label: "Save",
            shortcut: format("onSave"),
            category: "File",
            action: handlers.onSave,
        },
        {
            id: "save-as",
            label: "Save As…",
            shortcut: format("onSaveAs"),
            category: "File",
            action: handlers.onSaveAs,
        },
        {
            id: "close",
            label: "Quit App",
            shortcut: format("onClose"),
            category: "File",
            action: handlers.onClose,
        },
        {
            id: "go-home",
            label: "Close File / Go Home",
            shortcut: format("onGoHome"),
            category: "File",
            action: handlers.onGoHome,
        },

        // --- View ---
        {
            id: "toggle-theme",
            label: "Toggle Dark / Light Theme",
            shortcut: format("onToggleTheme"),
            category: "View",
            action: handlers.onToggleTheme,
        },
        {
            id: "toggle-focus-mode",
            label: "Toggle Focus Mode",
            shortcut: format("onToggleFocusMode"),
            category: "View",
            action: handlers.onToggleFocusMode,
        },
        {
            id: "find-replace",
            label: "Find & Replace",
            shortcut: format("onFind"),
            category: "Edit",
            action: handlers.onFind,
        },


        // --- Format ---
        {
            id: "heading-1",
            label: "Heading 1",
            shortcut: format("onSetHeading1"),
            category: "Format",
            action: () => handlers.onSetHeading(1),
        },
        {
            id: "heading-2",
            label: "Heading 2",
            shortcut: format("onSetHeading2"),
            category: "Format",
            action: () => handlers.onSetHeading(2),
        },
        {
            id: "heading-3",
            label: "Heading 3",
            shortcut: format("onSetHeading3"),
            category: "Format",
            action: () => handlers.onSetHeading(3),
        },
        {
            id: "heading-4",
            label: "Heading 4",
            shortcut: format("onSetHeading4"),
            category: "Format",
            action: () => handlers.onSetHeading(4),
        },
        {
            id: "heading-5",
            label: "Heading 5",
            shortcut: format("onSetHeading5"),
            category: "Format",
            action: () => handlers.onSetHeading(5),
        },
        {
            id: "heading-6",
            label: "Heading 6",
            shortcut: format("onSetHeading6"),
            category: "Format",
            action: () => handlers.onSetHeading(6),
        },
        {
            id: "paragraph",
            label: "Normal Text",
            shortcut: format("onSetParagraph"),
            category: "Format",
            action: handlers.onSetParagraph,
        },
        {
            id: "bold",
            label: "Bold",
            shortcut: format("onToggleBold"),
            category: "Format",
            action: handlers.onToggleBold,
        },
        {
            id: "italic",
            label: "Italic",
            shortcut: format("onToggleItalic"),
            category: "Format",
            action: handlers.onToggleItalic,
        },
        {
            id: "strikethrough",
            label: "Strikethrough",
            shortcut: format("onToggleStrikethrough"),
            category: "Format",
            action: handlers.onToggleStrikethrough,
        },
        {
            id: "highlight",
            label: "Highlight",
            shortcut: format("onToggleHighlight"),
            category: "Format",
            action: handlers.onToggleHighlight,
        },
        {
            id: "blockquote",
            label: "Blockquote",
            shortcut: format("onToggleBlockquote"),
            category: "Format",
            action: handlers.onToggleBlockquote,
        },
        {
            id: "bullet-list",
            label: "Bullet List",
            shortcut: format("onToggleBulletList"),
            category: "Format",
            action: handlers.onToggleBulletList,
        },
        {
            id: "ordered-list",
            label: "Ordered List",
            shortcut: format("onToggleOrderedList"),
            category: "Format",
            action: handlers.onToggleOrderedList,
        },
        {
            id: "code-block",
            label: "Code Block",
            shortcut: format("onToggleCodeBlock"),
            category: "Format",
            action: handlers.onToggleCodeBlock,
        },
        {
            id: "horizontal-rule",
            label: "Horizontal Rule",
            shortcut: format("onInsertHorizontalRule"),
            category: "Format",
            action: handlers.onInsertHorizontalRule,
        },
    ];
}

/**
 * Simple filter: match query against command label (case-insensitive).
 * Supports space-separated terms for basic fuzzy matching.
 */
export function filterCommands(
    commands: Command[],
    query: string,
): Command[] {
    if (!query.trim()) return commands;

    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const result = commands.filter((cmd) => {
        const label = cmd.label.toLowerCase();
        const category = cmd.category.toLowerCase();
        const text = `${label} ${category}`;
        return terms.every((term) => text.includes(term));
    });

    // Ensure the custom-shortcuts command is always at the top
    const customShortcutsCmd = commands.find(c => c.id === "custom-shortcuts");
    if (customShortcutsCmd) {
        const filteredWithoutSettings = result.filter(c => c.id !== "custom-shortcuts");
        return [customShortcutsCmd, ...filteredWithoutSettings];
    }
    return result;
}
