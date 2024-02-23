import React, { useEffect } from "react";
import Modal from "react-modal";
import { useLastSelectedProjectBoardStore } from "../../../stores/useLastSelectedProjectBoardStore";
import { Button } from "../ui/Button";
import { FullScreenModalOverlay } from "../ui/FullScreenModalOverlay";
import { trpc } from "../utils/trpc";
import { Input } from "../ui/Input";
import { SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

if (typeof window !== "undefined") {
  Modal.setAppElement("body");
}

interface DeleteBoardConfirmationModalProps {
  isOpen: boolean;
  onDismissModal: () => void;
}

type Inputs = {
  name: string;
};

export const CreateProjectModal: React.FC<
  DeleteBoardConfirmationModalProps
> = ({ isOpen, onDismissModal }) => {
  const router = useRouter();
  const { lastProjectId } = useLastSelectedProjectBoardStore();
  const { mutateAsync, isPending } = trpc.createProject.useMutation({
    //After successful db deletion, remove the board from the local list of boards.
    onSuccess: (data) => {
      onDismissModal();
      // @todo
      router.push(`/p/${data.project.id}`);
    },
  });
  const onSubmit: SubmitHandler<Inputs> = (data) => {
    return mutateAsync(data);
  };
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Inputs>();

  return (
    <FullScreenModalOverlay onRequestClose={onDismissModal} isOpen={isOpen}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="relative standard card p-4">
          <h1 className="text-2xl font-bold py-2">Create Project</h1>
          <div style={{ width: 400 }}>
            <Input
              autoFocus
              placeholder="name"
              {...register("name", {
                required: true,
              })}
            />
          </div>
          <div className="flex flex-row space-x-2 justify-end mt-4">
            <Button type="button" buttonType="neutral" onClick={onDismissModal}>
              Cancel
            </Button>
            <Button type="submit" buttonType="action">
              Create
            </Button>
          </div>
        </div>
      </form>
    </FullScreenModalOverlay>
  );
};
