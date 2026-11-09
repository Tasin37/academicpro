import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/src/lib/auth";
import { mongooseConnect } from "@/src/lib/mongoose";
import { FAQ } from "@/src/models/models";

const INITIAL_FAQS = [
  {
    question: "How do I place an assignment order?",
    answer: "Simply fill out the order form with your course details, topic, deadline, and any attachment you want us to follow.",
    isPublished: true,
  },
  {
    question: "Can I request revisions after delivery?",
    answer: "Yes, every order includes revision support until you are satisfied with the final paper.",
    isPublished: true,
  },
  {
    question: "Is my personal information kept confidential?",
    answer: "Absolutely. We keep all details private and treat every order with strict confidentiality.",
    isPublished: true,
  },
];

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.id && session.user.role === "admin";
}

export async function GET(request: Request) {
  try {
    await mongooseConnect();
    const includeAll = new URL(request.url).searchParams.get("all") === "true";
    if (includeAll && !(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    if ((await FAQ.countDocuments()) === 0) {
      await FAQ.insertMany(INITIAL_FAQS);
    }

    const faqs = await FAQ.find(includeAll ? {} : { isPublished: true }).sort({ createdAt: 1 }).lean();
    return NextResponse.json({ faqs });
  } catch (error) {
    console.error("Failed to load FAQs:", error);
    return NextResponse.json({ error: "Failed to load FAQs." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }
    await mongooseConnect();
    const body = await request.json();
    const question = body.question?.trim();
    const answer = body.answer?.trim();
    if (!question || !answer) {
      return NextResponse.json({ error: "Question and answer are required." }, { status: 400 });
    }
    const faq = await FAQ.create({
      question,
      answer,
      isPublished: body.isPublished !== undefined ? Boolean(body.isPublished) : true,
    });
    return NextResponse.json({ faq }, { status: 201 });
  } catch (error) {
    console.error("Failed to create FAQ:", error);
    return NextResponse.json({ error: "Failed to create FAQ." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }
    await mongooseConnect();
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: "FAQ ID is required." }, { status: 400 });
    }
    const updateData: Record<string, unknown> = {};
    if (typeof body.question === "string") updateData.question = body.question.trim();
    if (typeof body.answer === "string") updateData.answer = body.answer.trim();
    if (body.isPublished !== undefined) updateData.isPublished = Boolean(body.isPublished);
    if (!Object.keys(updateData).length) {
      return NextResponse.json({ error: "No FAQ changes provided." }, { status: 400 });
    }
    const faq = await FAQ.findByIdAndUpdate(body.id, updateData, { new: true, runValidators: true });
    if (!faq) return NextResponse.json({ error: "FAQ not found." }, { status: 404 });
    return NextResponse.json({ faq });
  } catch (error) {
    console.error("Failed to update FAQ:", error);
    return NextResponse.json({ error: "Failed to update FAQ." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }
    await mongooseConnect();
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "FAQ ID is required." }, { status: 400 });
    const faq = await FAQ.findByIdAndDelete(id);
    if (!faq) return NextResponse.json({ error: "FAQ not found." }, { status: 404 });
    return NextResponse.json({ message: "FAQ deleted successfully." });
  } catch (error) {
    console.error("Failed to delete FAQ:", error);
    return NextResponse.json({ error: "Failed to delete FAQ." }, { status: 500 });
  }
}
