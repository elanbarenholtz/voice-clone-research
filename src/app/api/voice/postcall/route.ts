import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Called by ElevenLabs after conversation ends
export async function POST(request: Request) {
  const body = await request.json();

  const agentId = body.agent_id || "";
  const callSid = body.call_sid || body.conversation_id || null;
  const fromNumber = body.from || body.caller_number || "unknown";
  const transcript = body.transcript || null;
  const summary = body.summary || null;
  const durationSec = body.duration_seconds || body.duration || null;

  // Find user by agent ID
  const user = await prisma.user.findFirst({
    where: { agentId },
  });

  if (!user) {
    console.error("postcall: no user found for agent", agentId);
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  await prisma.call.create({
    data: {
      userId: user.id,
      callSid,
      fromNumber,
      toNumber: user.phoneNumber || "",
      durationSec: durationSec ? Math.round(durationSec) : null,
      transcript: typeof transcript === "string" ? transcript : JSON.stringify(transcript),
      summary,
    },
  });

  return NextResponse.json({ success: true });
}
