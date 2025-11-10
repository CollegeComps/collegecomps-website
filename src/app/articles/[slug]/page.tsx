import { getArticleBySlug, getAllArticles } from '@/lib/articles';
import { notFound } from 'next/navigation';
import { remark } from 'remark';
import html from 'remark-html';
import gfm from 'remark-gfm';
import Link from 'next/link';
import { CalendarIcon, TagIcon, UserIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export async function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

async function markdownToHtml(markdown: string) {
  const result = await remark()
    .use(gfm)
    .use(html, { sanitize: false })
    .process(markdown);
  return result.toString();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  
  if (!article) {
    return {
      title: 'Article Not Found | CollegeComps',
    };
  }

  return {
    title: `${article.title} | CollegeComps`,
    description: article.excerpt,
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const contentHtml = await markdownToHtml(article.content);

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          href="/articles"
          className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 mb-8 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Articles
        </Link>

        {/* Article Header */}
        <article className="bg-gray-900 border border-gray-800 rounded-lg shadow-lg overflow-hidden">
          {article.image && (
            <div className="h-64 bg-gray-800 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
              {article.featured && (
                <span className="absolute top-4 right-4 px-3 py-1 bg-orange-500 text-white text-sm font-bold rounded-full">
                  Featured
                </span>
              )}
            </div>
          )}

          <div className="p-8">
            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
              <span className="flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                {article.author}
              </span>
              <span className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                {new Date(article.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-2">
                <TagIcon className="w-4 h-4" />
                {article.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl font-extrabold text-white mb-4">
              {article.title}
            </h1>

            {/* Excerpt */}
            <p className="text-xl text-gray-300 mb-8 font-medium">
              {article.excerpt}
            </p>

            {/* Content */}
            <div
              className="prose prose-invert prose-orange max-w-none
                prose-headings:text-white prose-headings:font-bold
                prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-4
                prose-a:text-orange-400 prose-a:no-underline hover:prose-a:text-orange-300
                prose-strong:text-white prose-strong:font-bold
                prose-ul:text-gray-300 prose-ul:my-4
                prose-ol:text-gray-300 prose-ol:my-4
                prose-li:my-2
                prose-blockquote:border-l-4 prose-blockquote:border-orange-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-400
                prose-code:text-orange-400 prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                prose-pre:bg-gray-800 prose-pre:border prose-pre:border-gray-700 prose-pre:rounded-lg
                prose-hr:border-gray-700 prose-hr:my-8"
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          </div>
        </article>

        {/* Related Articles / CTA */}
        <div className="mt-12 p-8 bg-orange-500/10 border border-orange-500 rounded-lg">
          <h3 className="text-2xl font-bold text-white mb-4">
            Ready to Calculate Your College ROI?
          </h3>
          <p className="text-gray-300 mb-6">
            Use our comprehensive ROI calculator to compare colleges and make informed decisions about your education investment.
          </p>
          <Link
            href="/roi-calculator"
            className="inline-flex items-center px-6 py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors"
          >
            Try ROI Calculator
          </Link>
        </div>
      </div>
    </div>
  );
}
