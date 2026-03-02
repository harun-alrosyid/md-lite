import { describe, it, expect } from 'vitest';
import { Editor } from '@tiptap/core';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { CustomLink } from './CustomLink';

describe('CustomLink Extension', () => {
    it('converts markdown link syntax into actual HTML anchor tags via proseMirror plugins', () => {
        const editor = new Editor({
            extensions: [Document, Paragraph, Text, CustomLink],
            content: '<p>[Click Here](https://google.com)</p>',
        });

        // Append a space to trigger the transaction hook logic
        editor.commands.insertContent(' ');

        const html = editor.getHTML();
        expect(html).toContain('href="https://google.com"');
        expect(html).toContain('>Click Here</a>');
    });

    it('ignores markdown image syntax', () => {
        const editor = new Editor({
            extensions: [Document, Paragraph, Text, CustomLink],
            content: '<p>![Image](https://img.com/a.png)</p>',
        });

        editor.commands.insertContent(' ');

        const html = editor.getHTML();
        expect(html).not.toContain('<a ');
        expect(html).toContain('![Image](https://img.com/a.png)');
    });

    it('ignores empty urls or placeholder syntax', () => {
        const editor = new Editor({
            extensions: [Document, Paragraph, Text, CustomLink],
            content: '<p>[Empty]()</p><p>[Placeholder](url)</p>',
        });

        editor.commands.insertContent(' ');

        const html = editor.getHTML();
        expect(html).not.toContain('<a ');
    });

    it('does not transform if the user cursor is actively inside the mark bounds', () => {
        const editor = new Editor({
            extensions: [Document, Paragraph, Text, CustomLink],
            content: '<p>[Draft](http://link.com)</p>',
        });

        // Set cursor inside the raw markdown syntax so it shouldn't transform
        editor.commands.setTextSelection(4); // Inside "[Draft]"

        editor.commands.insertContent('a'); // Trigger docChange transaction

        const html = editor.getHTML();
        expect(html).toContain('[Draaft](http://link.com)'); // Should remain as plaintext markdown
        expect(html).not.toContain('<a ');
    });

    it('maintains correct selection position when typing exactly at the end', () => {
        const editor = new Editor({
            extensions: [Document, Paragraph, Text, CustomLink],
            content: '<p>[EndTest](http://end.com)</p>',
        });

        // End of the link syntax position
        // <p> = pos 1, "[EndTest](http://end.com)" length is 25. 
        editor.commands.setTextSelection(26);

        editor.commands.insertContent(' ');

        const html = editor.getHTML();
        expect(html).toContain('href="http://end.com"');
        expect(editor.state.selection.from).toBe(9); // length of "EndTest " + <p>
    });
});
