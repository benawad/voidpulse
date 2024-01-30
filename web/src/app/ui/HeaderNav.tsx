import Link from "next/link";
import React from "react";

interface HeaderNavProps {}

export const HeaderNav: React.FC<HeaderNavProps> = ({}) => {
  const headerItemStyle =
    "p-3 lg:p-3 m-1 hoverable area rounded-lg items-center flex text-center";
  return (
    <div className="w-full h-16 bg-gradient-to-r from-secondary-signature-100 to-secondary-signature-100 shadow-md fixed top-0 z-50">
      <div className="flex-row flex justify-start h-full">
        <Link href="/" className={headerItemStyle}>
          boards
        </Link>
        <div className={headerItemStyle}>users</div>
        <div className={headerItemStyle}>events</div>
        <div className={headerItemStyle}>assistant</div>
      </div>
    </div>
  );
};
