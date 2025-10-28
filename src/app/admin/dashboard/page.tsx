import { DashboardClient } from "@/components/admin/dashboard/DashboardClient";

export default function DashboardPage() {
    // O fetching dos dados agora é feito de forma assíncrona no servidor 
    // e passado para o cliente, usando Firebase.
    return (
        <DashboardClient />
    );
}

export const revalidate = 0;

  