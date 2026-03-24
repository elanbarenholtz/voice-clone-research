import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import SessionProvider from "@/components/session-provider";
import Nav from "@/components/nav";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <SessionProvider>
      <Nav />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        {children}
      </main>
    </SessionProvider>
  );
}
