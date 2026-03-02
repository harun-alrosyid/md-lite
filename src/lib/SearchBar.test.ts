import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/svelte';
import SearchBar from './SearchBar.svelte';
import type { Editor } from '@tiptap/core';

describe('SearchBar.svelte', () => {
    let mockEditor: any;
    let onCloseMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        onCloseMock = vi.fn();
        mockEditor = {
            storage: {
                searchReplace: {
                    results: [],
                    currentIndex: -1,
                }
            },
            commands: {
                setSearchTerm: vi.fn() as any,
                setReplaceTerm: vi.fn() as any,
                setCaseSensitive: vi.fn() as any,
                goToNextMatch: vi.fn() as any,
                goToPreviousMatch: vi.fn() as any,
                replaceCurrentMatch: vi.fn() as any,
                replaceAllMatches: vi.fn() as any,
                clearSearch: vi.fn() as any,
                focus: vi.fn() as any,
            }
        };
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('does not render if visible is false', () => {
        render(SearchBar, { props: { editor: mockEditor, visible: false, onClose: onCloseMock as any } });
        expect(document.querySelector('.search-bar')).toBeNull();
    });

    it('renders when visible is true', () => {
        render(SearchBar, { props: { editor: mockEditor, visible: true, onClose: onCloseMock as any } });
        expect(document.querySelector('.search-bar')).not.toBeNull();
        expect(screen.getByPlaceholderText('Find…')).toBeDefined();
        expect(screen.getByPlaceholderText('Replace…')).toBeDefined();
    });

    it('calls setSearchTerm on find input', async () => {
        render(SearchBar, { props: { editor: mockEditor, visible: true, onClose: onCloseMock as any } });
        const findInput = screen.getByPlaceholderText('Find…');

        await fireEvent.input(findInput, { target: { value: 'test' } });

        expect(mockEditor.commands.setSearchTerm).toHaveBeenCalledWith('test');
    });

    it('calls setReplaceTerm on replace input', async () => {
        render(SearchBar, { props: { editor: mockEditor, visible: true, onClose: onCloseMock as any } });
        const replaceInput = screen.getByPlaceholderText('Replace…');

        await fireEvent.input(replaceInput, { target: { value: 'replacement' } });

        expect(mockEditor.commands.setReplaceTerm).toHaveBeenCalledWith('replacement');
    });

    it('toggles case sensitive and syncs', async () => {
        render(SearchBar, { props: { editor: mockEditor, visible: true, onClose: onCloseMock as any } });
        const caseBtn = document.querySelector('.case-btn') as HTMLButtonElement;

        await fireEvent.click(caseBtn);
        expect(mockEditor.commands.setCaseSensitive).toHaveBeenCalledWith(true);
        expect(caseBtn.classList.contains('active')).toBe(true);

        await fireEvent.click(caseBtn);
        expect(mockEditor.commands.setCaseSensitive).toHaveBeenCalledWith(false);
    });

    it('navigates to next match', async () => {
        mockEditor.storage.searchReplace.results = [1, 2];
        render(SearchBar, { props: { editor: mockEditor, visible: true, onClose: onCloseMock as any } });

        const findInput = screen.getByPlaceholderText('Find…');
        await fireEvent.input(findInput, { target: { value: 'x' } });

        const nextBtn = screen.getByTitle('Next Match (Enter)');
        await fireEvent.click(nextBtn);

        expect(mockEditor.commands.goToNextMatch).toHaveBeenCalled();
    });

    it('navigates to previous match', async () => {
        mockEditor.storage.searchReplace.results = [1, 2];
        render(SearchBar, { props: { editor: mockEditor, visible: true, onClose: onCloseMock as any } });

        const findInput = screen.getByPlaceholderText('Find…');
        await fireEvent.input(findInput, { target: { value: 'x' } });

        const prevBtn = screen.getByTitle('Previous Match (Shift+Enter)');
        await fireEvent.click(prevBtn);

        expect(mockEditor.commands.goToPreviousMatch).toHaveBeenCalled();
    });

    it('handles Find Enter keydown', async () => {
        mockEditor.storage.searchReplace.results = [1, 2];
        render(SearchBar, { props: { editor: mockEditor, visible: true, onClose: onCloseMock as any } });
        const findInput = screen.getByPlaceholderText('Find…');

        await fireEvent.input(findInput, { target: { value: 'x' } });

        await fireEvent.keyDown(findInput, { key: 'Enter', shiftKey: false });
        expect(mockEditor.commands.goToNextMatch).toHaveBeenCalled();

        await fireEvent.keyDown(findInput, { key: 'Enter', shiftKey: true });
        expect(mockEditor.commands.goToPreviousMatch).toHaveBeenCalled();
    });

    it('handles Find Tab focus swap', async () => {
        render(SearchBar, { props: { editor: mockEditor, visible: true, onClose: onCloseMock as any } });
        const findInput = screen.getByPlaceholderText('Find…');
        const replaceInput = screen.getByPlaceholderText('Replace…');

        const focusSpy = vi.spyOn(replaceInput, 'focus');
        await fireEvent.keyDown(findInput, { key: 'Tab' });
        expect(focusSpy).toHaveBeenCalled();
    });

    it('handles Find Escape keydown', async () => {
        render(SearchBar, { props: { editor: mockEditor, visible: true, onClose: onCloseMock as any } });
        const findInput = screen.getByPlaceholderText('Find…');

        await fireEvent.keyDown(findInput, { key: 'Escape' });

        expect(mockEditor.commands.clearSearch).toHaveBeenCalled();
        expect(onCloseMock).toHaveBeenCalled();
    });

    it('handles Replace Escape keydown', async () => {
        render(SearchBar, { props: { editor: mockEditor, visible: true, onClose: onCloseMock as any } });
        const replaceInput = screen.getByPlaceholderText('Replace…');

        await fireEvent.keyDown(replaceInput, { key: 'Escape' });

        expect(mockEditor.commands.clearSearch).toHaveBeenCalled();
        expect(onCloseMock).toHaveBeenCalled();
    });

    it('handles Replace Tab focus swap', async () => {
        render(SearchBar, { props: { editor: mockEditor, visible: true, onClose: onCloseMock as any } });
        const findInput = screen.getByPlaceholderText('Find…');
        const replaceInput = screen.getByPlaceholderText('Replace…');

        const focusSpy = vi.spyOn(findInput, 'focus');
        await fireEvent.keyDown(replaceInput, { key: 'Tab' });
        expect(focusSpy).toHaveBeenCalled();
    });

    it('calls replaceAll on click and keydown', async () => {
        mockEditor.storage.searchReplace.results = [1, 2];
        render(SearchBar, { props: { editor: mockEditor, visible: true, onClose: onCloseMock as any } });

        const findInput = screen.getByPlaceholderText('Find…');
        await fireEvent.input(findInput, { target: { value: 'x' } });

        const allBtn = screen.getByTitle('Replace All (⌘+Enter)');
        await fireEvent.click(allBtn);
        expect(mockEditor.commands.replaceAllMatches).toHaveBeenCalledTimes(1);

        const replaceInput = screen.getByPlaceholderText('Replace…');
        await fireEvent.keyDown(replaceInput, { key: 'Enter', metaKey: true });
        expect(mockEditor.commands.replaceAllMatches).toHaveBeenCalledTimes(2);
    });

    it('calls replaceCurrent on click and keydown', async () => {
        mockEditor.storage.searchReplace.results = [1, 2];
        render(SearchBar, { props: { editor: mockEditor, visible: true, onClose: onCloseMock as any } });

        const findInput = screen.getByPlaceholderText('Find…');
        await fireEvent.input(findInput, { target: { value: 'x' } });

        const replaceBtn = screen.getByTitle('Replace');
        await fireEvent.click(replaceBtn);
        expect(mockEditor.commands.replaceCurrentMatch).toHaveBeenCalledTimes(1);

        const replaceInput = screen.getByPlaceholderText('Replace…');
        await fireEvent.keyDown(replaceInput, { key: 'Enter', shiftKey: false });
        expect(mockEditor.commands.replaceCurrentMatch).toHaveBeenCalledTimes(2);
    });

    it('displays result count correctly', async () => {
        mockEditor.storage.searchReplace.results = [1, 2, 3];
        mockEditor.storage.searchReplace.currentIndex = 1;

        render(SearchBar, { props: { editor: mockEditor, visible: true, onClose: onCloseMock as any } });

        // syncResults is not fully reactive without events, trigger one
        const findInput = screen.getByPlaceholderText('Find…');
        await fireEvent.input(findInput, { target: { value: 'x' } });

        const counter = document.querySelector('.match-counter');
        expect(counter?.textContent?.trim()).toBe('2 / 3');
    });

    it('handles close button click', async () => {
        render(SearchBar, { props: { editor: mockEditor, visible: true, onClose: onCloseMock as any } });
        const closeBtn = screen.getByTitle('Close (Esc)');

        await fireEvent.click(closeBtn);

        expect(mockEditor.commands.clearSearch).toHaveBeenCalled();
        expect(onCloseMock).toHaveBeenCalled();
        expect(mockEditor.commands.focus).toHaveBeenCalled();
    });
});
