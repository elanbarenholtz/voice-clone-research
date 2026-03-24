"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function ClonePage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "no-recording" | "ready-to-clone" | "cloning" | "done" | "error">("loading");
  const [voiceId, setVoiceId] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Check current status
  useEffect(() => {
    fetch("/api/user/status")
      .then((r) => r.json())
      .then((data) => {
        if (data.voiceId) {
          setVoiceId(data.voiceId);
          setStatus("done");
        } else if (data.cloneStatus === "cloning") {
          setStatus("cloning");
        } else if (data.recordingUrl) {
          setStatus("ready-to-clone");
        } else {
          setStatus("no-recording");
        }
      });
  }, []);

  const startCloning = useCallback(async () => {
    setStatus("cloning");
    setError("");

    const res = await fetch("/api/clone/create", { method: "POST" });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Cloning failed");
      setStatus("ready-to-clone");
      return;
    }

    setVoiceId(data.voiceId);
    setStatus("done");
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Voice Clone</h1>
        <p className="mt-1 text-gray-600">
          Create an AI clone of your voice using your recording.
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        {status === "loading" && (
          <p className="text-gray-500">Loading...</p>
        )}

        {status === "no-recording" && (
          <div>
            <p className="text-gray-600">You haven&apos;t recorded your voice yet.</p>
            <button
              onClick={() => router.push("/record")}
              className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Go to Recording
            </button>
          </div>
        )}

        {status === "ready-to-clone" && (
          <div>
            <p className="text-gray-600 mb-4">
              Your recording is ready. Click below to create your voice clone.
            </p>
            <button
              onClick={startCloning}
              className="rounded-md bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700"
            >
              Create Voice Clone
            </button>
          </div>
        )}

        {status === "cloning" && (
          <div className="space-y-4">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
            <p className="text-lg font-medium text-gray-900">
              Creating your voice clone...
            </p>
            <p className="text-sm text-gray-500">
              This usually takes 30-60 seconds.
            </p>
          </div>
        )}

        {status === "done" && (
          <div className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <span className="text-2xl text-green-600">{"\u2713"}</span>
            </div>
            <p className="text-lg font-medium text-gray-900">
              Voice clone created!
            </p>
            <p className="text-sm text-gray-500">
              Voice ID: <code className="text-xs">{voiceId}</code>
            </p>
            <button
              onClick={() => router.push("/setup")}
              className="rounded-md bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700"
            >
              Continue to Setup
            </button>
          </div>
        )}

        {status === "error" && (
          <p className="text-red-600">{error}</p>
        )}

        {error && status !== "error" && (
          <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
