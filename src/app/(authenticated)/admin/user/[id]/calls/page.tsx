import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminUserCallsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.isAdmin) redirect("/dashboard");

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      calls: { orderBy: { startedAt: "desc" } },
    },
  });

  if (!user) redirect("/admin");

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin" className="text-sm text-blue-600 hover:underline">
          &larr; Back to Admin
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          Calls for {user.name || user.email}
        </h1>
      </div>

      {user.calls.length === 0 ? (
        <p className="text-gray-500">No calls yet.</p>
      ) : (
        <div className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
          {user.calls.map((call) => (
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
                      : "—"}
                  </p>
                </div>
              </div>

              {call.summary && (
                <div className="rounded-md bg-blue-50 p-3">
                  <p className="text-xs font-medium text-blue-700 mb-1">Summary</p>
                  <p className="text-sm text-blue-900">{call.summary}</p>
                </div>
              )}

              {call.transcript && (
                <details>
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
