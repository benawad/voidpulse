export const eventTime = (timezone: string, prefix = "") => {
  return `toDateTime(${prefix}time, '${timezone}')`;
};

export const inputTime = (varName: string, timezone: string) => {
  return `toDate(toDateTime({${varName}:DateTime}, '${timezone}'))`;
};
