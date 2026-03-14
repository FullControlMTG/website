import ContactForm from './ContactForm';

export const metadata = { title: 'Contact — FullControlMTG' };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="font-display text-4xl font-bold text-[#7dd3fc] mb-2">Contact</h1>
      <p className="text-slate-400 mb-8">
        Have a question, collaboration idea, or just want to say hi? Drop us a message.
      </p>
      <ContactForm />
    </div>
  );
}
