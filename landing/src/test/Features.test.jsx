import { render, screen } from '@testing-library/react';
import Features from '../components/Features';

describe('Features', () => {
    it('renders the features section with correct id', () => {
        render(<Features />);
        expect(document.querySelector('#features')).toBeInTheDocument();
    });

    it('shows the section heading "The Power of Less"', () => {
        render(<Features />);
        expect(screen.getByText('The Power of Less')).toBeInTheDocument();
    });

    it('shows the section sub-heading', () => {
        render(<Features />);
        expect(screen.getByText(/Minimalist interface paired with powerful/i)).toBeInTheDocument();
    });

    it('renders the Command Palette feature card', () => {
        render(<Features />);
        expect(screen.getByText('Command Palette (⌘K)')).toBeInTheDocument();
        expect(screen.getByText(/Ditch the mouse/i)).toBeInTheDocument();
    });

    it('renders the WYSIWYG Perfection feature card', () => {
        render(<Features />);
        expect(screen.getByText('WYSIWYG Perfection')).toBeInTheDocument();
        expect(screen.getByText(/No more split screens/i)).toBeInTheDocument();
    });

    it('renders the Typewriter Mode feature card', () => {
        render(<Features />);
        expect(screen.getByText('Typewriter Mode')).toBeInTheDocument();
        expect(screen.getByText(/Stay centered/i)).toBeInTheDocument();
    });

    it('renders the Native Performance feature card', () => {
        render(<Features />);
        expect(screen.getByText('Native Performance')).toBeInTheDocument();
        expect(screen.getByText(/Zero bloat/i)).toBeInTheDocument();
    });

    it('renders the Shadow Recovery feature card', () => {
        render(<Features />);
        expect(screen.getByText('Shadow Recovery')).toBeInTheDocument();
        expect(screen.getByText(/Your words are safe/i)).toBeInTheDocument();
    });

    it('applies md:col-span-2 class to the WYSIWYG card (span 2)', () => {
        const { container } = render(<Features />);
        const cards = container.querySelectorAll('.glass.p-8.rounded-2xl');
        // WYSIWYG is index 1 (0-based) and has span=2
        const wysiwygCard = cards[1];
        expect(wysiwygCard.className).toContain('md:col-span-2');
    });
});
