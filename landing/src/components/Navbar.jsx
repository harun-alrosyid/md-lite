import { Github, Menu, X, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
    const [open, setOpen] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem('md-lite-theme') || 'dark');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('md-lite-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    const go = (id) => {
        setOpen(false);
        const el = document.getElementById(id);
        if (el) {
            const offset = 80; // Navbar height
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = el.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    const links = ['home', 'features', 'download', 'about', 'contact'];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass border-b transition-colors border-white/5">
            <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between font-sans">

                {/* Logo */}
                <button onClick={() => go('home')} className="flex items-center gap-2.5 font-bold text-lg tracking-tight select-none">
                    <img src="/logo.png" alt="MD Lite Logo" className="w-6 h-6 object-contain" />
                    <span className="text-inherit">MD Lite</span>
                </button>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-1">
                    {links.map(l => (
                        <button key={l} onClick={() => go(l)} className="px-4 py-2 text-sm font-medium opacity-70 hover:opacity-100 hover:text-indigo-500 transition-all capitalize rounded-lg bg-transparent hover:bg-black/5 dark:hover:bg-white/5">
                            {l}
                        </button>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors opacity-70 hover:opacity-100"
                        title="Toggle theme"
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    <a href="https://github.com/harun-alrosyid/md-lite" target="_blank" rel="noreferrer" className="hidden md:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-current opacity-70 rounded-full hover:opacity-100 hover:text-indigo-500 transition-all">
                        <Github size={16} /> GitHub
                    </a>

                    <button onClick={() => setOpen(!open)} className="md:hidden p-2 opacity-70 hover:opacity-100 transition-colors">
                        {open ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {open && (
                <div className="md:hidden glass border-t border-white/5 px-6 py-4 flex flex-col gap-2">
                    {links.map(l => (
                        <button key={l} onClick={() => go(l)} className="text-left py-2 capitalize font-medium opacity-70 hover:opacity-100 transition-colors">
                            {l}
                        </button>
                    ))}
                    <a href="https://github.com/harun-alrosyid/md-lite" target="_blank" rel="noreferrer" className="flex items-center gap-2 py-2 text-sm font-medium opacity-70 hover:opacity-100 transition-colors border-t border-white/5 mt-2 pt-4">
                        <Github size={18} /> GitHub
                    </a>
                </div>
            )}
        </nav>
    );
}
