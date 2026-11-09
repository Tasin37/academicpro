import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { mongooseConnect } from "@/src/lib/mongoose";
import { Post } from "@/src/models/models";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    await mongooseConnect();

    const post = await Post.findOneAndUpdate(
      { slug },
      { $inc: { views: 1 } },
      { new: true }
    ).lean();

    if (!post) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Failed to fetch blog post:", error);
    return NextResponse.json({ error: "Failed to fetch post." }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const { slug } = await params;
    await mongooseConnect();

    const body = await request.json();

    const updateData: Record<string, unknown> = {};
    if (body.title) updateData.title = body.title.trim();
    if (body.summary) updateData.summary = body.summary.trim();
    if (body.content) {
      updateData.content = body.content.trim();
      const wordCount = body.content.trim().split(/\s+/).length;
      updateData.readTime = `${Math.max(1, Math.round(wordCount / 200))} min read`;
    }
    if (body.category) updateData.category = body.category.trim();
    if (body.coverImage !== undefined) updateData.coverImage = body.coverImage.trim();
    if (body.isPublished !== undefined) updateData.isPublished = Boolean(body.isPublished);

    const updatedPost = await Post.findOneAndUpdate({ slug }, updateData, { new: true });

    if (!updatedPost) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Post updated successfully!", post: updatedPost });
  } catch (error) {
    console.error("Failed to update post:", error);
    return NextResponse.json({ error: "Failed to update post." }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const { slug } = await params;
    await mongooseConnect();

    const result = await Post.findOneAndDelete({ slug });
    if (!result) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Post deleted successfully!" });
  } catch (error) {
    console.error("Failed to delete post:", error);
    return NextResponse.json({ error: "Failed to delete post." }, { status: 500 });
  }
}
