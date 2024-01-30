import React, { useContext, useMemo } from "react";

type ProjectBoardContextType = {
  projectId: string;
  boardId: string;
};

const ProjectBoardContext = React.createContext<ProjectBoardContextType>({
  projectId: "",
  boardId: "",
});

export const ProjectBoardProvider: React.FC<
  React.PropsWithChildren<ProjectBoardContextType>
> = ({ children, projectId, boardId }) => {
  return (
    <ProjectBoardContext.Provider
      value={useMemo(() => ({ projectId, boardId }), [projectId, boardId])}
    >
      {children}
    </ProjectBoardContext.Provider>
  );
};

export const useProjectBoardContext = () => useContext(ProjectBoardContext);
