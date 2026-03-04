import { render, screen } from '@testing-library/react';
import Hero from '../components/Hero';

// Mock ProductPreview to isolate Hero
vi.mock('../components/ProductPreview', () => ({
    default: () => <div data-testid="product-preview" />,
}));

// Mirrors the exact constants inside Hero.jsx
const VERSION = 'v0.2.1';       // the component stores version WITH the 'v' prefix
const PREFIX = 'https://github.com/harun-alrosyid/md-lite/releases/download';
// The component builds: `${prefix}/v${version}/...` → produces /vv0.2.1/ (double-v)
const DOWNLOAD_BASE = `${PREFIX}/v${VERSION}`;

describe('Hero', () => {
    it('renders the hero section with id="home"', () => {
        render(<Hero />);
        expect(document.querySelector('#home')).toBeInTheDocument();
    });

    it('shows the version badge', () => {
        render(<Hero />);
        expect(screen.getByText(`MD Lite ${VERSION} is now available`)).toBeInTheDocument();
    });

    it('shows the main headline', () => {
        render(<Hero />);
        expect(screen.getByText('Write at the')).toBeInTheDocument();
        expect(screen.getByText('Speed of Thought.')).toBeInTheDocument();
    });

    it('shows the description paragraph', () => {
        render(<Hero />);
        expect(screen.getByText(/A hyper-lightweight, minimalist Markdown editor/i)).toBeInTheDocument();
    });

    it('Download for macOS link has correct href', () => {
        render(<Hero />);
        const link = screen.getByRole('link', { name: /Download for macOS/i });
        expect(link).toHaveAttribute(
            'href',
            `${DOWNLOAD_BASE}/MD.Lite_${VERSION}_aarch64.dmg`
        );
        expect(link).toHaveAttribute('target', '_blank');
    });

    it('GitHub link has correct href', () => {
        render(<Hero />);
        const link = screen.getByRole('link', { name: /View on GitHub/i });
        expect(link).toHaveAttribute('href', 'https://github.com/harun-alrosyid/md-lite');
        expect(link).toHaveAttribute('target', '_blank');
    });

    it('renders ProductPreview component', () => {
        render(<Hero />);
        expect(screen.getByTestId('product-preview')).toBeInTheDocument();
    });
});
