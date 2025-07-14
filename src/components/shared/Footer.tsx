"use client";

import { useAppSettings } from "@/context/AppContext";
import { Skeleton } from "@/components/ui/skeleton";

export function Footer() {
    const { settings, loading } = useAppSettings();
    
    if (loading) {
        return (
             <footer className="py-6 md:px-8 md:py-0 border-t">
                <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
                    <Skeleton className="h-4 w-1/3" />
                </div>
            </footer>
        )
    }

    return (
        <footer className="py-6 md:px-8 md:py-0 border-t">
            <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
            <p className="text-center text-sm leading-loose text-muted-foreground">
                {settings?.footerText}
            </p>
            </div>
      </footer>
    )
}
