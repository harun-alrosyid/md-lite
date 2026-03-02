import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import type { Transaction, EditorState } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export interface FocusModeStorage {
    enabled: boolean;
}

const focusModePluginKey = new PluginKey("focusMode");

/**
 * Find the top-level node (depth 1) that contains the given position.
 * Returns the position range [from, to] of that node, or null.
 */
function findActiveBlock(
    state: EditorState,
): { from: number; to: number } | null {
    const { $from } = state.selection;

    // Walk up to depth 1 (top-level child of doc)
    if ($from.depth < 1) return null;

    const start = $from.start(1);
    const end = $from.end(1);
    return { from: start - 1, to: end + 1 };
}

/**
 * Build decorations that dim all top-level blocks except the active one.
 */
function buildFocusDecorations(
    state: EditorState,
    enabled: boolean,
): DecorationSet {
    if (!enabled) return DecorationSet.empty;

    const activeBlock = findActiveBlock(state);
    if (!activeBlock) return DecorationSet.empty;

    const decorations: Decoration[] = [];
    const { doc } = state;

    doc.forEach((node, pos) => {
        const nodeFrom = pos;
        const nodeTo = pos + node.nodeSize;
        const isActive =
            nodeFrom >= activeBlock.from && nodeTo <= activeBlock.to;

        if (!isActive) {
            decorations.push(
                Decoration.node(nodeFrom, nodeTo, {
                    class: "focus-dimmed",
                }),
            );
        }
    });

    return DecorationSet.create(doc, decorations);
}

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        focusMode: {
            setFocusMode: (enabled: boolean) => ReturnType;
            toggleFocusMode: () => ReturnType;
        };
    }
}

export const FocusMode = Extension.create<{}, FocusModeStorage>({
    name: "focusMode",

    addStorage() {
        return {
            enabled: false,
        };
    },

    addCommands() {
        return {
            setFocusMode:
                (enabled: boolean) =>
                    ({ dispatch, editor }) => {
                        this.storage.enabled = enabled;

                        if (dispatch) {
                            const tr = editor.state.tr.setMeta(
                                focusModePluginKey,
                                { updated: true },
                            );
                            dispatch(tr);
                        }

                        return true;
                    },

            toggleFocusMode:
                () =>
                    ({ dispatch, editor }) => {
                        this.storage.enabled = !this.storage.enabled;

                        if (dispatch) {
                            const tr = editor.state.tr.setMeta(
                                focusModePluginKey,
                                { updated: true },
                            );
                            dispatch(tr);
                        }

                        return true;
                    },
        };
    },

    addProseMirrorPlugins() {
        const storage = this.storage;

        return [
            new Plugin({
                key: focusModePluginKey,
                state: {
                    init(_, state): DecorationSet {
                        return buildFocusDecorations(state, storage.enabled);
                    },
                    apply(
                        tr: Transaction,
                        oldDecorations: DecorationSet,
                        _oldState,
                        newState,
                    ): DecorationSet {
                        // Rebuild on meta update, doc change, or selection change
                        if (
                            tr.getMeta(focusModePluginKey) ||
                            tr.docChanged ||
                            tr.selectionSet
                        ) {
                            return buildFocusDecorations(
                                newState,
                                storage.enabled,
                            );
                        }
                        return oldDecorations;
                    },
                },
                props: {
                    decorations(state: EditorState) {
                        return this.getState(state);
                    },
                },
            }),
        ];
    },
});
