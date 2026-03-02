import type { Editor, JSONContent } from "@tiptap/core";

export interface OutlineHeading {
    id: string;
    level: number;
    text: string;
    pos: number;
    isActive?: boolean;
}

export function extractHeadings(editor: Editor): OutlineHeading[] {
    const headings: OutlineHeading[] = [];
    if (!editor) return headings;

    const doc = editor.state.doc;
    doc.descendants((node, pos) => {
        if (node.type.name === 'heading') {
            headings.push({
                id: `heading-${pos}`,
                level: node.attrs.level,
                text: node.textContent,
                pos: pos,
                isActive: false,
            });
        }
    });

    return headings;
}

export function getActiveHeading(editor: Editor, headings: OutlineHeading[]): string | null {
    if (!editor || headings.length === 0) return null;

    const currentPos = editor.state.selection.from;

    // Find the closest heading before or at the current cursor position
    let activeHeadingId = null;
    for (let i = headings.length - 1; i >= 0; i--) {
        if (currentPos >= headings[i].pos) {
            activeHeadingId = headings[i].id;
            break;
        }
    }

    return activeHeadingId;
}

export function scrollToHeading(editor: Editor, pos: number) {
    if (!editor) return;
    editor.chain().focus().setTextSelection(pos).scrollIntoView().run();
}
