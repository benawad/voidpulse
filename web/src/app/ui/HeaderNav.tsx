import Link from "next/link";
import React from "react";
import VoidpulseIcon from "../landing/VoidpulseIcon";

interface HeaderNavProps {}

export const HeaderNav: React.FC<HeaderNavProps> = ({}) => {
  const headerItemStyle =
    "p-3 lg:p-3 m-1 hoverable area rounded-lg items-center flex text-center";
  return (
    <div className="w-full h-16 bg-gradient-to-r from-secondary-signature-100 to-secondary-signature-100 shadow-md sticky top-0 z-30">
      <div className="flex-row flex justify-start h-full items-center">
        <VoidpulseIcon className="ml-4 mr-2" />
        <Link href="/" className={headerItemStyle}>
          boards
        </Link>
        <div className={headerItemStyle}>users</div>
        <div className={headerItemStyle}>events</div>
        <Link href="/assistant" className={headerItemStyle}>
          assistant
        </Link>
        <Link href="/themes" className={headerItemStyle}>
          themes
        </Link>
      </div>
    </div>
  );
};
