import ejs from "ejs";
import { fileURLToPath } from "node:url";

const registrationOtpTemplatePath = fileURLToPath(
  new URL("../templates/emails/registration-otp.ejs", import.meta.url),
);

export interface RegistrationOtpTemplateData {
  name?: string;
  otp: string;
  expiresInMinutes: number;
  year: number;
}

export async function renderRegistrationOtpEmail(
  data: RegistrationOtpTemplateData,
): Promise<string> {
  return ejs.renderFile(registrationOtpTemplatePath, {
    name: data.name ?? "",
    otp: data.otp,
    expiresInMinutes: data.expiresInMinutes,
    year: data.year,
  });
}
