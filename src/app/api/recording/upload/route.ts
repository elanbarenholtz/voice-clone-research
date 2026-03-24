import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const audio = formData.get("audio") as File | null;

  if (!audio) {
    return NextResponse.json({ error: "No audio file" }, { status: 400 });
  }

  // Convert to base64 for storage (simple prototype approach)
  const buffer = Buffer.from(await audio.arrayBuffer());
  const base64 = buffer.toString("base64");
  const dataUrl = `data:${audio.type};base64,${base64}`;

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      recordingUrl: dataUrl,
      cloneStatus: "recording",
    },
  });

  return NextResponse.json({ success: true });
}
