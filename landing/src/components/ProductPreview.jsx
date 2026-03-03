export default function ProductPreview() {
    return (
        <div className="relative mt-16 md:mt-24 animate-fade-in-up animate-delay-400">
            {/* Glow behind */}
            <div className="absolute inset-0 -inset-x-8 -inset-y-8 bg-indigo-500/15 rounded-3xl blur-[80px] pointer-events-none"></div>

            {/* Product Image Container */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10 mx-auto max-w-5xl transform hover:scale-[1.01] transition-transform duration-700">
                <img
                    src="/screenshots/product-preview.jpg"
                    alt="MD Lite Product Preview"
                    className="w-full h-auto block"
                />
            </div>
        </div>
    );
}
