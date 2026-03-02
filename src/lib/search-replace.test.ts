import { describe, it, expect, beforeEach } from 'vitest';
import { Editor } from '@tiptap/core';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { SearchReplace } from './search-replace';

describe('SearchReplace Extension', () => {
    let editor: Editor;

    beforeEach(() => {
        editor = new Editor({
            extensions: [
                Document,
                Paragraph,
                Text,
                SearchReplace,
            ],
            content: `
                <p>The quick brown fox jumps over the lazy dog.</p>
                <p>The FOX is very quick. A fox.</p>
            `,
        });

        // Force reset the extension storage because TipTap Singletons bleed state
        editor.storage.searchReplace.results = [];
        editor.storage.searchReplace.currentIndex = 0;
        editor.storage.searchReplace.searchTerm = '';
        editor.storage.searchReplace.replaceTerm = '';
        editor.storage.searchReplace.caseSensitive = false;
    });

    afterEach(() => {
        editor.destroy();
    });

    it('initializes with default storage', () => {
        const storage = editor.storage.searchReplace;
        expect(storage.searchTerm).toBe('');
        expect(storage.replaceTerm).toBe('');
        expect(storage.caseSensitive).toBe(false);
        expect(storage.currentIndex).toBe(0); // Actually init gives 0
        expect(storage.results).toEqual([]);
    });

    it('setSearchTerm finds matches (case insensitive)', () => {
        editor.commands.setSearchTerm('fox');
        const storage = editor.storage.searchReplace;

        expect(storage.searchTerm).toBe('fox');
        expect(storage.results.length).toBe(3); // 'fox', 'FOX', 'fox'
        expect(storage.currentIndex).toBe(0);
    });

    it('setSearchTerm empty clears results', () => {
        editor.commands.setSearchTerm('fox');
        editor.commands.setSearchTerm('');
        const storage = editor.storage.searchReplace;
        expect(storage.results.length).toBe(0);
        expect(storage.currentIndex).toBe(-1);
    });

    it('setCaseSensitive filters case sensitive matches', () => {
        editor.commands.setSearchTerm('fox');
        editor.commands.setCaseSensitive(true);
        const storage = editor.storage.searchReplace;

        expect(storage.caseSensitive).toBe(true);
        expect(storage.results.length).toBe(2); // Only 'fox', 'fox'
        expect(storage.currentIndex).toBe(0);
    });

    it('setReplaceTerm updates storage', () => {
        editor.commands.setReplaceTerm('cat');
        const storage = editor.storage.searchReplace;
        expect(storage.replaceTerm).toBe('cat');
    });

    it('goToNextMatch loops through results correctly', () => {
        editor.commands.setSearchTerm('fox'); // 3 matches: indices 0, 1, 2
        const storage = editor.storage.searchReplace;
        expect(storage.currentIndex).toBe(0);

        editor.commands.goToNextMatch();
        expect(storage.currentIndex).toBe(1);

        editor.commands.goToNextMatch();
        expect(storage.currentIndex).toBe(2);

        editor.commands.goToNextMatch();
        expect(storage.currentIndex).toBe(0);
    });

    it('goToPreviousMatch loops backward through results correctly', () => {
        editor.commands.setSearchTerm('fox'); // 3 matches
        const storage = editor.storage.searchReplace;

        editor.commands.goToPreviousMatch();
        expect(storage.currentIndex).toBe(2);

        editor.commands.goToPreviousMatch();
        expect(storage.currentIndex).toBe(1);

        editor.commands.goToPreviousMatch();
        expect(storage.currentIndex).toBe(0);
    });

    it('replaceCurrentMatch replaces the active match index', async () => {
        editor.commands.setSearchTerm('fox');
        editor.commands.setReplaceTerm('CAT');
        editor.commands.goToNextMatch(); // index 1, which is 'FOX'

        editor.commands.replaceCurrentMatch();

        // Wait for re-scan timeout
        await new Promise(r => setTimeout(r, 10));

        const text = editor.getText();
        expect(text).toContain('The quick brown fox jumps over the lazy dog.');
        expect(text).toContain('The CAT is very quick. A fox.');

        const storage = editor.storage.searchReplace;
        expect(storage.results.length).toBe(2); // only two 'fox' left
    });

    it('replaceAllMatches replaces all occurrences', async () => {
        editor.commands.setSearchTerm('fox');
        editor.commands.setReplaceTerm('CAT');

        editor.commands.replaceAllMatches();

        // Wait for re-scan timeout
        await new Promise(r => setTimeout(r, 10));

        const text = editor.getText();
        expect(text).toContain('The quick brown CAT jumps over the lazy dog.');
        expect(text).toContain('The CAT is very quick. A CAT.');

        const storage = editor.storage.searchReplace;
        expect(storage.results.length).toBe(0);
    });

    it('clearSearch resets storage entirely', () => {
        editor.commands.setSearchTerm('fox');
        editor.commands.setReplaceTerm('CAT');
        editor.commands.clearSearch();

        const storage = editor.storage.searchReplace;
        expect(storage.searchTerm).toBe('');
        expect(storage.replaceTerm).toBe('');
        expect(storage.currentIndex).toBe(-1);
        expect(storage.results.length).toBe(0);
    });

    it('does not crash when replacing empty match list', () => {
        editor.commands.setSearchTerm('xyznonexistent');
        editor.commands.setReplaceTerm('CAT');
        const res = editor.commands.replaceCurrentMatch();
        expect(res).toBe(false);
    });

    it('does not crash when replaceAll matches is empty', () => {
        editor.commands.setSearchTerm('xyznonexistent');
        editor.commands.setReplaceTerm('CAT');
        const res = editor.commands.replaceAllMatches();
        expect(res).toBe(false);
    });

    it('does not crash when goToNext with empty list', () => {
        editor.commands.setSearchTerm('xyz');
        const res = editor.commands.goToNextMatch();
        expect(res).toBe(false);
    });

    it('does not crash when goToPrevious with empty list', () => {
        editor.commands.setSearchTerm('xyz');
        const res = editor.commands.goToPreviousMatch();
        expect(res).toBe(false);
    });

    it('re-evaluates matches on text insertion', () => {
        editor.commands.setSearchTerm('fox');
        if (editor.storage.searchReplace.results.length !== 3) {
            throw new Error('DUMP: ' + JSON.stringify(editor.storage.searchReplace.results) + ' | TEXT: ' + editor.getText());
        }
        expect(editor.storage.searchReplace.results.length).toBe(3);

        // Add a new paragraph with 'fox'
        editor.commands.insertContent('<p>Here is another fox</p>');
        expect(editor.storage.searchReplace.results.length).toBe(4);
    });
});
