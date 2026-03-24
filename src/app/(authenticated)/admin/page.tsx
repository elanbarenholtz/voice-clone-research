import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.isAdmin) redirect("/dashboard");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { calls: true, contacts: true } },
    },
  });

  const totalCalls = await prisma.call.count();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin</h1>
          <p className="mt-1 text-gray-600">
            {users.length} users &middot; {totalCalls} total calls
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                User
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Phone
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Calls
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Joined
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-900">
                    {user.name || "—"}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      user.isActive
                        ? "bg-green-100 text-green-700"
                        : user.voiceId
                          ? "bg-yellow-100 text-yellow-700"
                          : user.recordingUrl
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {user.isActive
                      ? "Live"
                      : user.voiceId
                        ? "Cloned"
                        : user.recordingUrl
                          ? "Recorded"
                          : "New"}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-sm text-gray-600">
                  {user.phoneNumber || "—"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {user._count.calls > 0 ? (
                    <Link
                      href={`/admin/user/${user.id}/calls`}
                      className="text-blue-600 hover:underline"
                    >
                      {user._count.calls}
                    </Link>
                  ) : (
                    "0"
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {user.createdAt.toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
