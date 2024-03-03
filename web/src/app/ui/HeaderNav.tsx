import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { IoIosSettings } from "react-icons/io";
import { IoFolderOutline } from "react-icons/io5";
import { PlusIcon } from "../p/[projectId]/chart/manual-sidebars/PlusIcon";
import { CreateProjectModal } from "../components/CreateProjectModal";
import { useFetchProjectBoards } from "../utils/useFetchProjectBoards";
import { Dropdown } from "./Dropdown";
import VoidpulseIcon from "../landing/VoidpulseIcon";

interface HeaderNavProps {}

export const HeaderNav: React.FC<HeaderNavProps> = ({}) => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { projects, project } = useFetchProjectBoards();
  const headerItemStyle =
    "p-3 lg:p-3 m-1 hover:bg-primary-800/30 transition-colors rounded-lg items-center flex text-center";
  return (
    <div className="w-full h-14 bg-gradient-to-r from-accent-100 to-accent-200 shadow-lg sticky top-0 z-30">
      <div className="flex-row flex justify-start h-full items-center">
        {/* <VoidpulseIcon className="ml-4" /> */}
        {/* <Link href="/" className={headerItemStyle}>
          boards
        </Link> */}
        {/* <div className={headerItemStyle}>users</div>
        <div className={headerItemStyle}>events</div>
        <Link href="/assistant" className={headerItemStyle}>
          assistant
        </Link> */}
        {/* <Link href="/themes" className={headerItemStyle}>
          themes
        </Link> */}

        <CreateProjectModal
          isOpen={isModalOpen}
          onDismissModal={() => {
            setIsModalOpen(false);
          }}
        />
        <div>
          <Dropdown
            buttonClassName="text-primary-100 hover:bg-primary-800/30 rounded-lg p-2 transition-colors font-bold text-xl ml-2"
            menuClassName={`animate-in fade-in zoom-in-75 duration-200 bg-primary-900 border-primary-700 font-semibold `}
            placement="bottom-start"
            autoWidth
            noCaret
            upAndDownCaret
            showCheckmark
            portal={false}
            opts={[
              ...(projects?.map((p) => ({
                label: p.name,
                value: p.id,
                Icon: (
                  <IoFolderOutline className="opacity-50 w-6 h-6 rounded-md p-1" />
                ),
              })) || []),
              {
                label: "New project...",
                value: "new",
                optClassName: "font-normal text-primary-400",
                Icon: (
                  <PlusIcon
                    className={
                      "bg-primary-700 mr-0 group-hover:bg-accent-100/20"
                    }
                  />
                ),
              },
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
        <Link href="/settings" className={`ml-auto mr-2 ${headerItemStyle}`}>
          <span className="mr-1 text-xs font-semibold">Settings</span>
          <IoIosSettings size={24} />
        </Link>
      </div>
    </div>
  );
};
