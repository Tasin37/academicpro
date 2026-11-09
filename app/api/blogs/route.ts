import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { mongooseConnect } from "@/src/lib/mongoose";
import { Post } from "@/src/models/models";

const INITIAL_POSTS = [
  {
    title: "How to Structure a Literature Review That Gets an A",
    slug: "how-to-structure-a-literature-review",
    category: "Academic Writing",
    readTime: "6 min read",
    coverImage: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80",
    summary: "Learn the thematic, chronological, and methodological approaches to organizing your literature review effectively.",
    content: `Writing a literature review can feel daunting when you're faced with dozens of journal articles, books, and theoretical papers. However, a high-scoring literature review is not a summary of each source one by one—it is a synthesis that reveals patterns, themes, contradictions, and gaps in the existing research.

### 1. Define Your Scope and Research Question
Before searching databases like JSTOR, PubMed, or Google Scholar, determine the exact boundary of your review. What specific question does your paper address? What time period, methodology, or population are you focusing on?

### 2. Choose an Organizational Model
There are three primary ways to organize your review:
- **Thematic Structure:** Group sources by central debates or subtopics (e.g., economic factors vs. social factors).
- **Chronological Structure:** Trace the evolution of the research field over time, highlighting paradigm shifts.
- **Methodological Structure:** Compare findings based on quantitative vs. qualitative research approaches.

### 3. Synthesize Instead of Summarizing
Avoid writing paragraphs that start with "Smith (2020) found..." followed by "Jones (2021) argued...". Instead, compare their arguments:
> "While early studies emphasized mechanical causes (Smith, 2020), subsequent investigations have revealed cognitive factors to be equally significant (Jones, 2021; Garcia, 2023)."

### 4. Conclude with the Research Gap
Every good literature review leads to a purpose. Conclude by identifying what previous studies have omitted or where further inquiry is essential. This sets up your own research questions or thesis perfectly.`,
    isPublished: true,
  },
  {
    title: "Mastering APA 7th Edition: Common Citation Pitfalls and How to Fix Them",
    slug: "mastering-apa-7th-edition-citation-pitfalls",
    category: "Formatting & Style",
    readTime: "5 min read",
    coverImage: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1200&q=80",
    summary: "A practical breakdown of tricky citation scenarios: multiple authors, online lecture slides, and AI tool attribution.",
    content: `The 7th edition of the American Psychological Association (APA) publication manual introduced notable simplifications, but students still frequently stumble over specific formatting rules. Here are the most common pitfalls and their direct solutions.

### 1. In-Text Citations for Three or More Authors
In APA 6th, you listed all authors the first time. In APA 7th, you use **et al.** right from the very first citation whenever a work has 3 or more authors:
- **Correct:** (Rodriguez et al., 2022) or Rodriguez et al. (2022) argued...
- **Incorrect:** (Rodriguez, Patel, & Gomez, 2022)

### 2. DOIs vs. URLs
Always format DOIs as standard hyperlinks beginning with \`https://doi.org/\`. Do not include "DOI:" before the link, and do not place a period after the URL in the reference list.

### 3. Citing AI-Generated Content (e.g., ChatGPT)
APA has released official guidance on citing generative AI:
- Author: OpenAI (or the tool developer).
- Year: Year of version used.
- Title: Name of model (e.g., *ChatGPT* [Large language model]).
- In-text citation: (OpenAI, 2023).

### 4. Running Heads
In APA 7th student papers, a running head is **not required** unless your instructor explicitly requests it. You only need a page number in the top right header.`,
    isPublished: true,
  },
  {
    title: "5 Time Management Habits of Top Performing College Students",
    slug: "5-time-management-habits-college-students",
    category: "Study Skills",
    readTime: "5 min read",
    coverImage: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80",
    summary: "How to block time for deep research, outline papers ahead of deadlines, and manage semester workloads without burning out.",
    content: `Academic success is rarely about raw intellect—it is about managing cognitive load and avoiding the stress of last-minute panic. High-performing students consistently implement deliberate routines that protect their focus.

### 1. The 48-Hour Outline Rule
Whenever an assignment is assigned, create a skeleton outline within 48 hours. You don't need to write the paper immediately; simply jot down the headings, thesis concept, and target word counts. This primes your subconscious mind to notice relevant ideas in class lectures.

### 2. Time Boxing Deep Work
Multitasking while studying creates attention residue. Set a timer for 50 minutes of single-task focus with notifications disabled, followed by a 10-minute mental break. Three focused blocks accomplish more than eight hours of distracted study.

### 3. Source Organization from Day One
Never copy and paste a quote without recording the exact citation details and page number immediately. Using reference management tools like Zotero or Mendeley eliminates hours of bibliography hunting before submission deadlines.

### 4. The "Two-Draft" Minimum
First drafts are for getting ideas down; second drafts are for clarity and rhythm. Never turn in a first draft without allowing at least 24 hours between writing and proofreading so you can read your work with fresh eyes.`,
    isPublished: true,
  },
];

export async function GET(request: Request) {
  try {
    await mongooseConnect();

    // Auto-seed initial posts if database is empty
    const count = await Post.countDocuments();
    if (count === 0) {
      await Post.insertMany(INITIAL_POSTS);
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("q");
    const includeUnpublished = searchParams.get("all") === "true";

    const query: Record<string, unknown> = {};

    if (!includeUnpublished) {
      query.isPublished = true;
    }

    if (category && category !== "All") {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { summary: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    const posts = await Post.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Failed to load blog posts:", error);
    return NextResponse.json({ error: "Failed to load blog posts." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    await mongooseConnect();

    const body = await request.json();
    const title = body.title?.trim();
    const summary = body.summary?.trim();
    const content = body.content?.trim();
    const category = body.category?.trim() || "Academic Writing";
    const coverImage = body.coverImage?.trim() || "";
    const authorName = body.authorName?.trim() || session.user.name || "AcademicPro Admin";
    const isPublished = body.isPublished !== undefined ? Boolean(body.isPublished) : true;

    if (!title || !summary || !content) {
      return NextResponse.json({ error: "Title, summary, and content are required." }, { status: 400 });
    }

    // Generate unique slug
    let baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    if (!baseSlug) {
      baseSlug = `article-${Date.now()}`;
    }

    let slug = baseSlug;
    let existing = await Post.findOne({ slug });
    let counter = 1;
    while (existing) {
      slug = `${baseSlug}-${counter}`;
      existing = await Post.findOne({ slug });
      counter++;
    }

    // Estimate read time
    const wordCount = content.split(/\s+/).length;
    const readMinutes = Math.max(1, Math.round(wordCount / 200));
    const readTime = `${readMinutes} min read`;

    const post = await Post.create({
      title,
      slug,
      summary,
      content,
      category,
      authorName,
      authorId: session.user.id,
      coverImage: coverImage || undefined,
      readTime,
      isPublished,
    });

    return NextResponse.json({ message: "Article published successfully!", post }, { status: 201 });
  } catch (error) {
    console.error("Error creating blog post:", error);
    return NextResponse.json({ error: "Failed to create blog post." }, { status: 500 });
  }
}
