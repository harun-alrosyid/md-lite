import { describe, it, expect } from 'vitest';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';

describe('Markdown Parsing with setContent', () => {
    it('should parse headings correctly when setContent is called', () => {
        const editor = new Editor({
            extensions: [
                StarterKit,
                Markdown.configure({
                    html: true,
                    tightLists: true,
                    bulletListMarker: "-",
                    transformPastedText: true,
                    transformCopiedText: true,
                }),
            ],
            content: '',
        });

        editor.commands.setContent('### New Design');

        const html = editor.getHTML();
        console.log("HTML:", html);

        expect(html).toContain('h3');
    });
});
