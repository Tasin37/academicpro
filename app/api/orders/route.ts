import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/src/lib/auth";
import { mongooseConnect } from "@/src/lib/mongoose";
import { Order, Student } from "@/src/models/models";
import { OrderStatus } from "@/src/models/Order";

type OrderBody = {
  title?: string;
  description?: string;
  subject?: string;
  deadline?: string;
  pages?: number;
  academicLevel?: string;
  budget?: number;
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
  return student;
}

export async function GET() {
  try {
    const student = await getCurrentStudent();
    if (!student) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const orders = await Order.find({ studentId: student._id }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ orders });
  } catch {
    return NextResponse.json({ error: "Unable to fetch orders at this time." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const student = await getCurrentStudent();
    if (!student) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    let body: OrderBody;
    try {
      body = (await request.json()) as OrderBody;
    } catch {
      return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
    }

    const title = body.title?.trim();
    const description = body.description?.trim();
    const subject = body.subject?.trim();
    const deadline = body.deadline ? new Date(body.deadline) : null;
    const pages = Number(body.pages);
    const budget = Number(body.budget);

    if (
      !title ||
      !description ||
      !subject ||
      !deadline ||
      Number.isNaN(deadline.getTime()) ||
      deadline <= new Date() ||
      !body.academicLevel ||
      !Number.isInteger(pages) ||
      pages < 1 ||
      !Number.isFinite(budget) ||
      budget < 0
    ) {
      return NextResponse.json({ error: "Please provide valid assignment details and a future deadline." }, { status: 400 });
    }

    const order = await Order.create({
      studentId: student._id,
      title,
      description,
      subject,
      deadline,
      pages,
      academicLevel: body.academicLevel,
      budget,
      notes: body.notes?.trim(),
      status: OrderStatus.PENDING,
    });

    await Student.updateOne({ _id: student._id }, { $inc: { totalOrders: 1 } });

    return NextResponse.json({ order }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to process order at this time." }, { status: 500 });
  }
}