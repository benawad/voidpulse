const MS_SECOND = 1000;
const MS_MINUTE = 60 * 1000;
const MS_HOUR = MS_MINUTE * 60;
const MS_DAY = MS_HOUR * 24;
const MS_WEEK = MS_DAY * 7;
const MS_YEAR = MS_WEEK * 52;
export const msToDurationString = (ms: number) => {
  if (ms < MS_MINUTE) {
    return `${Math.ceil(ms / MS_SECOND)}s`;
  } else if (ms < MS_HOUR) {
    return `${Math.round(ms / MS_MINUTE)}m`;
  } else if (ms < MS_DAY) {
    return `${Math.round(ms / MS_HOUR)}h`;
  } else if (ms < MS_WEEK) {
    return `${Math.floor(ms / MS_DAY)}d`;
  } else if (ms < MS_YEAR) {
    return `${Math.floor(ms / MS_WEEK)}w`;
  }

  return `${Math.floor(ms / MS_YEAR)}y`;
};
