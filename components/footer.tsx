import { Clock, Github, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">Time Card Calculator Calculator</span>
            </div>
            <div className="flex space-x-4">
              <div className="flex items-center text-sm text-gray-400">
                <Mail className="h-4 w-4 mr-2" />
                info@time-card-calculator.work
              </div>
            </div>
            {/* Friend Links */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Friend Links</h3>
              <ul className="space-y-2">
                <li><a href="https://wordle-hint.net" className="text-sm text-gray-400 hover:text-white transition-colors">Wordle Hint</a></li>
              </ul>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-sm text-gray-400 hover:text-white transition-colors">Home</a></li>
              <li><a href="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">Contact</a></li>
              <li><a href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="https://github.com/summer0512/time-card-calculator" className="text-sm text-gray-400 hover:text-white transition-colors flex gap-2">Github <Github/></a></li>
            </ul>
          </div>
          {/* Guides */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Guides</h3>
            <ul className="space-y-2">
              <li><a href="/guides/time-card-calculator-with-lunch" className="text-sm text-gray-400 hover:text-white transition-colors">Time Card Calculator with Lunch</a></li>
              <li><a href="/guides/time-card-calculator-with-breaks" className="text-sm text-gray-400 hover:text-white transition-colors">Time Card Calculator with Breaks</a></li>
              <li><a href="/guides/biweekly-time-card-calculator" className="text-sm text-gray-400 hover:text-white transition-colors">Biweekly Time Card Calculator</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8">
          <p className="text-gray-400 text-sm text-center">
            Copyright 2025 Time Card Calculator Calculator. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}