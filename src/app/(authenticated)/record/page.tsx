"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

const READING_SCRIPT = `Welcome to the voice cloning session. Please read the following passage naturally, as if you're talking to a friend.

Hi there! My name is — well, you know my name. Let me tell you a bit about my day. I woke up this morning feeling pretty good. Had some coffee, checked my phone, and thought about what I wanted to get done today.

You know what's funny? I was just thinking about how different things are now compared to a few years ago. Technology has changed so much. I mean, here I am, recording my voice so an AI can learn to sound like me. That's wild, right?

Anyway, let me tell you about something that happened last week. I was walking through campus and ran into an old friend I hadn't seen in months. We ended up talking for like an hour. It was really nice catching up.

Oh, and one more thing — I've been meaning to ask you something. Have you ever tried that new place downtown? The one with the really good sandwiches? I went there yesterday and it was amazing. You should definitely check it out.

Alright, I think that's about it for now. Thanks for listening! Talk to you later. Bye!`;

const MIN_DURATION_SEC = 60;

export default function RecordPage() {
  const router = useRouter();
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      });

      chunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start(1000);
      startTimeRef.current = Date.now();
      setRecording(true);
      setAudioBlob(null);
      setAudioUrl(null);
      setError("");

      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 500);
    } catch {
      setError("Microphone access denied. Please allow microphone access and try again.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
  }, []);

  const uploadRecording = useCallback(async () => {
    if (!audioBlob) return;
    if (duration < MIN_DURATION_SEC) {
      setError(`Recording must be at least ${MIN_DURATION_SEC} seconds. You recorded ${duration}s.`);
      return;
    }

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");

    const res = await fetch("/api/recording/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Upload failed");
      setUploading(false);
      return;
    }

    router.push("/clone");
  }, [audioBlob, duration, router]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Record Your Voice</h1>
        <p className="mt-1 text-gray-600">
          Read the script below naturally. We need at least 60 seconds of audio.
        </p>
      </div>

      {/* Script */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Reading Script
        </h2>
        <div className="whitespace-pre-line text-gray-800 leading-relaxed">
          {READING_SCRIPT}
        </div>
      </div>

      {/* Recording controls */}
      <div className="flex flex-col items-center gap-4 rounded-lg border border-gray-200 bg-white p-8">
        {/* Timer */}
        <div className="text-4xl font-mono tabular-nums text-gray-900">
          {formatTime(duration)}
        </div>

        {duration > 0 && duration < MIN_DURATION_SEC && !recording && (
          <p className="text-sm text-amber-600">
            Need at least {MIN_DURATION_SEC - duration}s more
          </p>
        )}

        {duration >= MIN_DURATION_SEC && !recording && (
          <p className="text-sm text-green-600">Recording length is good!</p>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          {!recording && !audioBlob && (
            <button
              onClick={startRecording}
              className="flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-white font-semibold hover:bg-red-700"
            >
              <span className="h-3 w-3 rounded-full bg-white" />
              Start Recording
            </button>
          )}

          {recording && (
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 rounded-full bg-gray-800 px-6 py-3 text-white font-semibold hover:bg-gray-900"
            >
              <span className="h-3 w-3 rounded-sm bg-white" />
              Stop Recording
            </button>
          )}

          {!recording && audioBlob && (
            <>
              <button
                onClick={startRecording}
                className="rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Re-record
              </button>
              <button
                onClick={uploadRecording}
                disabled={uploading}
                className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Upload & Continue"}
              </button>
            </>
          )}
        </div>

        {/* Playback */}
        {audioUrl && !recording && (
          <div className="mt-4 w-full max-w-md">
            <audio controls src={audioUrl} className="w-full" />
          </div>
        )}

        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
