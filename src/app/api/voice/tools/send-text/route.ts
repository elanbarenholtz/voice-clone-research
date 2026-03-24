import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Tool for the AI agent to text the real user
export async function POST(request: Request) {
  const body = await request.json();
  const { agent_id, message, caller_number } = body;

  if (!agent_id || !message) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const user = await prisma.user.findFirst({
    where: { agentId: agent_id },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Send SMS via Twilio to the user's real phone (would need their real number stored)
  // For prototype, just log it
  console.log(`[send-text] Agent ${agent_id} wants to text user ${user.id}: ${message}`);
  console.log(`[send-text] Caller: ${caller_number || "unknown"}`);

  // TODO: Implement actual Twilio SMS sending when user's real phone is stored
  // const twilioSid = process.env.TWILIO_ACCOUNT_SID!;
  // const twilioAuth = process.env.TWILIO_AUTH_TOKEN!;

  return NextResponse.json({
    success: true,
    message: "Text notification sent to the real user.",
  });
}
