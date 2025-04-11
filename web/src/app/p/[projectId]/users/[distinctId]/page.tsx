"use client";
import { useParams } from "next/navigation";
import React from "react";
import { IoChevronBack } from "react-icons/io5";
import { ProjectBoardProvider } from "../../../../../../providers/ProjectBoardProvider";
import { FullScreenLoading } from "../../../../ui/FullScreenLoading";
import { HeaderNav } from "../../../../ui/HeaderNav";
import { LineSeparator } from "../../../../ui/LineSeparator";
import { trpc } from "../../../../utils/trpc";
import { useFetchProjectBoards } from "../../../../utils/useFetchProjectBoards";

export const PropertiesPage: React.FC = ({}) => {
  const { distinctId } = useParams<{ distinctId: string }>();
  const { project, board } = useFetchProjectBoards();
  const [offset, setOffset] = React.useState(0);
  const [allEvents, setAllEvents] = React.useState<
    Array<{
      name: string;
      time: string;
      properties: string;
    }>
  >([]);

  const { data: events, isLoading } = trpc.getEventsForUser.useQuery(
    {
      projectId: project?.id ?? "",
      distinctId,
      offset,
    },
    {
      enabled: !!project?.id,
    }
  );

  React.useEffect(() => {
    if (events?.events) {
      setAllEvents((prev) => [...prev, ...events.events]);
    }
  }, [events?.events]);

  if (!isLoading && !events?.events.length) {
    return <div>No events found</div>;
  }

  if (!project || !board || !allEvents) {
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
          </div>
          <LineSeparator />
        </div>
        <div className="p-4 max-w-screen-sm">
          <h2 className="text-xl font-semibold text-primary-100 mb-4">
            Events
          </h2>
          <div className="space-y-4">
            {allEvents.map((event) => (
              <div
                key={`${event.time}-${event.name}`}
                className="bg-primary-800 rounded-lg p-4"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-primary-100">
                    {event.name}
                  </span>
                  <span className="text-sm text-primary-400">
                    {new Date(event.time).toLocaleString()}
                  </span>
                </div>
                {Object.entries(event.properties).length > 0 && (
                  <div className="mt-2">
                    <div className="text-sm text-primary-300 mb-1">
                      Properties:
                    </div>
                    <div className="space-y-1">
                      {Object.entries(JSON.parse(event.properties)).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="flex items-center gap-2 text-sm"
                          >
                            <span className="text-primary-400">{key}:</span>
                            <span className="text-primary-200">
                              {typeof value === "object"
                                ? JSON.stringify(value)
                                : String(value)}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          {events?.hasMore && (
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={() => setOffset(offset + 100)}
                className="px-4 py-2 bg-primary-700 text-primary-200 rounded-lg hover:bg-primary-600"
              >
                Load More
              </button>
            </div>
          )}
        </div>
      </main>
    </ProjectBoardProvider>
  );
};

export const runtime = "edge";

export default trpc.withTRPC(PropertiesPage);
