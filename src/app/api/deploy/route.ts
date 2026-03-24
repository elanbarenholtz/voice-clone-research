import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ELEVENLABS_API = "https://api.elevenlabs.io/v1";

export async function POST() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user?.voiceId) {
    return NextResponse.json({ error: "No voice clone found" }, { status: 400 });
  }
  if (!user?.systemPrompt) {
    return NextResponse.json({ error: "Setup not completed" }, { status: 400 });
  }

  // If already deployed, return existing info
  if (user.phoneNumber && user.agentId) {
    return NextResponse.json({
      phoneNumber: user.phoneNumber,
      agentId: user.agentId,
      alreadyDeployed: true,
    });
  }

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  try {
    // Step 1: Buy a Twilio phone number
    let phoneNumber: string;
    let phoneSid: string;

    if (!user.phoneNumber) {
      const twilioSid = process.env.TWILIO_ACCOUNT_SID!;
      const twilioAuth = process.env.TWILIO_AUTH_TOKEN!;
      const twilioAuth64 = Buffer.from(`${twilioSid}:${twilioAuth}`).toString("base64");

      const buyRes = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/IncomingPhoneNumbers.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${twilioAuth64}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            AreaCode: "561", // South Florida for FAU
            VoiceUrl: "https://api.elevenlabs.io/twilio/inbound_call",
            VoiceMethod: "POST",
          }),
        }
      );

      if (!buyRes.ok) {
        const err = await buyRes.text();
        console.error("Twilio buy error:", err);
        return NextResponse.json(
          { error: "Failed to buy phone number" },
          { status: 502 }
        );
      }

      const buyData = await buyRes.json();
      phoneNumber = buyData.phone_number;
      phoneSid = buyData.sid;

      await prisma.user.update({
        where: { id: user.id },
        data: { phoneNumber, phoneSid },
      });
    } else {
      phoneNumber = user.phoneNumber;
      phoneSid = user.phoneSid!;
    }

    // Step 2: Create ElevenLabs Conversational AI agent
    let agentId: string;

    if (!user.agentId) {
      const agentRes = await fetch(`${ELEVENLABS_API}/convai/agents/create`, {
        method: "POST",
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `clone_${user.id}`,
          conversation_config: {
            agent: {
              prompt: {
                prompt: user.systemPrompt,
              },
              first_message: user.greeting || "Hello?",
            },
            tts: {
              voice_id: user.voiceId,
            },
          },
          platform_settings: {
            overrides: {
              conversation_initiation_client_data_webhook: `${baseUrl}/api/voice/init`,
            },
          },
        }),
      });

      if (!agentRes.ok) {
        const err = await agentRes.text();
        console.error("ElevenLabs agent creation error:", err);
        return NextResponse.json(
          { error: "Failed to create AI agent" },
          { status: 502 }
        );
      }

      const agentData = await agentRes.json();
      agentId = agentData.agent_id;

      await prisma.user.update({
        where: { id: user.id },
        data: { agentId },
      });
    } else {
      agentId = user.agentId;
    }

    // Step 3: Register Twilio number with ElevenLabs
    if (!user.phoneNumberId) {
      // Import the phone number to ElevenLabs
      const importRes = await fetch(`${ELEVENLABS_API}/convai/phone-numbers/create`, {
        method: "POST",
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          provider: "twilio",
          label: `clone_${user.id}`,
          twilio_config: {
            account_sid: process.env.TWILIO_ACCOUNT_SID,
            auth_token: process.env.TWILIO_AUTH_TOKEN,
          },
        }),
      });

      if (!importRes.ok) {
        const err = await importRes.text();
        console.error("ElevenLabs phone import error:", err);
        return NextResponse.json(
          { error: "Failed to register phone with ElevenLabs" },
          { status: 502 }
        );
      }

      const importData = await importRes.json();
      const phoneNumberId = importData.phone_number_id;

      // Assign the phone to the agent
      await fetch(`${ELEVENLABS_API}/convai/phone-numbers/${phoneNumberId}`, {
        method: "PATCH",
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ agent_id: agentId }),
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { phoneNumberId, isActive: true },
      });
    }

    return NextResponse.json({
      phoneNumber,
      agentId,
      deployed: true,
    });
  } catch (err) {
    console.error("Deploy error:", err);
    return NextResponse.json(
      { error: "Deployment failed" },
      { status: 500 }
    );
  }
}
