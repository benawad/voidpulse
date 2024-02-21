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
import { debounce } from "../../../utils/debounce";
import { usePrevious } from "../../../utils/usePrevious";

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
  startingWidths?: number[];
  onWidths: (widths: number[]) => void;
}

export const HorizontalResizableProvider: React.FC<
  HorizontalResizableProviderProps
> = ({ children, numItems, startingWidths, onWidths }) => {
  const [widths, setWidths] = useState<number[]>(
    () => startingWidths || Array(numItems).fill(100 / numItems)
  ); // Initialize with 2 elements at 50% width

  const prevNumItems = usePrevious(numItems);
  useEffect(() => {
    if (typeof prevNumItems !== "undefined" && prevNumItems !== numItems) {
      const newWidths = Array(numItems).fill(100 / numItems);
      setWidths(newWidths);
      onWidths(newWidths);
    }
  }, [numItems]);

  const onWidthsRef = useRef(onWidths);
  onWidthsRef.current = onWidths;
  const debouncedOnWidths = useMemo(
    () => debounce((w: number[]) => onWidthsRef.current(w), 500),
    []
  );
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
        debouncedOnWidths(nextWidths);
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
