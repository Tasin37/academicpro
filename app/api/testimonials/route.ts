import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import { mongooseConnect } from "@/src/lib/mongoose";
import { Testimonial } from "@/src/models/models";

const INITIAL_TESTIMONIALS = [
  {
    name: "Maya Johnson",
    role: "Undergraduate Student",
    institution: "Columbia University",
    quote: "The team helped me turn a late assignment into an A-grade submission with clean research, strong arguments, and flawless formatting.",
    rating: 5,
    isApproved: true,
    isFeatured: true,
  },
  {
    name: "David Lee",
    role: "Graduate Researcher",
    institution: "Georgia Tech",
    quote: "Clear communication and fast delivery made the whole process stress-free during finals week. The citations were spot-on.",
    rating: 5,
    isApproved: true,
    isFeatured: true,
  },
  {
    name: "Sarah Jenkins",
    role: "Nursing & Health Sciences",
    institution: "University of Michigan",
    quote: "I was struggling with my clinical case study analysis until I reached out. My writer understood medical formatting and delivered two days ahead of schedule.",
    rating: 5,
    isApproved: true,
    isFeatured: true,
  },
  {
    name: "Marcus Vance",
    role: "Business Administration",
    institution: "NYU Stern",
    quote: "Outstanding quality on my market entry strategy paper. Thorough financial metrics and zero plagiarism. Truly lifesavers!",
    rating: 5,
    isApproved: true,
    isFeatured: true,
  },
];

export async function GET(request: NextRequest) {
  try {
    await mongooseConnect();

    // Auto-seed initial testimonials if none exist
    const count = await Testimonial.countDocuments();
    if (count === 0) {
      await Testimonial.insertMany(INITIAL_TESTIMONIALS);
    }

    const { searchParams } = new URL(request.url);
    const includeAll = searchParams.get("all") === "true";

    if (includeAll) {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id || session.user.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
      }
    }

    const query = includeAll ? {} : { isApproved: true };
    const testimonials = await Testimonial.find(query).sort({ isFeatured: -1, createdAt: -1 }).lean();

    const totalApproved = testimonials.filter((t) => t.isApproved);
    const avgRating = totalApproved.length > 0
      ? (totalApproved.reduce((acc, t) => acc + (t.rating || 5), 0) / totalApproved.length).toFixed(1)
      : "5.0";

    return NextResponse.json({
      testimonials,
      stats: {
        total: testimonials.length,
        averageRating: Number(avgRating),
      },
    });
  } catch (error) {
    console.error("Failed to fetch testimonials:", error);
    return NextResponse.json({ error: "Failed to fetch testimonials." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await mongooseConnect();
    const session = await getServerSession(authOptions);

    const body = await request.json();
    const name = body.name?.trim() || session?.user?.name || "";
    const role = body.role?.trim() || "Student";
    const institution = body.institution?.trim() || "";
    const quote = body.quote?.trim() || "";
    const rating = Math.min(5, Math.max(1, Number(body.rating) || 5));

    if (!name || name.length < 2) {
      return NextResponse.json({ error: "Please provide your name." }, { status: 400 });
    }

    if (!quote || quote.length < 10) {
      return NextResponse.json({ error: "Please write at least 10 characters for your testimonial." }, { status: 400 });
    }

    const testimonial = await Testimonial.create({
      name,
      role,
      institution: institution || undefined,
      quote,
      rating,
      userId: session?.user?.id ? session.user.id : undefined,
      isApproved: true,
      isFeatured: true,
    });

    return NextResponse.json({ message: "Thank you! Your testimonial has been published.", testimonial }, { status: 201 });
  } catch (error) {
    console.error("Error creating testimonial:", error);
    return NextResponse.json({ error: "Unable to submit testimonial at this time." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    await mongooseConnect();
    const body = await request.json();
    const { id, isApproved, isFeatured } = body;

    if (!id) {
      return NextResponse.json({ error: "Testimonial ID is required." }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (isApproved !== undefined) updateData.isApproved = Boolean(isApproved);
    if (isFeatured !== undefined) updateData.isFeatured = Boolean(isFeatured);

    const updated = await Testimonial.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) {
      return NextResponse.json({ error: "Testimonial not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Testimonial updated successfully.", testimonial: updated });
  } catch (error) {
    console.error("Error updating testimonial:", error);
    return NextResponse.json({ error: "Failed to update testimonial." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    await mongooseConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Testimonial ID is required." }, { status: 400 });
    }

    const deleted = await Testimonial.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Testimonial not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Testimonial deleted successfully." });
  } catch (error) {
    console.error("Error deleting testimonial:", error);
    return NextResponse.json({ error: "Failed to delete testimonial." }, { status: 500 });
  }
}
