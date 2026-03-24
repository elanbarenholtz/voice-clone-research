import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user?.recordingUrl) {
    return NextResponse.json({ error: "No recording found" }, { status: 400 });
  }

  // Decode base64 audio
  const base64Match = user.recordingUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!base64Match) {
    return NextResponse.json({ error: "Invalid recording format" }, { status: 400 });
  }

  const mimeType = base64Match[1];
  const buffer = Buffer.from(base64Match[2], "base64");

  // Determine file extension
  const ext = mimeType.includes("webm") ? "webm" : mimeType.includes("wav") ? "wav" : "mp3";

  // Call ElevenLabs to create voice clone
  const formData = new FormData();
  formData.append("name", `clone_${user.id}`);
  formData.append(
    "files",
    new Blob([buffer], { type: mimeType }),
    `recording.${ext}`
  );
  formData.append("description", `Voice clone for ${user.name || user.email}`);

  await prisma.user.update({
    where: { id: user.id },
    data: { cloneStatus: "cloning" },
  });

  try {
    const res = await fetch("https://api.elevenlabs.io/v1/voices/add", {
      method: "POST",
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY!,
      },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("ElevenLabs clone error:", err);
      await prisma.user.update({
        where: { id: user.id },
        data: { cloneStatus: "recording" },
      });
      return NextResponse.json(
        { error: "Voice cloning failed. Please try again." },
        { status: 502 }
      );
    }

    const data = await res.json();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        voiceId: data.voice_id,
        cloneStatus: "ready",
      },
    });

    return NextResponse.json({ voiceId: data.voice_id });
  } catch (err) {
    console.error("Clone creation error:", err);
    await prisma.user.update({
      where: { id: user.id },
      data: { cloneStatus: "recording" },
    });
    return NextResponse.json(
      { error: "Voice cloning failed" },
      { status: 500 }
    );
  }
}
