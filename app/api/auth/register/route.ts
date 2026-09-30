import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { User, Student } from "@/src/models/models";
import { UserRole } from "@/src/models/User";
import { mongooseConnect } from "@/src/lib/mongoose";

type RegistrationBody = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegistrationBody;
    const firstName = body.firstName?.trim();
    const lastName = body.lastName?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

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
      role: UserRole.STUDENT,
    });

    await Student.create({ userId: user._id });

    return NextResponse.json(
      { user: { id: user._id.toString(), firstName, lastName, email, role: UserRole.STUDENT } },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ error: "Unable to create your account right now." }, { status: 500 });
  }
}