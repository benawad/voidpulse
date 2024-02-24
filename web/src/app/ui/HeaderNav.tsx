import Link from "next/link";
import React, { useState } from "react";
import VoidpulseIcon from "../landing/VoidpulseIcon";
import { IoFolderOutline, IoHomeOutline, IoSettings } from "react-icons/io5";
import { FiSettings } from "react-icons/fi";
import { RouterOutput } from "../utils/trpc";
import { useFetchProjectBoards } from "../utils/useFetchProjectBoards";
import { Dropdown } from "./Dropdown";
import { useRouter } from "next/navigation";
import { CreateProjectModal } from "../components/CreateProjectModal";
import { FaPlus } from "react-icons/fa";
import { PlusIcon } from "../chart/manual-sidebars/PlusIcon";

interface HeaderNavProps {}

export const HeaderNav: React.FC<HeaderNavProps> = ({}) => {
  const router = useRouter();
  const { projects, project } = useFetchProjectBoards();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const headerItemStyle =
    "p-3 lg:p-3 m-1 hoverable area rounded-lg items-center flex text-center";
  return (
    <div className="w-full h-16 bg-gradient-to-r from-accent-100 to-accent-200 shadow-lg sticky top-0 z-30">
      <div className="flex-row flex justify-start h-full items-center">
        {/* <VoidpulseIcon className="ml-4 mr-2" /> */}
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
                label: "Create project",
                value: "new",
                Icon: <PlusIcon className={"bg-primary-700 mr-0"} />,
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
          <span className="mr-1 text-xs">Settings</span>
          <IoSettings size={24} />
        </Link>
      </div>
    </div>
  );
};
