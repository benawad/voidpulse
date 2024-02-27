import { ServerClient } from "postmark";

export const postmark = new ServerClient(process.env.POSTMARK_API_KEY);
export const transactionalStream = "confirm-email";
export const defaultCompanyInfo = {
  product_url: "https://voidpulse.ai",
  product_name: "Voidpulse",
  company_name: "Voidpulse",
  company_address: "",
};
