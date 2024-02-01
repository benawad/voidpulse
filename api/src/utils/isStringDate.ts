// Examples of usage:
// console.log(isValidDate("2024-01-30")); // true
// console.log(isValidDate("30/01/2024")); // true
// console.log(isValidDate("Jan")); // true
// console.log(isValidDate("Mon")); // true
// console.log(isValidDate("2024-01-30 13:45:00")); // true
// console.log(isValidDate("2024-01-30T13:45:00Z")); // true, ISO 8601 UTC format

export function isStringDate(dateString: string): boolean {
  const regexMap = {
    isoDate: /\d{4}-\d{2}-\d{2}( \d{2}:\d{2}:\d{2})?/, // Optional time for date
    euroDate: /\d{2}-\d{2}-\d{4}/, // European date format doesn't include time in this example
    isoDateWithSlashes: /\d{4}\/\d{2}\/\d{2}/, // Slashed date format doesn't include time in this example
    euroDateWithSlashes: /\d{2}\/\d{2}\/\d{4}/, // European slashed date format doesn't include time in this example
    threeLetterMonth: /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/, // Month abbreviation doesn't include time
    isoDateTimeUTC: /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/, // ISO 8601 UTC format
  };

  for (const key in regexMap) {
    if (regexMap[key as keyof typeof regexMap].test(dateString)) {
      return true;
    }
  }

  return false;
}
