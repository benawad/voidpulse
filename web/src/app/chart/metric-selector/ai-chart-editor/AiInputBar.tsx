import React, { useState } from "react";
import { Input } from "../../../ui/Input";
import { SubmitHandler, useForm } from "react-hook-form";
import { trpc } from "../../../utils/trpc";
import { MsgRole } from "@voidpulse/api";

export type LocalAiMsg = {
  text: string;
  role: MsgRole;
};

interface AiInputBarProps {
  onMsg: (msg: LocalAiMsg) => void;
}

type Inputs = {
  prevMsgs: LocalAiMsg[];
  userInputText: string;
};

export const AiInputBar: React.FC<AiInputBarProps> = ({ onMsg, prevMsgs }) => {
  const { mutateAsync } = trpc.sendMsgToAi.useMutation({
    onSuccess: (data) => {
      onMsg({
        text: data.message || "",
        role: MsgRole.ai,
      });
    },
  });
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = (data) => {
    onMsg({
      text: data.userInputText,
      role: MsgRole.user,
    });
    return mutateAsync({
      text: data.userInputText,
      prevMsgs,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-2">
      <Input
        autoFocus
        placeholder="What chart should we make?"
        {...register("userInputText", { required: true })}
      />
    </form>
  );
};
