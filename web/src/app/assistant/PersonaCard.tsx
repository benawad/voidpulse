import React from "react";
import { LineSeparator } from "../ui/LineSeparator";

interface PersonaCardProps {
  persona: any;
}

export const PersonaCard: React.FC<PersonaCardProps> = ({ persona }) => {
  return (
    <div
      className="hoverable card area group text-center m-3 p-4 rounded-3xl"
      //   style={{ width: 200, height: 300 }}
    >
      {/* Placeholder circle for images */}
      <div
        className="rounded-full mx-auto bg-white/10 group-hover:ring-secondary-signature-100 group-hover:ring-2"
        style={{
          height: 100,
          width: 100,
        }}
      ></div>
      <div className="font-bold text-lg my-2 mx-auto text-center group-hover:text-secondary-signature-100">
        {persona?.name}
      </div>
      <LineSeparator />
      <div className="mx-auto my-2 text-center subtext">
        {persona?.description}
      </div>
    </div>
  );
};
