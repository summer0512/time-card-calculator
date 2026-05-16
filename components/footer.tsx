import { Clock, Github, Mail } from "lucide-react";
import Link from "next/link";

const popularTools = [
  { name: "Time Card Calculator with Lunch Breaks", href: "/time-card-calculator-with-lunch" },
  { name: "Biweekly Time Card Calculator", href: "/biweekly-time-card-calculator" },
  { name: "Timesheet Calculator with Lunch", href: "/timesheet-calculator-with-lunch" },
  { name: "Lunch Break Calculator", href: "/lunch-break-calculator" },
  { name: "Time Punch Calculator", href: "/time-punch-calculator" }
];

const guideLinks = [
  { name: "How to Calculate Time Cards with Lunch Breaks", href: "/guides/time-card-calculator-with-lunch" },
  { name: "How to Calculate Time Card Breaks", href: "/guides/time-card-calculator-with-breaks" },
  { name: "Biweekly Time Card Guide", href: "/guides/biweekly-time-card-calculator" }
];

const friendLinks = [
  { name: "Morse Code Kit", href: "https://morsecodekit.com/", follow: true },
  { name: "PrintableGen", href: "https://printablegen.com/", follow: true },
  { name: "Generate Org Chart", href: "https://generateorgchart.com/", follow: true },
  { name: "Size Chart Kit", href: "https://sizechartkit.com/", follow: true }
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">Time Card Calculator</span>
            </div>
            <div className="flex items-center text-sm text-gray-400 mb-4">
              <Mail className="h-4 w-4 mr-2" />
              info@time-card-calculator.work
            </div>
            <p className="text-sm text-gray-400 max-w-xl">
              Free online calculators for time cards, lunch breaks, time punches, and biweekly payroll hour summaries.
            </p>
          </div>

          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/summer0512/time-card-calculator"
                  className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center gap-2"
                >
                  Github <Github className="h-4 w-4" />
                </a>
              </li>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-3">
            <h3 className="text-lg font-semibold mb-4">Popular Tools</h3>
            <ul className="space-y-2">
              {popularTools.map((tool) => (
                <li key={tool.href}>
                  <Link href={tool.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1 md:col-span-3">
            <h4 className="text-sm font-semibold text-white mb-2">Guides</h4>
            <div className="flex flex-wrap gap-3">
              {guideLinks.map((guide) => (
                <Link key={guide.href} href={guide.href} className="text-xs text-gray-400 hover:text-white transition-colors">
                  {guide.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-sm font-semibold text-white mb-2">Friend Links</h4>
            <div className="flex flex-wrap gap-3">
              {friendLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  rel={link.follow ? undefined : "nofollow"}
                  target="_blank"
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-800">
          <p className="text-gray-400 text-sm text-center">Copyright 2026 Time Card Calculator. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
