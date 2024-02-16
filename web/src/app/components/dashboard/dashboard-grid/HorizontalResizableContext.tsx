import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
} from "react";

interface HorizontalResizableContextState {
  widths: number[];
  handleResize: (index: number, delta: number) => void;
}

const HorizontalResizableContext = createContext<
  HorizontalResizableContextState | undefined
>(undefined);

interface HorizontalResizableProviderProps {
  children: ReactNode;
  numItems: number;
}

export const HorizontalResizableProvider: React.FC<
  HorizontalResizableProviderProps
> = ({ children, numItems }) => {
  const [widths, setWidths] = useState<number[]>(() =>
    Array(numItems).fill(100 / numItems)
  ); // Initialize with 2 elements at 50% width

  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setWidths(() => Array(numItems).fill(100 / numItems));
  }, [numItems]);

  const handleResize = useCallback(
    (index: number, delta: number) => {
      setWidths((currentWidths) => {
        const nextWidths = [...currentWidths];
        if (index < nextWidths.length - 1) {
          if (nextWidths[index + 1] - delta < 25) {
            delta = nextWidths[index + 1] - 25;
          }
          if (nextWidths[index] + delta < 25) {
            delta = 25 - nextWidths[index];
          }
          // Ensure the widths don't go below 25%
          if (
            nextWidths[index] + delta >= 25 &&
            nextWidths[index + 1] - delta >= 25
          ) {
            nextWidths[index] += delta;
            nextWidths[index + 1] -= delta;
          }
        }
        return nextWidths;
      });
    },
    [numItems]
  );

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      widths,
      handleResize,
    }),
    [widths, handleResize]
  );

  return (
    <HorizontalResizableContext.Provider value={contextValue}>
      {children}
    </HorizontalResizableContext.Provider>
  );
};

// Custom hook to use the context
export const useHorizontalResizable = (): HorizontalResizableContextState => {
  const context = useContext(HorizontalResizableContext);
  if (context === undefined) {
    throw new Error(
      "useHorizontalResizable must be used within a HorizontalResizableProvider"
    );
  }
  return context;
};
