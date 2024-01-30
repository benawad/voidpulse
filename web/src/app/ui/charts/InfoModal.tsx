import React from "react";

interface InfoModalProps {}

export const InfoModal: React.FC<InfoModalProps> = ({}) => {
  return (
    <div className="padded hoverable card area m-6">
      Wow, your metrics look gorgeous.
    </div>
  );
};
