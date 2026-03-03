export default function Technical() {
    return (
        <section className="py-32 relative transition-colors" style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex flex-col lg:flex-row items-center gap-16">

                    {/* Text */}
                    <div className="flex-1 max-w-xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                            Engineering Approach
                        </div>
                        <h2 className="text-4xl font-bold tracking-tight mb-6">Built for native performance.</h2>
                        <p className="text-lg opacity-60 leading-relaxed mb-10">
                            MD Lite is a natively optimized application backed by a Rust core and reactive Svelte 5 frontend.
                        </p>

                        <div className="space-y-5 pl-6" style={{ borderLeft: '2px solid var(--border-color)' }}>
                            <div>
                                <div className="font-semibold text-base mb-1">Vitest & Cargo Test</div>
                                <div className="text-sm opacity-50">Rigorous frontend and Rust backend testing ensures absolute stability.</div>
                            </div>
                            <div>
                                <div className="font-semibold text-base mb-1">Tauri v2 Engine</div>
                                <div className="text-sm opacity-50">Native binary output with webview flexibility and tiny bundle size.</div>
                            </div>
                        </div>
                    </div>

                    {/* Code Window */}
                    <div className="flex-1 w-full">
                        <div className="rounded-xl overflow-hidden shadow-2xl shadow-black/40 transform hover:scale-[1.01] transition-transform duration-500" style={{ border: '1px solid var(--border-color)' }}>
                            <img
                                src="/screenshots/product-preview-2.jpg"
                                alt="Technical detail of MD Lite"
                                className="w-full h-auto block"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
