import { ServerClient } from "postmark";
import { v4 } from "uuid";
import { redis } from "../../redis";

// Send an email:
const client = new ServerClient(process.env.POSTMARK_API_KEY);

const confirmationEmailCodePrefix = "ce:";

export const checkConfirmationCode = (code: string) => {
  return redis.get(confirmationEmailCodePrefix + code).then((userId) => {
    if (userId) {
      redis.del(confirmationEmailCodePrefix + code);
    }
    return userId;
  });
};

export const sendConfirmationEmail = async (email: string, userId: string) => {
  const code = v4();
  await redis.setex(
    confirmationEmailCodePrefix + code,
    60 * 60 * 24 * 3,
    userId
  );

  await client.sendEmailWithTemplate({
    From: process.env.FROM_EMAIL,
    To: email,
    TemplateId: 35035760,
    TemplateModel: {
      product_url: "https://voidpulse.ai",
      product_name: "Voidpulse",
      action_url: `${process.env.FRONTEND_URL}/confirm-email/${code}`,
      company_name: "Voidpulse",
      company_address: "",
    },
    MessageStream: "confirm-email",
  });
};
