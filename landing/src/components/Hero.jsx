import { Apple, Github } from 'lucide-react';
import ProductPreview from './ProductPreview';

export default function Hero() {
    const version = "v0.2.1";
    const prefix = "https://github.com/harun-alrosyid/md-lite/releases/download";
    const downloadLink = `${prefix}/v${version}/MD.Lite_${version}_aarch64.dmg`;

    return (
        <section id="home" className="relative pt-40 pb-16 overflow-hidden transition-colors">
            {/* Ambient background glows */}
            <div className="absolute top-[-20%] left-[10%] w-[500px] h-[500px] bg-indigo-600/10 dark:bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute top-[10%] right-[-5%] w-[400px] h-[400px] bg-violet-500/5 dark:bg-violet-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="max-w-6xl mx-auto px-6 relative z-10">

                {/* Badge */}
                <div className="flex justify-center mb-10 animate-fade-in-up">
                    <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm font-medium opacity-70">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        MD Lite {version} is now available
                    </div>
                </div>

                {/* Headline */}
                <div className="text-center max-w-4xl mx-auto animate-fade-in-up">
                    <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-8 select-none">
                        Write at the<br />
                        <span className="text-gradient">Speed of Thought.</span>
                    </h1>

                    <p className="text-lg md:text-xl opacity-70 max-w-2xl mx-auto mb-12 leading-relaxed">
                        A hyper-lightweight, minimalist Markdown editor for macOS. Built with Tauri & Svelte 5 for best performance.
                    </p>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animate-delay-200">
                    <a href={downloadLink} target="_blank" rel="noreferrer" className="btn-gradient inline-flex items-center gap-3 px-8 py-4 rounded-full text-white font-semibold text-base shadow-lg shadow-indigo-500/25">
                        <Apple size={22} /> Download for macOS (.dmg)
                    </a>
                    <a href="https://github.com/harun-alrosyid/md-lite" target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 px-8 py-4 rounded-full border border-current opacity-70 hover:opacity-100 dark:hover:bg-white/5 hover:bg-black/5 transition-all font-medium text-base">
                        <Github size={20} /> View on GitHub
                    </a>
                </div>

                {/* Product Preview Mockup */}
                <ProductPreview />
            </div>
        </section>
    );
}
