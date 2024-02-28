"use client";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { FullScreenLoading } from "../../ui/FullScreenLoading";
import { trpc } from "../../utils/trpc";

export const AcceptInvite: React.FC = ({}) => {
  const router = useRouter();
  const { code } = useParams<{ code: string }>();
  const { mutateAsync, error } = trpc.acceptProjectInvite.useMutation();
  const utils = trpc.useUtils();
  useEffect(() => {
    mutateAsync({
      code,
    }).then((data) => {
      utils.getMe.setData(undefined, {
        user: data.user,
        projects: data.projects,
      });
      utils.getBoards.setData(
        { projectId: data.projects[0].id },
        { boards: [data.board] }
      );
      router.push(`/p/${data.projects[0].id}`);
    });
  }, []);

  if (error) {
    return <div>{error.message}</div>;
  }

  return <FullScreenLoading />;
};

export default trpc.withTRPC(AcceptInvite);
export const runtime = "edge";
