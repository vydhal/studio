import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // In a real application, you would protect this layout with authentication.
  // For this test environment, we are allowing access directly.
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
       <AdminSidebar />
        <main className="flex flex-1 flex-col gap-4 p-4 sm:px-8 sm:py-4 md:gap-8 lg:pl-72">
            {children}
        </main>
    </div>
  );
}
