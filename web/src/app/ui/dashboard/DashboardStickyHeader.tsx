import Link from "next/link";
import React from "react";
import { Button } from "../Button";
import { FaPlus } from "react-icons/fa6";

interface DashboardStickyHeaderProps {
  board?: any;
}

export const DashboardStickyHeader: React.FC<DashboardStickyHeaderProps> = ({
  board,
}) => {
  const hasEmoji = true;
  return (
    <div className="flex-1 flex flex-row items-center justify-between px-6 sticky top-16 bg-primary-900 z-10">
      {/* Dashboard title */}
      <div className="py-4 flex-1 flex-row">
        {/* Note: might be preferable in the future to stick the route at the top for better navigation, but for now we'll stick the title.*/}
        <div className="text-3xl font-bold flex flex-row py-1 ">
          {hasEmoji ? (
            <div className="mr-2 hover:bg-primary-700 h-8 w-8 text-center rounded-l cursor-pointer">
              🥳
            </div>
          ) : (
            <div></div>
          )}
          <div className="hoverable area rounded-lg px-1">
            {board?.name ?? "No board selected"}
          </div>
        </div>
        <div className="flex ml-10">
          <div className="hoverable area text-xs subtext px-1 rounded-md">
            Here are our main charts.
          </div>
        </div>
      </div>

      {/* Placeholder bank for little buttons */}
      <div></div>

      {/* New chart button */}
      <Link href="/chart">
        <Button>
          <div className="flex items-center">
            <FaPlus className="mr-2" /> New chart
          </div>
        </Button>
      </Link>
    </div>
  );
};
