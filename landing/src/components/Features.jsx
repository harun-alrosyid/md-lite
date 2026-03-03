import { Command, Orbit, Maximize, Zap, Shield } from 'lucide-react';

const features = [
    {
        icon: <Command size={24} />,
        title: "Command Palette (⌘K)",
        desc: "Ditch the mouse. Navigate, format, and execute commands entirely from your keyboard.",
        color: "indigo",
        span: 1,
    },
    {
        icon: <Orbit size={24} />,
        title: "WYSIWYG Perfection",
        desc: "No more split screens. Edit and preview in a single, seamless flow.",
        color: "violet",
        span: 2,
    },
    {
        icon: <Maximize size={24} />,
        title: "Typewriter Mode",
        desc: "Stay centered. Your cursor stays in focus while the UI fades away.",
        color: "indigo",
        span: 1,
    },
    {
        icon: <Zap size={24} />,
        title: "Native Performance",
        desc: "Zero bloat. Built on Tauri v2 for a tiny footprint and blazing startup times.",
        color: "emerald",
        span: 1,
    },
    {
        icon: <Shield size={24} />,
        title: "Shadow Recovery",
        desc: "Your words are safe. Auto-save and session recovery mean you never lose a line.",
        color: "indigo",
        span: 1,
    },
];

const colorMap = {
    indigo: { bg: 'bg-indigo-500/10 dark:bg-indigo-500/20', text: 'text-indigo-600 dark:text-indigo-400', hover: 'hover:border-indigo-500/30' },
    violet: { bg: 'bg-violet-500/10 dark:bg-violet-500/20', text: 'text-violet-600 dark:text-violet-400', hover: 'hover:border-violet-500/30' },
    emerald: { bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400', hover: 'hover:border-emerald-500/30' },
};

export default function Features() {
    return (
        <section id="features" className="py-32 relative transition-colors">
            {/* Subtle bg radial */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.06),transparent_60%)] pointer-events-none"></div>

            <div className="max-w-6xl mx-auto px-6 relative z-10">
                <div className="text-center mb-20 animate-fade-in-up">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-5 select-none">The Power of Less</h2>
                    <p className="text-lg opacity-70 max-w-xl mx-auto leading-relaxed">
                        Minimalist interface paired with powerful, keyboard-first tools.
                    </p>
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {features.map((f, i) => {
                        const c = colorMap[f.color];
                        return (
                            <div
                                key={i}
                                className={`glass p-8 rounded-2xl transition-all duration-300 ${c.hover} ${f.span === 2 ? 'md:col-span-2' : ''} group animate-fade-in-up`}
                                style={{ animationDelay: `${i * 0.1}s` }}
                            >
                                <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center ${c.text} mb-5 group-hover:scale-110 transition-transform`}>
                                    {f.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                                <p className="text-base opacity-60 leading-relaxed font-medium">{f.desc}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
