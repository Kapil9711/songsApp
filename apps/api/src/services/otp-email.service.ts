import { sendEmail } from "./email.service.js";
import { renderRegistrationOtpEmail } from "./email-template.service.js";

export async function sendRegistrationOtpEmail(
  email: string,
  otp: string,
  name?: string,
): Promise<void> {
  const html = await renderRegistrationOtpEmail({
    name,
    otp,
    expiresInMinutes: 5,
    year: new Date().getFullYear(),
  });

  await sendEmail({
    to: email,
    subject: "Verify your email address | Riffly",
    text: [
      `Hello${name ? ` ${name}` : ""},`,
      "",
      "Welcome to Riffly!",
      `Your email verification code is: ${otp}`,
      "This code expires in 5 minutes.",
      "If you didn't create a Riffly account, you can ignore this email.",
    ].join("\n"),
    html,
  });
}
