import { useState } from 'react';
import { Mail, Send } from 'lucide-react';

export default function Support() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSend = (e) => {
        e.preventDefault();
        window.location.href = `mailto:hello@harunalrosyid.com?subject=Inquiry from ${encodeURIComponent(name)}&body=${encodeURIComponent(message)} (From: ${encodeURIComponent(email)})`;
    };

    return (
        <section id="contact" className="py-32 relative transition-colors" style={{ borderTop: '1px solid var(--border-color)' }}>
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"></div>

            <div className="max-w-2xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-5">Contact Developer</h2>
                    <p className="text-lg opacity-60">Have a question or feedback? We'd love to hear from you.</p>
                </div>

                <div className="glass p-8 md:p-12 rounded-3xl relative">
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 opacity-50"></div>

                    <div className="flex items-center gap-3 mb-8">
                        <Mail className="text-indigo-600 dark:text-indigo-400" size={24} />
                        <h3 className="text-xl font-semibold">Get in Touch</h3>
                    </div>

                    <form onSubmit={handleSend} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium opacity-60 mb-2">Name</label>
                                <input type="text" required className="input-field" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium opacity-60 mb-2">Email</label>
                                <input type="email" required className="input-field" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium opacity-60 mb-2">Message</label>
                            <textarea required className="input-field" placeholder="How can we help you today?" value={message} onChange={e => setMessage(e.target.value)}></textarea>
                        </div>
                        <div className="flex justify-end pt-2">
                            <button type="submit" className="btn-gradient inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full text-white font-semibold text-sm">
                                <Send size={16} /> Send Message
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
}
