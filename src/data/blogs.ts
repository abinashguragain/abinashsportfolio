export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: string;
  category: string;
  featured: boolean;
  image?: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    slug: "the-art-of-storytelling-in-content-writing",
    title: "The Art of Storytelling in Content Writing",
    excerpt: "Discover how narrative techniques can transform your content from mundane to memorable, creating deeper connections with your audience.",
    content: `
# The Art of Storytelling in Content Writing

Great content isn't just about conveying information—it's about telling a story that resonates with your audience.

## Why Stories Matter

Humans are wired for stories. Since the beginning of time, we've used narratives to share knowledge, build communities, and make sense of the world around us.

In content writing, storytelling serves several crucial purposes:

- **Creates emotional connections** with readers
- **Makes complex information digestible** and memorable
- **Differentiates your content** from competitors
- **Drives action** through relatable narratives

## The Structure of Compelling Stories

Every great story follows a pattern. In content writing, this often looks like:

1. **The Hook** - Grab attention with a compelling opening
2. **The Problem** - Identify the challenge your reader faces
3. **The Journey** - Take them through the discovery process
4. **The Solution** - Present your insights or offering
5. **The Transformation** - Show the positive outcome

## Practical Tips for Better Storytelling

Start with your audience. What keeps them up at night? What dreams do they have? The best stories speak directly to these hopes and fears.

Use specific details. Instead of saying "a successful business," describe "a small bakery that grew from 10 to 1000 daily customers."

Don't be afraid of vulnerability. Sharing challenges and failures makes your content more authentic and relatable.

## Conclusion

Storytelling isn't just a nice-to-have in content writing—it's the difference between content that gets skipped and content that gets shared. Start incorporating narrative techniques into your writing today.
    `,
    date: "2024-12-15",
    readTime: "5 min read",
    category: "Writing Tips",
    featured: true,
  },
  {
    id: "2",
    slug: "seo-strategies-that-actually-work",
    title: "SEO Strategies That Actually Work in 2024",
    excerpt: "Cut through the noise with proven SEO tactics that drive real organic traffic without compromising content quality.",
    content: `
# SEO Strategies That Actually Work in 2024

Search engine optimization has evolved dramatically. Here's what's actually moving the needle today.

## Quality Over Keywords

Gone are the days of keyword stuffing. Modern SEO prioritizes:

- **User intent matching** - Understanding what searchers really want
- **Comprehensive coverage** - Being the definitive resource on a topic
- **E-E-A-T signals** - Experience, Expertise, Authoritativeness, Trust

## Technical Foundations

Before worrying about content, ensure your technical SEO is solid:

1. Fast page load times (under 3 seconds)
2. Mobile-first design
3. Proper heading hierarchy
4. Clean URL structures

## Content Strategy

Create content clusters around your core topics. Link related pieces together to build topical authority.

Focus on answering real questions your audience has. Tools like AnswerThePublic and People Also Ask can reveal valuable opportunities.

## The Long Game

SEO is a marathon, not a sprint. Consistent, quality content creation over months and years builds sustainable organic traffic that paid advertising can never match.
    `,
    date: "2024-12-10",
    readTime: "7 min read",
    category: "SEO",
    featured: false,
  },
  {
    id: "3",
    slug: "building-a-personal-brand-as-a-writer",
    title: "Building a Personal Brand as a Writer",
    excerpt: "Your unique voice is your greatest asset. Learn how to develop and showcase your personal brand as a content creator.",
    content: `
# Building a Personal Brand as a Writer

In a world of AI-generated content, your authentic voice is more valuable than ever.

## What Is Personal Branding?

Personal branding is the intentional effort to create and influence public perception. For writers, it's about:

- Your unique perspective and voice
- The topics you're known for
- How you present yourself visually and verbally

## Finding Your Niche

You don't have to write about everything. In fact, you shouldn't. The most successful writers focus on:

1. What they're genuinely passionate about
2. Where they have expertise or unique experience
3. Topics with audience demand

The intersection of these three is your sweet spot.

## Consistency Is Key

Your brand should be consistent across:

- Writing style and tone
- Visual identity (colors, fonts, imagery)
- Social media presence
- How you interact with your audience

## Building in Public

Share your journey, including the struggles. People connect with authenticity. Document what you learn and share freely—this builds trust and establishes expertise.

## The Compound Effect

Personal branding takes time. But each piece of content, each interaction, each small win compounds over time into something significant.
    `,
    date: "2024-12-05",
    readTime: "6 min read",
    category: "Career",
    featured: true,
  },
  {
    id: "4",
    slug: "mastering-the-cold-open",
    title: "Mastering the Cold Open: Hook Readers in Seconds",
    excerpt: "The first few lines make or break your content. Learn techniques to craft openings that demand attention.",
    content: `
# Mastering the Cold Open: Hook Readers in Seconds

You have approximately 8 seconds to grab a reader's attention. Make them count.

## The Problem With Boring Openings

Most content starts with variations of:
- "In today's fast-paced world..."
- "Have you ever wondered..."
- "Content marketing is important because..."

These openings are forgettable. They blend into the noise.

## Types of Powerful Opens

### The Bold Statement
Start with something unexpected or even controversial. "Most of what you've heard about SEO is wrong."

### The Story Drop
Begin mid-action. "The email came at 3 AM. Two words: 'You're hired.'"

### The Question That Stings
Ask something that hits close to home. "When was the last time you wrote something you were truly proud of?"

### The Startling Stat
Lead with data that surprises. "73% of readers decide whether to continue within the first sentence."

## Testing Your Opens

Write 5-10 different opening lines for each piece. Choose the one that creates the most tension or curiosity. If your opening doesn't make *you* want to keep reading, rewrite it.
    `,
    date: "2024-11-28",
    readTime: "4 min read",
    category: "Writing Tips",
    featured: false,
  },
];

export const getFeaturedPosts = () => blogPosts.filter(post => post.featured);
export const getLatestPosts = (count: number = 3) => blogPosts.slice(0, count);
export const getPostBySlug = (slug: string) => blogPosts.find(post => post.slug === slug);
export const getAllCategories = () => [...new Set(blogPosts.map(post => post.category))];
