import { ReactElement } from "react";
import { HiSelector } from "react-icons/hi";
import { IoIosArrowDown, IoIosCheckmark } from "react-icons/io";
import { FloatingMenu } from "./FloatingMenu";
import { FloatingTrigger } from "./FloatingTrigger";
import { Kids } from "./FullScreenModalOverlay";
import { AggType } from "@voidpulse/api";

interface DropdownProps<T> {
  opts: {
    label: string;
    value: T;
    Icon?: ReactElement;
    optClassName?: string;
  }[];
  value: T;
  onSelect: (value: T) => void;
  noCaret?: boolean;
  upAndDownCaret?: boolean;
  showCheckmark?: boolean;
  autoWidth?: boolean;
  portal?: boolean;
  menuClassName?: string;
  buttonClassName?: string;
  placement?: "bottom-start" | "bottom-end" | "top-start" | "top-end";
}

const aggOpts = [
  { label: "Average", value: AggType.avg },
  { label: "Median", value: AggType.median },
  { label: "25th Percentile", value: AggType.percentile25 },
  { label: "75th Percentile", value: AggType.percentile75 },
  { label: "90th Percentile", value: AggType.percentile90 },
  { label: "Min", value: AggType.min },
  { label: "Max", value: AggType.max },
];

export const DropdownOption: Kids<{
  onAgg?: (value: AggType) => void;
  aggValue?: AggType;
  onClick: () => void;
  className?: string;
  active: boolean;
  icon?: ReactElement;
  showCheckmark?: boolean;
}> = ({
  children,
  onClick,
  active,
  className = "",
  icon,
  showCheckmark,
  onAgg,
  aggValue,
}) => {
  const cn = `w-full flex flex-row items-center p-2 text-left accent-hover group rounded-md justify-between ${
    active ? "bg-accent-100 text-primary-100" : ""
  } ${className}`;

  const inside = (
    <>
      <div className="flex flex-row justify-start">
        {icon ? <div className="mr-2">{icon}</div> : null}
        <span>{children}</span>
      </div>
      {showCheckmark && active ? <IoIosCheckmark size={24} /> : null}
    </>
  );

  if (onAgg) {
    return (
      <FloatingTrigger
        appearsOnClick
        placement="right"
        portal
        floatingContent={
          <FloatingMenu style={{ marginLeft: 8 }}>
            {aggOpts.map((opt) => (
              <DropdownOption
                aggValue={aggValue}
                key={opt.label}
                onClick={() => {
                  onAgg?.(opt.value);
                }}
                active={opt.value === aggValue}
                showCheckmark={showCheckmark}
              >
                {opt.label}
              </DropdownOption>
            ))}
          </FloatingMenu>
        }
        className="w-full"
      >
        <div className="w-full">
          <div className={cn}>{inside}</div>
          {aggValue ? (
            <div className="ml-2 text-xs opacity-50">
              {aggOpts.find((x) => x.value === aggValue)?.label}
            </div>
          ) : null}
        </div>
      </FloatingTrigger>
    );
  } else {
    return (
      <button onClick={onClick} className={cn}>
        {inside}
      </button>
    );
  }
};

export const DropdownStartButton: Kids<{
  icon?: ReactElement;
  noCaret?: boolean;
  upAndDownCaret?: boolean;
  buttonClassName?: string;
}> = ({ buttonClassName, icon, noCaret, upAndDownCaret, children }) => {
  return (
    <div
      className={
        (buttonClassName
          ? buttonClassName
          : `text-primary-400 text-xs accent-hover`) +
        ` px-2 py-2 rounded-md flex items-center`
      }
    >
      {icon ? <div className="mr-1">{icon}</div> : null}
      {children}
      {noCaret ? null : <IoIosArrowDown className="ml-1" />}
      {upAndDownCaret ? (
        <HiSelector className="opacity-50 ml-1" size={16} />
      ) : null}
    </div>
  );
};

export function Dropdown<T>({
  opts,
  value,
  onSelect,
  noCaret,
  upAndDownCaret,
  showCheckmark,
  autoWidth,
  portal = true,
  menuClassName,
  buttonClassName,
  placement = "bottom-start",
}: DropdownProps<T>) {
  const chosenOption = opts.find((x) => x.value === value);
  return (
    <FloatingTrigger
      appearsOnClick
      placement={placement}
      portal={portal}
      floatingContent={
        <FloatingMenu autoWidth={autoWidth} className={menuClassName}>
          {/* This part is the dropdown menu itself*/}
          {opts.map((opt) => (
            <DropdownOption
              key={opt.label}
              onClick={() => {
                onSelect(opt.value);
              }}
              className={opt.optClassName}
              active={opt.value === value}
              icon={opt.Icon}
              showCheckmark={showCheckmark}
            >
              {opt.label}
            </DropdownOption>
          ))}
        </FloatingMenu>
      }
      className="flex"
    >
      {/* Inside component that you click on to open the dropdown menu*/}
      <DropdownStartButton
        buttonClassName={buttonClassName}
        noCaret={noCaret}
        upAndDownCaret={upAndDownCaret}
        icon={chosenOption?.Icon}
      >
        {chosenOption?.label}
      </DropdownStartButton>
    </FloatingTrigger>
  );
}
