import { useParams, Link, Navigate } from 'react-router-dom';
import { marked } from 'marked';
import { getPostBySlug } from '../utils/markdown';
import TagBadge from '../components/ui/TagBadge';

export default function BlogPost() {
  const { slug } = useParams();
  const post = getPostBySlug(slug);

  if (!post) return <Navigate to="/blog" replace />;

  const fm = post.frontmatter;
  const bodyHtml = post.body?.trim() ? marked.parse(post.body) : null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <nav className="mb-8 text-sm text-slate-500">
        <Link to="/blog" className="hover:text-slate-300 transition-colors">Blog</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-300">{fm.title}</span>
      </nav>

      {fm.coverImage && (
        <div className="mb-8 overflow-hidden rounded-2xl h-64">
          <img
            src={fm.coverImage}
            alt={fm.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        {fm.tags?.map((tag) => <TagBadge key={tag} tag={tag} />)}
      </div>

      <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
        {fm.title}
      </h1>

      <div className="flex items-center gap-2 mb-8 text-sm text-slate-500">
        {fm.author && <span className="text-slate-400">{fm.author}</span>}
        {fm.author && fm.publishedAt && <span>·</span>}
        {fm.publishedAt && (
          <time dateTime={fm.publishedAt}>
            {new Date(fm.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        )}
        {fm.updatedAt && fm.updatedAt !== fm.publishedAt && (
          <>
            <span>·</span>
            <span>Updated {new Date(fm.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </>
        )}
      </div>

      {bodyHtml && (
        <div
          className="prose prose-invert prose-sm max-w-none
            text-slate-300
            [&_h2]:font-display [&_h2]:text-[#7dd3fc] [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-10 [&_h2]:mb-4
            [&_h3]:text-white [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-3
            [&_p]:leading-relaxed [&_p]:mb-4
            [&_strong]:text-white
            [&_a]:text-[#e94560] [&_a]:no-underline hover:[&_a]:underline
            [&_ul]:my-4 [&_ul]:space-y-1 [&_li]:text-slate-300
            [&_ol]:my-4 [&_ol]:space-y-1
            [&_blockquote]:border-l-2 [&_blockquote]:border-[#7dd3fc]/40 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-400
            [&_code]:bg-white/10 [&_code]:rounded [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-xs [&_code]:text-[#7dd3fc]
            [&_hr]:border-white/10 [&_hr]:my-8"
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />
      )}

      <div className="mt-12 pt-8 border-t border-white/10">
        <Link
          to="/blog"
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          ← Back to Blog
        </Link>
      </div>
    </div>
  );
}
