import { render, screen } from '@testing-library/react';
import About from '../components/About';

describe('About', () => {
    it('renders the about section with correct id', () => {
        render(<About />);
        expect(document.querySelector('#about')).toBeInTheDocument();
    });

    it('shows "Our Vision" badge', () => {
        render(<About />);
        expect(screen.getByText('Our Vision')).toBeInTheDocument();
    });

    it('shows the philosophy heading', () => {
        render(<About />);
        expect(screen.getByText(/The Philosophy of/i)).toBeInTheDocument();
    });

    it('shows the quoted philosophy text', () => {
        render(<About />);
        expect(screen.getByText(/MD-Lite was born out of a need/i)).toBeInTheDocument();
    });

    it('shows the author name', () => {
        render(<About />);
        expect(screen.getByText('Harun Alrosyid')).toBeInTheDocument();
    });

    it('shows the author title', () => {
        render(<About />);
        expect(screen.getByText('Creator & Lead Developer')).toBeInTheDocument();
    });

    it('shows the "HA" avatar initials', () => {
        render(<About />);
        expect(screen.getByText('HA')).toBeInTheDocument();
    });
});
