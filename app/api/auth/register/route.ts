import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { User, Student, Writer } from "@/src/models/models";
import { UserRole } from "@/src/models/User";
import { mongooseConnect } from "@/src/lib/mongoose";

type RegistrationBody = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  role?: "student" | "writer";
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegistrationBody;
    const firstName = body.firstName?.trim();
    const lastName = body.lastName?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const requestedRole = body.role === "writer" ? UserRole.WRITER : UserRole.STUDENT;

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    await mongooseConnect();

    const existingUser = await User.findOne({ email }).select("_id").lean();
    if (existingUser) {
      return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: await bcrypt.hash(password, 12),
      role: requestedRole,
    });

    if (requestedRole === UserRole.WRITER) {
      await Writer.create({
        userId: user._id,
        hourlyRate: 20,
        expertise: ["General Academic Writing"],
        isVerified: false,
      });
    } else {
      await Student.create({ userId: user._id });
    }

    return NextResponse.json(
      { user: { id: user._id.toString(), firstName, lastName, email, role: requestedRole } },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ error: "Unable to create your account right now." }, { status: 500 });
  }
}