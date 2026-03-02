import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import OutlinePanel from './OutlinePanel.svelte';
import type { OutlineHeading } from './outline';

describe('OutlinePanel', () => {
    const defaultProps = {
        visible: true,
        headings: [
            { id: '1', level: 1, text: 'H1', pos: 10 },
            { id: '2', level: 2, text: 'H2', pos: 20 },
            { id: '3', level: 3, text: 'H3', pos: 30 },
        ] as OutlineHeading[],
        activeId: null,
        onJump: vi.fn(),
        onClose: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // Mock scrollIntoView to prevent JSDOM errors
        Element.prototype.scrollIntoView = vi.fn();
    });

    it('does not render when visible is false', () => {
        const { container } = render(OutlinePanel, { props: { ...defaultProps, visible: false } });
        expect(container.querySelector('.outline-panel')).toBeNull();
    });

    it('renders headings when visible is true', () => {
        const { container } = render(OutlinePanel, { props: defaultProps });
        expect(container.querySelector('.outline-panel')).not.toBeNull();
        expect(screen.getByText('H1')).toBeTruthy();
        expect(screen.getByText('H2')).toBeTruthy();
        expect(screen.getByText('H3')).toBeTruthy();
    });

    it('shows empty state when no headings', () => {
        render(OutlinePanel, { props: { ...defaultProps, headings: [] } });
        expect(screen.getByText('No headings found')).toBeTruthy();
    });

    it('clicking close button calls onClose', async () => {
        render(OutlinePanel, { props: defaultProps });
        const closeBtn = screen.getByTitle('Close (Esc)');
        await fireEvent.click(closeBtn);
        expect(defaultProps.onClose).toHaveBeenCalledOnce();
    });

    it('clicking an item calls onJump with item position', async () => {
        render(OutlinePanel, { props: defaultProps });
        const h2 = screen.getByText('H2').closest('button')!;
        await fireEvent.click(h2);
        expect(defaultProps.onJump).toHaveBeenCalledWith(20);
    });

    it('mouse move on item sets focus index', async () => {
        const { container } = render(OutlinePanel, { props: defaultProps });
        const h3 = screen.getByText('H3').closest('button')!;
        await fireEvent.mouseMove(h3);
        // It should have 'is-focused' class
        expect(h3.classList.contains('is-focused')).toBe(true);
    });

    it('re-focuses to activeId on visible true', async () => {
        render(OutlinePanel, { props: { ...defaultProps, activeId: '2' } });
        await waitFor(() => {
            const h2 = screen.getByText('H2').closest('button')!;
            expect(h2.classList.contains('is-active')).toBe(true);
        });
    });

    describe('Keyboard navigation', () => {
        it('Escape calls onClose', async () => {
            render(OutlinePanel, { props: defaultProps });
            await fireEvent.keyDown(window, { key: 'Escape' });
            expect(defaultProps.onClose).toHaveBeenCalledOnce();
        });

        it('ignores keydown if not visible', async () => {
            render(OutlinePanel, { props: { ...defaultProps, visible: false } });
            await fireEvent.keyDown(window, { key: 'Escape' });
            expect(defaultProps.onClose).not.toHaveBeenCalled();
        });

        it('ArrowDown navigates list', async () => {
            // By default, index 0 is focused if activeId is null
            const { container } = render(OutlinePanel, { props: defaultProps });

            await fireEvent.keyDown(window, { key: 'ArrowDown' }); // Focus moves to index 1 (H2)

            await waitFor(() => {
                const buttons = container.querySelectorAll('.outline-item');
                expect(buttons[0].classList.contains('is-focused')).toBe(false);
                expect(buttons[1].classList.contains('is-focused')).toBe(true);
            });
        });

        it('ArrowUp navigates list upwards', async () => {
            const { container } = render(OutlinePanel, { props: defaultProps });

            await fireEvent.keyDown(window, { key: 'ArrowUp' }); // Focus wraps to last index (H3)

            await waitFor(() => {
                const buttons = container.querySelectorAll('.outline-item');
                expect(buttons[2].classList.contains('is-focused')).toBe(true);
            });
        });

        it('Enter calls onJump and onClose', async () => {
            render(OutlinePanel, { props: defaultProps });

            await fireEvent.keyDown(window, { key: 'ArrowDown' }); // Focus index 1 (H2)
            await fireEvent.keyDown(window, { key: 'Enter' });

            expect(defaultProps.onJump).toHaveBeenCalledWith(20);
            expect(defaultProps.onClose).toHaveBeenCalledOnce();
        });
    });
});
