import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Called by ElevenLabs before conversation starts
export async function POST(request: Request) {
  const body = await request.json();
  const callerNumber = body.from || body.caller_number || "";
  const agentId = body.agent_id || "";

  // Find the user by agent ID
  const user = await prisma.user.findFirst({
    where: { agentId },
    include: {
      contacts: true,
    },
  });

  if (!user) {
    return NextResponse.json({ first_message: "Hello?" });
  }

  // Check if caller is a known contact
  const contact = user.contacts.find((c) =>
    callerNumber.includes(c.phone.replace(/\D/g, "").slice(-10))
  );

  if (contact) {
    const greeting = `Hey ${contact.name}! What's up?`;
    return NextResponse.json({
      first_message: greeting,
      dynamic_variables: {
        caller_name: contact.name,
        caller_relationship: contact.relationship || "contact",
        caller_notes: contact.notes || "",
      },
    });
  }

  return NextResponse.json({
    first_message: user.greeting || "Hello?",
  });
}
