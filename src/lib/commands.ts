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
    category: "File" | "View" | "Format" | "Edit";
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

/**
 * Create the full command list from handler callbacks.
 */
export function createCommands(handlers: CommandHandlers): Command[] {
    return [
        // --- File ---
        {
            id: "new-file",
            label: "New File",
            shortcut: "⌘N",
            category: "File",
            action: handlers.onNew,
        },
        {
            id: "open-file",
            label: "Open File",
            shortcut: "⌘O",
            category: "File",
            action: handlers.onOpen,
        },
        {
            id: "save",
            label: "Save",
            shortcut: "⌘S",
            category: "File",
            action: handlers.onSave,
        },
        {
            id: "save-as",
            label: "Save As…",
            shortcut: "⌘⇧S",
            category: "File",
            action: handlers.onSaveAs,
        },
        {
            id: "close",
            label: "Quit App",
            shortcut: "⌘W",
            category: "File",
            action: handlers.onClose,
        },
        {
            id: "go-home",
            label: "Close File / Go Home",
            shortcut: "⌘Q",
            category: "File",
            action: handlers.onGoHome,
        },

        // --- View ---
        {
            id: "toggle-theme",
            label: "Toggle Dark / Light Theme",
            shortcut: "⌘D",
            category: "View",
            action: handlers.onToggleTheme,
        },
        {
            id: "toggle-focus-mode",
            label: "Toggle Focus Mode",
            shortcut: "⌘⇧F",
            category: "View",
            action: handlers.onToggleFocusMode,
        },
        {
            id: "find-replace",
            label: "Find & Replace",
            shortcut: "⌘F",
            category: "Edit",
            action: handlers.onFind,
        },

        // --- Format ---
        {
            id: "heading-1",
            label: "Heading 1",
            shortcut: "⌘1",
            category: "Format",
            action: () => handlers.onSetHeading(1),
        },
        {
            id: "heading-2",
            label: "Heading 2",
            shortcut: "⌘2",
            category: "Format",
            action: () => handlers.onSetHeading(2),
        },
        {
            id: "heading-3",
            label: "Heading 3",
            shortcut: "⌘3",
            category: "Format",
            action: () => handlers.onSetHeading(3),
        },
        {
            id: "heading-4",
            label: "Heading 4",
            shortcut: "⌘4",
            category: "Format",
            action: () => handlers.onSetHeading(4),
        },
        {
            id: "heading-5",
            label: "Heading 5",
            shortcut: "⌘5",
            category: "Format",
            action: () => handlers.onSetHeading(5),
        },
        {
            id: "heading-6",
            label: "Heading 6",
            shortcut: "⌘6",
            category: "Format",
            action: () => handlers.onSetHeading(6),
        },
        {
            id: "paragraph",
            label: "Normal Text",
            shortcut: "⌘0",
            category: "Format",
            action: handlers.onSetParagraph,
        },
        {
            id: "bold",
            label: "Bold",
            shortcut: "⌘B",
            category: "Format",
            action: handlers.onToggleBold,
        },
        {
            id: "italic",
            label: "Italic",
            shortcut: "⌘I",
            category: "Format",
            action: handlers.onToggleItalic,
        },
        {
            id: "strikethrough",
            label: "Strikethrough",
            shortcut: "⌘⇧X",
            category: "Format",
            action: handlers.onToggleStrikethrough,
        },
        {
            id: "highlight",
            label: "Highlight",
            shortcut: "⌘⇧H",
            category: "Format",
            action: handlers.onToggleHighlight,
        },
        {
            id: "blockquote",
            label: "Blockquote",
            category: "Format",
            action: handlers.onToggleBlockquote,
        },
        {
            id: "bullet-list",
            label: "Bullet List",
            category: "Format",
            action: handlers.onToggleBulletList,
        },
        {
            id: "ordered-list",
            label: "Ordered List",
            category: "Format",
            action: handlers.onToggleOrderedList,
        },
        {
            id: "code-block",
            label: "Code Block",
            category: "Format",
            action: handlers.onToggleCodeBlock,
        },
        {
            id: "horizontal-rule",
            label: "Horizontal Rule",
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
    return commands.filter((cmd) => {
        const label = cmd.label.toLowerCase();
        const category = cmd.category.toLowerCase();
        const text = `${label} ${category}`;
        return terms.every((term) => text.includes(term));
    });
}
