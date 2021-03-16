/**
 * Converts Javascript Date object
 * to string date in "YYYY-MM-DD" format
 * @param Date
 * @returns string
 */
export const formatDate = (date: Date): string =>
  [
    date.getFullYear(),
    (date.getMonth() + 1).toString().padStart(2, "0"),
    date
      .getDate()
      .toString()
      .padStart(2, "0")
  ].join("-");
