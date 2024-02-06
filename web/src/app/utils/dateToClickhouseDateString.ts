import { Moment } from "moment";

export const dateToClickhouseDateString = (dt: Date | Moment) => {
  return dt.toISOString().slice(0, 19).replace("T", " ");
};
