import { useState } from 'react';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    // Wire up to a form backend (Formspree, Netlify Forms, etc.) as needed
    setSubmitted(true);
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="font-display text-4xl font-bold text-[#7dd3fc] mb-2">Contact</h1>
      <p className="text-slate-400 mb-8">
        Have a question, collaboration idea, or just want to say hi? Drop us a message.
      </p>

      {submitted ? (
        <div className="rounded-xl border border-[#7dd3fc]/30 bg-[#1a1a2e] p-8 text-center">
          <div className="text-4xl mb-4">✓</div>
          <h2 className="font-display text-xl font-semibold text-white mb-2">Message Sent!</h2>
          <p className="text-slate-400">Thanks for reaching out. We'll get back to you soon.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              type="text"
              required
              className="w-full rounded-lg border border-white/10 bg-[#1a1a2e] px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#7dd3fc]/50 focus:outline-none"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              className="w-full rounded-lg border border-white/10 bg-[#1a1a2e] px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#7dd3fc]/50 focus:outline-none"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="message">
              Message
            </label>
            <textarea
              id="message"
              rows={5}
              required
              className="w-full rounded-lg border border-white/10 bg-[#1a1a2e] px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-[#7dd3fc]/50 focus:outline-none resize-none"
              placeholder="What's on your mind?"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-[#e94560] py-2.5 text-sm font-semibold text-white hover:bg-[#c73652] transition-colors"
          >
            Send Message
          </button>
        </form>
      )}
    </div>
  );
}
