import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import type { Transaction } from "@tiptap/pm/state";
import type { EditorState } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { TextSelection } from "@tiptap/pm/state";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";

export interface SearchReplaceStorage {
    searchTerm: string;
    replaceTerm: string;
    caseSensitive: boolean;
    currentIndex: number;
    results: { from: number; to: number }[];
}

const searchReplacePluginKey = new PluginKey("searchReplace");

/**
 * Find all occurrences of `searchTerm` in the ProseMirror document.
 */
function findMatches(
    doc: ProseMirrorNode,
    searchTerm: string,
    caseSensitive: boolean,
): { from: number; to: number }[] {
    if (!searchTerm) return [];

    const results: { from: number; to: number }[] = [];
    const term = caseSensitive ? searchTerm : searchTerm.toLowerCase();

    doc.descendants((node, pos) => {
        if (!node.isText || !node.text) return;

        const text = caseSensitive ? node.text : node.text.toLowerCase();

        let index = text.indexOf(term);
        while (index !== -1) {
            results.push({
                from: pos + index,
                to: pos + index + searchTerm.length,
            });
            index = text.indexOf(term, index + 1);
        }
    });

    return results;
}

/**
 * Build a DecorationSet from search results.
 */
function buildDecorations(
    doc: ProseMirrorNode,
    results: { from: number; to: number }[],
    currentIndex: number,
): DecorationSet {
    if (results.length === 0) return DecorationSet.empty;

    const decorations = results.map((result, i) => {
        const className =
            i === currentIndex
                ? "search-match search-match-current"
                : "search-match";
        return Decoration.inline(result.from, result.to, {
            class: className,
        });
    });

    return DecorationSet.create(doc, decorations);
}

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        searchReplace: {
            setSearchTerm: (term: string) => ReturnType;
            setReplaceTerm: (term: string) => ReturnType;
            setCaseSensitive: (flag: boolean) => ReturnType;
            goToNextMatch: () => ReturnType;
            goToPreviousMatch: () => ReturnType;
            replaceCurrentMatch: () => ReturnType;
            replaceAllMatches: () => ReturnType;
            clearSearch: () => ReturnType;
        };
    }
}

export const SearchReplace = Extension.create<{}, SearchReplaceStorage>({
    name: "searchReplace",

    addStorage() {
        return {
            searchTerm: "",
            replaceTerm: "",
            caseSensitive: false,
            currentIndex: 0,
            results: [],
        };
    },

    addCommands() {
        return {
            setSearchTerm:
                (term: string) =>
                    ({ editor, dispatch }) => {
                        this.storage.searchTerm = term;
                        this.storage.results = findMatches(
                            editor.state.doc,
                            term,
                            this.storage.caseSensitive,
                        );
                        this.storage.currentIndex =
                            this.storage.results.length > 0 ? 0 : -1;

                        if (dispatch) {
                            const tr = editor.state.tr.setMeta(
                                searchReplacePluginKey,
                                { updated: true },
                            );
                            dispatch(tr);
                        }

                        return true;
                    },

            setReplaceTerm:
                (term: string) =>
                    () => {
                        this.storage.replaceTerm = term;
                        return true;
                    },

            setCaseSensitive:
                (flag: boolean) =>
                    ({ editor, dispatch }) => {
                        this.storage.caseSensitive = flag;
                        this.storage.results = findMatches(
                            editor.state.doc,
                            this.storage.searchTerm,
                            flag,
                        );
                        this.storage.currentIndex =
                            this.storage.results.length > 0 ? 0 : -1;

                        if (dispatch) {
                            const tr = editor.state.tr.setMeta(
                                searchReplacePluginKey,
                                { updated: true },
                            );
                            dispatch(tr);
                        }

                        return true;
                    },

            goToNextMatch:
                () =>
                    ({ tr, dispatch }) => {
                        const { results } = this.storage;
                        if (results.length === 0) return false;

                        this.storage.currentIndex =
                            (this.storage.currentIndex + 1) % results.length;

                        if (dispatch) {
                            const match = results[this.storage.currentIndex];
                            tr.setMeta(searchReplacePluginKey, { updated: true })
                                .scrollIntoView();

                            tr.setSelection(
                                TextSelection.near(tr.doc.resolve(match.from))
                            );
                        }

                        return true;
                    },

            goToPreviousMatch:
                () =>
                    ({ tr, dispatch }) => {
                        const { results } = this.storage;
                        if (results.length === 0) return false;

                        this.storage.currentIndex =
                            (this.storage.currentIndex - 1 + results.length) %
                            results.length;

                        if (dispatch) {
                            const match = results[this.storage.currentIndex];
                            tr.setMeta(searchReplacePluginKey, { updated: true })
                                .scrollIntoView();

                            tr.setSelection(
                                TextSelection.near(tr.doc.resolve(match.from))
                            );
                        }

                        return true;
                    },

            replaceCurrentMatch:
                () =>
                    ({ editor, tr, dispatch }) => {
                        const { results, currentIndex, replaceTerm } =
                            this.storage;
                        if (results.length === 0 || currentIndex < 0) return false;

                        const match = results[currentIndex];

                        if (dispatch) {
                            tr.insertText(
                                replaceTerm,
                                match.from,
                                match.to,
                            );
                        }

                        // Re-scan after replacement
                        setTimeout(() => {
                            editor.commands.setSearchTerm(this.storage.searchTerm);
                        }, 0);

                        return true;
                    },

            replaceAllMatches:
                () =>
                    ({ editor, tr, dispatch }) => {
                        const { results, replaceTerm } = this.storage;
                        if (results.length === 0) return false;

                        if (dispatch) {
                            for (let i = results.length - 1; i >= 0; i--) {
                                tr.insertText(
                                    replaceTerm,
                                    results[i].from,
                                    results[i].to,
                                );
                            }
                        }

                        setTimeout(() => {
                            editor.commands.setSearchTerm(this.storage.searchTerm);
                        }, 0);

                        return true;
                    },

            clearSearch:
                () =>
                    ({ tr, dispatch }) => {
                        this.storage.searchTerm = "";
                        this.storage.replaceTerm = "";
                        this.storage.currentIndex = -1;
                        this.storage.results = [];

                        if (dispatch) {
                            tr.setMeta(
                                searchReplacePluginKey,
                                { updated: true },
                            );
                        }

                        return true;
                    },
        };
    },

    addProseMirrorPlugins() {
        const storage = this.storage;

        return [
            new Plugin({
                key: searchReplacePluginKey,
                state: {
                    init(): DecorationSet {
                        return DecorationSet.empty;
                    },
                    apply(
                        tr: Transaction,
                        oldDecorations: DecorationSet,
                    ): DecorationSet {
                        if (
                            tr.getMeta(searchReplacePluginKey) ||
                            tr.docChanged
                        ) {
                            if (tr.docChanged && storage.searchTerm) {
                                storage.results = findMatches(
                                    tr.doc,
                                    storage.searchTerm,
                                    storage.caseSensitive,
                                );
                                if (
                                    storage.currentIndex >=
                                    storage.results.length
                                ) {
                                    storage.currentIndex = Math.max(
                                        0,
                                        storage.results.length - 1,
                                    );
                                }
                            }
                            return buildDecorations(
                                tr.doc,
                                storage.results,
                                storage.currentIndex,
                            );
                        }
                        return oldDecorations.map(tr.mapping, tr.doc);
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
