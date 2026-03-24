import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      cloneStatus: true,
      voiceId: true,
      recordingUrl: true,
      agentId: true,
      phoneNumber: true,
      isActive: true,
      displayName: true,
      systemPrompt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...user,
    recordingUrl: user.recordingUrl ? true : false, // Don't send the actual base64
  });
}
