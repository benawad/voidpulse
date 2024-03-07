export const eventTime = (timezone: string, prefix = "") => {
  return `toDateTime(${prefix}time, '${timezone}')`;
};

export const inputTime = (varName: string, timezone: string) => {
  return `toDateTime(toDateTime({${varName}:DateTime}), '${timezone}')`;
};
