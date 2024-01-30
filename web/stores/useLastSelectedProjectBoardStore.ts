import { create } from "zustand";
import { combine, persist } from "zustand/middleware";

export const useLastSelectedProjectBoardStore = create(
  persist(
    combine(
      {
        lastBoardId: "" as string,
        lastProjectId: "" as string,
        _hasHydrated: false as boolean,
      },
      (set) => ({
        set,
      })
    ),
    {
      name: "useLastSelectedProjectBoardStore",
    }
  )
);
