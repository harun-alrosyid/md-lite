import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import TitleBar from './TitleBar.svelte';

describe('TitleBar', () => {
    const defaultProps = {
        fileName: 'test.md',
        isDirty: false,
        isSaving: false,
        theme: 'dark' as const,
        hasFile: true,
        onToggleTheme: vi.fn(),
        onRename: vi.fn(),
        onToggleOutline: vi.fn(),
    };

    it('displays the file name', () => {
        render(TitleBar, { props: defaultProps });
        expect(screen.getByText('test.md')).toBeTruthy();
    });

    it('displays "Untitled" when fileName is empty', () => {
        render(TitleBar, { props: { ...defaultProps, fileName: '' } });
        expect(screen.getByText('Untitled')).toBeTruthy();
    });

    it('shows dirty dot when isDirty is true', () => {
        const { container } = render(TitleBar, {
            props: { ...defaultProps, isDirty: true },
        });
        const dot = container.querySelector('.titlebar-dot');
        expect(dot).toBeTruthy();
    });

    it('hides dirty dot when isDirty is false', () => {
        const { container } = render(TitleBar, {
            props: { ...defaultProps, isDirty: false },
        });
        const dot = container.querySelector('.titlebar-dot');
        expect(dot).toBeNull();
    });

    it('shows "Saving…" when isSaving is true', () => {
        render(TitleBar, {
            props: { ...defaultProps, isSaving: true },
        });
        expect(screen.getByText('Saving…')).toBeTruthy();
    });

    it('hides "Saving…" when isSaving is false', () => {
        render(TitleBar, {
            props: { ...defaultProps, isSaving: false },
        });
        expect(screen.queryByText('Saving…')).toBeNull();
    });

    it('renders toggle theme button with accessible label', () => {
        render(TitleBar, { props: defaultProps });
        const btn = screen.getByRole('button', { name: /toggle theme/i });
        expect(btn).toBeTruthy();
    });

    it('calls onToggleTheme when toggle button is clicked', async () => {
        const onToggleTheme = vi.fn();
        render(TitleBar, {
            props: { ...defaultProps, onToggleTheme },
        });
        const btn = screen.getByRole('button', { name: /toggle theme/i });
        await fireEvent.click(btn);
        expect(onToggleTheme).toHaveBeenCalledOnce();
    });

    it('renders sun SVG in dark theme', () => {
        const { container } = render(TitleBar, {
            props: { ...defaultProps, theme: 'dark' },
        });
        // Sun icon has a <circle> element
        const circle = container.querySelector('svg circle');
        expect(circle).toBeTruthy();
    });

    it('renders moon SVG in light theme', () => {
        const { container } = render(TitleBar, {
            props: { ...defaultProps, theme: 'light' },
        });
        // Moon icon has a <path> but no <circle>
        const circle = container.querySelector('svg circle');
        const path = container.querySelector('svg path');
        expect(circle).toBeNull();
        expect(path).toBeTruthy();
    });

    it('shows outline button when hasFile is true', () => {
        const onToggleOutline = vi.fn();
        const { container } = render(TitleBar, {
            props: { ...defaultProps, hasFile: true, onToggleOutline },
        });
        const btn = screen.getByTitle('Toggle Outline (⌘⇧O)');
        expect(btn).toBeTruthy();
    });

    it('hides outline button when hasFile is false', () => {
        render(TitleBar, {
            props: { ...defaultProps, hasFile: false },
        });
        expect(screen.queryByTitle('Toggle Outline (⌘⇧O)')).toBeNull();
    });

    it('calls onToggleOutline when outline button clicked', async () => {
        const onToggleOutline = vi.fn();
        render(TitleBar, {
            props: { ...defaultProps, hasFile: true, onToggleOutline },
        });
        const btn = screen.getByTitle('Toggle Outline (⌘⇧O)');
        await fireEvent.click(btn);
        expect(onToggleOutline).toHaveBeenCalledOnce();
    });

    describe('Inline Rename', () => {
        it('enters edit mode on double click', async () => {
            render(TitleBar, { props: defaultProps });
            const titleBtn = screen.getByText('test.md');
            await fireEvent.click(titleBtn); // single click does nothing
            await fireEvent.dblClick(titleBtn); // enter edit mode

            const input = screen.getByDisplayValue('test.md');
            expect(input).toBeTruthy();
        });

        it('commits rename on enter key', async () => {
            const onRename = vi.fn();
            render(TitleBar, { props: { ...defaultProps, onRename } });

            const titleBtn = screen.getByText('test.md');
            await fireEvent.dblClick(titleBtn);

            const input = screen.getByDisplayValue('test.md');

            // Type a new name
            await fireEvent.input(input, { target: { value: 'new-name.md' } });
            await fireEvent.keyDown(input, { key: 'Enter' });

            expect(onRename).toHaveBeenCalledWith('new-name.md');
            expect(screen.queryByDisplayValue('new-name.md')).toBeNull(); // editing mode closes
        });

        it('appends .md extension if missing during commit', async () => {
            const onRename = vi.fn();
            render(TitleBar, { props: { ...defaultProps, onRename } });

            await fireEvent.dblClick(screen.getByText('test.md'));
            const input = screen.getByDisplayValue('test.md');

            await fireEvent.input(input, { target: { value: 'no-extension' } });
            await fireEvent.blur(input); // blur also commits

            expect(onRename).toHaveBeenCalledWith('no-extension.md');
        });

        it('cancels rename on Escape key', async () => {
            const onRename = vi.fn();
            render(TitleBar, { props: { ...defaultProps, onRename } });

            await fireEvent.dblClick(screen.getByText('test.md'));
            const input = screen.getByDisplayValue('test.md');

            await fireEvent.input(input, { target: { value: 'cancelled' } });
            await fireEvent.keyDown(input, { key: 'Escape' });

            expect(onRename).not.toHaveBeenCalled();
            expect(screen.getByText('test.md')).toBeTruthy(); // Reverts to original
        });

        it('does not commit if name is unchanged', async () => {
            const onRename = vi.fn();
            render(TitleBar, { props: { ...defaultProps, onRename } });

            await fireEvent.dblClick(screen.getByText('test.md'));
            const input = screen.getByDisplayValue('test.md');

            await fireEvent.keyDown(input, { key: 'Enter' });
            expect(onRename).not.toHaveBeenCalled();
        });

        it('does not commit if name is empty', async () => {
            const onRename = vi.fn();
            render(TitleBar, { props: { ...defaultProps, onRename } });

            await fireEvent.dblClick(screen.getByText('test.md'));
            const input = screen.getByDisplayValue('test.md');

            await fireEvent.input(input, { target: { value: '   ' } });
            await fireEvent.blur(input);

            expect(onRename).not.toHaveBeenCalled();
        });
    });
});
