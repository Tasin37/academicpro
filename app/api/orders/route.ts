import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/src/lib/auth";
import { mongooseConnect } from "@/src/lib/mongoose";
import { Order, Student } from "@/src/models/models";
import { OrderStatus } from "@/src/models/Order";

type OrderBody = {
  name?: string;
  whatsappNumber?: string;
  email?: string;
  subjectCode?: string;
  title?: string;
  description?: string;
  subject?: string;
  deadline?: string;
  pages?: number;
  academicLevel?: string;
  budget?: number;
  cloudLink?: string;
  attachments?: string[];
  materials?: string;
  notes?: string;
};

async function getCurrentStudent() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "student") {
    return null;
  }

  await mongooseConnect();
  let student = await Student.findOne({ userId: session.user.id });
  if (!student) {
    student = await Student.create({ userId: session.user.id });
  }
  return { student, user: session.user };
}

export async function GET() {
  try {
    const studentData = await getCurrentStudent();
    if (!studentData) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const orders = await Order.find({ studentId: studentData.student._id })
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json({ error: "Unable to fetch orders at this time." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const studentData = await getCurrentStudent();
    if (!studentData) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { student, user } = studentData;

    let body: OrderBody;
    try {
      body = (await request.json()) as OrderBody;
    } catch {
      return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
    }

    const studentName = body.name?.trim() || user.name || "";
    const studentEmail = body.email?.trim() || user.email || "";
    const whatsappNumber = body.whatsappNumber?.trim() || "";
    const subjectCode = body.subjectCode?.trim() || "";
    const subject = body.subject?.trim() || subjectCode || "General Assignment";
    const description = body.description?.trim();
    const title =
      body.title?.trim() ||
      (subjectCode ? `${subjectCode} Assignment` : description ? description.slice(0, 45) : "Academic Assignment");

    const deadline = body.deadline ? new Date(body.deadline) : null;
    const pages = Math.max(1, Number(body.pages) || 1);
    const academicLevel = body.academicLevel?.trim() || "Bachelor";

    if (!description) {
      return NextResponse.json({ error: "Please provide an assignment description." }, { status: 400 });
    }

    if (!deadline || Number.isNaN(deadline.getTime()) || deadline <= new Date()) {
      return NextResponse.json({ error: "Please select a valid future deadline." }, { status: 400 });
    }

    // Tier pricing: calculate standard budget if not explicitly provided
    let budget = Number(body.budget);
    if (!Number.isFinite(budget) || budget <= 0) {
      const rates: Record<string, number> = {
        "High School": 15,
        "Associate": 18,
        "Bachelor": 22,
        "Master": 30,
        "PhD": 35,
      };
      const rate = rates[academicLevel] || 22;
      budget = rate * pages;
    }

    let notes = body.notes?.trim() || "";
    const cloudLink = body.cloudLink?.trim() || "";
    if (cloudLink) {
      notes = notes ? `${notes}\nCloud Link: ${cloudLink}` : `Cloud Link: ${cloudLink}`;
    }

    const attachments = Array.isArray(body.attachments)
      ? body.attachments.filter((item): item is string => typeof item === "string" && item.length > 0)
      : [];

    const order = await Order.create({
      studentId: student._id,
      studentName: studentName || undefined,
      studentEmail: studentEmail || undefined,
      whatsappNumber: whatsappNumber || undefined,
      subjectCode: subjectCode || undefined,
      title,
      description,
      subject,
      deadline,
      pages,
      academicLevel,
      budget,
      cloudLink: cloudLink || undefined,
      attachments,
      notes: notes || undefined,
      status: OrderStatus.PENDING,
    });

    await Student.updateOne({ _id: student._id }, { $inc: { totalOrders: 1 } });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: "Unable to process order at this time." }, { status: 500 });
  }
}
