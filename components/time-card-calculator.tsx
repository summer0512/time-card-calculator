"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Trash2, Copy, RotateCcw, CreditCard, Calculator, Printer, Plus, Minus, Eraser } from "lucide-react";

interface DayEntry {
  date: string;
  from: string;
  to: string;
  breakDeduction: string;
  lunch?: string;
  breaks: string[];
  total: number; // in minutes
}

export default function TimeCardCalculator() {
  const [showLunchColumn, setShowLunchColumn] = useState(false);
  const [breakColumns, setBreakColumns] = useState(1); // Start with 1 break column
  const [isBiweekly, setIsBiweekly] = useState(false);
  
  const [days, setDays] = useState<DayEntry[]>([
    { date: "Monday", from: "8:30AM", to: "5:00PM", breakDeduction: "0:30", breaks: [""], total: 0 },
    { date: "Tuesday", from: "", to: "", breakDeduction: "", breaks: [""], total: 0 },
    { date: "Wednesday", from: "", to: "", breakDeduction: "", breaks: [""], total: 0 },
    { date: "Thursday", from: "", to: "", breakDeduction: "", breaks: [""], total: 0 },
    { date: "Friday", from: "", to: "", breakDeduction: "", breaks: [""], total: 0 },
    { date: "Saturday", from: "", to: "", breakDeduction: "", breaks: [""], total: 0 },
    { date: "Sunday", from: "", to: "", breakDeduction: "", breaks: [""], total: 0 },
  ]);

  // Generate biweekly days data
  const generateBiweeklyDays = (): DayEntry[] => {
    const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const days: DayEntry[] = [];
    
    for (let week = 1; week <= 2; week++) {
      weekDays.forEach(day => {
        days.push({
          date: `Week ${week} - ${day}`,
          from: week === 1 && day === "Monday" ? "8:30AM" : "",
          to: week === 1 && day === "Monday" ? "5:00PM" : "",
          breakDeduction: week === 1 && day === "Monday" ? "0:30" : "",
          breaks: [""],
          total: 0
        });
      });
    }
    
    return days;
  };

  // Update days when biweekly setting changes
  useEffect(() => {
    if (isBiweekly) {
      setDays(generateBiweeklyDays());
    } else {
      setDays([
        { date: "Monday", from: "8:30AM", to: "5:00PM", breakDeduction: "0:30", breaks: [""], total: 0 },
        { date: "Tuesday", from: "", to: "", breakDeduction: "", breaks: [""], total: 0 },
        { date: "Wednesday", from: "", to: "", breakDeduction: "", breaks: [""], total: 0 },
        { date: "Thursday", from: "", to: "", breakDeduction: "", breaks: [""], total: 0 },
        { date: "Friday", from: "", to: "", breakDeduction: "", breaks: [""], total: 0 },
        { date: "Saturday", from: "", to: "", breakDeduction: "", breaks: [""], total: 0 },
        { date: "Sunday", from: "", to: "", breakDeduction: "", breaks: [""], total: 0 },
      ]);
    }
  }, [isBiweekly]);

  const [roundTime, setRoundTime] = useState("No Round");
  const [reportHeader, setReportHeader] = useState("");
  const [reportNotes, setReportNotes] = useState("");
  const [includePayment, setIncludePayment] = useState(true);
  const [basePay, setBasePay] = useState("35");
  // const [overtimeRate, setOvertimeRate] = useState("1.5");
  // const [overtimeAfter, setOvertimeAfter] = useState("40");
  const [currency, setCurrency] = useState("$");
  const [showBlankDays, setShowBlankDays] = useState(true);
  const [saveValues, setSaveValues] = useState(false);
  const [totalHours, setTotalHours] = useState(0);
  const [totalPay, setTotalPay] = useState(0);

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Parse time string to minutes
  const parseTimeToMinutes = (timeStr: string): number => {
    if (!timeStr.trim()) return 0;
    
    const cleanTime = timeStr.trim().toLowerCase();
    
    // Handle AM/PM format
    let hours = 0;
    let minutes = 0;
    let isPM = false;
    
    if (cleanTime.includes('am') || cleanTime.includes('pm')) {
      isPM = cleanTime.includes('pm');
      const timeOnly = cleanTime.replace(/[ap]m/g, '').trim();
      
      if (timeOnly.includes(':')) {
        const [h, m] = timeOnly.split(':');
        hours = parseInt(h) || 0;
        minutes = parseInt(m) || 0;
      } else if (timeOnly.includes('.')) {
        const [h, m] = timeOnly.split('.');
        hours = parseInt(h) || 0;
        minutes = parseInt(m) || 0;
      } else {
        hours = parseInt(timeOnly) || 0;
      }
      
      if (isPM && hours !== 12) hours += 12;
      if (!isPM && hours === 12) hours = 0;
    } else {
      // Handle 24-hour format or decimal format
      if (cleanTime.includes(':')) {
        const [h, m] = cleanTime.split(':');
        hours = parseInt(h) || 0;
        minutes = parseInt(m) || 0;
      } else if (cleanTime.includes('.')) {
        const [h, m] = cleanTime.split('.');
        hours = parseInt(h) || 0;
        minutes = parseInt(m) || 0;
      } else {
        hours = parseInt(cleanTime) || 0;
      }
    }
    
    return hours * 60 + minutes;
  };

  // Convert minutes to hours format
  const minutesToHours = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}`;
  };

  // Calculate total hours for a day
  const calculateDayTotal = (from: string, to: string, breakDeduction: string, lunch?: string, breaks: string[] = []): number => {
    const fromMinutes = parseTimeToMinutes(from);
    const toMinutes = parseTimeToMinutes(to);
    const breakMinutes = breakColumns > 0 ? parseTimeToMinutes(breakDeduction) : 0;
    const lunchMinutes = lunch ? parseTimeToMinutes(lunch) : 0;
    const additionalBreakMinutes = breaks.reduce((sum, breakTime) => sum + parseTimeToMinutes(breakTime), 0);
    
    if (fromMinutes === 0 || toMinutes === 0) return 0;
    
    let totalMinutes = toMinutes - fromMinutes;
    if (totalMinutes < 0) totalMinutes += 24 * 60; // Handle overnight shifts
    
    const totalDeductions = breakMinutes + lunchMinutes + additionalBreakMinutes;
    return Math.max(0, totalMinutes - totalDeductions);
  };

  // Update calculations whenever data changes
  useEffect(() => {
    const updatedDays = days.map(day => ({
      ...day,
      total: calculateDayTotal(day.from, day.to, day.breakDeduction, day.lunch, day.breaks)
    }));
    
    const totalMinutes = updatedDays.reduce((sum, day) => sum + day.total, 0);
    const totalHoursDecimal = totalMinutes / 60;
    
    setDays(updatedDays);
    setTotalHours(totalHoursDecimal);
    
    // Calculate pay
    const basePayRate = parseFloat(basePay) || 0;
    // const overtimeThreshold = parseFloat(overtimeAfter) || 40;
    // const overtimeMultiplier = parseFloat(overtimeRate) || 1.5;
    
    // let regularHours = Math.min(totalHoursDecimal, overtimeThreshold);
    // let overtimeHours = Math.max(0, totalHoursDecimal - overtimeThreshold);
    
    const regularPay = totalHoursDecimal * basePayRate;
    // const overtimePay = overtimeHours * basePayRate * overtimeMultiplier;
    
    setTotalPay(regularPay);
  }, [days.map(d => `${d.from}-${d.to}-${d.breakDeduction}-${d.lunch}-${d.breaks.join('|')}`).join('|'), basePay, showLunchColumn, breakColumns]);

  const updateDay = (index: number, field: keyof DayEntry, value: string) => {
    const newDays = [...days];
    newDays[index][field] = value as never;
    setDays(newDays);
  };

  const updateDayLunch = (index: number, value: string) => {
    const newDays = [...days];
    newDays[index].lunch = value;
    setDays(newDays);
  };

  const updateDayBreak = (dayIndex: number, breakIndex: number, value: string) => {
    const newDays = [...days];
    newDays[dayIndex].breaks[breakIndex] = value;
    setDays(newDays);
  };

  const removeDayData = (index: number) => {
    updateDay(index, "from", "");
    updateDay(index, "to", "");
    updateDay(index, "breakDeduction", "");
  };

  const copyFirstRowDown = () => {
    const firstRow = days[0];
    const newDays = days.map((day, index) => 
      index === 0 ? day : { ...day, from: firstRow.from, to: firstRow.to, breakDeduction: firstRow.breakDeduction }
    );
    setDays(newDays);
  };

  const clearAll = () => {
    setDays(days.map(day => ({ ...day, from: "", to: "", breakDeduction: "", total: 0 })));
    setReportHeader("");
    setReportNotes("");
  };

  // Column management functions
  const addLunchColumn = () => {
    setShowLunchColumn(true);
    // Set default lunch value to 1:00 for all days
    setDays(days.map(day => ({ ...day, lunch: "1:00" })));
  };

  const removeLunchColumn = () => {
    setShowLunchColumn(false);
    // Remove lunch data from all days
    setDays(days.map(day => ({ ...day, lunch: undefined })));
  };

  const addBreakColumn = () => {
    if (breakColumns < 3) {
      setBreakColumns(breakColumns + 1);
      // Add break with default value 0:30 for all days
      setDays(days.map(day => ({ ...day, breaks: [...day.breaks, "0:30"] })));
    }
  };

  const removeBreakColumn = (index: number) => {
    setBreakColumns(breakColumns - 1);
    // Remove break data from all days
    setDays(days.map(day => ({
      ...day,
      breaks: day.breaks.filter((_, i) => i !== index)
    })));
  };

  const calculateHours = () => {
    // Force recalculation (already happens automatically)
    alert(`Total Hours: ${totalHours.toFixed(2)}\nTotal Pay: ${currency}${totalPay.toFixed(2)}`);
  };

  const printReport = () => {
    if (!isClient) return;
    
    // Calculate total columns (excluding Action column)
    const totalColumns = 4 + (showLunchColumn ? 1 : 0) + breakColumns;
    
    // Create print HTML
    const printHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Time Card Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            line-height: 1.4;
          }
          .print-header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
          }
          .print-title {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
          }
          .print-subtitle {
            font-size: 14px;
            color: #666;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #333;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f5f5f5;
            font-weight: bold;
          }
          .total-row {
            background-color: #f9f9f9;
            font-weight: bold;
          }
          .total-cell {
            text-align: center;
            font-size: 16px;
            color: #2e7d32;
          }
          .payment-info {
            text-align: right;
            font-size: 16px;
            color: #2e7d32;
            font-weight: bold;
          }
          .notes-section {
            margin-top: 20px;
            padding: 15px;
            border: 1px solid #ccc;
            background-color: #f9f9f9;
          }
          .notes-title {
            font-weight: bold;
            margin-bottom: 10px;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="print-header">
          <div class="print-title">Time Card Report</div>
          <div class="print-subtitle">Generated on ${isClient ? new Date().toLocaleDateString() : ''}</div>
          ${reportHeader ? `<div class="report-header">${reportHeader}</div>` : ''}
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>From</th>
              <th>To</th>
              ${breakColumns > 0 ? '<th>Break</th>' : ''}
              ${showLunchColumn ? '<th>Lunch</th>' : ''}
              ${Array.from({ length: breakColumns - 1 }, (_, i) => `<th>Break ${i + 2}</th>`).join('')}
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${days.map(day => `
              <tr>
                <td>${day.date}</td>
                <td>${day.from || '-'}</td>
                <td>${day.to || '-'}</td>
                ${breakColumns > 0 ? `<td>${day.breakDeduction || '-'}</td>` : ''}
                ${showLunchColumn ? `<td>${day.lunch || '-'}</td>` : ''}
                ${Array.from({ length: breakColumns - 1 }, (_, i) => `<td>${day.breaks[i + 1] || '-'}</td>`).join('')}
                <td class="total-cell">${day.total > 0 ? minutesToHours(day.total) : '-'}</td>
              </tr>
            `).join('')}
            
            <tr class="total-row">
              <td colspan="${totalColumns - 1}" style="text-align: right;"><strong>Total:</strong></td>
              <td class="total-cell">${totalHours > 0 ? totalHours.toFixed(2) + 'h' : '-'}</td>
            </tr>
          </tbody>
        </table>
        
        ${includePayment ? `
          <div class="payment-info">
            Total Pay: ${currency}${totalPay.toFixed(2)}
          </div>
        ` : ''}
        
        ${reportNotes ? `
          <div class="notes-section">
            <div class="notes-title">Notes:</div>
            <div>${reportNotes.replace(/\n/g, '<br>')}</div>
          </div>
        ` : ''}
      </body>
      </html>
    `;
    
    // Create a hidden iframe for printing
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'absolute';
    printFrame.style.left = '-9999px';
    printFrame.style.top = '-9999px';
    printFrame.style.width = '0px';
    printFrame.style.height = '0px';
    document.body.appendChild(printFrame);
    
    const printDocument = printFrame.contentDocument || printFrame.contentWindow?.document;
    if (printDocument) {
      printDocument.open();
      printDocument.write(printHTML);
      printDocument.close();
      
      // Wait for content to load, then print
      printFrame.onload = () => {
        printFrame.contentWindow?.print();
        
        // Remove the iframe after printing
        setTimeout(() => {
          document.body.removeChild(printFrame);
        }, 1000);
      };
    }
  };

  return (
    <div className="w-full mx-auto py-2 xl:py-8">
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 rounded-t-lg sm:py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="hidden sm:block">
              <h1 className="text-xl text-gray-800 font-bold">
                Time Card Calculator
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Calculate work hours and earnings
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {/* <Button
                onClick={calculateHours}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                <Calculator className="h-4 w-4 mr-1" />
                Calculate
              </Button> */}
              
              <Button
                variant="outline"
                onClick={clearAll}
                size="sm"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Clear All
              </Button>
              
              <Button
                variant="outline"
                onClick={printReport}
                size="sm"
              >
                <Printer className="h-4 w-4 mr-1" />
                Print
              </Button>
              
              <Button
                variant="outline"
                onClick={copyFirstRowDown}
                size="sm"
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy First Row
              </Button>

              <Button
                variant="outline"
                onClick={addLunchColumn}
                size="sm"
                disabled={showLunchColumn}
              >
                <Plus className="h-4 w-4 mr-1" />
                With Lunch
              </Button>

              <Button
                variant="outline"
                onClick={addBreakColumn}
                size="sm"
                disabled={breakColumns >= 3}
              >
                <Plus className="h-4 w-4 mr-1" />
                With Break
              </Button>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <CreditCard className="h-4 w-4 mr-1" />
                    Payment ({currency}{basePay}/day)
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-4">

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includePayment"
                        checked={includePayment}
                        onCheckedChange={setIncludePayment}
                      />
                      <Label htmlFor="includePayment" className="text-blue-600 font-semibold">Include payment information</Label>
                    </div>

                    <div>
                      <Label htmlFor="basePay">Base Pay Rate:</Label>
                      <div className="flex items-center mt-1">
                        <Input
                          id="currency"
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                          className="w-12 h-8 text-center rounded-r-none placeholder:text-gray-300"
                          placeholder="$"
                        />
                        <Input
                          id="basePay"
                          value={basePay}
                          onChange={(e) => setBasePay(e.target.value)}
                          className="rounded-l-none h-8 placeholder:text-gray-300"
                        />
                      </div>
                    </div>

                    {/* <div>
                      <Label htmlFor="overtimeAfter">Overtime after:</Label>
                      <div className="flex items-center mt-1">
                        <Input
                          id="overtimeAfter"
                          value={overtimeAfter}
                          onChange={(e) => setOvertimeAfter(e.target.value)}
                          className="w-20 h-8"
                        />
                        <span className="ml-2 text-sm">hours per week</span>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="overtimeRate">Overtime Rate:</Label>
                      <div className="flex items-center mt-1">
                        <Input
                          id="overtimeRate"
                          value={overtimeRate}
                          onChange={(e) => setOvertimeRate(e.target.value)}
                          className="w-20 h-8"
                        />
                        <span className="ml-2 text-sm">times base rate</span>
                      </div>
                    </div> */}

                  </div>
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    Settings
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="biweekly"
                        checked={isBiweekly}
                        onCheckedChange={setIsBiweekly}
                      />
                      <Label htmlFor="biweekly" className="text-blue-600 font-semibold">Biweekly</Label>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-2">
          {/* Time Entry Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-green-100 to-blue-100">
                  <th className="border border-gray-300 p-1 text-left font-semibold min-w-[120px]">Date</th>
                  <th className="border border-gray-300 p-1 text-left font-semibold min-w-[90px]">From</th>
                  <th className="border border-gray-300 p-1 text-left font-semibold min-w-[90px]">To</th>
                  {breakColumns > 0 && (
                    <th className="border border-gray-300 p-1 text-left font-semibold min-w-[90px]">
                      <div className="flex items-center gap-1">
                        <span>Break</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeBreakColumn(0)}
                          className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                          title="Remove column"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </th>
                  )}
                  {showLunchColumn && (
                    <th className="border border-gray-300 p-1 text-left font-semibold min-w-[90px]">
                      <div className="flex items-center gap-1">
                        <span>Lunch</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={removeLunchColumn}
                          className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                          title="Remove column"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </th>
                  )}
                  {Array.from({ length: breakColumns - 1 }, (_, i) => (
                    <th key={`break-${i + 1}`} className="border border-gray-300 p-1 text-left font-semibold">
                      <div className="flex items-center gap-1">
                        <span>Break {i + 2}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeBreakColumn(i + 1)}
                          className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                          title="Remove column"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </th>
                  ))}
                  <th className="border border-gray-300 p-1 text-center font-semibold">Total</th>
                  <th className="border border-gray-300 p-1 text-center font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {days.map((day, index) => (
                  <tr key={day.date} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-1">
                      <Input
                        value={day.date}
                        onChange={(e) => updateDay(index, "date", e.target.value)}
                        className="w-full h-9"
                      />
                    </td>
                    <td className="border border-gray-300 p-1">
                      <Input
                        value={day.from}
                        onChange={(e) => updateDay(index, "from", e.target.value)}
                        placeholder="8:30AM"
                        className="w-full h-9 placeholder:text-gray-300"
                      />
                    </td>
                    <td className="border border-gray-300 p-1">
                      <Input
                        value={day.to}
                        onChange={(e) => updateDay(index, "to", e.target.value)}
                        placeholder="5:00PM"
                        className="w-full h-9 placeholder:text-gray-300"
                      />
                    </td>
                    {breakColumns > 0 && (
                      <td className="border border-gray-300 p-1">
                        <Input
                          value={day.breakDeduction}
                          onChange={(e) => updateDay(index, "breakDeduction", e.target.value)}
                          placeholder="0:30"
                          className="w-full h-9 placeholder:text-gray-300"
                        />
                      </td>
                    )}
                    {showLunchColumn && (
                      <td className="border border-gray-300 p-1">
                        <Input
                          value={day.lunch || ""}
                          onChange={(e) => updateDayLunch(index, e.target.value)}
                          placeholder="1:00"
                          className="w-full h-9 placeholder:text-gray-300"
                        />
                      </td>
                    )}
                    {Array.from({ length: breakColumns - 1 }, (_, i) => (
                      <td key={`break-${index}-${i + 1}`} className="border border-gray-300 p-2">
                        <Input
                          value={day.breaks[i + 1] || ""}
                          onChange={(e) => updateDayBreak(index, i + 1, e.target.value)}
                          placeholder="0:15"
                          className="w-full h-9 placeholder:text-gray-300"
                        />
                      </td>
                    ))}
                    <td className="border border-gray-300 text-center font-mono">
                      <span className="text-blue-600 font-semibold">
                        {day.total > 0 ? minutesToHours(day.total) : '-'}
                      </span>
                    </td>
                    <td className="border border-gray-300 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDayData(index)}
                        className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                        title="Clear row"
                      >
                        <Eraser className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                
                {/* Total Row */}
                <tr className="bg-gradient-to-r from-blue-100 to-green-100 font-semibold">
                  <td className="border border-gray-300 p-2 text-right" colSpan={4 + (showLunchColumn ? 1 : 0) + (breakColumns - 1)}>
                    <strong>Total:</strong>
                  </td>
                  <td className="border border-gray-300 p-2 text-center font-mono">
                    <span className="text-green-600 font-bold text-lg">
                      {totalHours > 0 ? totalHours.toFixed(2) + 'h' : '-'}
                    </span>
                  </td>
                  <td className="border border-gray-300 p-2 text-center">
                    {includePayment && (
                      <span className="text-green-600 font-bold">
                        {currency}{totalPay.toFixed(2)}
                      </span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
        </CardContent>
      </Card>
    </div>
  );
}