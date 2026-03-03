import { Github, Scale, FileText } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="py-12 transition-colors" style={{ borderTop: '1px solid var(--border-color)' }}>
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10">

                    {/* Brand */}
                    <div className="flex items-center gap-2.5">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                        <span className="font-bold text-lg tracking-tight">MD Lite</span>
                    </div>

                    {/* Links */}
                    <div className="flex flex-wrap gap-6">
                        <a href="https://github.com/harun-alrosyid/md-lite" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm opacity-60 hover:opacity-100 transition-colors">
                            <Github size={15} /> GitHub
                        </a>
                        <a href="https://github.com/harun-alrosyid/md-lite/blob/main/LICENSE" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm opacity-60 hover:opacity-100 transition-colors">
                            <Scale size={15} /> License (MIT)
                        </a>
                        <a href="https://github.com/harun-alrosyid/md-lite/blob/main/README.md" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm opacity-60 hover:opacity-100 transition-colors">
                            <FileText size={15} /> Documentation
                        </a>
                    </div>
                </div>

                <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs opacity-40" style={{ borderTop: '1px solid var(--border-color)' }}>
                    <span>&copy; 2026 Harun Alrosyid.</span>
                    <span>This Page Built with Vite + React.</span>
                </div>
            </div>
        </footer>
    );
}
