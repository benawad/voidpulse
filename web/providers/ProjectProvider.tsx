import React, { useContext, useMemo } from "react";

type ProjectContextType = {
  id: string;
};

const ProjectContext = React.createContext<ProjectContextType>({
  id: "",
});

export const ProjectProvider: React.FC<
  React.PropsWithChildren<ProjectContextType>
> = ({ children, id }) => {
  return (
    <ProjectContext.Provider value={useMemo(() => ({ id }), [id])}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjectContext = () => useContext(ProjectContext);
