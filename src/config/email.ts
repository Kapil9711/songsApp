import { Resend } from "resend";

const { RESEND_API_KEY, SMTP_FROM_NAME } = process.env;

if (!RESEND_API_KEY) {
  throw new Error("Missing RESEND_API_KEY environment variable");
}

export const resend = new Resend(RESEND_API_KEY);

export const emailConfig = {
  from: `${process.env.SMTP_FROM_NAME || "Riffly"} <noreply@kapil.store>`,
};
