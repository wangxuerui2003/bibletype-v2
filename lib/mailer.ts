import nodemailer from "nodemailer";
import { loadLocalEnv } from "./load-local-env";

loadLocalEnv();

export function getMailer() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "localhost",
    port: Number(process.env.SMTP_PORT ?? 1025),
    secure: false,
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          }
        : undefined,
  });
}

export async function sendMail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  const transporter = getMailer();

  await transporter.sendMail({
    from: process.env.MAIL_FROM ?? "BibleType <no-reply@bibletype.local>",
    to,
    subject,
    text,
    html,
  });
}
