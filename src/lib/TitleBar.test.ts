import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import TitleBar from './TitleBar.svelte';

describe('TitleBar', () => {
    const defaultProps = {
        fileName: 'test.md',
        isDirty: false,
        isSaving: false,
        theme: 'dark' as const,
        onToggleTheme: vi.fn(),
        onRename: vi.fn(),
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
        await btn.click();
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
});
