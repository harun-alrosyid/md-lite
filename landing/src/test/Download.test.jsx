import { render, screen } from '@testing-library/react';
import Download from '../components/Download';

const VERSION = '0.2.1';
const PREFIX = 'https://github.com/harun-alrosyid/md-lite/releases/download';

describe('Download', () => {
    it('renders the download section with correct id', () => {
        render(<Download />);
        expect(document.querySelector('#download')).toBeInTheDocument();
    });

    it('shows the section heading "Get MD Lite"', () => {
        render(<Download />);
        expect(screen.getByText('Get MD Lite')).toBeInTheDocument();
    });

    it('shows the description text', () => {
        render(<Download />);
        expect(screen.getByText(/Download the latest executable/i)).toBeInTheDocument();
    });

    it('shows the macOS card heading', () => {
        render(<Download />);
        expect(screen.getByText('macOS')).toBeInTheDocument();
    });

    it('shows Intel & Apple Silicon sub-label', () => {
        render(<Download />);
        expect(screen.getByText('Intel & Apple Silicon')).toBeInTheDocument();
    });

    it('Apple Silicon download link has correct href', () => {
        render(<Download />);
        const link = screen.getByRole('link', { name: /Apple Silicon \(\.dmg\)/i });
        expect(link).toHaveAttribute(
            'href',
            `${PREFIX}/v${VERSION}/MD.Lite_${VERSION}_aarch64.dmg`
        );
    });

    it('Intel download link has correct href', () => {
        render(<Download />);
        const link = screen.getByRole('link', { name: /Intel \(\.dmg\)/i });
        expect(link).toHaveAttribute(
            'href',
            `${PREFIX}/v${VERSION}/MD.Lite_${VERSION}_x64.dmg`
        );
    });

    it('shows the contributors card heading', () => {
        render(<Download />);
        expect(screen.getByText('Contributors')).toBeInTheDocument();
    });

    it('Getting Started Guide link has correct href', () => {
        render(<Download />);
        const link = screen.getByRole('link', { name: /Getting Started Guide/i });
        expect(link).toHaveAttribute(
            'href',
            'https://github.com/harun-alrosyid/md-lite/blob/main/CONTRIBUTING.md'
        );
    });
});
