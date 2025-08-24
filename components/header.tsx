"use client";

import { cn } from "@/lib/utils";
import {Link, usePathname} from '@/i18n/routing';
import Image from 'next/image';
import { ThemeToggle } from "./theme-toggle";
import { LanguageToggle } from "./language-toggle";
import { useTranslations } from 'next-intl';
import { Clock, ChevronDown } from "lucide-react";
import MobileMenuButton from "./mobile-menu-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// export default function Header({ className }: { className?: string }) {
//   const t = useTranslations('Header');
//   return (
//     <header className={cn(`sticky top-0 z-50 w-full border-b bg-background`, className)}>
//       <div className="container mx-auto">
//         <div className="flex h-16 items-center justify-between">
//           {/* header left */}
//           <div className="flex justify-start items-center gap-4">
//             <Link href="/" className="flex items-center gap-4">
//               <Image src="/logo.png" alt="logo" width={32} height={32} />
//               <h1 className="text-2xl font-bold">{t('title')}</h1>
//             </Link>
//           </div>
//           {/* header right */}
//           <div className="flex justify-end items-center gap-4">
//             {/* dark mode toggle */}
//             <ThemeToggle />
//             {/* language toggle */}
//             <LanguageToggle />
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }
const menuItems = [
  { name: "Home", href: "/" },
  { name: "Contact", href: "/contact" }
];

const guideItems = [
  { name: "Time Card Calculator with Lunch", href: "/guides/time-card-calculator-with-lunch" },
  { name: "Time Card Calculator with Breaks", href: "/guides/time-card-calculator-with-breaks" },
  { name: "Biweekly Time Card Calculator", href: "/guides/biweekly-time-card-calculator" }
];

export default function Header() {
  const pathname = usePathname();
  
  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/' || pathname.endsWith('/');
    }
    return pathname.includes(href);
  };

  const isGuidesActive = () => {
    return guideItems.some(item => pathname.includes(item.href));
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Time Card Calculator</span>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden md:flex space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:text-blue-600"
                )}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Guides Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1",
                    isGuidesActive()
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:text-blue-600"
                  )}
                >
                  Guides
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                {guideItems.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "w-full px-2 py-2 text-sm cursor-pointer",
                        isActive(item.href)
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                      )}
                    >
                      {item.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Mobile Menu Button - Only this part is interactive */}
          <MobileMenuButton />
        </div>
      </div>
    </header>
  );
}