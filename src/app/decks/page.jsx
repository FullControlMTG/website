import { getAllDecks } from '@/lib/markdown';
import DeckGallery from '@/components/ui/DeckGallery';

export const metadata = { title: 'Decklists — FullControlMTG' };

export default function DecksPage() {
  const decks = getAllDecks();

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-10">
        <h1 className="font-display text-4xl font-bold text-[#7dd3fc] mb-2">Decklists</h1>
        <p className="text-slate-400">
          Browse our curated Magic: The Gathering decklists.
        </p>
      </div>
      <DeckGallery decks={decks} />
    </div>
  );
}
