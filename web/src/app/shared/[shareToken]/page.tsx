"use client";
import React from "react";
import { useParams } from "next/navigation";
import { trpc } from "../../utils/trpc";
import { CurrThemeProvider } from "../../themes/CurrThemeProvider";
import { FullScreenLoading } from "../../ui/FullScreenLoading";
import { ErrorMessage } from "../../ui/ErrorMessage";
import { SharedBoardView } from "./SharedBoardView";

export const runtime = "edge";

function SharedBoardPage() {
  const { shareToken } = useParams<{ shareToken: string }>();

  const { data, isLoading, error } = trpc.getSharedBoard.useQuery(
    { shareToken },
    {
      enabled: !!shareToken,
    }
  );

  if (isLoading) {
    return (
      <CurrThemeProvider>
        <FullScreenLoading />
      </CurrThemeProvider>
    );
  }

  if (error) {
    return (
      <CurrThemeProvider>
        <div className="min-h-screen bg-primary-900 flex items-center justify-center">
          <div className="text-center">
            <ErrorMessage message={error.message} />
            <p className="text-primary-400 mt-4">
              This board may not exist or sharing has been disabled.
            </p>
          </div>
        </div>
      </CurrThemeProvider>
    );
  }

  if (!data) {
    return (
      <CurrThemeProvider>
        <div className="min-h-screen bg-primary-900 flex items-center justify-center">
          <div className="text-center">
            <ErrorMessage message="Board not found" />
          </div>
        </div>
      </CurrThemeProvider>
    );
  }

  return (
    <CurrThemeProvider>
      <SharedBoardView board={data.board} charts={data.charts} />
    </CurrThemeProvider>
  );
}

export default trpc.withTRPC(SharedBoardPage);
