import nodemailer from "nodemailer";

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASSWORD,
  SMTP_FROM_NAME,
  SMTP_FROM_EMAIL,
} = process.env;

if (
  !SMTP_HOST ||
  !SMTP_PORT ||
  !SMTP_USER ||
  !SMTP_PASSWORD ||
  !SMTP_FROM_NAME ||
  !SMTP_FROM_EMAIL
) {
  throw new Error("Missing required SMTP environment variables");
}

export const emailConfig = {
  from: `"${SMTP_FROM_NAME}" <${SMTP_FROM_EMAIL}>`,
};

export const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  secure: Number(SMTP_PORT) === 465,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
});
