import { getAllContent } from '@/lib/markdown';
import ContentGallery from '@/components/ui/ContentGallery';

export const metadata = { title: 'Content — FullControlMTG' };

export default function ContentPage() {
  const items = getAllContent();

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-10">
        <h1 className="font-display text-4xl font-bold text-[#7dd3fc] mb-2">Content</h1>
        <p className="text-slate-400">
          Deck techs, gameplay videos, and in-depth strategy content. All free on YouTube.
        </p>
      </div>
      <ContentGallery items={items} />
    </div>
  );
}
