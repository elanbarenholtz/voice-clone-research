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
      displayName: true,
      pronunciation: true,
      bio: true,
      personality: true,
      greeting: true,
      callerRules: true,
      systemPrompt: true,
      contacts: {
        select: { name: true, phone: true, relationship: true, notes: true },
      },
    },
  });

  return NextResponse.json(user);
}
