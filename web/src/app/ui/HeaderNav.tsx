import Link from "next/link";
import React, { useState } from "react";
import VoidpulseIcon from "../landing/VoidpulseIcon";
import { IoSettings } from "react-icons/io5";
import { RouterOutput } from "../utils/trpc";
import { useFetchProjectBoards } from "../utils/useFetchProjectBoards";
import { Dropdown } from "./Dropdown";
import { useRouter } from "next/navigation";
import { CreateProjectModal } from "../components/CreateProjectModal";

interface HeaderNavProps {}

export const HeaderNav: React.FC<HeaderNavProps> = ({}) => {
  const router = useRouter();
  const { projects, project } = useFetchProjectBoards();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const headerItemStyle =
    "p-3 lg:p-3 m-1 hoverable area rounded-lg items-center flex text-center";
  return (
    <div className="w-full h-16 mono-body bg-gradient-to-r from-accent-100 to-accent-200 shadow-md sticky top-0 z-30">
      <div className="flex-row flex justify-start h-full items-center">
        <VoidpulseIcon className="ml-4 mr-2" />
        <Link href="/" className={headerItemStyle}>
          boards
        </Link>
        {/* <div className={headerItemStyle}>users</div>
        <div className={headerItemStyle}>events</div>
        <Link href="/assistant" className={headerItemStyle}>
          assistant
        </Link> */}
        {/* <Link href="/themes" className={headerItemStyle}>
          themes
        </Link> */}
        <Link href="/settings" className={`ml-auto mr-2 ${headerItemStyle}`}>
          <IoSettings size={24} />
        </Link>
        <CreateProjectModal
          isOpen={isModalOpen}
          onDismissModal={() => {
            setIsModalOpen(false);
          }}
        />
        <div className="mr-4">
          <Dropdown
            placement="bottom-end"
            portal={false}
            opts={[
              ...(projects?.map((p) => ({
                label: p.name,
                value: p.id,
              })) || []),
              { label: "Create project", value: "new" },
            ]}
            value={project?.id}
            onSelect={(id) => {
              if (id === "new") {
                setIsModalOpen(true);
              } else if (id !== project?.id) {
                router.push(`/p/${id}`);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};
