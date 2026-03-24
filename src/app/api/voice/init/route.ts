import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Called by ElevenLabs before conversation starts
export async function POST(request: Request) {
  const body = await request.json();
  const callerNumber = body.from || body.caller_number || "";
  const agentId = body.agent_id || "";

  const user = await prisma.user.findFirst({
    where: { agentId },
    include: { contacts: true },
  });

  if (!user) {
    return NextResponse.json({ first_message: "Hello?" });
  }

  // Match caller by last 10 digits
  const callerDigits = callerNumber.replace(/\D/g, "").slice(-10);
  const contact = user.contacts.find((c) =>
    c.phone.replace(/\D/g, "").slice(-10) === callerDigits
  );

  if (contact) {
    // Use the contact-specific greeting, or generate a natural one
    const greeting =
      contact.greeting ||
      `Hey${contact.nickname ? ` ${contact.nickname}` : ` ${contact.name}`}! What's up?`;

    return NextResponse.json({
      first_message: greeting,
      dynamic_variables: {
        caller_name: contact.name,
        caller_nickname: contact.nickname || contact.name,
        caller_relationship: contact.relationship || "contact",
        caller_personality: contact.personality || "",
        caller_topics: contact.topics || "",
        caller_inside_jokes: contact.insideJokes || "",
        caller_notes: contact.notes || "",
      },
    });
  }

  return NextResponse.json({
    first_message: user.greeting || "Hello?",
  });
}
