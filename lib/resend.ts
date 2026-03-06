import { Resend } from "resend";

function getClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new Resend(apiKey);
}

export function hasResendConfig() {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL);
}

export async function sendMorningReminder(input: { to: string; origin: string }) {
  const client = getClient();
  const from = process.env.RESEND_FROM_EMAIL;
  if (!client || !from) {
    return { skipped: true };
  }

  await client.emails.send({
    from,
    to: [input.to],
    subject: "scaveng.io is on today",
    text: `A new scaveng.io hunt will drop later today. Keep your phone ready: ${input.origin}`
  });

  return { skipped: false };
}