import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getCloudflareContext } from "@opennextjs/cloudflare";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(request: NextRequest) {
  try {
    const runtime =
      process.env.NODE_ENV === "production"
        ? (getCloudflareContext().env as unknown as Record<
            string,
            string | undefined
          >)
        : process.env;
    
    const apiKey = runtime.RESEND_API_KEY;

    if (!apiKey) {
      console.error("Missing RESEND_API_KEY");

      return NextResponse.json(
        { error: "Email service is not configured" },
        { status: 500 },
      );
    }

    const resend = new Resend(apiKey);

    const { email, subject, message } = await request.json();

    if (!email || !message) {
      return NextResponse.json(
        { error: "Email and message are required" },
        { status: 400 },
      );
    }

    const emailSubject =
      subject || "Contact Form Submission from Time Card Calculator";

    const fromEmail =
      runtime.FROM_EMAIL || "onboarding@resend.dev";

    const toEmail =
      runtime.TO_EMAIL || "info@time-card-calculator.work";

    const safeEmail = escapeHtml(String(email));
    const safeSubject = escapeHtml(String(emailSubject));
    const safeMessage = escapeHtml(String(message));

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject: emailSubject,
      replyTo: email,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>

          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>From:</strong> ${safeEmail}</p>
            <p style="margin: 5px 0;"><strong>Subject:</strong> ${safeSubject}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          </div>

          <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">Message:</h3>
            <p style="white-space: pre-wrap; line-height: 1.6; color: #4b5563;">${safeMessage}</p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              Sent from Time Card Calculator
            </p>
          </div>
        </div>
      `,
      text: `
New contact form submission:

From: ${email}
Subject: ${emailSubject}
Date: ${new Date().toLocaleString()}

Message:
${message}

---
Sent from Time Card Calculator
      `.trim(),
    });

    if (error) {
      console.error("Resend API error:", error);

      return NextResponse.json(
        {
          error: "Failed to send email",
          details: error.message,
        },
        { status: 500 },
      );
    }

    console.log("Email sent successfully:", data);

    return NextResponse.json({
      message: "Email sent successfully",
      data,
    });
  } catch (error) {
    console.error("Error sending email:", error);

    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 },
    );
  }
}