export type ToolSlug =
  | "time-card-calculator-with-lunch"
  | "biweekly-time-card-calculator"
  | "time-card-calculator-with-breaks"
  | "timesheet-calculator-with-lunch"
  | "time-clock-calculator-with-lunch"
  | "hours-calculator-with-lunch"
  | "lunch-break-calculator"
  | "30-minute-lunch-break-calculator"
  | "time-punch-calculator"
  | "punch-clock-calculator"
  | "military-time-card-calculator";

export type CalculatorMode = "time-card" | "hours";

export interface CalculatorPropsConfig {
  mode?: CalculatorMode;
  defaultBreakMinutes?: number;
  showLunchBreak?: boolean;
  showMultipleBreaks?: boolean;
  showBiweekly?: boolean;
  showOvertime?: boolean;
  showPrintableTimesheet?: boolean;
  timeFormat?: "auto" | "12h" | "24h" | "military";
  copyVariant?: "time-card" | "timesheet" | "time-clock" | "punch";
  labels?: {
    start: string;
    end: string;
    break: string;
    lunch: string;
    day: string;
  };
}

export interface ToolCalculatorConfig {
  slug: ToolSlug;
  title: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  subtitle: string;
  intro: string;
  howToSteps: string[];
  example: {
    title: string;
    calculation: string;
    result: string;
  };
  faqs: Array<{ question: string; answer: string }>;
  relatedSlugs: ToolSlug[];
  guideSlug?:
    | "time-card-calculator-with-lunch"
    | "time-card-calculator-with-breaks"
    | "biweekly-time-card-calculator";
  calculatorProps: CalculatorPropsConfig;
}

export const toolCalculators: ToolCalculatorConfig[] = [
  {
    slug: "time-card-calculator-with-lunch",
    title: "Time Card Calculator with Lunch Breaks",
    metaTitle: "Time Card Calculator with Lunch Breaks",
    metaDescription:
      "Calculate work hours after lunch breaks with this free time card calculator. Enter clock in/out times, lunch breaks, overtime, and weekly totals.",
    h1: "Time Card Calculator with Lunch Breaks",
    subtitle:
      "Subtract unpaid lunch breaks automatically and keep daily, weekly, and overtime totals in one view.",
    intro:
      "This time card calculator with lunch break support is built for employees and managers who need accurate paid-hour totals when lunch is unpaid.",
    howToSteps: [
      "Enter your start and end time for each workday.",
      "Keep lunch enabled and set the lunch duration for each day.",
      "Review daily totals, weekly total hours, and overtime summary.",
      "Print the timesheet if you need a payroll record."
    ],
    example: {
      title: "Lunch deduction example",
      calculation: "8:00 AM to 5:00 PM with a 30-minute lunch",
      result: "Paid time = 8.5 hours (8:30)."
    },
    faqs: [
      {
        question: "How do I calculate a time card with lunch?",
        answer:
          "Enter your in and out times, then enter lunch minutes. The calculator subtracts lunch from each shift automatically."
      },
      {
        question: "Is lunch break paid or unpaid?",
        answer:
          "Many workplaces treat lunch as unpaid. Confirm your employer policy and enter lunch accordingly."
      },
      {
        question: "Can I use a 30-minute or 1-hour lunch break?",
        answer: "Yes. You can set each day to 0:30, 1:00, or any custom value."
      },
      {
        question: "Can this calculator handle multiple lunch breaks?",
        answer:
          "Yes. Add extra break columns to track split lunch or additional unpaid breaks."
      }
    ],
    relatedSlugs: [
      "time-card-calculator-with-breaks",
      "time-clock-calculator-with-lunch",
      "timesheet-calculator-with-lunch",
      "lunch-break-calculator"
    ],
    guideSlug: "time-card-calculator-with-lunch",
    calculatorProps: {
      mode: "time-card",
      defaultBreakMinutes: 30,
      showLunchBreak: true,
      showMultipleBreaks: false,
      showBiweekly: false,
      showOvertime: true,
      showPrintableTimesheet: true,
      timeFormat: "auto",
      copyVariant: "time-card",
      labels: {
        start: "Start Time",
        end: "End Time",
        break: "Break",
        lunch: "Lunch",
        day: "Day"
      }
    }
  },
  {
    slug: "biweekly-time-card-calculator",
    title: "Biweekly Time Card Calculator",
    metaTitle: "Biweekly Time Card Calculator",
    metaDescription:
      "Calculate hours for a two-week pay period with this free biweekly time card calculator. Add lunch breaks, daily punches, weekly totals, and overtime.",
    h1: "Biweekly Time Card Calculator",
    subtitle:
      "Track Week 1 and Week 2 in a single 14-day calculator with weekly subtotals and pay-period totals.",
    intro:
      "Use this biweekly time card calculator when your payroll runs every two weeks and you need daily, weekly, and full pay-period hour totals.",
    howToSteps: [
      "Turn on biweekly mode to display 14 days (Week 1 + Week 2).",
      "Enter daily work times and lunch deductions.",
      "Review Week 1 and Week 2 totals separately.",
      "Use the pay-period total and overtime summary for payroll checks."
    ],
    example: {
      title: "Two-week pay period example",
      calculation: "Week 1 = 42:00, Week 2 = 38:00",
      result: "Pay period total = 80:00. Weekly overtime is 2:00 in Week 1 only."
    },
    faqs: [
      {
        question: "How do I calculate a biweekly time card?",
        answer:
          "Enter all 14 days, then use the weekly subtotals and final pay-period total for the complete biweekly record."
      },
      {
        question: "Is overtime calculated weekly or biweekly?",
        answer:
          "This calculator reports overtime by week (over 40 hours/week), which is the most common payroll rule."
      },
      {
        question: "Can I add lunch breaks to a biweekly timesheet?",
        answer: "Yes. Lunch can be enabled and edited per day in both weeks."
      },
      {
        question: "Can I print a two-week time card?",
        answer: "Yes. Use Print to generate a clean biweekly timesheet layout."
      }
    ],
    relatedSlugs: [
      "time-card-calculator-with-lunch",
      "timesheet-calculator-with-lunch",
      "time-card-calculator-with-breaks",
      "time-punch-calculator"
    ],
    guideSlug: "biweekly-time-card-calculator",
    calculatorProps: {
      mode: "time-card",
      defaultBreakMinutes: 30,
      showLunchBreak: true,
      showMultipleBreaks: false,
      showBiweekly: true,
      showOvertime: true,
      showPrintableTimesheet: true,
      timeFormat: "auto",
      copyVariant: "timesheet",
      labels: {
        start: "Start Time",
        end: "End Time",
        break: "Break",
        lunch: "Lunch",
        day: "Date"
      }
    }
  },
  {
    slug: "time-card-calculator-with-breaks",
    title: "Time Card Calculator with Breaks",
    metaTitle: "Time Card Calculator with Breaks",
    metaDescription:
      "Calculate work hours with multiple breaks using this free time card calculator. Add lunch, rest breaks, split shifts, daily totals, and weekly hours.",
    h1: "Time Card Calculator with Breaks",
    subtitle:
      "Track more than lunch by adding multiple break columns for morning, lunch, and afternoon deductions.",
    intro:
      "This page is for teams that need a time card calculator with breaks across different break types, not just a single lunch deduction.",
    howToSteps: [
      "Enter start and end time for each day.",
      "Use the first break column and add extra break columns if needed.",
      "Enter each break in hours:minutes format.",
      "Check total break time, daily paid hours, and weekly totals."
    ],
    example: {
      title: "Multiple break example",
      calculation: "9:00 AM to 5:30 PM, with 0:30 lunch and 0:15 rest break",
      result: "Paid time = 7.75 hours (7:45)."
    },
    faqs: [
      {
        question: "How do I subtract breaks from work hours?",
        answer:
          "Enter each break duration and the calculator subtracts the combined break total from the shift length."
      },
      {
        question: "Can I add more than one break per day?",
        answer: "Yes. Add more break columns to track multiple break periods."
      },
      {
        question: "Are breaks paid or unpaid?",
        answer:
          "That depends on your policy. Enter only unpaid breaks if you want paid-hour output."
      },
      {
        question: "What is the difference between lunch breaks and rest breaks?",
        answer:
          "Lunch is usually a longer meal period, while rest breaks are shorter; both can be tracked separately here."
      }
    ],
    relatedSlugs: [
      "time-card-calculator-with-lunch",
      "lunch-break-calculator",
      "time-punch-calculator",
      "punch-clock-calculator"
    ],
    guideSlug: "time-card-calculator-with-breaks",
    calculatorProps: {
      mode: "time-card",
      defaultBreakMinutes: 15,
      showLunchBreak: true,
      showMultipleBreaks: true,
      showBiweekly: false,
      showOvertime: true,
      showPrintableTimesheet: true,
      timeFormat: "auto",
      copyVariant: "time-card",
      labels: {
        start: "Start Time",
        end: "End Time",
        break: "Break",
        lunch: "Lunch",
        day: "Day"
      }
    }
  },
  {
    slug: "timesheet-calculator-with-lunch",
    title: "Timesheet Calculator with Lunch Breaks",
    metaTitle: "Timesheet Calculator with Lunch Breaks",
    metaDescription:
      "Create a printable timesheet with lunch breaks, daily work hours, weekly totals, and overtime using this free timesheet calculator.",
    h1: "Timesheet Calculator with Lunch Breaks",
    subtitle:
      "Build a payroll-ready weekly timesheet with lunch deductions, totals, and print support.",
    intro:
      "Use this timesheet calculator with lunch when you need a clean weekly record for payroll, review, or employee files.",
    howToSteps: [
      "Fill in daily in/out entries.",
      "Enter lunch durations for each day.",
      "Add report header details such as employee name or pay period.",
      "Print the final timesheet with totals and notes."
    ],
    example: {
      title: "Weekly timesheet example",
      calculation: "Five days at 8:00 to 5:00 with 1:00 lunch",
      result: "Each day = 8:00 paid hours, weekly total = 40:00."
    },
    faqs: [
      {
        question: "How do I make a timesheet with lunch breaks?",
        answer:
          "Enter daily time rows and lunch deductions, then use the totals section and print output as your timesheet."
      },
      {
        question: "Can I print the timesheet?",
        answer: "Yes. The page includes a printable timesheet format."
      },
      {
        question: "Can I use this for payroll records?",
        answer:
          "Yes. It is suitable for payroll prep, but always match your company overtime and break rules."
      },
      {
        question: "Does the calculator subtract lunch automatically?",
        answer: "Yes. Lunch is deducted from each row before totals are calculated."
      }
    ],
    relatedSlugs: [
      "time-card-calculator-with-lunch",
      "biweekly-time-card-calculator",
      "time-clock-calculator-with-lunch",
      "time-punch-calculator"
    ],
    calculatorProps: {
      mode: "time-card",
      defaultBreakMinutes: 30,
      showLunchBreak: true,
      showMultipleBreaks: false,
      showBiweekly: false,
      showOvertime: true,
      showPrintableTimesheet: true,
      timeFormat: "auto",
      copyVariant: "timesheet",
      labels: {
        start: "Start Time",
        end: "End Time",
        break: "Break",
        lunch: "Lunch",
        day: "Date"
      }
    }
  },
  {
    slug: "time-clock-calculator-with-lunch",
    title: "Time Clock Calculator with Lunch Breaks",
    metaTitle: "Time Clock Calculator with Lunch Breaks",
    metaDescription:
      "Enter clock in and clock out times, subtract lunch breaks, and calculate daily or weekly hours with this free time clock calculator.",
    h1: "Time Clock Calculator with Lunch Breaks",
    subtitle:
      "Use clock-in and clock-out language for fast payroll-friendly hour calculations.",
    intro:
      "This time clock calculator with lunch is designed for shift logs and time-clock style records where users track clock in and clock out entries.",
    howToSteps: [
      "Enter Clock In and Clock Out for each day.",
      "Set lunch duration for unpaid meal periods.",
      "Add extra break columns when needed.",
      "Review daily and weekly paid-hour totals."
    ],
    example: {
      title: "Clock-time example",
      calculation: "Clock In 7:30 AM, Clock Out 4:30 PM, Lunch 0:30",
      result: "Paid time = 8.5 hours (8:30)."
    },
    faqs: [
      {
        question: "How do I calculate hours from clock in and clock out times?",
        answer:
          "Enter each clock pair by day. The calculator computes worked time and subtracts break deductions."
      },
      {
        question: "How do I subtract lunch from time clock hours?",
        answer: "Use the lunch column to enter the unpaid lunch amount for each day."
      },
      {
        question: "Can I enter multiple punches in one day?",
        answer: "You can use additional break columns to approximate split periods in one row."
      },
      {
        question: "Can I use this as a payroll time clock calculator?",
        answer: "Yes. It is suited for payroll prep and weekly hour reconciliation."
      }
    ],
    relatedSlugs: [
      "time-punch-calculator",
      "punch-clock-calculator",
      "time-card-calculator-with-lunch",
      "timesheet-calculator-with-lunch"
    ],
    calculatorProps: {
      mode: "time-card",
      defaultBreakMinutes: 30,
      showLunchBreak: true,
      showMultipleBreaks: true,
      showBiweekly: false,
      showOvertime: true,
      showPrintableTimesheet: true,
      timeFormat: "auto",
      copyVariant: "time-clock",
      labels: {
        start: "Clock In",
        end: "Clock Out",
        break: "Break",
        lunch: "Lunch",
        day: "Date"
      }
    }
  },
  {
    slug: "hours-calculator-with-lunch",
    title: "Hours Calculator with Lunch Break",
    metaTitle: "Hours Calculator with Lunch Break",
    metaDescription:
      "Calculate work hours between two times and subtract lunch breaks. Get total hours in decimal and hours:minutes format.",
    h1: "Hours Calculator with Lunch Break",
    subtitle:
      "Quick one-shift calculator for start time, end time, lunch, and paid-hour output.",
    intro:
      "Use this hours calculator with lunch when you only need a simple start-to-end shift calculation instead of a full weekly time card.",
    howToSteps: [
      "Enter shift start time.",
      "Enter shift end time.",
      "Set the lunch break duration.",
      "Read the result in both decimal and HH:MM formats."
    ],
    example: {
      title: "Single-shift example",
      calculation: "8:00 AM to 5:00 PM with 0:30 lunch",
      result: "Paid time = 8.5 hours (8:30)."
    },
    faqs: [
      {
        question: "How do I calculate hours with lunch?",
        answer:
          "Subtract your lunch duration from the time difference between shift start and shift end."
      },
      {
        question: "What is 8 AM to 5 PM with a 30-minute lunch?",
        answer: "The total is 8.5 hours, which is 8:30 in hours and minutes."
      },
      {
        question: "How do I convert work hours to decimal hours?",
        answer:
          "Minutes are divided by 60, so 30 minutes becomes 0.5 and 45 minutes becomes 0.75."
      },
      {
        question: "Can I use this for one shift only?",
        answer: "Yes. This page is designed specifically for one-shift calculations."
      }
    ],
    relatedSlugs: [
      "lunch-break-calculator",
      "30-minute-lunch-break-calculator",
      "time-card-calculator-with-lunch",
      "military-time-card-calculator"
    ],
    calculatorProps: {
      mode: "hours",
      defaultBreakMinutes: 30,
      showLunchBreak: true,
      showMultipleBreaks: false,
      showBiweekly: false,
      showOvertime: false,
      showPrintableTimesheet: false,
      timeFormat: "auto",
      copyVariant: "time-card",
      labels: {
        start: "Start Time",
        end: "End Time",
        break: "Break",
        lunch: "Lunch Break",
        day: "Shift"
      }
    }
  },
  {
    slug: "lunch-break-calculator",
    title: "Lunch Break Calculator",
    metaTitle: "Lunch Break Calculator",
    metaDescription:
      "Calculate paid work hours after subtracting lunch or break time. Enter shift start, shift end, and lunch duration to get total hours.",
    h1: "Lunch Break Calculator",
    subtitle:
      "Calculate shift length, unpaid lunch deductions, and paid hours in seconds.",
    intro:
      "This lunch break calculator focuses on break deduction math so you can quickly separate total shift time from paid work time.",
    howToSteps: [
      "Enter shift start and shift end.",
      "Enter the lunch or unpaid break duration.",
      "Review total shift time, break time, and paid hours.",
      "Adjust break duration for 30, 45, or 60-minute scenarios."
    ],
    example: {
      title: "Lunch deduction examples",
      calculation: "9:00 AM to 5:00 PM with 0:30 lunch",
      result: "Shift = 8:00, break = 0:30, paid = 7:30 (7.5 hours)."
    },
    faqs: [
      {
        question: "How do I calculate lunch break time?",
        answer:
          "Find total shift time first, then subtract lunch or unpaid break minutes to get paid hours."
      },
      {
        question: "Is a lunch break subtracted from work hours?",
        answer:
          "In many payroll systems, unpaid lunch is deducted. Paid breaks typically are not deducted."
      },
      {
        question: "How many hours is 9 to 5 with a 30-minute lunch?",
        answer: "The paid total is 7.5 hours, or 7:30."
      },
      {
        question: "Can I calculate paid and unpaid breaks?",
        answer:
          "Yes. Enter only unpaid time in the break fields to calculate paid hours."
      }
    ],
    relatedSlugs: [
      "30-minute-lunch-break-calculator",
      "hours-calculator-with-lunch",
      "time-card-calculator-with-lunch",
      "time-card-calculator-with-breaks"
    ],
    calculatorProps: {
      mode: "hours",
      defaultBreakMinutes: 30,
      showLunchBreak: true,
      showMultipleBreaks: false,
      showBiweekly: false,
      showOvertime: false,
      showPrintableTimesheet: false,
      timeFormat: "auto",
      copyVariant: "time-card",
      labels: {
        start: "Shift Start",
        end: "Shift End",
        break: "Break",
        lunch: "Lunch / Unpaid Break",
        day: "Shift"
      }
    }
  },
  {
    slug: "30-minute-lunch-break-calculator",
    title: "30 Minute Lunch Break Calculator",
    metaTitle: "30 Minute Lunch Break Calculator",
    metaDescription:
      "Calculate work hours after a 30-minute lunch break. Enter your start and end times to get paid hours, daily totals, and weekly hours.",
    h1: "30 Minute Lunch Break Calculator",
    subtitle:
      "Fast calculator pre-set to a 30-minute lunch break for common payroll scenarios.",
    intro:
      "This 30 minute lunch break calculator is ideal when your schedule uses a standard 0:30 unpaid lunch and you need quick paid-hour totals.",
    howToSteps: [
      "Enter your start and end times.",
      "Keep the default lunch value at 0:30.",
      "Review paid hours in decimal and HH:MM.",
      "Change lunch to 0:45 or 1:00 only if your day differs."
    ],
    example: {
      title: "30-minute examples",
      calculation: "8:00 AM to 4:30 PM minus 0:30 lunch",
      result: "Paid time = 8:00 hours."
    },
    faqs: [
      {
        question: "How do I subtract a 30-minute lunch break?",
        answer:
          "Subtract 0:30 from your full shift length. This calculator applies that automatically."
      },
      {
        question: "What is 8 to 4:30 with a 30-minute lunch?",
        answer: "8.0 hours paid time."
      },
      {
        question: "What is 9 to 5:30 with a 30-minute lunch?",
        answer: "8.0 hours paid time."
      },
      {
        question: "Can I change the lunch break to 45 or 60 minutes?",
        answer: "Yes. You can overwrite the default 0:30 value in the lunch field."
      }
    ],
    relatedSlugs: [
      "lunch-break-calculator",
      "hours-calculator-with-lunch",
      "time-card-calculator-with-lunch",
      "time-clock-calculator-with-lunch"
    ],
    calculatorProps: {
      mode: "hours",
      defaultBreakMinutes: 30,
      showLunchBreak: true,
      showMultipleBreaks: false,
      showBiweekly: false,
      showOvertime: false,
      showPrintableTimesheet: false,
      timeFormat: "auto",
      copyVariant: "time-card",
      labels: {
        start: "Start Time",
        end: "End Time",
        break: "Break",
        lunch: "30-Minute Lunch",
        day: "Shift"
      }
    }
  },
  {
    slug: "time-punch-calculator",
    title: "Time Punch Calculator",
    metaTitle: "Time Punch Calculator",
    metaDescription:
      "Calculate work hours from punch in and punch out times. Add breaks, lunch, multiple punches, and get daily or weekly totals.",
    h1: "Time Punch Calculator",
    subtitle:
      "Track manual punch in and punch out records with break and lunch deduction support.",
    intro:
      "Use this time punch calculator to total punch-based shifts and generate clean daily or weekly numbers for payroll review.",
    howToSteps: [
      "Enter Punch In and Punch Out by day.",
      "Add lunch and break deductions.",
      "Use additional break columns for more punch segments.",
      "Review totals and print if needed."
    ],
    example: {
      title: "Punch record example",
      calculation: "Punch In 6:45 AM, Punch Out 3:30 PM, Lunch 0:30",
      result: "Paid time = 8.25 hours (8:15)."
    },
    faqs: [
      {
        question: "How do I calculate punch in and punch out times?",
        answer:
          "Subtract punch in from punch out and then subtract unpaid lunch or breaks."
      },
      {
        question: "What is a time punch calculator?",
        answer:
          "It is a work-hours calculator built around punch records rather than narrative timesheet notes."
      },
      {
        question: "Can I add lunch breaks to punch times?",
        answer: "Yes. Add lunch in the lunch field so it is deducted from paid hours."
      },
      {
        question: "Can I enter multiple punch periods?",
        answer: "Yes. Use multiple break columns to capture segmented punch periods."
      }
    ],
    relatedSlugs: [
      "punch-clock-calculator",
      "time-clock-calculator-with-lunch",
      "time-card-calculator-with-breaks",
      "timesheet-calculator-with-lunch"
    ],
    calculatorProps: {
      mode: "time-card",
      defaultBreakMinutes: 15,
      showLunchBreak: true,
      showMultipleBreaks: true,
      showBiweekly: false,
      showOvertime: true,
      showPrintableTimesheet: true,
      timeFormat: "auto",
      copyVariant: "punch",
      labels: {
        start: "Punch In",
        end: "Punch Out",
        break: "Break",
        lunch: "Lunch",
        day: "Date"
      }
    }
  },
  {
    slug: "punch-clock-calculator",
    title: "Punch Clock Calculator",
    metaTitle: "Punch Clock Calculator",
    metaDescription:
      "Use this free punch clock calculator to total punch in/out times, subtract breaks, and calculate daily or weekly work hours.",
    h1: "Punch Clock Calculator",
    subtitle:
      "Total punch card records quickly with break deductions and weekly totals.",
    intro:
      "This punch clock calculator is built for legacy punch card workflows and manual payroll checks based on punch clock records.",
    howToSteps: [
      "Enter Punch Clock In and Punch Clock Out times.",
      "Add lunch and break deductions from the punch card.",
      "Review daily totals and weekly hours.",
      "Print a clean report for payroll files."
    ],
    example: {
      title: "Punch card example",
      calculation: "Punch Clock In 7:00 AM, Punch Clock Out 4:00 PM, Breaks total 0:45",
      result: "Paid time = 8.25 hours (8:15)."
    },
    faqs: [
      {
        question: "How do I calculate punch clock hours?",
        answer:
          "Take the difference between in and out punches and subtract unpaid breaks to get paid time."
      },
      {
        question: "How do I total a punch card?",
        answer:
          "Enter each daily punch pair and break amount; the calculator sums paid hours for you."
      },
      {
        question: "Can I subtract lunch from punch clock hours?",
        answer: "Yes. Use the lunch field for unpaid meal periods."
      },
      {
        question: "What format should I enter punch times in?",
        answer:
          "You can use 12-hour format with AM/PM or 24-hour format such as 17:30."
      }
    ],
    relatedSlugs: [
      "time-punch-calculator",
      "time-clock-calculator-with-lunch",
      "time-card-calculator-with-lunch",
      "biweekly-time-card-calculator"
    ],
    calculatorProps: {
      mode: "time-card",
      defaultBreakMinutes: 15,
      showLunchBreak: true,
      showMultipleBreaks: true,
      showBiweekly: false,
      showOvertime: true,
      showPrintableTimesheet: true,
      timeFormat: "auto",
      copyVariant: "punch",
      labels: {
        start: "Punch Clock In",
        end: "Punch Clock Out",
        break: "Break",
        lunch: "Lunch",
        day: "Date"
      }
    }
  },
  {
    slug: "military-time-card-calculator",
    title: "Military Time Card Calculator",
    metaTitle: "Military Time Card Calculator",
    metaDescription:
      "Calculate work hours using military time or 24-hour time format. Enter start, end, lunch breaks, and get daily or weekly totals.",
    h1: "Military Time Card Calculator",
    subtitle:
      "Use 24-hour clock entries like 08:00 and 17:00 with automatic decimal-hour conversion.",
    intro:
      "This military time card calculator supports 24-hour time entry without AM/PM, which is useful for operations, healthcare, logistics, and shift work.",
    howToSteps: [
      "Enter start and end in 24-hour format (for example 08:00, 17:00).",
      "Add lunch and break deductions in HH:MM.",
      "Check daily totals in decimal and HH:MM.",
      "Use weekly totals and overtime summary for payroll validation."
    ],
    example: {
      title: "24-hour example",
      calculation: "08:00 to 17:00 minus 00:30 lunch",
      result: "Paid time = 8.5 hours (8:30)."
    },
    faqs: [
      {
        question: "How do I calculate time cards in military time?",
        answer:
          "Use 24-hour start and end entries and subtract breaks. No AM/PM is required."
      },
      {
        question: "What is 08:00 to 17:00 with a 30-minute lunch?",
        answer: "The result is 8.5 hours, or 8:30."
      },
      {
        question: "Can I enter 24-hour time without AM/PM?",
        answer: "Yes. This page is optimized for 24-hour military time entry."
      },
      {
        question: "Does the calculator convert military time to decimal hours?",
        answer: "Yes. Results are shown in both decimal hours and HH:MM format."
      }
    ],
    relatedSlugs: [
      "time-card-calculator-with-lunch",
      "hours-calculator-with-lunch",
      "time-clock-calculator-with-lunch",
      "biweekly-time-card-calculator"
    ],
    calculatorProps: {
      mode: "time-card",
      defaultBreakMinutes: 30,
      showLunchBreak: true,
      showMultipleBreaks: false,
      showBiweekly: false,
      showOvertime: true,
      showPrintableTimesheet: true,
      timeFormat: "24h",
      copyVariant: "time-card",
      labels: {
        start: "Start (24h)",
        end: "End (24h)",
        break: "Break",
        lunch: "Lunch",
        day: "Day"
      }
    }
  }
];

export const toolCalculatorMap: Record<ToolSlug, ToolCalculatorConfig> = toolCalculators.reduce(
  (acc, item) => {
    acc[item.slug] = item;
    return acc;
  },
  {} as Record<ToolSlug, ToolCalculatorConfig>
);

export const popularToolSlugs: ToolSlug[] = toolCalculators.map((item) => item.slug);
