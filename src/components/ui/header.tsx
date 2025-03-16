"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex">
          <Link href="/" className="flex items-center gap-2 px-4">
            <span className="font-bold text-lg">
              <span className="text-indigo-600 dark:text-indigo-400">Etüt</span><span className="text-indigo-500 dark:text-indigo-300">Abi</span>
              <span className="text-xs ml-2 text-gray-500 dark:text-gray-400">by HercAI</span>
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {!isHome && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="flex items-center gap-1 px-3 py-1"
            >
              <Link href="/">
                <Home className="h-4 w-4 mr-1" />
                Ana Sayfa
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
} 