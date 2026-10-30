import { resend, emailConfig } from "../config/email.js";

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

  const emailBase = {
    from: emailConfig.from,
    to: [to],
    subject,
  };

  const result = html
    ? await resend.emails.send({
        ...emailBase,
        html,
        ...(text ? { text } : {}),
      })
    : await resend.emails.send({
        ...emailBase,
        text: text!,
      });

  if (result.error) {
    console.error("Resend email failed:", result.error);

    throw new Error(`Failed to send email: ${result.error.message}`);
  }

  console.info("Email sent successfully", {
    messageId: result.data?.id,
    recipient: to,
  });
}
