import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";
import path from "path";
import fs from "fs/promises";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files received." }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const uploadedUrls: string[] = [];

    for (const file of files) {
      if (!file.name) continue;
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const safeBaseName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const uniqueName = `${Date.now()}_${safeBaseName}`;
      const filePath = path.join(uploadDir, uniqueName);
      await fs.writeFile(filePath, buffer);
      uploadedUrls.push(`/uploads/${uniqueName}`);
    }

    return NextResponse.json({ urls: uploadedUrls });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload materials." }, { status: 500 });
  }
}

