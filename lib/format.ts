export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 20,
  }).format(value);
}

/** Bi-monthly periods: 1st–15th and 16th–end of month */
export function getCurrentPeriodLabel(date: Date = new Date()) {
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();
  const lastDay = new Date(year, date.getMonth() + 1, 0).getDate();
  const suffix = lastDay === 31 ? "st" : "th";
  return day <= 15
    ? `1st–15th ${month} ${year}`
    : `16th–${lastDay}${suffix} ${month} ${year}`;
}
