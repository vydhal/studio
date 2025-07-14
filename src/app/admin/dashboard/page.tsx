import { DashboardClient } from "@/components/admin/dashboard/DashboardClient";

export default function DashboardPage() {
    // O fetching dos dados agora é feito dentro do DashboardClient, que é um Client Component
    // para poder acessar o localStorage.
    return (
        <div className="space-y-4">
            <DashboardClient />
        </div>
    );
}

export const revalidate = 0;
