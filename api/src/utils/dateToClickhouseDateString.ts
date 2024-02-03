export const dateToClickhouseDateString = (dt: Date) => {
  return dt.toISOString().slice(0, 19).replace("T", " ");
};
