import { describe, it, expect } from 'vitest';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { CustomImage } from './lib/CustomImage';
import { CustomLink } from './lib/CustomLink';
import { Markdown } from 'tiptap-markdown';

describe('Markdown Parsing', () => {
    it('should parse headings correctly from markdown', () => {
        const editor = new Editor({
            extensions: [
                StarterKit,
                CustomImage.configure({
                    currentFilePath: () => '',
                }),
                CustomLink.configure({
                    openOnClick: true,
                    autolink: true,
                }),
                Markdown.configure({
                    html: true,
                    tightLists: true,
                    bulletListMarker: "-",
                    transformPastedText: true,
                    transformCopiedText: true,
                }),
            ],
            content: '### New Design',
        });

        const html = editor.getHTML();
        const md = editor.storage.markdown.getMarkdown();
        console.log("HTML:", html);
        console.log("MD:", md);

        expect(html).toContain('h3');
    });
});
