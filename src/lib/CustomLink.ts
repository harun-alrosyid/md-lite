import { Link } from "@tiptap/extension-link";
import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";

export const CustomLink = Link.extend({
    addProseMirrorPlugins() {
        const plugins = this.parent?.() || [];
        const type = this.type;

        plugins.push(
            new Plugin({
                key: new PluginKey("markdown-links"),
                appendTransaction(transactions, oldState, newState) {
                    const docChanges = transactions.some((tr) => tr.docChanged);
                    if (!docChanges) return;

                    const { tr, selection } = newState;
                    let modified = false;

                    const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
                    const matches: any[] = [];

                    newState.doc.descendants((node: any, pos: number) => {
                        if (node.isBlock && node.isTextblock) {
                            const textContent = node.textContent;
                            let match;
                            while ((match = regex.exec(textContent)) !== null) {
                                const text = match[1];
                                const url = match[2];

                                // Skip if empty or matches our explicit placeholder
                                if (url.trim() === "" || text.trim() === "" || url === "url") {
                                    continue;
                                }

                                // Skip markdown images ![alt](url)
                                if (match.index > 0 && textContent[match.index - 1] === '!') {
                                    continue;
                                }

                                // Pos is the block node start. Children start at pos + 1
                                const start = pos + 1 + match.index;
                                const end = start + match[0].length;

                                // Do not transform if the user's cursor is actively inside the exact mark bounds,
                                // let them safely finish writing or editing.
                                const isCursorInside = selection.from > start && selection.to < end;

                                if (isCursorInside) continue;

                                matches.push({ start, end, text, url });
                            }
                        }
                    });

                    // Process backward to prevent positions shifting underneath us
                    for (let i = matches.length - 1; i >= 0; i--) {
                        const { start, end, text, url } = matches[i];
                        const mark = type.create({ href: url });

                        tr.delete(start, end);
                        tr.insertText(text, start);
                        tr.addMark(start, start + text.length, mark);

                        // Maintain cursor properly if they were positioned exactly at the end 
                        if (selection.from >= end) {
                            const diff = end - start - text.length;
                            const newPos = selection.from - diff;
                            // Safe clamp
                            const clampedPos = Math.min(Math.max(0, newPos), tr.doc.content.size);
                            tr.setSelection(TextSelection.create(tr.doc, clampedPos));
                        }

                        modified = true;
                    }

                    if (modified) {
                        return tr;
                    }
                },
            }),
        );

        return plugins;
    },
});
