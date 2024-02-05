import { DataType } from "../app-router-type";
import { isStringDate } from "./isStringDate";

export const propsToTypes = (props: any) => {
  const propTypes: Record<string, { type: DataType }> = {};

  Object.entries(props).forEach(([key, value]) => {
    if (!(key in propTypes)) {
      if (typeof value === "number") {
        propTypes[key] = { type: DataType.number };
      } else if (typeof value === "string") {
        if (isStringDate(value)) {
          propTypes[key] = { type: DataType.date };
        } else {
          propTypes[key] = { type: DataType.string };
        }
      } else if (typeof value === "boolean") {
        propTypes[key] = { type: DataType.boolean };
      } else {
        propTypes[key] = { type: DataType.other };
      }
    }
  });

  return propTypes;
};
