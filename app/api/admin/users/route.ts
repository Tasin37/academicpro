import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/src/lib/auth";
import { mongooseConnect } from "@/src/lib/mongoose";
import { Student, User, Writer } from "@/src/models/models";
import { UserRole } from "@/src/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin access only." }, { status: 401 });
    }

    await mongooseConnect();
    const users = await User.find({})
      .select("email firstName lastName role isActive createdAt")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json({ users });
  } catch (err) {
    console.error("Admin users fetch error:", err);
    return NextResponse.json({ error: "Failed to load users list." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin access only." }, { status: 401 });
    }

    const body = (await request.json()) as { userId?: string; role?: UserRole; isActive?: boolean };
    if (!body.userId) {
      return NextResponse.json({ error: "User ID is required." }, { status: 400 });
    }

    await mongooseConnect();
    const user = await User.findById(body.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (body.role && Object.values(UserRole).includes(body.role)) {
      user.role = body.role;

      if (body.role === UserRole.WRITER) {
        const existingWriter = await Writer.findOne({ userId: user._id });
        if (!existingWriter) {
          await Writer.create({
            userId: user._id,
            hourlyRate: 20,
            expertise: ["General Academic Writing"],
            isVerified: true,
          });
        }
      } else if (body.role === UserRole.STUDENT) {
        const existingStudent = await Student.findOne({ userId: user._id });
        if (!existingStudent) {
          await Student.create({ userId: user._id });
        }
      }
    }

    if (typeof body.isActive === "boolean") {
      user.isActive = body.isActive;
    }

    await user.save();

    return NextResponse.json({ message: "User updated successfully.", user });
  } catch (err) {
    console.error("Admin user update error:", err);
    return NextResponse.json({ error: "Failed to update user." }, { status: 500 });
  }
}

