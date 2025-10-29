
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, School } from 'lucide-react';
import { useAppSettings } from '@/context/AppContext';
import { useAuth } from '@/hooks/useAuth';


export function Header() {
  const { appName } = useAppSettings();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-8">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <School className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">
              {appName}
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/census">Censo Escolar</Link>
          </nav>
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <Link href="/" className="mr-6 flex items-center space-x-2 mb-6">
                  <School className="h-6 w-6 text-primary" />
                  <span className="font-bold">{appName}</span>
                </Link>
                <nav className="flex flex-col space-y-4">
                  <Link href="/census" className="text-lg">Censo Escolar</Link>
                  <Link href={user ? "/admin/dashboard" : "/login"} className="text-lg">
                    {user ? "Painel Admin" : "Admin Login"}
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
          <nav className="hidden md:flex items-center">
            <Button asChild>
              <Link href={user ? "/admin/dashboard" : "/login"}>
                {user ? "Painel Admin" : "Admin Login"}
              </Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
