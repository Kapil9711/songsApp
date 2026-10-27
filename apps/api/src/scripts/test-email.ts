import "dotenv/config";
import { transporter, emailConfig } from "../config/email.js";

async function main() {
  try {
    await transporter.verify();
    console.log("SMTP connection and authentication successful");
    const info = await transporter.sendMail({
      from: emailConfig.from,
      to: "kapil.rajput9711@gmail.com",
      subject: "Riffly SMTP Test",
      text: "Your Gmail SMTP email sender is working!",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Welcome to Riffly!</h2>
          <p>Your Gmail SMTP email sender is working.</p>
        </div>
      `,
    });

    console.log("Email sent:", info.messageId);
  } catch (error) {
    console.error("Email test failed:", error);
    process.exitCode = 1;
  } finally {
    transporter.close();
  }
}

await main();
