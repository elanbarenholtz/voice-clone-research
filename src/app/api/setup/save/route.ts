import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSystemPrompt } from "@/lib/prompt";

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { displayName, pronunciation, bio, personality, greeting, callerRules, contacts } = body;

  if (!displayName) {
    return NextResponse.json({ error: "Display name is required" }, { status: 400 });
  }

  // Delete existing contacts and re-create
  await prisma.contact.deleteMany({ where: { userId: session.user.id } });

  if (contacts && contacts.length > 0) {
    await prisma.contact.createMany({
      data: contacts.map((c: { name: string; phone: string; relationship?: string; notes?: string }) => ({
        userId: session.user.id,
        name: c.name,
        phone: c.phone,
        relationship: c.relationship || null,
        notes: c.notes || null,
      })),
    });
  }

  // Fetch contacts back for prompt generation
  const savedContacts = await prisma.contact.findMany({
    where: { userId: session.user.id },
  });

  const systemPrompt = generateSystemPrompt({
    displayName,
    pronunciation,
    bio,
    personality,
    callerRules,
    contacts: savedContacts,
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      displayName,
      pronunciation,
      bio,
      personality,
      greeting: greeting || "Hello?",
      callerRules,
      systemPrompt,
    },
  });

  return NextResponse.json({ success: true, systemPrompt });
}
