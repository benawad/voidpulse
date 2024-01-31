import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { trpc } from "../../utils/trpc";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";

interface RegisterFormProps {}

type Inputs = {
  email: string;
  password: string;
};

export const CreateBoardForm: React.FC<RegisterFormProps> = ({}) => {
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
  const onSubmit: SubmitHandler<Inputs> = (data) => {
    mutateAsync(data);
  };

  return (
    <div className="page">
      <div className="flex justify-center">
        <div className="card p-12">
          <div className="text-center p-4 text-primary-500 font-bold">
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
                {...register("email", { required: true })}
              />

              {/* include validation with required or other standard HTML validation rules */}
              <Input
                placeholder="password"
                autoComplete="current-password"
                type="password"
                {...register("password", { required: true })}
              />
              <pre>{errors.email?.message}</pre>
              <pre>{errors.password?.message}</pre>
              <pre>{errors.root?.message}</pre>
            </div>
            <Button type="submit" className="my-4">
              Enter
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
