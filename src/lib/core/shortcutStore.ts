export type ActionType =
    | "onNew"
    | "onOpen"
    | "onSave"
    | "onSaveAs"
    | "onClose"
    | "onToggleTheme"
    | "onFind"
    | "onToggleFocusMode"
    | "onCommandPalette"
    | "onGoHome"
    | "onToggleOutline"
    | "onSetHeading1"
    | "onSetHeading2"
    | "onSetHeading3"
    | "onSetHeading4"
    | "onSetHeading5"
    | "onSetHeading6"
    | "onSetParagraph"
    | "onToggleBold"
    | "onToggleItalic"
    | "onToggleStrikethrough"
    | "onToggleHighlight"
    | "onToggleBlockquote"
    | "onToggleBulletList"
    | "onToggleOrderedList"
    | "onToggleCodeBlock"
    | "onInsertHorizontalRule";

import { isTauri } from "./env";

export interface ShortcutConfig {
    [action: string]: string;
}

export const defaultShortcuts: ShortcutConfig = {
    onNew: "CmdOrCtrl+Shift+N",
    onOpen: "CmdOrCtrl+O",
    onSave: "CmdOrCtrl+S",
    onSaveAs: "CmdOrCtrl+Shift+S",
    onClose: "CmdOrCtrl+Shift+Q",
    onToggleTheme: "CmdOrCtrl+D",
    onFind: "CmdOrCtrl+F",
    onToggleFocusMode: "CmdOrCtrl+Shift+F",
    onCommandPalette: "CmdOrCtrl+K",
    onGoHome: "CmdOrCtrl+Shift+W",
    onToggleOutline: "CmdOrCtrl+Shift+O",
    onSetHeading1: "CmdOrCtrl+1",
    onSetHeading2: "CmdOrCtrl+2",
    onSetHeading3: "CmdOrCtrl+3",
    onSetHeading4: "CmdOrCtrl+4",
    onSetHeading5: "CmdOrCtrl+5",
    onSetHeading6: "CmdOrCtrl+6",
    onSetParagraph: "CmdOrCtrl+0",
    onToggleBold: "CmdOrCtrl+B",
    onToggleItalic: "CmdOrCtrl+I",
    onToggleStrikethrough: "CmdOrCtrl+Shift+X",
    onToggleHighlight: "CmdOrCtrl+Shift+H",
    onToggleBlockquote: "",
    onToggleBulletList: "",
    onToggleOrderedList: "",
    onToggleCodeBlock: "",
    onInsertHorizontalRule: "",
};

export const STORAGE_KEY = "md-lite-shortcuts";

export function loadShortcuts(): ShortcutConfig {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return { ...defaultShortcuts, ...JSON.parse(stored) };
        }
    } catch (e) {
        console.error("Failed to load custom shortcuts", e);
    }
    return { ...defaultShortcuts };
}

export function saveShortcuts(config: ShortcutConfig) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
        console.error("Failed to save custom shortcuts", e);
    }
}

export function formatShortcutForDisplay(shortcut: string): string {
    return shortcut
        .replace(/CmdOrCtrl/g, "⌘")
        .replace(/Shift/g, "⇧")
        .replace(/Alt/g, "⌥");
}

/**
 * Checks if a KeyboardEvent matches a given shortcut string pattern.
 * Pattern format example: "CmdOrCtrl+Shift+S"
 */
export function matchShortcut(e: KeyboardEvent, shortcutPattern: string): boolean {
    const parts = shortcutPattern.split("+").map((p) => p.toLowerCase());
    const key = e.key.toLowerCase();

    // Some keys might report differently (e.g. Shift usually doesn't trigger on its own, but combined keys will report e.key as the character)
    const requiresCmdOrCtrl = parts.includes("cmdorctrl");
    const requiresShift = parts.includes("shift");
    const requiresAlt = parts.includes("alt");

    const keyPartLength = parts.filter(p => !["cmdorctrl", "shift", "alt"].includes(p)).length;
    let targetKey = keyPartLength > 0 ? parts[parts.length - 1] : "";

    // Normalize target key for letter case since e.key respects caps lock/shift
    // If Shift is pressed, e.key might be "S" instead of "s"
    if (targetKey.length === 1 && targetKey >= 'a' && targetKey <= 'z') {
        // e.key is what we want to test against.
    }

    const isCmdOrCtrl = e.metaKey || e.ctrlKey;
    const isShift = e.shiftKey;
    const isAlt = e.altKey;

    if (requiresCmdOrCtrl !== isCmdOrCtrl) return false;
    if (requiresShift !== isShift) return false;
    if (requiresAlt !== isAlt) return false;

    // Direct key match
    return key === targetKey;
}
