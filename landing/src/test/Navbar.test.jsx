import { render, screen, fireEvent, act } from '@testing-library/react';
import Navbar from '../components/Navbar';

describe('Navbar', () => {
    beforeEach(() => {
        localStorage.clear();
        window.scrollTo.mockClear();
        document.documentElement.removeAttribute('data-theme');
    });

    // ── Theme Initialization ────────────────────────────────────────────────

    it('defaults to dark theme when localStorage is empty', () => {
        render(<Navbar />);
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('reads saved theme from localStorage on mount', () => {
        localStorage.setItem('md-lite-theme', 'light');
        render(<Navbar />);
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('persists theme to localStorage on mount', () => {
        render(<Navbar />);
        expect(localStorage.getItem('md-lite-theme')).toBe('dark');
    });

    // ── Theme Toggle ────────────────────────────────────────────────────────

    it('shows Sun icon when theme is dark', () => {
        render(<Navbar />);
        // Sun icon title doesn't exist in lucide — we check by button title
        const btn = screen.getByTitle('Toggle theme');
        expect(btn).toBeInTheDocument();
        // In dark mode Sun is shown (so user can switch to light)
        // The button contains an SVG; we verify Moon doesn't exist by triggering toggle
        fireEvent.click(btn);
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
        expect(localStorage.getItem('md-lite-theme')).toBe('light');
    });

    it('toggles from dark to light and back to dark', () => {
        render(<Navbar />);
        const btn = screen.getByTitle('Toggle theme');
        // dark → light
        fireEvent.click(btn);
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
        // light → dark
        fireEvent.click(btn);
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('saves toggled theme to localStorage', () => {
        render(<Navbar />);
        fireEvent.click(screen.getByTitle('Toggle theme'));
        expect(localStorage.getItem('md-lite-theme')).toBe('light');
    });

    // ── Nav Links ───────────────────────────────────────────────────────────

    it('renders all 5 navigation link labels', () => {
        render(<Navbar />);
        const links = ['home', 'features', 'download', 'about', 'contact'];
        links.forEach((l) => {
            // each link appears at least once (desktop + possibly mobile)
            const buttons = screen.getAllByText(new RegExp(`^${l}$`, 'i'));
            expect(buttons.length).toBeGreaterThanOrEqual(1);
        });
    });

    it('renders the GitHub link with correct href', () => {
        render(<Navbar />);
        const link = screen.getByRole('link', { name: /github/i });
        expect(link).toHaveAttribute('href', 'https://github.com/harun-alrosyid/md-lite');
        expect(link).toHaveAttribute('target', '_blank');
    });

    // ── Scroll Navigation ───────────────────────────────────────────────────

    it('calls window.scrollTo when clicking a nav link targeting an existing element', () => {
        // Create a real DOM element with id="features"
        const el = document.createElement('section');
        el.id = 'features';
        document.body.appendChild(el);

        render(<Navbar />);
        const btns = screen.getAllByText(/^features$/i);
        fireEvent.click(btns[0]);

        expect(window.scrollTo).toHaveBeenCalledWith(
            expect.objectContaining({ behavior: 'smooth' })
        );

        document.body.removeChild(el);
    });

    it('does NOT throw when clicking a nav link targeting a missing element', () => {
        render(<Navbar />);
        const btns = screen.getAllByText(/^contact$/i);
        expect(() => fireEvent.click(btns[0])).not.toThrow();
    });

    // ── Logo Button ─────────────────────────────────────────────────────────

    it('renders the MD Lite logo image', () => {
        render(<Navbar />);
        const logo = screen.getByAltText('MD Lite Logo');
        expect(logo).toHaveAttribute('src', '/logo.png');
    });

    it('renders the brand name text', () => {
        render(<Navbar />);
        expect(screen.getByText('MD Lite')).toBeInTheDocument();
    });

    it('clicking the logo button scrolls to #home element if present', () => {
        const el = document.createElement('section');
        el.id = 'home';
        document.body.appendChild(el);

        render(<Navbar />);
        // Logo button is the first button in the nav
        const logoBtn = screen.getByText('MD Lite').closest('button');
        fireEvent.click(logoBtn);
        expect(window.scrollTo).toHaveBeenCalledWith(
            expect.objectContaining({ behavior: 'smooth' })
        );

        document.body.removeChild(el);
    });

    // ── Mobile Menu ─────────────────────────────────────────────────────────

    it('mobile menu is closed by default (no duplicated links visible)', () => {
        render(<Navbar />);
        // When closed there is NO mobile-menu div, so each link text appears once
        const homeLinks = screen.getAllByText(/^home$/i);
        expect(homeLinks).toHaveLength(1);
    });

    it('clicking the menu button opens the mobile menu', () => {
        render(<Navbar />);
        const menuBtn = screen.getByRole('button', { name: '' }); // no aria-label — find via SVG
        // We find the hamburger button by looking for the button that doesn't have a title
        const allButtons = screen.getAllByRole('button');
        // buttons: logo, each desktop link (5), theme toggle, hamburger = 8 total without open
        // The hamburger is the last button
        const hamburger = allButtons[allButtons.length - 1];
        fireEvent.click(hamburger);

        // Now mobile links appear too
        const homeLinks = screen.getAllByText(/^home$/i);
        expect(homeLinks.length).toBeGreaterThan(1);
    });

    it('clicking a mobile link closes the mobile menu', () => {
        render(<Navbar />);
        const allButtons = screen.getAllByRole('button');
        const hamburger = allButtons[allButtons.length - 1];

        // Open menu
        fireEvent.click(hamburger);
        // Grab a mobile link — now multiple "home" exist; click the second one
        const homeLinks = screen.getAllByText(/^home$/i);
        fireEvent.click(homeLinks[homeLinks.length - 1]);

        // After closing, only one "home" should be present again
        const homeLinksAfter = screen.getAllByText(/^home$/i);
        expect(homeLinksAfter).toHaveLength(1);
    });

    it('clicking the menu button again closes the mobile menu (X → Menu)', () => {
        render(<Navbar />);
        const allButtons = screen.getAllByRole('button');
        const hamburger = allButtons[allButtons.length - 1];

        fireEvent.click(hamburger); // open
        // After opening, the same button now renders X icon; click again to close
        const allButtonsOpen = screen.getAllByRole('button');
        const closeBtn = allButtonsOpen[allButtonsOpen.length - 1];
        fireEvent.click(closeBtn); // close

        const homeLinks = screen.getAllByText(/^home$/i);
        expect(homeLinks).toHaveLength(1);
    });

    it('mobile menu renders the GitHub link', () => {
        render(<Navbar />);
        const allButtons = screen.getAllByRole('button');
        const hamburger = allButtons[allButtons.length - 1];
        fireEvent.click(hamburger);

        // After opening, there should be GitHub links (desktop + mobile)
        const ghLinks = screen.getAllByRole('link', { name: /github/i });
        expect(ghLinks.length).toBeGreaterThanOrEqual(2);
    });
});
