import { NextResponse } from "next/server";

import { repository } from "@/lib/repository";
import { sendMorningReminder } from "@/lib/resend";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return true;
  }

  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${secret}`;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const recipients = await repository.listReminderRecipients();
  const origin = process.env.APP_BASE_URL ?? new URL(request.url).origin;
  let sent = 0;
  let skipped = 0;

  for (const recipient of recipients) {
    const result = await sendMorningReminder({ to: recipient.email, origin });
    if (result.skipped) {
      skipped += 1;
    } else {
      sent += 1;
    }
  }

  return NextResponse.json({ recipients: recipients.length, sent, skipped });
}