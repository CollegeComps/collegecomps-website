import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface ArticleMetadata {
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
  featured: boolean;
  image?: string;
}

export interface Article extends ArticleMetadata {
  content: string;
}

const articlesDirectory = path.join(process.cwd(), 'content/articles');

/**
 * Get all articles sorted by date (newest first)
 */
export function getAllArticles(): Article[] {
  try {
    // Check if articles directory exists
    if (!fs.existsSync(articlesDirectory)) {
      console.warn('[WARN] Articles directory does not exist:', articlesDirectory);
      return [];
    }

    const fileNames = fs.readdirSync(articlesDirectory);
    const articles = fileNames
      .filter((fileName) => fileName.endsWith('.md'))
      .map((fileName) => {
        const slug = fileName.replace(/\.md$/, '');
        const fullPath = path.join(articlesDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);

        return {
          slug,
          content,
          title: data.title || '',
          excerpt: data.excerpt || '',
          author: data.author || 'CollegeComps Team',
          date: data.date || '',
          category: data.category || 'General',
          featured: data.featured || false,
          image: data.image || null,
        } as Article;
      });

    // Sort by date (newest first)
    return articles.sort((a, b) => {
      if (a.date < b.date) return 1;
      if (a.date > b.date) return -1;
      return 0;
    });
  } catch (error) {
    console.error('[ERROR] Failed to read articles:', error);
    return [];
  }
}

/**
 * Get article by slug
 */
export function getArticleBySlug(slug: string): Article | null {
  try {
    const fullPath = path.join(articlesDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug,
      content,
      title: data.title || '',
      excerpt: data.excerpt || '',
      author: data.author || 'CollegeComps Team',
      date: data.date || '',
      category: data.category || 'General',
      featured: data.featured || false,
      image: data.image || null,
    } as Article;
  } catch (error) {
    console.error(`[ERROR] Failed to read article ${slug}:`, error);
    return null;
  }
}

/**
 * Get featured articles
 */
export function getFeaturedArticles(): Article[] {
  const allArticles = getAllArticles();
  return allArticles.filter((article) => article.featured);
}

/**
 * Get articles by category
 */
export function getArticlesByCategory(category: string): Article[] {
  const allArticles = getAllArticles();
  return allArticles.filter((article) => article.category === category);
}

/**
 * Get all unique categories
 */
export function getAllCategories(): string[] {
  const allArticles = getAllArticles();
  const categories = allArticles.map((article) => article.category);
  return Array.from(new Set(categories));
}
