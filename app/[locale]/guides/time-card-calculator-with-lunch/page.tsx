import HeadInfo from '@/components/head-info';

export default function TimeCardCalculatorWithLunchGuide() {
  return (
    <div>
      <HeadInfo
        locale="en"
        page="guides/time-card-calculator-with-lunch"
        title="Time Card Calculator with Lunch Breaks Guide"
        description="Guide to using time card calculator with lunch break tracking"
        keywords="time card calculator, lunch break, work hours, time tracking"
        ogType="article"
        ogImageAlt="Time card calculator with lunch breaks guide cover"
      />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Time Card Calculator with Lunch Breaks
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
              Master the art of accurate time tracking with our comprehensive guide to using lunch breaks in your time card calculations.
            </p>
            <a 
              href="/" 
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try the Calculator Now
            </a>
          </div>

          {/* Introduction */}
          <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
            <h2 className="text-3xl font-semibold text-gray-800 mb-4">
              Understanding Lunch Break Tracking
            </h2>
            <p className="text-gray-600 mb-4">
              Our Time Card Calculator offers flexible lunch break tracking to ensure accurate payroll calculations. Whether you need to track standard lunch breaks, multiple breaks, or customize break times, our calculator provides the tools you need.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
              <p className="text-blue-800">
                <strong>Key Feature:</strong> The lunch break column can be easily added or removed based on your specific time tracking needs.
              </p>
            </div>
          </div>

          {/* Getting Started */}
          <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
            <h2 className="text-3xl font-semibold text-gray-800 mb-6">
              Getting Started with Lunch Breaks
            </h2>
            
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">
              Step 1: Enable Lunch Break Column
            </h3>
            <p className="text-gray-600 mb-4">
              To start tracking lunch breaks, click the "With Lunch" button in the calculator toolbar. This will add a dedicated lunch break column to your time card.
            </p>
            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <p className="font-mono text-sm text-gray-700">
                💡 When you enable the lunch column, it automatically sets a default 1:00 hour lunch break for all days.
              </p>
            </div>

            <h3 className="text-2xl font-semibold text-gray-700 mb-4">
              Step 2: Enter Your Work Hours
            </h3>
            <p className="text-gray-600 mb-4">
              Fill in your standard work hours in the "From" and "To" columns. The calculator supports various time formats:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li>12-hour format: 8:30AM, 5:00PM</li>
              <li>24-hour format: 08:30, 17:00</li>
              <li>Decimal format: 8.5, 17.0</li>
            </ul>

            <h3 className="text-2xl font-semibold text-gray-700 mb-4">
              Step 3: Customize Lunch Break Duration
            </h3>
            <p className="text-gray-600 mb-4">
              Modify the lunch break duration for each day as needed. Common lunch break durations include:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 p-3 rounded text-center">
                <p className="font-semibold text-green-800">30 min</p>
                <p className="text-sm text-green-600">0:30</p>
              </div>
              <div className="bg-blue-50 p-3 rounded text-center">
                <p className="font-semibold text-blue-800">45 min</p>
                <p className="text-sm text-blue-600">0:45</p>
              </div>
              <div className="bg-purple-50 p-3 rounded text-center">
                <p className="font-semibold text-purple-800">1 hour</p>
                <p className="text-sm text-purple-600">1:00</p>
              </div>
              <div className="bg-orange-50 p-3 rounded text-center">
                <p className="font-semibold text-orange-800">1.5 hours</p>
                <p className="text-sm text-orange-600">1:30</p>
              </div>
            </div>
          </div>

          {/* Advanced Features */}
          <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
            <h2 className="text-3xl font-semibold text-gray-800 mb-6">
              Advanced Lunch Break Features
            </h2>

            <h3 className="text-2xl font-semibold text-gray-700 mb-4">
              Multiple Break Support
            </h3>
            <p className="text-gray-600 mb-4">
              In addition to lunch breaks, our calculator supports tracking multiple break periods:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li>Primary break column for standard breaks</li>
              <li>Additional break columns (up to 3 total)</li>
              <li>Customizable break durations for each column</li>
              <li>Automatic calculation of total break time</li>
            </ul>

            <h3 className="text-2xl font-semibold text-gray-700 mb-4">
              Column Management
            </h3>
            <p className="text-gray-600 mb-4">
              You have full control over break and lunch columns:
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <h4 className="font-semibold text-yellow-800 mb-2">Column Actions:</h4>
              <ul className="text-yellow-700 space-y-1">
                <li>• <strong>Add:</strong> Click "With Lunch" or "With Break" buttons</li>
                <li>• <strong>Remove:</strong> Click the trash icon in column headers</li>
                <li>• <strong>Customize:</strong> Edit individual cell values</li>
              </ul>
            </div>

            <h3 className="text-2xl font-semibold text-gray-700 mb-4">
              Automatic Calculations
            </h3>
            <p className="text-gray-600 mb-4">
              The calculator automatically handles complex time calculations:
            </p>
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h4 className="font-semibold text-gray-800 mb-3">Calculation Formula:</h4>
              <p className="font-mono text-sm text-gray-700 mb-3">
                Total Work Time = (End Time - Start Time) - (Lunch Break + All Additional Breaks)
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-gray-700">Example 1:</p>
                  <p className="text-gray-600">8:00AM to 5:00PM</p>
                  <p className="text-gray-600">Lunch: 1:00</p>
                  <p className="text-green-600 font-semibold">Total: 8 hours</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Example 2:</p>
                  <p className="text-gray-600">9:00AM to 6:00PM</p>
                  <p className="text-gray-600">Lunch: 0:30 + Break: 0:15</p>
                  <p className="text-green-600 font-semibold">Total: 8.25 hours</p>
                </div>
              </div>
            </div>
          </div>

          {/* Use Cases */}
          <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
            <h2 className="text-3xl font-semibold text-gray-800 mb-6">
              Common Use Cases
            </h2>

            <h3 className="text-2xl font-semibold text-gray-700 mb-4">
              Standard Office Hours
            </h3>
            <p className="text-gray-600 mb-4">
              Perfect for traditional 9-to-5 jobs with a standard lunch break:
            </p>
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-blue-800 font-semibold mb-2">Typical Setup:</p>
              <ul className="text-blue-700 space-y-1">
                <li>• Start: 9:00AM</li>
                <li>• End: 5:00PM</li>
                <li>• Lunch: 1:00 hour</li>
                <li>• Daily Total: 8 hours</li>
              </ul>
            </div>

            <h3 className="text-2xl font-semibold text-gray-700 mb-4">
              Flexible Work Schedules
            </h3>
            <p className="text-gray-600 mb-4">
              Ideal for flexible work arrangements with varying break times:
            </p>
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <p className="text-green-800 font-semibold mb-2">Flexible Features:</p>
              <ul className="text-green-700 space-y-1">
                <li>• Custom lunch durations per day</li>
                <li>• Multiple short breaks</li>
                <li>• Variable start/end times</li>
                <li>• Automatic total calculations</li>
              </ul>
            </div>

            <h3 className="text-2xl font-semibold text-gray-700 mb-4">
              Shift Work
            </h3>
            <p className="text-gray-600 mb-4">
              Excellent for shift workers with different break schedules:
            </p>
            <div className="bg-purple-50 rounded-lg p-4 mb-6">
              <p className="text-purple-800 font-semibold mb-2">Shift Support:</p>
              <ul className="text-purple-700 space-y-1">
                <li>• Overnight shifts</li>
                <li>• Multiple break periods</li>
                <li>• Custom break allocations</li>
                <li>• Accurate overtime calculations</li>
              </ul>
            </div>
          </div>

          {/* Tips and Best Practices */}
          <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
            <h2 className="text-3xl font-semibold text-gray-800 mb-6">
              Tips and Best Practices
            </h2>

            <h3 className="text-2xl font-semibold text-gray-700 mb-4">
              Accuracy Tips
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">✓ Do's</h4>
                <ul className="text-green-700 space-y-1 text-sm">
                  <li>• Use consistent time formats</li>
                  <li>• Include all break periods</li>
                  <li>• Review calculations daily</li>
                  <li>• Save your time cards regularly</li>
                </ul>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-2">✗ Don'ts</h4>
                <ul className="text-red-700 space-y-1 text-sm">
                  <li>• Mix time formats in same card</li>
                  <li>• Forget to add break times</li>
                  <li>• Overlook overnight shifts</li>
                  <li>• Skip verification steps</li>
                </ul>
              </div>
            </div>

            <h3 className="text-2xl font-semibold text-gray-700 mb-4">
              Time-Saving Features
            </h3>
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h4 className="font-semibold text-blue-800 mb-3">Productivity Boosters:</h4>
              <ul className="text-blue-700 space-y-2">
                <li>• <strong>Copy First Row:</strong> Quickly apply the same schedule to multiple days</li>
                <li>• <strong>Clear All:</strong> Reset the entire calculator for a new pay period</li>
                <li>• <strong>Print Report:</strong> Generate professional time card reports</li>
                <li>• <strong>Auto-calculation:</strong> Real-time updates as you type</li>
              </ul>
            </div>
          </div>

          {/* Troubleshooting */}
          <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
            <h2 className="text-3xl font-semibold text-gray-800 mb-6">
              Troubleshooting Common Issues
            </h2>

            <h3 className="text-2xl font-semibold text-gray-700 mb-4">
              Calculation Errors
            </h3>
            <div className="space-y-4 mb-6">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <h4 className="font-semibold text-yellow-800 mb-1">Issue: Negative time totals</h4>
                <p className="text-yellow-700 text-sm">
                  <strong>Solution:</strong> Ensure end time is after start time. For overnight shifts, 
                  the calculator automatically handles the date change.
                </p>
              </div>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <h4 className="font-semibold text-yellow-800 mb-1">Issue: Incorrect break calculations</h4>
                <p className="text-yellow-700 text-sm">
                  <strong>Solution:</strong> Verify break times are in correct format (HH:MM or decimal). 
                  Check that all break columns are properly configured.
                </p>
              </div>
            </div>

            <h3 className="text-2xl font-semibold text-gray-700 mb-4">
              Column Management
            </h3>
            <div className="space-y-4">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <h4 className="font-semibold text-yellow-800 mb-1">Issue: Can't add lunch column</h4>
                <p className="text-yellow-700 text-sm">
                  <strong>Solution:</strong> The lunch column may already be enabled. Check if you see 
                  a lunch column in your table. If visible, use the trash icon to remove it first.
                </p>
              </div>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <h4 className="font-semibold text-yellow-800 mb-1">Issue: Too many break columns</h4>
                <p className="text-yellow-700 text-sm">
                  <strong>Solution:</strong> The calculator supports a maximum of 3 break columns. 
                  Remove existing columns before adding new ones.
                </p>
              </div>
            </div>
          </div>

          {/* Conclusion */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-8 mb-8">
            <h2 className="text-3xl font-semibold text-gray-800 mb-4">
              Conclusion
            </h2>
            <p className="text-gray-600 mb-4">
              Our Time Card Calculator with lunch break support provides a comprehensive solution for accurate time tracking and payroll calculations. By understanding how to effectively use lunch breaks and multiple break periods, you can ensure precise time recording for any work schedule.
            </p>
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Key Takeaways:</h3>
              <ul className="text-gray-600 space-y-2">
                <li>• Lunch break columns can be added/removed as needed</li>
                <li>• Multiple break periods are supported for complex schedules</li>
                <li>• Automatic calculations ensure accuracy</li>
                <li>• Flexible time formats accommodate various preferences</li>
                <li>• Professional reports are available for payroll processing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}