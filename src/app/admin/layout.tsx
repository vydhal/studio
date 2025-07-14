import { AdminSidebar } from "@/components/admin/AdminSidebar";
import {
  SidebarProvider,
  SidebarInset
} from "@/components/ui/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
       <AdminSidebar />
        <main className="flex flex-1 flex-col gap-4 p-4 sm:px-8 sm:py-4 md:gap-8">
            {children}
        </main>
    </div>
  );
}
