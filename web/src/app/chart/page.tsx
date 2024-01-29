"use client";
import { ProjectProvider } from "../../../providers/ProjectProvider";
import { HeaderNav } from "../ui/HeaderNav";
import { trpc } from "../utils/trpc";
import { ChartEditor } from "./ChartEditor";

function Page() {
  const { data } = trpc.getProjects.useQuery();
  return (
    <div className="page">
      <ProjectProvider id={data?.projects[0].id || ""}>
        <HeaderNav />
        <ChartEditor />
      </ProjectProvider>
    </div>
  );
}

export default trpc.withTRPC(Page);
