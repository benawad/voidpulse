"use client";
import Link from "next/link";
import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Button } from "../ui/Button";
import { ErrorMessage } from "../ui/ErrorMessage";
import { Input } from "../ui/Input";
import { trpc } from "../utils/trpc";

type Inputs = {
  email: string;
};

const Page: React.FC = () => {
  const [done, setDone] = useState(false);
  const onSubmit: SubmitHandler<Inputs> = (data) => {
    mutateAsync(data);
  };
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Inputs>();
  const { mutateAsync } = trpc.forgotPassword.useMutation({
    onSuccess: () => {
      setDone(true);
    },
    onError: (err) => {
      setError("root", { type: "custom", message: err.message });
    },
  });

  return (
    <div className="page">
      <div className="flex justify-center">
        <div className="card p-12 mt-8 max-w-md">
          <div className="text-center mb-4 text-primary-500 font-bold">
            Forgot password
          </div>
          {/* "handleSubmit" will validate your inputs before invoking "onSubmit" */}
          {!done ? (
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
          ) : (
            <div>Check your email for a link to reset your password.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default trpc.withTRPC(Page);
