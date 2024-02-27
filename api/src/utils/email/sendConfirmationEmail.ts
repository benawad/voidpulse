import { v4 } from "uuid";
import { redis } from "../../redis";
import {
  defaultCompanyInfo,
  postmark,
  transactionalStream,
} from "../../postmark";

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
  // 3 days to confirm email
  await redis.setex(
    confirmationEmailCodePrefix + code,
    60 * 60 * 24 * 3,
    userId
  );

  await postmark.sendEmailWithTemplate({
    From: process.env.FROM_EMAIL,
    To: email,
    TemplateId: 35035760,
    TemplateModel: {
      ...defaultCompanyInfo,
      action_url: `${process.env.FRONTEND_URL}/confirm-email/${code}`,
    },
    MessageStream: transactionalStream,
  });
};
