export default function About() {
    return (
        <section id="about" className="py-32 relative overflow-hidden transition-colors">
            {/* Ambient glow */}
            <div className="absolute bottom-[-30%] right-[-10%] w-[500px] h-[500px] bg-violet-500/5 dark:bg-violet-500/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-3xl mx-auto px-6 relative z-10 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 mb-8 text-sm font-medium opacity-60" style={{ border: '1px solid var(--border-color)' }}>
                    Our Vision
                </div>

                <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-12 leading-tight">
                    The Philosophy of <span className="text-gradient">Simplicity</span>.
                </h2>

                <div className="glass p-10 md:p-14 rounded-3xl relative text-left">
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-500 to-emerald-400 opacity-60"></div>

                    <p className="text-xl md:text-2xl leading-relaxed font-medium mb-8 opacity-80">
                        "MD-Lite was born out of a need for a markdown editor that doesn't get in the way. No distractions, just you and your thoughts."
                    </p>

                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm shrink-0">
                            HA
                        </div>
                        <div>
                            <div className="font-semibold">Harun Alrosyid</div>
                            <div className="text-sm opacity-50">Creator & Lead Developer</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
