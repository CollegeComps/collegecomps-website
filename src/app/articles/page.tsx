import { getAllArticles, getAllCategories } from '@/lib/articles';
import Link from 'next/link';
import { CalendarIcon, TagIcon, UserIcon } from '@heroicons/react/24/outline';

export const metadata = {
  title: 'Articles | CollegeComps',
  description: 'Expert insights on college ROI, financial planning, and making informed decisions about your education investment.',
};

export default function ArticlesPage() {
  const articles = getAllArticles();
  const categories = getAllCategories();
  const featuredArticles = articles.filter(a => a.featured);
  const regularArticles = articles.filter(a => !a.featured);

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold text-white mb-4">
            Articles & Insights
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Expert guidance on college ROI, financial planning, and making informed decisions about your education investment.
          </p>
        </div>

        {/* Categories Filter */}
        {categories.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <Link
              href="/articles"
              className="px-4 py-2 bg-orange-500/20 border border-orange-500 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-colors"
            >
              All Articles
            </Link>
            {categories.map((category) => (
              <Link
                key={category}
                href={`/articles?category=${encodeURIComponent(category)}`}
                className="px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
              >
                {category}
              </Link>
            ))}
          </div>
        )}

        {/* Featured Articles */}
        {featuredArticles.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Featured Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredArticles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/articles/${article.slug}`}
                  className="group bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-orange-500 transition-all shadow-lg hover:shadow-orange-500/20"
                >
                  {article.image && (
                    <div className="h-48 bg-gray-800 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
                      <span className="absolute top-4 right-4 px-3 py-1 bg-orange-500 text-white text-sm font-bold rounded-full">
                        Featured
                      </span>
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" />
                        {new Date(article.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <TagIcon className="w-4 h-4" />
                        {article.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-gray-300 mb-4">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm text-gray-400">
                        <UserIcon className="w-4 h-4" />
                        {article.author}
                      </span>
                      <span className="text-orange-400 group-hover:text-orange-300 font-medium">
                        Read More →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Regular Articles */}
        {regularArticles.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">All Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {regularArticles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/articles/${article.slug}`}
                  className="group bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-orange-500 transition-all shadow-lg hover:shadow-orange-500/10"
                >
                  <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="w-3 h-3" />
                      {new Date(article.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                    <span className="px-2 py-0.5 bg-blue-500/20 border border-blue-500 text-blue-400 rounded text-xs">
                      {article.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-300 mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">{article.author}</span>
                    <span className="text-orange-400 group-hover:text-orange-300 font-medium">
                      Read →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {articles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No articles available yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
