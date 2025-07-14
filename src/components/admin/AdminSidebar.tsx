
"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Settings,
  School,
  FileEdit,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

export function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const handleLogout = async () => {
    toast({ title: "Logout realizado com sucesso!" });
    router.push("/login");
  };

  const menuItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "Usuários e Perfis", icon: Users },
    { href: "/admin/settings", label: "Configurações", icon: Settings },
  ];

  return (
    <SidebarProvider>
      <Sidebar className="border-r" collapsible="icon">
        <SidebarHeader className="p-4 justify-center">
            <Link href="/admin/dashboard" className="group flex items-center justify-center gap-2">
                <div className="p-2 rounded-lg bg-primary text-primary-foreground">
                    <School className="h-6 w-6 transition-all group-hover:scale-110" />
                </div>
                <span className="font-bold text-lg duration-200 group-data-[collapsible=icon]:hidden">
                    School Central
                </span>
            </Link>
        </SidebarHeader>

        <SidebarContent className="p-2">
            <SidebarMenu>
                {menuItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                            asChild
                            isActive={pathname === item.href}
                            tooltip={item.label}
                        >
                             <Link href={item.href}>
                                <item.icon className="h-5 w-5" />
                                <span>{item.label}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="p-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="w-full justify-start items-center gap-2"
                    >
                         <Image
                            src="https://placehold.co/36x36.png"
                            width={36}
                            height={36}
                            alt="Avatar"
                            className="overflow-hidden rounded-full"
                            data-ai-hint="avatar"
                        />
                        <div className="flex flex-col items-start duration-200 group-data-[collapsible=icon]:hidden">
                            <span className="text-sm font-medium">Admin</span>
                            <span className="text-xs text-muted-foreground">admin@escola.com</span>
                        </div>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href="/admin/settings">
                      <DropdownMenuItem>Configurações</DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem disabled>Suporte</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  );
}
