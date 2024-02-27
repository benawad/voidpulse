import { v4 } from "uuid";
import { redis } from "../../redis";
import {
  defaultCompanyInfo,
  postmark,
  transactionalStream,
} from "../../postmark";

const projectInviteCodePrefix = "pinv:";

export const checkProjectInviteCode = (code: string) => {
  return redis.get(projectInviteCodePrefix + code).then((x) => {
    if (!x) {
      return null;
    }

    redis.del(projectInviteCodePrefix + code);

    return JSON.parse(x) as { projectId: string; email: string };
  });
};

export const sendProjectInviteEmail = async ({
  inviteSenderEmail,
  toEmail,
  projectName,
  projectId,
}: {
  inviteSenderEmail: string;
  toEmail: string;
  projectName: string;
  projectId: string;
}) => {
  const code = v4();
  // 1 week to accept invite
  await redis.setex(
    projectInviteCodePrefix + code,
    60 * 60 * 24 * 7,
    JSON.stringify({ projectId, email: toEmail })
  );

  await postmark.sendEmailWithTemplate({
    From: process.env.FROM_EMAIL,
    To: toEmail,
    TemplateId: 35047281,
    TemplateModel: {
      ...defaultCompanyInfo,
      sender_email: inviteSenderEmail,
      project_name: projectName,
      action_url: `${process.env.FRONTEND_URL}/accept-invite/${code}`,
    },
    MessageStream: transactionalStream,
  });
};
