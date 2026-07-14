import { Navbar } from "@/components/Navbar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { getCurrentUser } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  return (
    <>
      <Navbar user={user} />
      <main className="flex-1 pb-16 lg:pb-0">{children}</main>
      <MobileBottomNav />
    </>
  );
}
