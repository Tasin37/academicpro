import { NextResponse } from "next/server";
import { mongooseConnect } from "@/src/lib/mongoose";
import { ContactInquiry } from "@/src/models/models";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const subject = typeof body.subject === "string" ? body.subject.trim() : "";
    const content = typeof body.message === "string" ? body.message.trim() : "";

    if (!name || !email || !subject || !content) {
      return NextResponse.json({ error: "Name, email, subject, and message are required." }, { status: 400 });
    }

    if (name.length > 120 || email.length > 320 || subject.length > 200 || content.length > 5000) {
      return NextResponse.json({ error: "One or more fields exceed the allowed length." }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    await mongooseConnect();
    const message = await ContactInquiry.create({
      name,
      email,
      subject,
      message: content,
      isRead: false,
    });

    return NextResponse.json({ message: "Your message has been sent.", inquiry: message }, { status: 201 });
  } catch (error) {
    console.error("Failed to save contact message:", error);
    return NextResponse.json({ error: "Unable to send your message right now." }, { status: 500 });
  }
}
