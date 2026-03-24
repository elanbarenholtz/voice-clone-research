import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function CallsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const calls = await prisma.call.findMany({
    where: { userId: session.user.id },
    orderBy: { startedAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Call History</h1>
        <p className="mt-1 text-gray-600">
          Calls handled by your AI voice clone.
        </p>
      </div>

      {calls.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500">
          No calls yet. Once your clone is live, calls will appear here.
        </div>
      ) : (
        <div className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
          {calls.map((call) => (
            <div key={call.id} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-sm font-medium text-gray-900">
                    {call.fromNumber}
                  </p>
                  <p className="text-xs text-gray-500">
                    {call.startedAt.toLocaleString()} &middot;{" "}
                    {call.durationSec
                      ? `${Math.floor(call.durationSec / 60)}m ${call.durationSec % 60}s`
                      : "Duration unknown"}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    call.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {call.status}
                </span>
              </div>

              {call.summary && (
                <div className="rounded-md bg-blue-50 p-3">
                  <p className="text-xs font-medium text-blue-700 mb-1">
                    Summary
                  </p>
                  <p className="text-sm text-blue-900">{call.summary}</p>
                </div>
              )}

              {call.transcript && (
                <details className="group">
                  <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700">
                    View transcript
                  </summary>
                  <pre className="mt-2 max-h-60 overflow-auto rounded-md bg-gray-50 p-3 text-xs text-gray-700 whitespace-pre-wrap">
                    {call.transcript}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
