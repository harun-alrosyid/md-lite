import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock all child components to isolate App
vi.mock('../components/Navbar', () => ({ default: () => <nav data-testid="navbar" /> }));
vi.mock('../components/Hero', () => ({ default: () => <section data-testid="hero" /> }));
vi.mock('../components/Features', () => ({ default: () => <section data-testid="features" /> }));
vi.mock('../components/Technical', () => ({ default: () => <section data-testid="technical" /> }));
vi.mock('../components/Download', () => ({ default: () => <section data-testid="download" /> }));
vi.mock('../components/About', () => ({ default: () => <section data-testid="about" /> }));
vi.mock('../components/Support', () => ({ default: () => <section data-testid="support" /> }));
vi.mock('../components/Footer', () => ({ default: () => <footer data-testid="footer" /> }));

describe('App', () => {
    it('renders without crashing', () => {
        const { container } = render(<App />);
        expect(container.firstChild).toBeTruthy();
    });

    it('renders Navbar', () => {
        render(<App />);
        expect(screen.getByTestId('navbar')).toBeInTheDocument();
    });

    it('renders a main element', () => {
        const { container } = render(<App />);
        expect(container.querySelector('main')).toBeInTheDocument();
    });

    it('renders Footer', () => {
        render(<App />);
        expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('renders all section components inside main', () => {
        render(<App />);
        expect(screen.getByTestId('hero')).toBeInTheDocument();
        expect(screen.getByTestId('features')).toBeInTheDocument();
        expect(screen.getByTestId('technical')).toBeInTheDocument();
        expect(screen.getByTestId('download')).toBeInTheDocument();
        expect(screen.getByTestId('about')).toBeInTheDocument();
        expect(screen.getByTestId('support')).toBeInTheDocument();
    });
});
