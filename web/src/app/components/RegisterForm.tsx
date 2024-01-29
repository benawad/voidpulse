import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { trpc } from "../utils/trpc";

interface RegisterFormProps {}

type Inputs = {
  email: string;
  password: string;
};

export const RegisterForm: React.FC<RegisterFormProps> = ({}) => {
  const utils = trpc.useUtils();
  const { mutateAsync } = trpc.register.useMutation({
    onSuccess: (data) => {
      if ("user" in data) {
        utils.getMe.setData(undefined, { user: data.user });
      }
    },
  });
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = (data) => mutateAsync(data);

  return (
    /* "handleSubmit" will validate your inputs before invoking "onSubmit" */
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* register your input into the hook by invoking the "register" function */}
      <input
        placeholder="email"
        type="email"
        {...register("email", { required: true })}
      />

      {/* include validation with required or other standard HTML validation rules */}
      <input
        placeholder="password"
        type="password"
        {...register("password", { required: true })}
      />
      <pre>{errors.email?.message}</pre>
      <pre>{errors.password?.message}</pre>
      <pre>{errors.root?.message}</pre>

      <input type="submit" />
    </form>
  );
};
