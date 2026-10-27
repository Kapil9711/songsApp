import { transporter, emailConfig } from "../config/email.js";

interface SendEmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: SendEmailOptions): Promise<void> {
  if (!text && !html) {
    throw new Error("Email must contain text or HTML content");
  }

  const info = await transporter.sendMail({
    from: emailConfig.from,
    to,
    subject,
    text,
    html,
  });

  console.info("Email sent successfully", {
    messageId: info.messageId,
    recipient: to,
  });
}
