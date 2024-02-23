"use client";
import React, { useState } from "react";
import { HeaderNav } from "../ui/HeaderNav";
import { trpc } from "../utils/trpc";
import { useFetchProjectBoards } from "../utils/useFetchProjectBoards";
import { EditableTextField } from "../ui/EditableTextField";
import { useLastSelectedProjectBoardStore } from "../../../stores/useLastSelectedProjectBoardStore";
import { ThemePicker } from "../themes/ThemePicker";

export const SettingsPage: React.FC = ({}) => {
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const { project } = useFetchProjectBoards();
  const utils = trpc.useUtils();
  const { mutateAsync, isPending } = trpc.updateProject.useMutation({
    onSuccess: (data) => {
      utils.getMe.setData(undefined, (oldData) => {
        if (!oldData) {
          return oldData;
        }
        return {
          ...oldData,
          projects: oldData.projects.map((p) => {
            if (p.id === data.project.id) {
              return data.project;
            }
            return p;
          }),
        };
      });
    },
  });

  return (
    <main className="h-screen bg-primary-900 flex flex-col">
      <HeaderNav />
      <div>
        <div>Project name</div>
        {!project ? null : (
          <EditableTextField
            text={project.name}
            onDone={(newName) => {
              mutateAsync({
                id: project?.id!,
                data: {
                  name: newName,
                },
              });
            }}
          />
        )}
      </div>
      <div className="mt-4">
        <div>Api key</div>
        <input
          type="text"
          id="apiKey"
          value={
            isRevealed
              ? project?.apiKey
              : Array(project?.apiKey.length || 0)
                  .fill("•")
                  .join("")
          }
          readOnly
        />
        <button className="mx-4" onClick={() => setIsRevealed(!isRevealed)}>
          {isRevealed ? "Hide" : "Reveal"}
        </button>
        <button
          disabled={isPending || !project}
          onClick={() => {
            mutateAsync({
              id: project?.id!,
              data: {
                revokeApiKey: true,
              },
            });
          }}
        >
          Revoke
        </button>
      </div>
      <div className="mt-4">
        <ThemePicker />
      </div>
    </main>
  );
};

export default trpc.withTRPC(SettingsPage);
