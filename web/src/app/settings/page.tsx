"use client";
import React, { useMemo, useState } from "react";
import { IoChevronBack } from "react-icons/io5";
import { ThemePicker } from "../themes/ThemePicker";
import { Button } from "../ui/Button";
import { EditableTextField } from "../ui/EditableTextField";
import { HeaderNav } from "../ui/HeaderNav";
import { LineSeparator } from "../ui/LineSeparator";
import { trpc } from "../utils/trpc";
import { useFetchProjectBoards } from "../utils/useFetchProjectBoards";
import { InviteMemberForm } from "./InviteMemberForm";
import { ProjectBoardProvider } from "../../../providers/ProjectBoardProvider";
import { FullScreenLoading } from "../ui/FullScreenLoading";
import { __cloud__ } from "../constants";
import { SearchSelect } from "../ui/SearchSelect";

export const SettingsPage: React.FC = ({}) => {
  const { mutateAsync: logout } = trpc.logout.useMutation();
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const { project, board } = useFetchProjectBoards();
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
              return {
                ...p,
                ...data.project,
              };
            }
            return p;
          }),
        };
      });
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

  if (!project || !board) {
    return <FullScreenLoading />;
  }

  const headerLabelStyle = "text-xs text-primary-400 my-3";
  const sectionStyle = "p-12";
  return (
    <ProjectBoardProvider boardId={board.id} projectId={project.id}>
      <main className="h-full min-h-screen bg-primary-900 flex flex-col">
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
            <div className={headerLabelStyle}>PROJECT TIMEZONE</div>
            <SearchSelect
              value={project.timezone}
              opts={opts}
              onSelect={(x) => {
                mutateAsync({
                  id: project!.id,
                  data: {
                    timezone: x,
                  },
                });
              }}
            />
          </div>
          <LineSeparator />
          {__cloud__ ? (
            <>
              <div className={sectionStyle}>
                <div className={headerLabelStyle}>INVITE MEMBERS</div>
                <InviteMemberForm />
              </div>
              <LineSeparator />
            </>
          ) : null}
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
                const y = window.confirm(
                  "Are you sure you want to revoke your API key?"
                );
                if (!y) {
                  return;
                }
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
          <LineSeparator />
          <div className={sectionStyle}>
            <Button
              onClick={async () => {
                await logout({});
                window.location.href = "/";
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </main>
    </ProjectBoardProvider>
  );
};

export default trpc.withTRPC(SettingsPage);
