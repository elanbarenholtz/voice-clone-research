import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { calls: { orderBy: { startedAt: "desc" }, take: 5 } },
  });

  if (!user) redirect("/login");

  const steps = [
    {
      label: "Record your voice",
      href: "/record",
      done: !!user.recordingUrl,
      active: !user.recordingUrl,
    },
    {
      label: "Clone your voice",
      href: "/clone",
      done: !!user.voiceId,
      active: !!user.recordingUrl && !user.voiceId,
    },
    {
      label: "Set up personality",
      href: "/setup",
      done: !!user.systemPrompt,
      active: !!user.voiceId && !user.systemPrompt,
    },
    {
      label: "Deploy your clone",
      href: "/deploy",
      done: !!user.phoneNumber,
      active: !!user.systemPrompt && !user.phoneNumber,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-600">
          Welcome{user.name ? `, ${user.name}` : ""}!
        </p>
      </div>

      {/* Status card */}
      {user.phoneNumber && user.isActive ? (
        <div className="rounded-lg border border-green-200 bg-green-50 p-6">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
            <h2 className="text-lg font-semibold text-green-800">
              Your clone is live!
            </h2>
          </div>
          <p className="mt-2 text-2xl font-mono text-green-900">
            {user.phoneNumber}
          </p>
          <p className="mt-1 text-sm text-green-700">
            {user.calls.length > 0
              ? `${user.calls.length} recent call${user.calls.length !== 1 ? "s" : ""}`
              : "No calls yet"}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Set up your voice clone
          </h2>
          <div className="mt-4 space-y-3">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    step.done
                      ? "bg-green-100 text-green-700"
                      : step.active
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {step.done ? "\u2713" : i + 1}
                </div>
                {step.active ? (
                  <Link
                    href={step.href}
                    className="text-blue-600 font-medium hover:underline"
                  >
                    {step.label}
                  </Link>
                ) : (
                  <span
                    className={
                      step.done ? "text-gray-500 line-through" : "text-gray-400"
                    }
                  >
                    {step.label}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent calls */}
      {user.calls.length > 0 && (
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Calls
            </h2>
            <Link href="/calls" className="text-sm text-blue-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-3 divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
            {user.calls.map((call) => (
              <div key={call.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-mono text-sm text-gray-900">
                    {call.fromNumber}
                  </p>
                  <p className="text-xs text-gray-500">
                    {call.startedAt.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    {call.durationSec ? `${Math.ceil(call.durationSec / 60)}m` : "--"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
