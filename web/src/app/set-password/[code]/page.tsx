"use client";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Button } from "../../ui/Button";
import { ErrorMessage } from "../../ui/ErrorMessage";
import { Input } from "../../ui/Input";
import { trpc } from "../../utils/trpc";

type Inputs = {
  password: string;
};

type InputKey = keyof Inputs;

const Page: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const utils = trpc.useUtils();
  const onSubmit: SubmitHandler<Inputs> = (data) => {
    mutateAsync({
      code,
      password: data.password,
    });
  };
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Inputs>();
  const { mutateAsync } = trpc.setPassword.useMutation({
    onSuccess: (data) => {
      if ("user" in data) {
        utils.getMe.setData(undefined, data);
        router.push(`/p/${data.projects[0].id}`);
      }
    },
    onError: (err) => {
      let keys: InputKey[] = ["password"];

      let key = err.data?.path;

      if (typeof key === "undefined") {
        setError("root", { type: "custom", message: err.message });
      } else {
        if ((keys as string[]).includes(key)) {
          setError(key as InputKey, { type: "custom", message: err.message });
        } else {
          setError("root", { type: "custom", message: err.message });
        }
      }
    },
  });
  let router = useRouter();

  return (
    <div className="page">
      <div className="flex justify-center">
        <div className="card p-12 mt-8 max-w-md">
          <div className="text-center mb-4 text-primary-500 font-bold">
            Set password
          </div>
          {/* "handleSubmit" will validate your inputs before invoking "onSubmit" */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
            <div>
              {/* include validation with required or other standard HTML validation rules */}
              <Input
                placeholder="new password"
                type="password"
                {...register("password", {
                  required: true,
                  minLength: {
                    value: 6,
                    message: "Must contain at least 6 characters",
                  },
                  maxLength: {
                    value: 255,
                    message: "Must contain at most 255 characters",
                  },
                })}
              />
              {errors.password && (
                <ErrorMessage>{errors.password.message}</ErrorMessage>
              )}

              {errors.root && (
                <ErrorMessage className="mt-3">
                  {errors.root.message}
                </ErrorMessage>
              )}
            </div>

            <Button type="submit" className="my-4 text-primary-300">
              Enter
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default trpc.withTRPC(Page);
