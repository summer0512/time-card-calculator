import { use } from "react";
import {useTranslations} from 'next-intl';
import HeadInfo from '@/components/head-info';
import TimeCardCalculator from "@/components/time-card-calculator";
import Link from "next/link";

export default function Home(props: {params: Promise<{locale: string}>}) {
  const params = use(props.params);
  const t = useTranslations('HomePage');
  return (
    <div>
      <HeadInfo
        locale={params.locale}
        page=""
        title={t('title')}
        description={t('description')}
        keywords={t('keywords')}
        ogImageAlt="Time card calculator dashboard preview"
      />
      <main className="flex-1 py-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 2xl:px-8">
          {/* Calculator Section */}
          <TimeCardCalculator />

          {/* Features Section */}
          <div className="mt-6 2xl:mt-1 mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="text-center p-6 bg-white rounded-lg shadow-sm border">
                <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Free Time Card Calculator</h2>
                <p className="text-gray-600">Our free time card calculator helps you track work hours accurately with no cost. Calculate weekly and biweekly hours, including lunch breaks and multiple break periods.</p>
              </div>

              <div className="text-center p-6 bg-white rounded-lg shadow-sm border">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Time Card Calculator with Lunch</h2>
                <p className="text-gray-600">Easily toggle lunch break column on/off with our time card calculator with lunch feature. Automatically deducts lunch breaks from total hours for accurate payroll calculations.</p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-lg shadow-sm border">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Time Card Calculator with Breaks</h2>
                <p className="text-gray-600">Support for multiple break periods with up to 3 break columns. Our time card calculator with breaks feature allows you to add or remove break columns as needed for flexible time tracking.</p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-lg shadow-sm border">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Biweekly Time Card Calculator</h2>
                <p className="text-gray-600">Biweekly time card calculator for 2-week pay periods with comprehensive time tracking and professional printable reports for payroll processing.</p>
              </div>
            </div>
          </div>

          {/* Time Format Examples Section */}
          <div className="mt-16 mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Multiple Time Format Support
            </h2>
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4">12-Hour Format</h3>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-blue-700 font-mono text-sm mb-2">8:30AM</p>
                    <p className="text-blue-700 font-mono text-sm mb-2">5:00PM</p>
                    <p className="text-blue-700 font-mono text-sm mb-2">12:15PM</p>
                    <p className="text-blue-600 text-xs mt-2">Standard AM/PM format</p>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-green-800 mb-4">24-Hour Military Time</h3>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-green-700 font-mono text-sm mb-2">08:30</p>
                    <p className="text-green-700 font-mono text-sm mb-2">17:00</p>
                    <p className="text-green-700 font-mono text-sm mb-2">12:15</p>
                    <p className="text-green-600 text-xs mt-2">Military time card calculator format</p>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-purple-800 mb-4">Decimal Time Format</h3>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-purple-700 font-mono text-sm mb-2">8.5</p>
                    <p className="text-purple-700 font-mono text-sm mb-2">17.0</p>
                    <p className="text-purple-700 font-mono text-sm mb-2">12.25</p>
                    <p className="text-purple-600 text-xs mt-2">Decimal format for total results</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Our time card calculator automatically converts between all formats, making it perfect for decimal time card calculator, 
                  military time card calculator, and standard time entry needs.
                </p>
              </div>
            </div>
          </div>

          {/* Calculator Details Section */}
          <div className="mt-16 mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              How Our Time Card Calculator Free Tool Works
            </h2>
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Simple Time Entry</h3>
                  <p className="text-gray-600 mb-4">Enter your work hours using our intuitive time card calculator interface. Support for multiple time formats makes it easy to track daily work hours, lunch breaks, and additional break periods.</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Enter start and end times for each work day</li>
                    <li>Add lunch break durations (automatically set to 1:00)</li>
                    <li>Include additional breaks as needed</li>
                    <li>Automatic calculation of total hours worked</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Advanced Features</h3>
                  <p className="text-gray-600 mb-4">Our time card calculator with breaks offers advanced features for comprehensive time tracking and payroll processing:</p>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Biweekly time card calculator for 2-week periods</li>
                    <li>Time card calculator with lunch breaks toggle</li>
                    <li>Multiple break period tracking (up to 3 columns)</li>
                    <li>Professional printable report generation</li>
                    <li>Copy functionality for quick data entry</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Q&A Section */}
          <div className="mt-16 mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Frequently Asked Questions
            </h2>
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <div className="space-y-8">
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">What is a time card calculator?</h3>
                  <p className="text-gray-600">A time card calculator is a tool that helps you track work hours, calculate total time worked, and manage payroll calculations. Our free time card calculator supports multiple time formats and includes features for lunch breaks and additional breaks.</p>
                </div>
                
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">How do I use the time card calculator with lunch breaks?</h3>
                  <p className="text-gray-600">Simply enter your start and end times for each work day, and the calculator will automatically deduct your lunch break (default 1 hour) from your total hours. You can also customize the lunch break duration or turn off the lunch break feature if needed.</p>
                </div>
                
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Can I calculate biweekly hours with this tool?</h3>
                  <p className="text-gray-600">Yes! Our biweekly time card calculator allows you to track hours for two-week pay periods. Simply enter your work hours for all days in the two-week period, and the calculator will provide you with total hours, overtime calculations, and a professional printable report.</p>
                </div>
                
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">What time formats are supported?</h3>
                  <p className="text-gray-600">Our time card calculator supports 12-hour format (8:30 AM, 5:00 PM), 24-hour military time (08:30, 17:00), and decimal time format (8.5, 17.0). The calculator automatically converts between formats, making it perfect for any time tracking needs.</p>
                </div>
                
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">How many break periods can I track?</h3>
                  <p className="text-gray-600">Our time card calculator with breaks supports up to 3 break columns, allowing you to track multiple break periods throughout the day. You can add or remove break columns as needed for flexible time tracking.</p>
                </div>
                
                <div className="pb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">What if the current features don't meet my specific needs?</h3>
                  <p className="text-gray-600 mb-4">We're always looking to improve our time card calculator to better serve our users' needs. If you have specific requirements or suggestions for new features, we'd love to hear from you!</p>
                  <Link href="/contact" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Contact Us to Submit Your Requirements
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
