"use client";
import React from "react";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { ProjectBoardProvider } from "../../../../../providers/ProjectBoardProvider";
import { FullScreenLoading } from "../../../ui/FullScreenLoading";
import { HeaderNav } from "../../../ui/HeaderNav";
import { LineSeparator } from "../../../ui/LineSeparator";
import { trpc } from "../../../utils/trpc";
import { useFetchProjectBoards } from "../../../utils/useFetchProjectBoards";

export const EventsPage: React.FC = ({}) => {
  const router = useRouter();
  const { project, board } = useFetchProjectBoards();
  const { data: events } = trpc.getEventNames.useQuery(
    {
      projectId: project?.id ?? "",
    },
    {
      enabled: !!project?.id,
    }
  );

  if (!project || !board || !events) {
    return <FullScreenLoading />;
  }

  const handleEventClick = (eventName: string) => {
    router.push(`/p/${project.id}/events/${eventName}/properties`);
  };

  return (
    <ProjectBoardProvider boardId={board.id} projectId={project.id}>
      <main className="h-full min-h-screen bg-primary-900 flex flex-col">
        <HeaderNav />
        <div>
          <button
            className="flex flex-row items-center mt-2 ml-2 text-primary-200 hover:scale-105 hover:text-primary-100 ease-in"
            onClick={() => window.history.back()}
          >
            <IoChevronBack className="mr-2" />
            Back
          </button>
          <LineSeparator />
        </div>
        <div className="px-4 py-2">
          <h2 className="text-xl font-semibold text-primary-100 mb-4">
            Events
          </h2>
          <div className="space-y-2">
            {events.items.map((event) => (
              <button
                key={event.value}
                onClick={() => handleEventClick(event.value)}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-primary-800 hover:bg-primary-700 text-primary-100 transition-colors"
              >
                <span>{event.name}</span>
                <IoChevronForward className="text-primary-300" />
              </button>
            ))}
          </div>
        </div>
      </main>
    </ProjectBoardProvider>
  );
};

export default trpc.withTRPC(EventsPage);
