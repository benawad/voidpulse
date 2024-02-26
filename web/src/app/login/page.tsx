"use client";
import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "../utils/trpc";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { ErrorMessage } from "../ui/ErrorMessage";

type Inputs = {
  email: string;
  password: string;
};

type InputKey = keyof Inputs;

const Page: React.FC = () => {
  const utils = trpc.useUtils();
  const onSubmit: SubmitHandler<Inputs> = (data) => {
    mutateAsync(data);
  };
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Inputs>();
  const { mutateAsync } = trpc.login.useMutation({
    onSuccess: (data) => {
      if ("user" in data) {
        utils.getMe.setData(undefined, data);
        router.push(`/p/${data.projects[0].id}`);
      }
    },
    onError: (err) => {
      let keys: InputKey[] = ["email", "password"];

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
            Log in
          </div>
          {/* "handleSubmit" will validate your inputs before invoking "onSubmit" */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
            <div>
              {/* register your input into the hook by invoking the "register" function */}
              <Input
                placeholder="email"
                autoComplete="email"
                type="email"
                {...register("email", {
                  required: true,
                  minLength: {
                    value: 3,
                    message: "Must contain at least 3 characters",
                  },
                  maxLength: {
                    value: 255,
                    message: "Must contain at most 255 characters",
                  },
                })}
              />
              {errors.email && (
                <ErrorMessage>{errors.email.message}</ErrorMessage>
              )}

              {/* include validation with required or other standard HTML validation rules */}
              <Input
                placeholder="password"
                autoComplete="current-password"
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

            <Link
              href="/register"
              className="text-primary-500 underline self-center"
            >
              don't have an account? create one
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
};

export default trpc.withTRPC(Page);
