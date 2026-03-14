export default function ContactForm() {
  return (
    <a
      href="mailto:fullcontrolmtg@gmail.com"
      className="inline-flex items-center gap-3 rounded-lg bg-[#e94560] px-6 py-3 text-sm font-semibold text-white hover:bg-[#c73652] transition-colors"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
      Send us an email
    </a>
  );
}
