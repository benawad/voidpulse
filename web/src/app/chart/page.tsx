"use client";
import { ProjectBoardProvider } from "../../../providers/ProjectBoardProvider";
import { HeaderNav } from "../ui/HeaderNav";
import { trpc } from "../utils/trpc";
import { ChartEditor } from "./ChartEditor";

function Page() {
  const { data } = trpc.getProjects.useQuery();
  return (
    <div className="page">
      <ProjectBoardProvider id={data?.projects[0].id || ""}>
        <HeaderNav />
        <ChartEditor />
      </ProjectBoardProvider>
    </div>
  );
}

export default trpc.withTRPC(Page);
