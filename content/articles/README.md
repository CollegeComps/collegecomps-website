# Articles Content Management

This directory contains all articles for the CollegeComps website. Articles are written in Markdown format with YAML frontmatter for metadata.

## Adding a New Article

1. Create a new `.md` file in `/content/articles/` directory
2. Use the filename as the URL slug (e.g., `my-article.md` → `/articles/my-article`)
3. Follow the template structure below

## Article Template

```markdown
---
title: "Your Article Title"
slug: "your-article-slug"
excerpt: "A brief summary of the article (1-2 sentences)"
author: "Author Name"
date: "YYYY-MM-DD"
category: "Category Name"
featured: false
image: "/images/articles/your-image.jpg"
---

# Your Article Title

Your article content goes here. You can use standard Markdown formatting.

## Headings

Use ## for main sections and ### for subsections.

### Subsections

Content here...

## Lists

- Bullet point 1
- Bullet point 2
- Bullet point 3

## Links

[Link text](/path-to-page)

## Images

![Alt text](/path-to-image.jpg)

## Code

Inline `code` or code blocks:

\```
Code block here
\```

---

*Additional notes or footer content*
```

## Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `title` | Yes | The main title of the article |
| `slug` | Yes | URL-friendly identifier (use hyphens, lowercase) |
| `excerpt` | Yes | Short description shown in article listings |
| `author` | No | Author name (defaults to "CollegeComps Team") |
| `date` | Yes | Publication date in YYYY-MM-DD format |
| `category` | Yes | Article category (e.g., "Financial Planning", "Career Advice") |
| `featured` | No | Set to `true` to feature the article (defaults to false) |
| `image` | No | Path to header image (optional) |

## Categories

Use consistent category names:
- **Financial Planning**: ROI calculations, budgeting, financial aid
- **Career Advice**: Job prospects, salary expectations, career paths
- **College Selection**: Choosing schools, comparing programs
- **Student Life**: Campus culture, housing, student experience
- **Academic Success**: Study tips, choosing majors, course selection

## Best Practices

1. **Keep excerpts concise**: 1-2 sentences maximum
2. **Use descriptive titles**: Make it clear what the article is about
3. **Choose appropriate categories**: Stick to the predefined categories
4. **Add images**: Include a header image when possible (1200x600px recommended)
5. **Link to tools**: Reference the ROI Calculator or other site features when relevant
6. **Use headings**: Break up content with clear section headings
7. **Internal links**: Link to other relevant pages on the site
8. **Proofread**: Check for spelling and grammar errors

## Markdown Formatting

### Emphasis
- *Italic text* with `*asterisks*`
- **Bold text** with `**double asterisks**`

### Lists
- Unordered lists with `-` or `*`
- Ordered lists with `1.`, `2.`, etc.

### Links
- Internal: `[Link text](/page-path)`
- External: `[Link text](https://example.com)`

### Blockquotes
> Use `>` for blockquotes

### Code
- Inline: \`code\`
- Block:
\```
code block
\```

## Publishing Workflow

1. Create or edit a `.md` file in `/content/articles/`
2. Commit and push changes to the repository
3. The article will automatically appear on the `/articles` page
4. No rebuild or deployment needed - changes are reflected immediately

## Example Article

See `/content/articles/understanding-college-roi.md` for a complete example.

## Need Help?

Contact the development team if you need assistance with:
- Adding images
- Complex formatting
- Technical issues
- Custom features

---

Last updated: November 2025
