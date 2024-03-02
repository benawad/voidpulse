import { useRouter } from "next/navigation";
import React, { useMemo } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import Modal from "react-modal";
import { useLastSelectedProjectBoardStore } from "../../../stores/useLastSelectedProjectBoardStore";
import { Button } from "../ui/Button";
import { FullScreenModalOverlay } from "../ui/FullScreenModalOverlay";
import { Input } from "../ui/Input";
import { trpc } from "../utils/trpc";
import { SearchSelect } from "../ui/SearchSelect";

if (typeof window !== "undefined") {
  Modal.setAppElement("body");
}

interface DeleteBoardConfirmationModalProps {
  isOpen: boolean;
  onDismissModal: () => void;
}

type Inputs = {
  name: string;
  timezone: string;
};

export const CreateProjectModal: React.FC<
  DeleteBoardConfirmationModalProps
> = ({ isOpen, onDismissModal }) => {
  const router = useRouter();
  const { lastProjectId } = useLastSelectedProjectBoardStore();
  const utils = trpc.useUtils();
  const { mutateAsync, isPending } = trpc.createProject.useMutation({
    //After successful db deletion, remove the board from the local list of boards.
    onSuccess: (data) => {
      onDismissModal();
      utils.getMe.setData(undefined, (old) => {
        if (!old) return old;
        return {
          ...old,
          projects: [...old.projects, data.project],
        };
      });
      utils.getBoards.setData(
        {
          projectId: data.project.id,
        },
        {
          boards: [data.board],
        }
      );
      router.push(`/p/${data.project.id}`);
    },
  });
  const onSubmit: SubmitHandler<Inputs> = (data) => {
    return mutateAsync(data);
  };
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Inputs>({
    values: {
      name: "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  });
  const opts = useMemo(
    () =>
      Intl.supportedValuesOf("timeZone").map((x) => ({
        label: x,
        value: x,
        searchValue: x.toLowerCase(),
      })),
    []
  );

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
          <div>
            <div className="text-xs pl-2 mt-6 mb-1 text-primary-300/50">
              Timezone
            </div>
            <Controller
              name="timezone"
              control={control}
              render={({ field }) => (
                <SearchSelect
                  value={field.value}
                  opts={opts}
                  onSelect={(x) => {
                    field.onChange({
                      target: {
                        value: x,
                      },
                    });
                  }}
                />
              )}
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
