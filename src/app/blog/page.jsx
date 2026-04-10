import { getAllPosts } from '@/lib/markdown';
import BlogGallery from '@/components/ui/BlogGallery';

export const revalidate = 3600;
export const metadata = { title: 'Blog — FullControlMTG' };

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-10">
        <h1 className="font-display text-4xl font-bold text-[#7dd3fc] mb-2">Blog</h1>
        <p className="text-slate-400">
          Strategy guides, card analysis, and deep dives into Magic: The Gathering.
        </p>
      </div>
      <BlogGallery posts={posts} />
    </div>
  );
}
