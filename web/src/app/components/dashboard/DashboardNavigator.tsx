import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import React, { useMemo } from "react";
import { useProjectBoardContext } from "../../../../providers/ProjectBoardProvider";
import { useLastSelectedProjectBoardStore } from "../../../../stores/useLastSelectedProjectBoardStore";
import { LineSeparator } from "../../ui/LineSeparator";
import { reorder } from "../../utils/reorder";
import { RouterOutput, trpc } from "../../utils/trpc";
import { AddBoardButton } from "./AddBoardButton";
import { DashboardSidebarButton } from "./DashboardSidebarButton";

interface DashboardNavigatorProps {
  project: RouterOutput["getMe"]["projects"][0];
  boards: RouterOutput["getBoards"]["boards"];
}

export const DashboardNavigator: React.FC<DashboardNavigatorProps> = ({
  project,
  boards,
}) => {
  const boardOrder = useMemo(() => {
    return [
      ...(project.boardOrder || []),
      ...boards
        .filter((b) => !project.boardOrder?.includes(b.id))
        .map((b) => b.id),
    ];
  }, [project.boardOrder, boards]);
  const { boardId } = useProjectBoardContext();
  const { set, lastProjectId } = useLastSelectedProjectBoardStore();
  const utils = trpc.useUtils();
  const { mutateAsync } = trpc.updateBoardOrder.useMutation();

  //Keyboard navigation
  // useKeyPress({
  //   onLeftArrowKey() {
  //     const index = boards.findIndex((b) => b.id === boardId);
  //     if (index) {
  //       set({ lastBoardId: boards[index - 1].id });
  //     }
  //   },
  //   onRightArrowKey() {
  //     const index = boards.findIndex((b) => b.id === boardId);
  //     if (index < boards.length - 1) {
  //       set({ lastBoardId: boards[index + 1].id });
  //     }
  //   },
  // });

  //Styling buttons
  const sidebarButtonStyle =
    "accent-hover ring-0 group flex p-2 rounded-lg w-full items-center relative ";
  const selectedBoardButtonStyle = "bg-primary-700 ring-primary-600/50 ";
  return (
    <div
      className="w-1/6 bg-primary-800 border-r border border-primary-700 flex sticky top-16 h-full"
      style={{ minWidth: 200 }}
    >
      <div className="w-full px-2 pt-4">
        {/* Team boards button  */}
        {/* <div className={sidebarButtonStyle + " border-transparent"}>
          <div className="flex items-center">
            <div className={"icon-box"}>
              <FaUserGroup
                className="m-auto group-hover:fill-white h-full w-full"
                style={{ padding: 5 }}
                size={12}
              />
            </div>
            Team boards
          </div>
        </div> */}
        {/* New board button  */}
        <div className={sidebarButtonStyle + " border-transparent"}>
          <AddBoardButton />
        </div>

        <LineSeparator />
        <div className="subtext py-2">BOARDS</div>
        <DragDropContext
          onDragEnd={(result) => {
            // dropped outside the list
            if (!result.destination) {
              return;
            }

            const newBoardOrder = reorder(
              boardOrder || [],
              result.source.index,
              result.destination.index
            );
            mutateAsync({
              projectId: project.id,
              boardOrder: newBoardOrder,
            });
            utils.getMe.setData(undefined, (oldData) => {
              if (!oldData) {
                return oldData;
              }
              return {
                ...oldData,
                projects: oldData.projects.map((p) => {
                  if (p.id === project.id) {
                    return {
                      ...p,
                      boardOrder: newBoardOrder,
                    };
                  }
                  return p;
                }),
              };
            });
          }}
        >
          <Droppable droppableId="droppable2">
            {(provided, snapshot) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {boardOrder.map((id, idx) => {
                  const board = boards.find((b) => b.id === id);
                  if (!board) {
                    return null;
                  }
                  return (
                    <Draggable key={id} draggableId={id} index={idx}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.dragHandleProps}
                          {...provided.draggableProps}
                        >
                          <DashboardSidebarButton board={board} />
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
};
