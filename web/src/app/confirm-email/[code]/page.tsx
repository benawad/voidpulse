"use client";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { FullScreenLoading } from "../../ui/FullScreenLoading";
import { trpc } from "../../utils/trpc";

export const ConfirmEmail: React.FC = ({}) => {
  const router = useRouter();
  const { code } = useParams<{ code: string }>();
  const { mutateAsync, error } = trpc.confirmEmail.useMutation();
  const utils = trpc.useUtils();
  useEffect(() => {
    mutateAsync({
      code,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }).then((data) => {
      utils.getMe.setData(undefined, data);
      utils.getBoards.setData(
        { projectId: data.projects[0].id },
        { boards: data.boards }
      );
      router.push(`/p/${data.projects[0].id}`);
    });
  }, []);

  if (error) {
    return <div>{error.message}</div>;
  }

  return <FullScreenLoading />;
};

export default trpc.withTRPC(ConfirmEmail);
export const runtime = "edge";
