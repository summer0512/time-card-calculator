"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "@/i18n/routing";

const menuItems = [
  { name: "Home", href: "/" },
  { name: "Time Card Calculator with Lunch", href: "/time-card-calculator-with-lunch" },
  { name: "Biweekly Time Card Calculator", href: "/biweekly-time-card-calculator" },
  { name: "Timesheet Calculator with Lunch", href: "/timesheet-calculator-with-lunch" },
  { name: "Time Punch Calculator", href: "/time-punch-calculator" },
  { name: "Guides", href: "/guides/time-card-calculator-with-lunch" },
  { name: "Contact", href: "/contact" }
];

export default function MobileMenuButton() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <div className="md:hidden">
        <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 z-50">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t shadow-lg">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
