"use client";
import React, { useState } from "react";
import { HeaderNav } from "../ui/HeaderNav";
import { trpc } from "../utils/trpc";
import { useFetchProjectBoards } from "../utils/useFetchProjectBoards";
import { EditableTextField } from "../ui/EditableTextField";
import { useLastSelectedProjectBoardStore } from "../../../stores/useLastSelectedProjectBoardStore";
import { ThemePicker } from "../themes/ThemePicker";
import { IoChevronBack } from "react-icons/io5";
import { LineSeparator } from "../ui/LineSeparator";
import { Button } from "../ui/Button";

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

  const headerLabelStyle = "text-xs text-primary-400 my-3";
  const sectionStyle = "p-12";
  return (
    <main className="h-full bg-primary-900 flex flex-col">
      <HeaderNav />
      {/* Settings content body */}
      <div>
        <button
          className="flex flex-row items-center mt-2 ml-2 text-primary-200 hover:scale-105 hover:text-primary-100 ease-in"
          onClick={() => window.history.back()}
        >
          <IoChevronBack className="mr-2" />
          Back
        </button>
        <LineSeparator />
        {/* Project details */}
        <div className={sectionStyle}>
          <div className={headerLabelStyle}>PROJECT NAME</div>
          <div className="text-xl font-bold flex mt-2">
            {!project ? null : (
              <EditableTextField
                text={project.name}
                showEditIcon
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
        </div>
        <LineSeparator />
        <div className={sectionStyle}>
          <div className={headerLabelStyle}>API KEY</div>
          <input
            type="text"
            id="apiKey"
            style={{ width: 350, height: 48 }}
            className="rounded-lg p-3 bg-primary-800 text-primary-100"
            value={
              isRevealed
                ? project?.apiKey
                : Array(project?.apiKey.length || 0)
                    .fill("•")
                    .join("")
            }
            readOnly
          />
          <Button className="mx-4" onClick={() => setIsRevealed(!isRevealed)}>
            {isRevealed ? "Hide" : "Reveal"}
          </Button>
          <Button
            buttonType="negative"
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
          </Button>
        </div>
        <LineSeparator />
        <div className={sectionStyle}>
          <div className={headerLabelStyle}>THEMES</div>
          <ThemePicker />
        </div>
      </div>
    </main>
  );
};

export default trpc.withTRPC(SettingsPage);
