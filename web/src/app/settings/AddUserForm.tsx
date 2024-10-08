import React, { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { trpc } from "../utils/trpc";
import { useProjectBoardContext } from "../../../providers/ProjectBoardProvider";
import { Input } from "../ui/Input";
import { ErrorMessage } from "../ui/ErrorMessage";
import { Button } from "../ui/Button";

type Inputs = {
  email: string;
  password: string;
};

export const AddUserForm: React.FC<{}> = ({}) => {
  const [done, setDone] = useState(false);
  const { projectId } = useProjectBoardContext();
  const onSubmit: SubmitHandler<Inputs> = (data) => {
    mutateAsync({
      projectId,
      email: data.email,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      password: data.password,
    });
  };
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<Inputs>();
  const { mutateAsync } = trpc.addUser.useMutation({
    onSuccess: () => {
      setDone(true);
      reset();
    },
    onError: (err) => {
      setError("root", { type: "custom", message: err.message });
    },
  });

  useEffect(() => {
    if (done) {
      const id = setTimeout(() => {
        setDone(false);
      }, 5000);

      return () => {
        clearTimeout(id);
      };
    }
  }, [done]);

  return (
    <>
      <form
        style={{ width: 350 }}
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col"
      >
        <div>
          {/* register your input into the hook by invoking the "register" function */}
          <Input
            placeholder="email"
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
          {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
          <Input
            placeholder="password"
            type="password"
            {...register("password")}
          />
          {errors.password && (
            <ErrorMessage>{errors.password.message}</ErrorMessage>
          )}

          {errors.root && (
            <ErrorMessage className="mt-3">{errors.root.message}</ErrorMessage>
          )}
        </div>

        <Button type="submit" className="my-4 text-primary-300">
          Create
        </Button>
        {done ? <div className="mt-1">Done!</div> : null}
      </form>
    </>
  );
};
