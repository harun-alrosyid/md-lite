import { Apple, Book } from 'lucide-react';

export default function Download() {
    const version = "0.2.1";
    const prefix = "https://github.com/harun-alrosyid/md-lite/releases/download";

    return (
        <section id="download" className="py-32 transition-colors">
            <div className="max-w-4xl mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-5">Get MD Lite</h2>
                    <p className="text-lg opacity-60 max-w-xl mx-auto">
                        Download the latest executable for macOS or clone the repo to contribute.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* macOS */}
                    <div className="glass p-8 rounded-2xl text-center hover:border-indigo-500/30 transition-colors group">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-500/20 transition-colors">
                            <Apple size={32} />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">macOS</h3>
                        <p className="text-sm opacity-50 mb-8">Intel & Apple Silicon</p>
                        <div className="flex flex-col gap-3">
                            <a href={`${prefix}/v${version}/MD.Lite_${version}_aarch64.dmg`} target="_blank" rel="noreferrer" className="btn-gradient py-3.5 rounded-xl text-white font-semibold text-sm text-center">
                                Apple Silicon (.dmg)
                            </a>
                            <a href={`${prefix}/v${version}/MD.Lite_${version}_x64.dmg`} target="_blank" rel="noreferrer" className="py-3.5 rounded-xl font-medium text-sm text-center opacity-70 hover:opacity-100 transition-all" style={{ border: '1px solid var(--border-color)' }}>
                                Intel (.dmg)
                            </a>
                        </div>
                    </div>

                    {/* Contributors */}
                    <div className="glass p-8 rounded-2xl text-center hover:border-emerald-500/30 transition-colors group">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto mb-6 group-hover:bg-emerald-500/20 transition-colors">
                            <Book size={32} />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Contributors</h3>
                        <p className="text-sm opacity-50 mb-8">Build, run, and contribute to MD Lite.</p>
                        <a href="https://github.com/harun-alrosyid/md-lite/blob/main/CONTRIBUTING.md" target="_blank" rel="noreferrer" className="block py-3.5 rounded-xl font-medium text-sm text-center opacity-70 hover:opacity-100 transition-all" style={{ border: '1px solid var(--border-color)' }}>
                            Getting Started Guide →
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
