"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DeployPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "not-ready" | "ready" | "deploying" | "deployed" | "error">("loading");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/user/status")
      .then((r) => r.json())
      .then((data) => {
        if (data.phoneNumber) {
          setPhoneNumber(data.phoneNumber);
          setStatus("deployed");
        } else if (data.voiceId && data.systemPrompt) {
          setStatus("ready");
        } else {
          setStatus("not-ready");
        }
      });
  }, []);

  const handleDeploy = async () => {
    setStatus("deploying");
    setError("");

    const res = await fetch("/api/deploy", { method: "POST" });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Deployment failed");
      setStatus("ready");
      return;
    }

    setPhoneNumber(data.phoneNumber);
    setStatus("deployed");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Deploy Your Clone</h1>
        <p className="mt-1 text-gray-600">
          Get a phone number that your AI clone will answer.
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
        {status === "loading" && (
          <p className="text-gray-500">Loading...</p>
        )}

        {status === "not-ready" && (
          <div>
            <p className="text-gray-600">
              Complete the previous steps first (record, clone, setup).
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Back to Dashboard
            </button>
          </div>
        )}

        {status === "ready" && (
          <div>
            <p className="text-gray-600 mb-2">
              Everything is set up. Click deploy to buy a phone number and go live.
            </p>
            <p className="text-xs text-gray-400 mb-6">
              This will purchase a phone number via Twilio and create your AI agent on ElevenLabs.
            </p>
            <button
              onClick={handleDeploy}
              className="rounded-md bg-green-600 px-8 py-3 text-lg font-semibold text-white hover:bg-green-700"
            >
              Deploy My Clone
            </button>
          </div>
        )}

        {status === "deploying" && (
          <div className="space-y-4">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-green-200 border-t-green-600" />
            <p className="text-lg font-medium text-gray-900">
              Deploying your clone...
            </p>
            <p className="text-sm text-gray-500">
              Buying phone number, creating agent, connecting everything...
            </p>
          </div>
        )}

        {status === "deployed" && (
          <div className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <span className="text-3xl">📞</span>
            </div>
            <p className="text-lg font-medium text-gray-900">
              Your clone is live!
            </p>
            <p className="text-3xl font-mono font-bold text-green-700">
              {phoneNumber}
            </p>
            <p className="text-sm text-gray-500">
              Call this number to talk to your AI clone.
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
