import React from "react";
import { LoadingSpinner } from "./LoadingSpinner";

interface FullscreenLoadingProps {}

export const FullScreenLoading: React.FC<FullscreenLoadingProps> = ({}) => {
  return (
    <div className="w-full h-screen bg-primary-900 flex justify-center items-center">
      <LoadingSpinner size={50} />
    </div>
  );
};
