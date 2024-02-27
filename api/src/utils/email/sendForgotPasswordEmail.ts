import { v4 } from "uuid";
import { redis } from "../../redis";
import {
  defaultCompanyInfo,
  postmark,
  transactionalStream,
} from "../../postmark";

const forgotPasswordCodePrefix = "ce:";

export const checkForgotPasswordCode = (code: string) => {
  return redis.get(forgotPasswordCodePrefix + code).then((userId) => {
    if (userId) {
      redis.del(forgotPasswordCodePrefix + code);
    }
    return userId;
  });
};

export const createSetPasswordCode = async (userId: string) => {
  const code = v4();
  // 3 hours to forget password
  await redis.setex(forgotPasswordCodePrefix + code, 60 * 60 * 3, userId);

  return code;
};

export const sendForgotPasswordEmail = async (
  email: string,
  userId: string
) => {
  const code = await createSetPasswordCode(userId);

  await postmark.sendEmailWithTemplate({
    From: process.env.FROM_EMAIL,
    To: email,
    TemplateId: 35048360,
    TemplateModel: {
      ...defaultCompanyInfo,
      action_url: `${process.env.FRONTEND_URL}/set-password/${code}`,
    },
    MessageStream: transactionalStream,
  });
};
