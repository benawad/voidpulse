"use client";
import React from "react";
import { IoChevronBack, IoSync } from "react-icons/io5";
import { ProjectBoardProvider } from "../../../../../../../providers/ProjectBoardProvider";
import { FullScreenLoading } from "../../../../../ui/FullScreenLoading";
import { HeaderNav } from "../../../../../ui/HeaderNav";
import { LineSeparator } from "../../../../../ui/LineSeparator";
import { trpc } from "../../../../../utils/trpc";
import { useFetchProjectBoards } from "../../../../../utils/useFetchProjectBoards";
import { useParams } from "next/navigation";
import { dataTypeToIconMap } from "../../../chart/metric-selector/PropKeySelector";
import { DataType } from "@voidpulse/api";

export const PropertiesPage: React.FC = ({}) => {
  const { eventValue } = useParams<{ eventValue: string }>();
  const { project, board } = useFetchProjectBoards();
  const utils = trpc.useUtils();

  const { data: propKeys } = trpc.getPropKeys.useQuery(
    {
      projectId: project?.id ?? "",
      events: [{ value: eventValue ?? "", name: eventValue ?? "" }],
    },
    {
      enabled: !!project?.id,
    }
  );

  const { mutate: syncProperties, isPending: isSyncing } =
    trpc.syncProperties.useMutation({
      onSuccess: () => {
        utils.getPropKeys.invalidate();
      },
    });

  if (!project || !board || !propKeys) {
    return <FullScreenLoading />;
  }

  return (
    <ProjectBoardProvider boardId={board.id} projectId={project.id}>
      <main className="h-full min-h-screen bg-primary-900 flex flex-col">
        <HeaderNav />
        <div>
          <div className="flex justify-between items-center px-2">
            <button
              className="flex flex-row items-center mt-2 text-primary-200 hover:scale-105 hover:text-primary-100 ease-in"
              onClick={() => window.history.back()}
            >
              <IoChevronBack className="mr-2" />
              Back
            </button>
            <button
              onClick={() =>
                syncProperties({ projectId: project.id, eventValue })
              }
              disabled={isSyncing}
              className="flex items-center gap-2 mt-2 px-4 py-2 bg-primary-700 text-primary-200 rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IoSync className={`${isSyncing ? "animate-spin" : ""}`} />
              Sync Properties
            </button>
          </div>
          <LineSeparator />
        </div>
        <div className="p-4 max-w-screen-sm">
          {propKeys.propDefs.map((propKey) => {
            const icon = dataTypeToIconMap[propKey.type];
            return (
              <div
                key={propKey.key}
                className="flex items-center gap-3 p-3 text-primary-200 rounded-lg"
              >
                <div className="text-lg">{icon}</div>
                <div className="flex-1 font-medium">{propKey.key}</div>
                <div className="text-sm text-primary-400">
                  {DataType[propKey.type].toString()}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </ProjectBoardProvider>
  );
};

export const runtime = "edge";

export default trpc.withTRPC(PropertiesPage);
