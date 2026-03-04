import { render, screen } from '@testing-library/react';
import Footer from '../components/Footer';

describe('Footer', () => {
    it('renders the footer element', () => {
        const { container } = render(<Footer />);
        expect(container.querySelector('footer')).toBeInTheDocument();
    });

    it('shows "MD Lite" brand name', () => {
        render(<Footer />);
        expect(screen.getByText('MD Lite')).toBeInTheDocument();
    });

    it('renders logo image', () => {
        render(<Footer />);
        const logo = screen.getByAltText('MD Lite Logo');
        expect(logo).toHaveAttribute('src', '/logo.png');
    });

    it('renders GitHub link with correct href', () => {
        render(<Footer />);
        const link = screen.getByRole('link', { name: /github/i });
        expect(link).toHaveAttribute('href', 'https://github.com/harun-alrosyid/md-lite');
    });

    it('renders License (MIT) link with correct href', () => {
        render(<Footer />);
        const link = screen.getByRole('link', { name: /license/i });
        expect(link).toHaveAttribute('href', 'https://github.com/harun-alrosyid/md-lite/blob/main/LICENSE');
    });

    it('renders Documentation link with correct href', () => {
        render(<Footer />);
        const link = screen.getByRole('link', { name: /documentation/i });
        expect(link).toHaveAttribute('href', 'https://github.com/harun-alrosyid/md-lite/blob/main/README.md');
    });

    it('shows copyright text', () => {
        render(<Footer />);
        expect(screen.getByText(/© 2026 Harun Alrosyid/i)).toBeInTheDocument();
    });

    it('shows built-with text', () => {
        render(<Footer />);
        expect(screen.getByText(/This Page Built with Vite \+ React/i)).toBeInTheDocument();
    });
});
